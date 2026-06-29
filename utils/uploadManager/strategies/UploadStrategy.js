/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:33:18
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 19:24:17
 * @FilePath: \gl_tape\utils\uploadManager\strategies\UploadStrategy.js
 */

/**
 * 上传策略基类
 * 所有具体的上传策略（WebView、UniApp）都必须继承此类并实现其抽象方法
 * 
 * 设计原则：
 * 1. 开闭原则：对扩展开放，对修改关闭
 * 2. 依赖倒置：依赖抽象而非具体实现
 * 3. 接口隔离：提供最小化的接口定义
 */
class UploadStrategy {
  constructor() {
    // 策略基类不需要额外的属性
  }

  /**
   * 上传文件到 OSS
   * 
   * @param {Object} file - 文件对象
   * @param {string} file.path - 文件路径 (例如: 'file:///storage/...')
   * @param {string} file.name - 文件名 (例如: 'audio.mp3')
   * @param {number} file.size - 文件大小（字节）
   * @param {string} [file.type] - MIME 类型（可选）
   * 
   * @param {Object} options - 上传选项
   * @param {Function} options.onProgress - 进度回调 (percent: 0-100)
   * @param {Function} options.onSuccess - 成功回调 (url: string, metadata: Object)
   * @param {Function} options.onFailure - 失败回调 (error: Object)
   * @param {Object} [options.ossConfig] - OSS 配置（策略特定）
   * @param {string} [options.ossConfig.bucket] - OSS bucket 名称
   * @param {string} [options.ossConfig.endpoint] - OSS endpoint
   * @param {string} [options.ossConfig.accessKeyId] - OSS AccessKeyId
   * @param {string} [options.ossConfig.accessKeySecret] - OSS AccessKeySecret
   * @param {string} [options.ossConfig.stsToken] - OSS STS Token（可选）
   * 
   * @returns {Promise<string>} OSS 文件 URL
   * @throws {Error} 子类必须实现此方法
   */
  async upload(file, options) {
    throw new Error(`upload() must be implemented by ${this.constructor.name}`)
  }

  /**
   * 取消正在进行的上传
   * 
   * 实现要求：
   * 1. 立即停止上传操作
   * 2. 清理相关资源（uploadTask、pending promises 等）
   * 3. 调用 onFailure 回调，传入取消错误
   * 
   * @throws {Error} 子类必须实现此方法
   */
  cancel() {
    throw new Error(`cancel() must be implemented by ${this.constructor.name}`)
  }

  /**
   * 检查当前环境是否支持该策略
   * 
   * 示例：
   * - WebViewStrategy: 总是返回 true（作为兜底方案）
   * - UniAppStrategy: 检查 uni.uploadFile 是否可用
   * 
   * @returns {boolean} true 表示支持，false 表示不支持
   * @throws {Error} 子类必须实现此方法
   */
  isSupported() {
    throw new Error(`isSupported() must be implemented by ${this.constructor.name}`)
  }

  /**
   * 检查策略是否已就绪（可以立即执行上传）
   * 
   * 示例：
   * - WebViewStrategy: 检查 WebView 是否已收到 webview_ready 信号
   * - UniAppStrategy: 总是返回 true（无需初始化）
   * 
   * @returns {boolean} true 表示已就绪，false 表示未就绪
   */
  isReady() {
    // 默认实现：支持即就绪
    return this.isSupported()
  }

  /**
   * 获取策略名称（用于日志记录和配置）
   * 
   * 标准名称：
   * - STRATEGY_NAMES.WEBVIEW: WebView 策略
   * - STRATEGY_NAMES.UNIAPP: UniApp 策略
   * 
   * @returns {string} 策略名称
   * @throws {Error} 子类必须实现此方法
   */
  getName() {
    throw new Error(`getName() must be implemented by ${this.constructor.name}`)
  }
}

// 导出基类
export default UploadStrategy
