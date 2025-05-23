# SpringBoot

## Spring

### 1.Spring框架中的单例Bean是线程安全的吗？

Spring框架中的Bean不是线程安全的，如果这个Bean中有一些成员可以被修改的，那么多线程过来的时候就一定会有线程安全问题，这个时候一般需要去使用锁来取解决，或者使用@Scope注解，传人prototype变成多例模式，但是如果没有这样可以被修改的成员，则一般会被认为是线程安全的

### 2.什么是AOP？

AOP翻译过来是面向切面编程，核心思想是将一些通用比较强的逻辑可以抽离出来，降低耦合度和代码的重复性，比如常用的日志、事务等等用的很多

### 3.你怎么使用AOP的？

我自己是写过一个仿b站的项目，它里面有一个会员等级的功能，不同等级的会员可以干不同的事情，因此我需要针对每个不同的接口都去判断用户的等级，进行合法性校验，因为我用了AOP切面编程。首先我需要通过代码实习告诉我的服务端，哪些接口需要有权限控制的功能，又需要什么样的等级，所以我首先需要去实现了一个切点，具体来说就是自己写了一个注解，该注解可以传入等级参数列表。并且对有权限控制的接口加上这个注解，传入等级列表这个参数，告诉这个接口什么等级才是合法的，然后我会根据这个切点实现了一个切面类，切面类中可以有很多的方法，比如before、after、around，我主要是实现了这个before方法，在before方法中获取用户当前等级，和当前注解传入的等级去做校验，不通过就拒绝执行接下里的逻辑，最终借助这个AOP切面编程实现了权限控制功能

### 4.Spring中的事务是如何实现的？

本质是通过AOP的功能进行前后拦截，在之前开启事务，在之后选择提交事务或者回滚事务。

### 5.Spring事务失效

我了解到的失效的场景有三种，第一种就是发生了异常，并且没有直接抛出，而是用catch去处理了，可以通过在catch中直接抛出异常来解决。第二种就是Spring的事务只会抛出非检查异常，如果不是这类的异常，spring的事务不会抛出，会造成事务的失效，解决这里问题需要在transactional注解后面加传入一个参数，rollback = Exception,这样就会任何异常都会抛出，不会造成索引的失效。第三种情况就是非public方法造成的事务失效，这个时候可以直接把这个方法改成public

### 6.Spring中bean的生命周期

第一步，会根据一个BeanDefination对象去获取Bean的定义信息

第二步，会去根据构造函数去实例化Bean，但是这个时候Bean很多的初始值还没有被赋予

第三步，会去执行依赖注入，执行一些set方法

第四步，会去处理Aware接口，这个Aware接口可以理解为有一些Bean的方法实现了这些接口，需要去进行重写

第五步，会去执行BeanPostProcessor后置处理器的前置部分

第六步，会去执行一些类的初始化方法

第七步，会去执行BeanPostProcessor后置处理器的后置部分

第八步，也是最后一步，去执行destory方法，去销毁Bean

### 7.循环引用是什么？用什么解决的？

循环引用就是两个对象互相作为对方的一个成员属性，导致在创建对象的时候，不断引用，就比如说A对象里面有一个成员变量B，B对象里面有一个成员变量A。实例化A需要去先实例化B，而实例化B又要去实例化A。主要是通过三级缓存来解决问题，

### 8.解决的具体流程是什么?

首先在实例化A对象的时候，首先会去创建ObjectFactory放到三级缓存singletonFactories中，紧接着会去实例化B对象，也会去创建objectFactory放到三级缓存singletonFactories中去，B注入又需要A，于是利用A的三级缓存对象生产生成一个A的对象放入二级缓存中去，这个是比较关键的一步，这个对象既可以是代理对象也可以是普通对象。紧接着B又可以从A的二级缓存中得到A的对象进行注入，最终得到B对象，A可以直接注入B，A最后创建成功再存入一级缓存中。最后二级缓存中的A对象清除

### 9.构造方法出现了循环依赖如何解决？

