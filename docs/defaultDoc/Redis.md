# Redis

## 缓存

###  1.什么是缓存穿透，解决方案?

第一点，我想说一说Redis作为缓存的正常的整个流程

首先会先去请求Redis，看Redis中有没有数据，有的话直接返回，否则就去进一步查询数据库，如果数据库查询到了数据就返回，并且返回之前写入到Redis中去，如果数据库也没有查询到就什么都不返回。

第二点，缓存穿透指的就是，如果一直查询不到数据，这个数据不仅缓存中没有，数据库里也没有，那就会一直导致数据库的查询操作，造成数据库压力过大崩溃。

第三点，我想去说一说怎么去解决这一个缓存穿透的问题，目前有两个方案，

第一种方案是，如果数据库也查询不到，直接把这个空数据（null）存到Redis中去，这样下次就Redis可以查询到了，避免了缓存穿透，这种方案的优点是实现简单，但是缺点就是会消耗redis的内存空间并且造成数据库的不一致的问题（比如这个时候数据库真有了这个数据）

第二种方案是去添加布隆过滤器，添加的位置是在缓存之前，在去请求缓存之前，可以先去请求布隆过滤器，如果判定没有数据直接返回为空，其中布隆过滤器是一个基于bitmap数组的东西，可以由redisson来实现，主要通过去根据某一个key的多次hash值判定是否均为1，可以说是通过一定的空间换取一定概率的判定率，一般可以设置误差在5%以内。

### 2.什么是缓存击穿，解决方案？

缓存击穿是指当一个热点key的数据时效过期后，大量该key的请求打到redis。在等redis重建完成这个key之前，所有请求打到mysql数据库导致数据库崩溃。

目前一般有两种方案，第一种是利用分布式锁来解决，如果请求数据库的某一个key失效了，会对这个key进行上锁，然后查询数据库进行key的重建，这个过程中所有的请求都需要等大这个重建过程完成，这个方案的优点是一致性极强但是性能较差。

第二种方案是利用逻辑过期来实现，这种方案不会给数据设置真正的过期时间，而是在数据结构之中增加一个逻辑过期的时间，当请求访问一个key的时候，如果发现已经逻辑过期，会重写缓存重新设置逻辑过期时间，但是这个会开一个新线程去做来避免等待，并且这个过程也会使用分布式锁来去做，避免其他线程去重复执行，本线程会直接返回过期时间，这个方案高可用，性能好，但是一致性不如直接去用分布式锁。

### 3.什么是缓存雪崩，解决方案？

缓存雪崩是指大量的key失效了（这个一般是由于设置了相同的TTL值）或者

redis直接宕机了，导致大量的请求直接到了数据库，导致数据库宕机。

这个有多种方法可以预防。

第一种就是去做一个多级缓存，比如让caffine当做以及缓存，redis当做二级缓存。

第二种就是设置一些随机性的TTL值，不让所有的key同时间全部失效

第三种就是针对请求做一个限流措施，控制请求的流量

第四种就是给redis做一个集群，这样一台宕机了，也有其他的可以顶替上来

### 4.如何保证双写一致性？(同mysql的数据如何与redis进行同步？)

读操作：

PS：双写一致性指当修改了数据库的数据也要同时更新缓存的数据，缓存和数据库的数据要保持一致。

PS：为什么会不一致？就是因为两个线程会互相产生影响，无论是先删缓存再修改数据库或者是先修改数据库再删除缓存都可能有脏数据（延迟双删）

首先需要确认我们的业务对实时性的要求高不高。如果高的话我们考虑可以使用分布式锁来进行解决，但是这样的话性能比较低，一般是使用读写锁，对于读的操作一般加上一个共享读锁，这样其他的线程也可以读取数据，但是对于写的操作一般会上一个排他锁，这样其他的线程不允许读也不允许写。

如果我们业务对实时性的要求不高，可以去保证事务的最终一致性，我们可以考虑使用一个异步化的方案，比如使用消息队列MQ和Canal，前者的话每次修改完数据库都会发送到消息队列，然后异步批量去删除缓存。后者的话每次是伪装成这个mysql的一个从节点，基于Binlog日志去检测mysql数据库的变化，然后异步统一调用单独的服务去删除缓存

### 5.数据的持久化是怎么做的？

