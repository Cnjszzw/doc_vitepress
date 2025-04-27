`public/topo/see/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>3D地形图</title>
    <!-- 重要，请到 https://console.amap.com 申请 JS API 的 key和密钥 -->
    <script type="text/javascript">
        window._AMapSecurityConfig = {
            securityJsCode:'c8aa87361af8e14619b012103dba0ff3',
        }
    </script>
    <script src="./three.js"></script>
    <link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css"/>
</head>

<body style="overflow: hidden">
<div id="container1" style="height: calc(100vh)"></div>

<!-- 修改功能菜单项，改为按钮组 -->
<div class="function-buttons">
    <button class="btn1 btn1-primary" onclick="handleFunction('visibility')" id="visibility-btn">
        通视分析
    </button>
    <button class="btn1 btn1-primary" onclick="handleFunction('height')" id="height-btn">
        视高编辑
    </button>
    <button class="btn1 btn1-primary" onclick="handleFunction('route')" id="route-btn">
        路线导航
    </button>
</div>

<div class="info">
    <div class="input-item">
        <input id='tipinput' class="input-item-text1" type="text" placeholder="请输入搜索内容">
        <button class="btn1 btn1-primary search-btn" onclick="searchChange()">
            搜索
        </button>
        <button class="btn1 btn1-primary reset-btn" onclick="restAll()">
            重置
        </button>
    </div>
    <div id="panel" style="max-height: 400px; overflow-y: auto; margin-top: 8px;"></div>
</div>
<div class="back-container">
    <button class="btn1 btn1-primary" onclick="goBack()">
        返&nbsp;&nbsp;回
    </button>
</div>
<!--        <script src="https://webapi.amap.com/loader.js"></script>-->
<script type="text/javascript" src="https://webapi.amap.com/maps?v=2.1Beta&key=a495aa052d34b146c412ab56e4912e6c"></script>
<script src="https://webapi.amap.com/loca?v=2.0.0&key=a495aa052d34b146c412ab56e4912e6c"></script>
<script src="./index.js"></script>
<style lang="scss" scoped>
  .amap-marker-label{
    white-space:inherit;
    background: none !important;
    border:none;
    z-index: 999999;
  }
  .info1{
    color: #000;
    padding: 5px;
    border-radius: 5px;
    backdrop-filter: blur(1px); /* 添加背景模糊效果 */
    background-color: rgba(255, 255, 255, 0.2); /* 半透明白色背景，增强模糊效果 */
  }
  body,
  html {
    margin: 0;
    padding: 0;
    font: 12px/16px Verdana, Helvetica, Arial, sans-serif;
    width: 100%;
    height: 100%;
  }

  .container1 {
    height: 100%;
  }
  .input-card .btn {
    width: 9rem;
  }
  .input-card{
    margin-bottom: 20px;
  }

  .btn1{
    display: inline-block;
    padding: 2px 15px;
    font-size: 14px;
    border-radius: 4px;
    line-height: 1.5715;
    font-weight: 400;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    user-select: none;
    height: 32px;
    outline: none;
  }
  /* 主要按钮 */
  .btn1-primary {
    background: #0096C1 !important;
    border-color: transparent !important;
    color: #FFFFFF !important;
  }

  .btn1-primary:hover {
    background: #008cb3 !important;
    color: #FFFFFF !important;
    border-color: #008cb3 !important;
  }

  /* 美化功能菜单标题 */
  .menu-title {
    padding: 10px 15px;
    background: #1890ff;
    color: white;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-title .arrow {
    font-size: 12px;
    transition: transform 0.3s;
  }

  .menu-title.active .arrow {
    transform: rotate(180deg);
  }

  .menu-items {
    padding: 5px 0;
    background: white;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }

  .menu-item {
    padding: 8px 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-item .checkmark {
    color: #1890ff;
    font-weight: bold;
    visibility: hidden;
  }

  .menu-item.active {
    color: #1890ff;
  }

  .menu-item.active .checkmark {
    visibility: visible;
  }

  /* 添加通视分析提示框样式 */
  .visibility-info {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    z-index: 99001;
    width: 400px;
  }

  .info-header {
    padding: 15px;
    background: #1890ff;
    color: white;
    border-radius: 4px 4px 0 0;
    position: relative;
    font-size: 16px;
  }

  .close-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 20px;
  }

  .close-btn:hover {
    opacity: 0.8;
  }

  .info-content {
    padding: 20px;
  }

  .info-content h4 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .info-content ol {
    margin: 0 0 20px 0;
    padding-left: 20px;
  }

  .info-content li {
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .info-content p {
    margin: 0 0 15px 0;
    line-height: 1.5;
  }

  .info-footer {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }

  .info-footer a {
    color: #1890ff;
    text-decoration: none;
  }

  .info-footer a:hover {
    text-decoration: underline;
  }

  /* Modal 样式 */
  .modal {
    position: fixed;
    top: 100px;
    right: 20px; /* 改为右对齐 */
    z-index: 1000;
    pointer-events: none;
  }

  .modal-content {
    position: relative;
    background: white;
    border-radius: 4px;
    width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    margin-left: auto; /* 添加右对齐 */
  }

  .modal-header {
    padding: 8px 12px;  /* 减小内边距 */
    background: #118AC3;
    color: #ADFEFE;
    border-radius: 4px 4px 0 0;
    font-size: 13px;  /* 稍微减小字体 */
    position: relative;
  }

  .modal-close {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;  /* 减小关闭按钮大小 */
    cursor: pointer;
    opacity: 0.8;
  }

  .modal-close:hover {
    opacity: 1;
  }

  .modal-body {
    padding: 12px;  /* 减小内边距 */
    background-color: #1A6BA7;
    color: #ADFEFE;
  }

  .modal-body h4 {
    margin: 0 0 6px;  /* 减小间距 */
    color: #FFFFFF;  /* 调整标题颜色为深灰色 */
    font-size: 13px;
  }

  .modal-body ol {
    margin: 0 0 12px;
    padding-left: 16px;  /* 减小列表缩进 */
  }

  .modal-body li {
    margin-bottom: 4px;  /* 减小列表项间距 */
    line-height: 1.4;
    color: #ffffff;  /* 调整文字颜色为中灰色 */
    font-size: 12px;
  }

  .modal-body p {
    margin: 0 0 8px;
    line-height: 1.4;
    color: #595959;  /* 调整文字颜色为中灰色 */
    font-size: 12px;
  }

  .modal-note {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    color: #8c8c8c !important;  /* 调整注释文字颜色为浅灰色 */
    font-size: 12px;
  }

  .modal-body a {
    color: #1890ff;
    text-decoration: none;
  }

  .modal-body a:hover {
    text-decoration: underline;
  }

  /* 修改功能菜单样式 */
  .function-buttons.disabled {
    pointer-events: none;
    opacity: 0.6;
    cursor: not-allowed;
  }

  .function-btn:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
    cursor: not-allowed;
  }

  .function-btn:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
  }

  /* 修改确认框样式，减小尺寸 */
  .confirm-dialog {
    position: fixed;
    background: white;
    padding: 12px;  /* 减小内边距 */
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    width: 200px;  /* 减小宽度 */
  }

  .confirm-content {
    text-align: center;
  }

  .confirm-content p {
    margin: 0 0 12px;  /* 减小间距 */
    font-size: 12px;  /* 减小字体 */
    color: #333;
  }

  .confirm-buttons {
    display: flex;
    justify-content: center;
    gap: 6px;  /* 减小按钮间距 */
  }

  .confirm-buttons button {
    padding: 4px 12px;  /* 减小按钮内边距 */
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;  /* 减小字体 */
    transition: all 0.3s;
  }

  .confirm-btn {
    background: #1890ff;
    color: white;
    border: none;
  }

  .confirm-btn:hover {
    background: #40a9ff;
  }

  .cancel-btn {
    background: white;
    border: 1px solid #d9d9d9;
    color: #666;
  }

  .cancel-btn:hover {
    color: #40a9ff;
    border-color: #40a9ff;
  }
</style>

<!-- 修改通视分析 Modal 结构 -->
<div id="visibility-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            通视分析说明
            <span class="modal-close" onclick="closeVisibilityModal()">&times;</span>
        </div>
        <div class="modal-body">
            <h4>操作步骤：</h4>
            <ol>
                <li>在需要进行通视分析的两个点上单击鼠标左键；</li>
                <li>会自动绘制从起点到终点的通视情况。可见区域为绿色，不可见为红色。</li>
            </ol>
        </div>
    </div>
</div>

<!-- 添加路线选择 Modal -->
<div id="route-modal" class="modal" style="display: none;">
    <div style="position: relative;
                border-radius: 4px;
                min-width: 320px;
                max-width: 460px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                pointer-events: auto;">
        <div class="modal-header">
            路线导航结果
            <span class="modal-close" onclick="closeRouteModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="analysis-list"></div>
        </div>
    </div>
</div>

</body>

<!-- 添加自定义提示弹窗 -->
<div id="custom-alert" class="custom-alert" style="display: none;">
    <div class="custom-alert-content">
        <div class="custom-alert-message"></div>
        <button class="custom-alert-btn" onclick="closeCustomAlert()">确定</button>
    </div>
</div>

<style>
    /* 添加加载提示的样式 */
    #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .loading-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 10px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-content p {
        margin: 0;
        color: #333;
        font-size: 14px;
    }

    #analysis-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .analysis-item {
        padding: 2px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    /* .analysis-item:hover {
        background-color: #f5f5f5;
    } */

    .analysis-item.selected {
        background-color: #e6f7ff;
        border-left: 3px solid #1890ff;
    }

    .analysis-details {
        font-size: 12px;
        color: #FFFFFF;
    }

    .select-btn {
        margin-top: 10px;
        padding: 4px 12px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .select-btn:hover {
        background: #40a9ff;
    }

    .button-group {
        display: flex;
        flex-direction: column;  /* 改为垂直方向排列 */
        gap: 8px;
        margin-top: 8px;
    }

    .route-btn {
        width: 100%;  /* 设置宽度占满 */
        padding: 6px 12px;  /* 增加一点垂直内边距 */
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
        white-space: nowrap;
    }

    .route-btn.replan {
        background: #52c41a;
        color: white;
    }

    .route-btn.clear {
        background: #ff4d4f;
        color: white;
    }

    .clear-all-btn {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #eee;
        text-align: center;
    }

    .clear-all-btn .route-btn {
        width: 120px;
    }

    /* 路线信息样式 */
    .route-info {
        margin-top: 8px;
        padding: 8px 10px;
        border-radius: 4px;
    }

    .route-type {
        display: flex;
        align-items: center;
        color: #FFFFFF;
        font-size: 13px;
        line-height: 24px;
    }

    .route-icon {
        margin-right: 6px;
        font-style: normal;
    }

    .route-mode {
        color: #Ffffff;
        margin-right: 4px;
    }

    .route-time {
        color: #Ffffff;
        font-weight: 500;
    }

    /* 调整搜索框容器的样式 */
    .info {
        position: absolute;
        left: 1rem;  /* 恢复原来的样式 */
        right: auto; 
        left: 1rem; 
        padding: 8px; 
        background: rgb(0, 72, 124, 0.75); 
        border-radius: 8px; 
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
        backdrop-filter: blur(8px); 
        display: flex; 
        flex-direction: column;
    }

    /* 调整搜索框组件样式 */
    .input-item {
        display: flex;
        align-items: center;
        /*gap: 8px;*/
        padding: 2px 2px;
        display: flex; 
        align-items: center; 
        gap: 8px;
    }

    .input-item-prepend {
        flex-shrink: 0;
    }

    .input-item-text1 {
      flex: 1; 
      min-width: 100px;
      max-width: 120px;
      height: 32px; 
      padding: 4px 11px; 
      border: 1px solid #004D87; 
      border-radius: 4px; 
      transition: all 0.3s;
      background-color: #004D87;
      color:#ADFEFE;
      text-align: left;
      letter-spacing: normal;
      word-spacing: normal;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
      font-size: 14px;
    }
    .btn-height-primary{
      padding: 6px 16px;
      background: #0096C1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-height-primary:hover{
      background-color: #007A9C !important;
      color:#FFFFFF !important;
    }
    .btn-height-primary:active{
      background-color: #006B8A !important;
      color:#FFFFFF !important;
    }
    .btn-height-danger{
      padding: 6px 16px;
      background: #e06561;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-height-danger:hover{
      background-color: orangered !important;
      color:#FFFFFF !important;
    }
    .btn-height-danger:active{
      background-color: #C35855 !important;
      color:#FFFFFF !important;
    }
    /* 调整功能菜单位置和样式 */
    .function-buttons {
        position: absolute;
        top: 20px;
        right: 120px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    }

    .function-btn {
        padding: 8px 16px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        white-space: nowrap;
    }

    .function-btn:hover {
        background: #40a9ff;
    }

    .function-btn.active {
        background: #096dd9;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    /* 返回按钮容器 */
    .back-container {
        position: absolute;
        bottom: 20px;
        left: 80px;
        background: rgb(0, 72, 124, 0.75);
        backdrop-filter: blur(8px);
        padding: 8px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* 返回按钮样式 */
    .back-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 16px;
        color: #fff;
        background: #1890ff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .back-btn:hover {
        background: #40a9ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }

    .back-btn span {
        font-size: 16px;
    }

    /* 搜索结果面板样式 */
    #panel {
        margin-top: 10px;
        max-height: 300px;
        overflow-y: auto;
        background: white;
        border-radius: 4px;
    }

    /* 柱高分析 Modal 样式 */
    .height-settings {
        padding: 10px 0;
    }

    .setting-item {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .setting-item label {
        color: #333;
        font-size: 13px;
        margin-right: 10px;
    }

    .setting-item input {
        width: 80px;
        padding: 4px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 13px;
        transition: all 0.3s;
    }

    .setting-item input:focus {
        border-color: #40a9ff;
        outline: none;
        box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
    }

    .total-height {
        padding: 8px 12px;
        background: #f5f5f5;
        border-radius: 4px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #333;
    }

    .total-height span {
        color: #1890ff;
        font-weight: bold;
    }

    .setting-tips {
        border-top: 1px dashed #eee;
        padding-top: 12px;
        margin-top: 12px;
    }

    .setting-tips p {
        color: #333;
        font-size: 13px;
        margin: 0 0 8px;
    }

    .setting-tips ol {
        margin: 0;
        padding-left: 20px;
    }

    .setting-tips li {
        color: #666;
        font-size: 12px;
        margin-bottom: 4px;
        line-height: 1.5;
    }

    .analysis-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3px;
        font-size: 12px;
        /*background-color: rgba(255, 255, 255, 0.3);   进一步降低不透明度 */
        border-radius: 4px;
        padding: 2px;
    }

    .analysis-item:last-child {
        border-radius: 0 0 4px 4px;  /* 最后一项底部圆角 */
        margin-bottom: 0;  /* 移除最后一项的底部间距 */
    }

    .analysis-item .label {
        min-width: 60px;
        max-width: 80px;
        padding-right: 4px;
        font-size: 12px;
        font-weight: 900;
        color: #09DEE8;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.8); /* 添加阴影以增强对比 */
    }

    .analysis-item .value {
        font-weight: 500;
        min-width: 70px;
        /*text-align: right;*/
        font-size: 12px;
        font-weight: 900;
        color: #09DEE8;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.8); /* 添加阴影以增强对比 */
    }

    /* 添加整体容器样式 */
    .analysis-container {
        background-color: rgba(255, 255, 255, 0.15);  /* 进一步降低整体背景不透明度 */
        padding: 4px;
        border-radius: 6px;
        backdrop-filter: blur(1.5px);  /* 减小模糊效果 */
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);  /* 进一步减小阴影强度 */
    }

    .action-btn {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s;
        border: none;
    }

    .clear-btn {
        background: #ff4d4f;
        color: white;
    }

    .clear-btn:hover {
        background: #ff7875;
    }

    /* 添加新的按钮样式 */
    .btn1-default {
        background: #fff;
        border: 1px solid #d9d9d9;
        color: #595959;
    }

    .btn1-default:hover {
        color: #40a9ff;
        border-color: #40a9ff;
    }

    .search-btn, .reset-btn {
        padding: 4px 15px;
        height: 32px;
        font-size: 14px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 64px;
    }

    #tipinput:focus {
        border-color: #40a9ff;
        outline: none;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    #tipinput::placeholder {
        color: #bfbfbf;
    }

    /* 优化面板滚动条样式 */
    #panel::-webkit-scrollbar {
        width: 6px;
    }

    #panel::-webkit-scrollbar-thumb {
        background: #d9d9d9;
        border-radius: 3px;
    }

    #panel::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
    }

    /* 自定义提示弹窗样式 */
    .custom-alert {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
    }

    .custom-alert-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        text-align: center;
        min-width: 280px;
        max-width: 400px;
    }

    .custom-alert-message {
        margin-bottom: 16px;
        color: #333;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
    }

    .custom-alert-btn {
        padding: 6px 20px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
    }

    .custom-alert-btn:hover {
        background: #40a9ff;
    }

    /* 隐藏高德地图 logo 和版权信息 */
    .amap-logo {
        display: none !important;
    }
    .amap-copyright {
        display: none !important;
    }
</style>
</html>
```

