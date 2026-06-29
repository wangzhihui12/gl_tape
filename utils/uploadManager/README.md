# UploadManager - OSS 文件上传管理器

基于策略模式的 OSS 文件上传管理器，支持多种上传策略和自动降级。

## 快速开始

### 1. 初始化

```javascript
import { getUploadManager } from '@/utils/uploadManager'

// 获取单例实例
const uploadManager = getUploadManager({
  webview: {
    webviewRef: this.$refs.uploaderWebview,
    vueContext: this
  }
})

// 等待所有策略就绪
await uploadManager.ready()
```

### 2. 上传文件

```javascript
const file = {
  path: '/path/to/file.mp3',
  name: 'file.mp3',
  size: 1024000  // 字节
}

const url = await uploadManager.upload(file, {
  ossConfig: {
    accessKeyId: 'xxx',
    accessKeySecret: 'xxx',
    stsToken: 'xxx',
    bucket: 'my-bucket',
    region: 'oss-cn-hangzhou'
  },
  onProgress: (percent) => {
    console.log(`上传进度: ${percent}%`)
  },
  onSuccess: (url) => {
    console.log(`上传成功: ${url}`)
  },
  onFailure: (error) => {
    console.error(`上传失败: ${error.message}`)
  }
})
```

## 核心特性

### 自动策略选择

根据文件大小自动选择最优策略：
- **文件 < 50MB**：优先使用 UniAppStrategy（表单上传）
- **文件 >= 50MB**：优先使用 WebViewStrategy（OSS SDK 分片上传）

### 自动降级

如果首选策略失败或未就绪，自动降级到下一个可用策略：
1. 尝试第一个策略
2. 失败则尝试第二个策略
3. 所有策略都失败则抛出异常

### Promise-based 就绪机制

```javascript
// 等待所有策略就绪
await uploadManager.ready()

// 检查是否已就绪（同步）
if (uploadManager.isReady()) {
  console.log('所有策略已就绪')
}
```

## 支持的策略

### WebViewStrategy
- 使用阿里云 OSS SDK
- 支持分片上传
- 适合大文件（>= 50MB）
- 需要 WebView 环境

### UniAppStrategy
- 使用 `uni.uploadFile` API
- 表单上传
- 适合小文件（< 50MB）
- 跨平台支持

## API 文档

### UploadManager

#### 构造函数
```javascript
new UploadManager(options)
```

**参数：**
- `options.webview` - WebView 配置（可选）
  - `webviewRef` - WebView 组件引用
  - `vueContext` - Vue 组件实例

#### upload(file, options)
上传文件到 OSS

**参数：**
- `file` - 文件对象
  - `path` - 文件路径
  - `name` - 文件名
  - `size` - 文件大小（字节）
- `options` - 上传选项
  - `ossConfig` - OSS 配置
  - `onProgress` - 进度回调
  - `onSuccess` - 成功回调
  - `onFailure` - 失败回调

**返回：** `Promise<string>` - OSS 文件 URL

#### ready()
等待所有策略就绪

**返回：** `Promise<void>`

#### isReady()
检查是否已就绪（同步）

**返回：** `boolean`

#### cancel()
取消正在进行的上传

#### handleWebViewMessage(event)
处理来自 WebView 的消息

**参数：**
- `event` - WebView message 事件

**返回：** `boolean` - 是否处理了消息

## 配置

### 文件大小阈值

```javascript
// 设置阈值（默认 50MB）
uploadManager.setFileSizeThreshold(100 * 1024 * 1024) // 100MB

// 获取阈值
const threshold = uploadManager.getFileSizeThreshold()
```

## 调试

### 启用调试日志

日志会自动输出到 `uni.$logger`，包括：
- 策略注册信息
- 文件大小和策略选择
- 上传进度和结果
- 错误信息

### 常见问题

#### WebView 策略未就绪
- 检查 WebView 是否加载完成
- 检查是否收到 `webview_ready` 信号
- 使用 `await uploadManager.ready()` 等待就绪

#### 上传失败
- 检查 OSS 配置是否正确
- 检查文件路径是否存在
- 检查网络连接
- 查看日志中的错误信息

## 架构设计

### 策略模式
- `UploadStrategy`：策略基类
- `WebViewStrategy`：WebView 上传策略
- `UniAppStrategy`：UniApp 上传策略

### 职责分离
- `UploadManager`：上传管理器（门面）
- `StrategySelector`：策略选择器
- `UploadStrategy`：策略实现

## 文档

- **快速开始**：`QUICK_START.md`
- **历史文档归档**：`docs/ARCHIVE.md`
- **代码注释**：查看各个模块的代码注释

---

**最后更新：** 2026-01-30
