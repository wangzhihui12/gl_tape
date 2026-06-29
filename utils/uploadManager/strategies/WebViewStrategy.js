/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:35:18
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 01:47:11
 * @FilePath: \simgle_app\utils\uploadManager\strategies\WebViewStrategy.js
 */

import UploadStrategy from './UploadStrategy.js'
import { getWebviewInstance } from '@/utils/utils.js'
import { STRATEGY_NAMES } from '../constants.js'
/**
 * WebView 上传策略（遗留方案）
 * 
 * 特点：
 * 1. 使用 WebView 加载 H5 页面，调用 aliyun-oss-sdk 上传
 * 2. 通过 evalJS 和 postMessage 与 WebView 通信
 * 3. OSS SDK 内置 multipart upload，支持大文件分片上传
 * 4. 作为最终兜底方案，总是可用
 * 
 * 通信流程：
 * 1. WebView 加载完成后发送 'webview_ready' 信号
 * 2. Native 调用 evalJS 执行 msgFromUniapp 函数
 * 3. WebView 上传完成后通过 postMessage 返回结果
 */
class WebViewStrategy extends UploadStrategy {
  constructor() {
    super()
    
    /**
     * WebView 组件引用
     * @type {Object|null}
     */
    this.webviewRef = null
    
    /**
     * 待处理的上传任务 Map
     * key: uploadId, value: { resolve, reject, onProgress, onSuccess, onFailure }
     * @type {Map<string, Object>}
     */
    this.pendingUploads = new Map()
    
    /**
     * WebView 是否已就绪
     * @type {boolean}
     */
    this.isWebViewReady = false
    
    /**
     * 当前上传 ID
     * @type {string|null}
     */
    this.currentUploadId = null
    
    /**
     * Vue 组件上下文
     * @type {Object|null}
     */
    this.vueContext = null
  }

  /**
   * 初始化 WebView 上下文
   * 
   * @param {Object} webviewRef - WebView 组件引用 ($refs.uploaderWebview)
   * @param {Object} vueContext - Vue 组件实例 (this)
   */
  initialize(webviewRef, vueContext) {
    this.webviewRef = webviewRef
    this.vueContext = vueContext
  }

  /**
   * 上传文件
   * 
   * 注意：WebView 策略使用 OSS SDK 内置的 multipart upload
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async upload(file, options) {
    return this.uploadDirect(file, options)
  }

  /**
   * 直接上传文件（通过 WebView）
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async uploadDirect(file, options) {
    if (!this.isWebViewReady) {
      throw new Error('WebView not ready')
    }

    if (!this.webviewRef) {
      throw new Error('WebView reference not set, call initialize() first')
    }

    const uploadId = this.generateUploadId()
    this.currentUploadId = uploadId
    
    return new Promise(async (resolve, reject) => {
      // 保存回调
      this.pendingUploads.set(uploadId, {
        resolve,
        reject,
        onProgress: options.onProgress,
        onSuccess: options.onSuccess,
        onFailure: options.onFailure
      })

      // 🔥 修复：从完整路径中提取目录路径
      // file.path 是完整路径：file:///path/to/file.mp3
      // msgFromUniapp 需要：
      //   - fileName: file.mp3
      //   - filePath: file:///path/to/
      let filePath = file.path
      let fileName = file.name
      
      // 如果 file.path 包含文件名，提取目录路径
      if (filePath.endsWith(fileName)) {
        // 移除文件名，保留目录路径
        filePath = filePath.substring(0, filePath.length - fileName.length)
      } else if (filePath.includes('/')) {
        // 如果路径不以文件名结尾，但包含 /，确保以 / 结尾
        if (!filePath.endsWith('/')) {
          filePath = filePath + '/'
        }
      }
      
      // 调用 WebView 函数上传文件
      // 匹配现有的 msgFromUniapp 函数签名
      await this.callWebViewFunction(
        'msgFromUniapp',
        options.ossConfig.accessKeyId,
        options.ossConfig.accessKeySecret,
        options.ossConfig.stsToken,
        fileName,
        filePath,
        uploadId, // 使用 uploadId 作为 recordId
        options.ossConfig.bucket,
        options.ossConfig.region,
        {
          // 可选参数
          partSize: options.partSize || 500, // 默认 500KB
          parallel: options.parallel || 4,    // 并发数
          timeout: options.timeout || 60000,  // 超时时间
          ossFolder: options.ossFolder || 'quality/' // OSS 文件夹
        }
      )
    })
  }

  /**
   * 上传分片（WebView 策略不使用）
   * 
   * WebView 策略使用 OSS SDK 内置的 multipart upload
   * 此方法不应被调用
   * 
   * @throws {Error} 不支持此方法
   */
  async uploadChunk() {
    throw new Error('WebViewStrategy uses OSS SDK built-in multipart upload, uploadChunk should not be called directly')
  }