一般有RDB（快照）和AOF两种方式，前者是备份redis的 数据到磁盘上，redis宕机的时候从磁盘恢复数据，后者是用二进制的方式记录每一个命令，定时记录去记录，redis宕机的时候读取一遍命令在执行就可以了，前者的文件小，回复速度会快，后者记录了所有命令，文件打，要去执行每条命令会慢一点，前者的完整性不如后者，对数据一致性要求比较高的话还是得用后者

### 6.Redis的数据过期策略是怎么做的？

Redis有两种数据的过期策略，一种是惰性删除，它指的是，每次去用到这个数据的时候去检查一下，如果发现过期了就去主动删除，否则就不去动他，这个的优点是无需耗费cpu处理的资源，但是代价就是会需要占用一定的内存空间。另一种是定期删除的策略，他又分为两种模式，一种是slow模式，意思就是定时按照某一个固定频率去删除，频率是10hz，每次处理规定不超过25ms，另一种是fast模式，这种模式频率不是固定，但是有一个原则就是每次护理之间的间隔不低于2毫秒，并且每次处理的时间不超过1毫秒。改模式的优点就是能节省一点内存空间但是占用的cpu资源比第一种要大，目前redis的过期策略处于平衡考虑，结合了这两种模式。

### 7.数据淘汰策略有哪些？

Redis的数据淘汰策略有很多，首先就是默认的配置，他就是不允许进行淘汰，一旦内存满了就直接进行报错，还有一种就是随机的策略。其中比较重要的两个是LRU和LFU算法，其中LRU算法是最近最少使用使用算法，这个算法会计算当前的时间和最近一次访问时间的差值，这个差值越大，代表越久没有被访问，被删除的优先级会越高。另一种是LFU算法，这个算法会统计每个被使用数据的次数，次数越低，带越被删除的优先级越大。一般来说，如果我们的业务有明显的冷热数据之分，会优先使用LRU算法。另外这些算法一般也分为两种，一种是针对所有数据的，一种是针对有TTL数据的，前者称为allkeys算法，后者 称为volite算法。

## 分布式锁

### 1.什么时候会用到分布式锁呢？

在单体的环境中，只有一个JVM进程，锁也只会作用在这一个JVM进程中，在分布式的情况下，存在多个JVM进程，因此需要分布式锁，它可以针对分布式环境下多个JVM进程的某个key进行加锁。因此分布式锁主要应用于分布式环境下，包括分布式下的定时任务，我在美团实习的时候就是这种类型，另一种就是抢单，超卖之类的问题。

### 2.Redis分布式锁，是如何实现的？

我在美团实习的时候接接触过一个内部工具开发的项目，哪个项目涉及了一些分布式下的定时任务，当时主要还是使用的Redisson框架来去实现这个分布式锁。但是从底层来说主要是依赖的redis的setnx key命令，

其中获取锁是 set key value nx ex ttl，其中删除锁是del key，也可以直接使用setnx命令，该命令在设置的key不存在的时候才可以创建，创建了这个key之后还使用了expire key ttl的命令为这个key设置了有效期，最后为了保障这两个命令的原子性，还使用了lua脚本确保这两个命令的原子性。

### 3.Redisson实现分布式锁如何合理地控制锁的有效时长？

Redisson实现了一个看门狗（watchDog）机制，其实就是新开了一个线程，该机制会检测业务的处理时间，每隔releaseTime/3去续期一次时间进行一次续期，续期的时候，会把时间重置为releaseTiem

### 4.Redisson这个所可以实现重入吗？

Redisson是一个可重入锁，他的底层是利用了一个hash结构，这个hash结构纪录片持有该线程的名称和重入次数，如果检测到想要获取锁的线程是同一个线程，就允许拿到锁，并将计数器+1。

### 5.Redisson这个锁能解决主从数据一致的问题吗？

并不能，可以通过红锁redlock来实现，但是成本太大了，如果非要强数据一致性，建议使用zookeeper

## 其他

### 1.Redis集群的方案有哪些？

目前Redis集群的方案主要有三种，分别是主从同步、哨兵模式、分片集群

### 2.介绍一下主从同步，其数据流程是怎么样的？

主从同步指的是，利用集群来缓解单节点redis服务器的压力，集群中分为主节点和从节点，主节点负责写操作，从节点负责读操作，一般都是一主多从，主节点写入数据后需要对从节点进行同步数据。