由于Bean的生命周期中，构造函数是第一个执行的，所以Spring没法解决这个循环依赖的问题，可以用一个懒加载模式。即@Lazy，什么时候需要了再去加载。

## SpringMVC

### 1.SpringMVC的执行流程

首先用户发送的请求会全部发送到一个叫做前端控制器的地方,然后这个前端前端控制器会接着把请求发送到处理器映射器,最终得到处理器对象和处理器拦截器(如果有),紧接着拿到对象信息后会接着转发到处理器适配器,这个视频器一个个去找所有的handler处理器进行处理,得到最终的结果后会直接通过接口上的注解@RespondBody注解去调用和h't't'pMessageConvret去转换为JSON文件并发送到前端(这个是前后端分离的情况),但如果不是的话,在得到处理器适配器后,结果会先返回给前端控制器,前端控制前会再去调用一个视图解析器,这个始图解析器会把处理器适配器的对象信息转换为model and view并最后一起发送给前端渲染器给渲染出来。


## SpringBoot

### 1.SpringBoot自动装配原理

首先核心是springboot启动类中的@SpringBootApplication注解，其中这个注解有多个注解组成，一个是@SpringBootConfiguration注解，一个是@CompoentScan注解，这两个注解主要是标注本身为配置类和配置扫描路径，核心是@EnableAutoConfiguraion注解，该注解又由很多的注解组实现，其中有一个@import注解，这个注解导入了MEAT-INFO下面的一个spring-factores注解，这个注解定义有100多种类，会根据所指定的选择条件来来决定是否将这些bean导入Spring容器中，比如说条件判断会有@ConditionalOnClass注解，来判断是否有对应的字节码文件，如果有则加载类，没有就把这个类的配置文件加载进spring容器中。

### 2.说一说Spring有哪些注解

首先Springboor整合了spring和springmvc两个框架，包含他们的注解，对于spring框架它的核心是IOC和AOP，因此注解主要都是bean的管理和依赖注入和切面编程，比如这个bean的管理就有@Controller@Service@@Dao@Componenty依赖注入就有@Resource@Autowire ，切面编程就有@Aspect@Before@After@Around ,那对于这个springmvc框架主要是设计页面数据的转换，比如@Responsebody @Pathvarible @Requestparam@REstController等等，springboot的核心主要是实现这个自动装配，比如@Springbootapplication @ CompontScan等等

### 3.说一说mybatis的执行流程

第一步：mybatis需要进行配置文件的配置，包括数据库的连接，mapper文件的指定等等

第二步：mybatis会生成一个sqlSessionFactory对象，这个对象回去生产sqlSession

第三步，去生成sqlSession对象，这个对象定义记录了所有的sql值执行方法

第四步，会操作数据库的接口exectuaor执行器，其中这个exectuaor执行器中中有一个参数MapperedStatement对象，这个参数记录了所有的参数映射文件

第五步，会去输入参数并进行映射，然后去数据库查询

第六步，会去拿到数据库的数据再进行一次输出映射

### 4.MyBatis是否支持延迟加载。如果支持背后的原理是什么？

首先MyBatis是支持延迟加载的，不仅支持一对一对象集合的延迟加载，也支持一对多对象的延迟加载，只不过这些配置是默认关闭的，需要在配置文件中全局开始，或者在sql文件中国局部开启。

延迟加载背后的原理就在于用力CGlib的代理对象，当调用目标方法的时候，会去调用拦截器invoke的方法，一旦发现这个目标方法的值为null，就会直接去执行sql查询，当获取数据以后，就会进行赋值操作，下一次查询就不是null了，就不会去查询了

### 5.讲一讲MyBatis中的一级和二级缓存，二级缓存什么时候会去清空数据？

首先，MyBatis的一级缓存是基于SqlSession这个范围内额，默认会被开启，其次MyBatis中的二级缓存是基于作用于的，不是基于SqlSession，也是用HashMap来做缓存，需要单独开始，一个是核心配置，一个是mapper映射文件。

其次当某一个作用域（一级缓存session、二级缓存namspace）被执行增删改的操作的之后，默认该作用域下的所有选中的缓存都将被清楚。