  /**
   * 取消上传
   * 
   * 注意：WebView OSS SDK 不支持通过消息取消上传
   * 只能拒绝 pending promise
   */
  cancel() {
    if (this.currentUploadId) {
      const upload = this.pendingUploads.get(this.currentUploadId)
      if (upload) {
        const error = new Error('Upload cancelled by user')
        upload.onFailure?.({ code: 'CANCELLED', message: error.message })
        upload.reject(error)
        this.pendingUploads.delete(this.currentUploadId)
      }
      this.currentUploadId = null
      
      uni.$logger?.local?.info('[WebViewStrategy] Upload cancelled')
    }
  }

  /**
   * 检查是否支持
   * 
   * WebView 总是可用（作为兜底方案）
   * 
   * @returns {boolean} 总是返回 true
   */
  isSupported() {
    return true
  }

  /**
   * 检查是否已就绪
   * 
   * WebView 需要等待 webview_ready 信号
   * 
   * @returns {boolean} 是否已就绪
   */
  isReady() {
    return this.isWebViewReady
  }

  /**
   * 获取策略名称
   * 
   * @returns {string} 'webview'
   */
  getName() {
    return STRATEGY_NAMES.WEBVIEW
  }

  /**
   * 调用 WebView 中的函数
   * 
   * @param {string} functionName - 函数名
   * @param {...any} args - 函数参数
   */
  async callWebViewFunction(functionName, ...args) {
    if (!this.vueContext) {
      throw new Error('Vue context not set')
    }

    // 将参数转换为字符串
    const argsStr = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg)
      } else if (typeof arg === 'string') {
        return `'${arg}'`
      }
      return arg
    }).join(',')
    
    // 执行 WebView 中的 JavaScript 函数
    const jsCode = `window.${functionName}(${argsStr})`
    
    try {
      // 使用项目的 getWebviewInstance 工具函数获取 WebView 实例
      const webviewComponent = this.vueContext.$refs.uploaderWebview
      const nativeWebview = await getWebviewInstance(webviewComponent, this.vueContext)
      
      if (!nativeWebview) {
        throw new Error('Failed to get WebView instance')
      }
      
      // 调用 evalJS
      if (typeof nativeWebview.evalJS === 'function') {
        nativeWebview.evalJS(jsCode)
      } else {
        throw new Error('WebView evalJS method not found')
      }
    } catch (error) {
      uni.$logger?.local?.error(`[WebViewStrategy] Failed to call WebView function: ${error.message}`)
      throw error
    }
  }

  /**
   * 处理来自 WebView 的消息
   * 
   * 消息格式：
   * - webview_ready: { action: 'webview_ready' }
   * - 上传结果: { code, message, fileName, recordId, filePath, data: { oss } }
   * 
   * @param {Object} data - 消息数据
   */
  handleMessage(data) {
    // 处理 webview_ready 信号
    if (data.action === 'webview_ready') {
      this.isWebViewReady = true
      return
    }

    // 处理上传响应
    const uploadId = data.recordId
    const upload = this.pendingUploads.get(uploadId)
    
    if (!upload) {
      uni.$logger?.local?.warn(`[WebViewStrategy] No pending upload found for: ${uploadId}`)
      return
    }

    if (data.code === 0) {
      // 上传成功
      const fileUrl = data.data?.oss?.res?.requestUrls?.[0] || ''
      const metadata = {
        size: data.data?.oss?.res?.size || 0,
        name: data.fileName
      }
      
      upload.onSuccess?.(fileUrl, metadata)
      upload.resolve(fileUrl)
      
      // uni.$logger?.local?.info(`[WebViewStrategy] Upload success: ${fileUrl}`)
    } else {
      // 上传失败
      const error = {
        code: data.code,
        message: data.message || 'Upload failed'
      }
      
      upload.onFailure?.(error)
      upload.reject(new Error(error.message))
      
      uni.$logger?.local?.error(`[WebViewStrategy] Upload failed: ${error.message}`)
    }

    // 清理
    this.pendingUploads.delete(uploadId)
    if (this.currentUploadId === uploadId) {
      this.currentUploadId = null
    }
  }

  /**
   * 生成上传 ID
   * 
   * @returns {string} 唯一的上传 ID
   */
  generateUploadId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * 重置策略状态
   * 
   * 用于清理所有待处理的上传任务
   */
  reset() {
    this.pendingUploads.clear()
    this.currentUploadId = null
    this.isWebViewReady = false
    
    uni.$logger?.local?.info('[WebViewStrategy] Strategy reset')
  }
}

// 导出策略类
export default WebViewStrategy