数据同步的流程，首先从节点会去请求主节点进行数据同步，同时请求中会带上一个replication id 和 offset偏移量两个参数。主节点在接受到请求后，会去使用自己的replication id和从节点发过来的replication进行对比，如果不是一样的，代表是第一次进行数据同步，因此主节点会生成一份RDB数据快照并发送给从节点，从节点进行数据同步，但是在生成RDB的过程中仍然可能后产生数据，所以主节点会以命令的方式记录到一个缓冲区，生成一个日志文件，发送给从节点，从节点根据这些命令继续备份，后期再同步都是依赖于这个日志文件，这个就是全量同步。还有一个情况是主节点发现从节点发送过来的replication id和自己的一样，代表不是第一次进行同步，是属于增量同步，因此会直接使用记录在缓冲区的命令写入到日志文件中，从节点依靠这个日志文件来进行同步，其中offset记录了偏差值，告诉了从日志文件的哪一个位置进行同步

### 3.如何保证Redis的高可用？

一般采用主从同步 + 哨兵模式，只有主从同步的问题在于，如果主节点挂了，那么redis就没有办法去写入数据了，而哨兵模式可以去实时监控redis集群之中的各个节点，如果检测到主节点挂了，会去选择一个slave从节点变成新的主节点，并以后数据的写入也都是依据这个主节点，一般来说redis用一主一从加上哨兵机制就可以解决问题，如果尽量不要去做分片，不然运维的成本比较大，如果实在压力还是过大，可以考虑针对不同的服务搭建多个redis集群。

### 4.Redis中的脑裂问题是什么？

redis集群中的脑裂问题是指，由于例如网络问题，redis主节点和从节点不在一个网络中，但是哨兵不能检测到主节点的心跳，导致选举了另一个从节点作为新的主节点，但是这个时候客户端还在旧的主节点写入数据，新的主节点一直没有数据写入，等待网络恢复之后，老的主节点又被降级为slave从节点，导致大量老的主节点数据大量丢失。

目前解决办法是一可以设置最少的slave从节点数量，比如至少有一个从节点才能同步数据，另一个解决办法是设定一个数据同步和复制的延迟最大时间，打不到要求就拒绝同步请求，保证数据不都是

### 5.Redis分片集群有什么用？

Redis分片集群主要解决的是海量数据的存储问题，一个redis分布集群中有多个master主节点，每个master主节点又有多个slave从节点，这样可以同时解决高并发的写和高并发的读的操作，同时master节点之间也会有类似于哨兵机制重点额心跳机制，会实时监测每一个master节点的可用性。对于过来的请求，无论流量打到哪一个master节点至上，都会被路由机制转发到正确的master节点之上。

### 6.Redis分片集群中的数据是怎么存储的？

Redis分片集群中有一个插槽机制，一共有16384个插槽，每一个redis的master主节点都会被分配一段插槽，对于每一个数据，他会首先进行一个校验，校验通过后会通过一个hash算法进行hash，然后瑞16384这个数字进行取模，最终得到一个映射的插槽值进行插入。

### 7.Redis为什么这么快

Redis这么快只要有三点原因。第一点原因就是Redis是基于内存的，内存比磁盘的速度快了一个数量级，并且Redis也是基于的C这种偏低层的编程语言开发的效率也高。第二点原因就是Redis是一个基于单线程的数据库，没有多线程之间进程切换带来的上下文切换带来的开销。第三点就是Redis使用了IO多路复用的机制，相比于阻塞IO的机制和非阻塞IO的机制，效率更高。

### 8.能进一步介绍一下IO多路复用的模型吗？

IO多路复用指的是，会开启一个专门的线程来监听所有的socket事件，一旦有准备好进行连接的socket进程就会通知对这个socket进程进行事件派发，先通过链接应答处理器，紧接着通过命令请求处理器进行命令的编译和执行，得到执行结果后再通过命令回复处理器进行结果的返回，这个就是所谓的IO多路复用，他并不是串行的等待当前的socket准备好再进行数据传输，而是指用专门的线程去检测，并且这里一般也是用的epoll模式来实现，直接把已经准备好的socket写入用户空间。

Redis在6.0的版本之后，针对在IO复用的基础之上又增加了多线程技术，不过这里的多线程主要是针对的网络IO，主要体现在命令请求处理器和命令回复处理器，前者可以多线程的处理接受请求数据转换成redis命令，再单线程的一个一个执行，得到的结果放回到缓冲区之后命令回复处理器多线程地返回结果给客户端。
