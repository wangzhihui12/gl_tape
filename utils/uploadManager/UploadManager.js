/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:39:31
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 19:42:20
 * @FilePath: \gl_tape\utils\uploadManager\UploadManager.js
 */

import WebViewStrategy from './strategies/WebViewStrategy.js'
import UniAppStrategy from './strategies/UniAppStrategy.js'
import StrategySelector from './components/StrategySelector.js'
import { STRATEGY_NAMES, FILE_SIZE_THRESHOLD } from './constants.js'

/**
 * 上传管理器 - 文件上传的主门面
 * 
 * 功能：
 * 1. 管理两种上传策略（WebView、UniApp）
 * 2. 根据文件大小自动选择最优策略
 * 3. 自动降级到备用策略
 * 4. 统一的上传接口
 * 5. 完整的日志记录
 * 
 * 使用示例：
 * ```javascript
 * const uploadManager = new UploadManager()
 * 
 * // 上传文件（自动选择策略）
 * await uploadManager.upload(file, {
 *   onProgress: (percent) => console.log(`进度: ${percent}%`),
 *   onSuccess: (url) => console.log(`成功: ${url}`),
 *   onFailure: (error) => console.error(`失败: ${error.message}`)
 * })
 * ```
 */
class UploadManager {
   /**
   * yourRegion填写Bucket所在地域。以华东1（杭州）为例，yourRegion填写为oss-cn-hangzhou。
   */
  region = 'oss-cn-shenzhen'
  /**
   * 填写Bucket名称。
   */
  bucket = 'glsk-oss'
  constructor(options = {}) {
    /**
     * 策略选择器
     * @type {StrategySelector}
     */
    this.strategySelector = new StrategySelector()
    
    /**
     * 日志记录器
     * @type {Object}
     */
    this.logger = uni.$logger || console
    
    /**
     * 文件大小阈值（字节）
     * 小于此大小使用 UniAppStrategy（表单上传）
     * 大于等于此大小使用 WebViewStrategy（OSS SDK 分片上传）
     * 
     * 默认：50MB
     * 
     * @type {number}
     */
    this.fileSizeThreshold = FILE_SIZE_THRESHOLD.SMALL_FILE
    
    /**
     * 最后一次上传使用的策略名称
     * @type {string}
     */
    this.lastUsedStrategy = STRATEGY_NAMES.NONE
    
    /**
     * 就绪状态 Promise
     * @type {Promise<void>}
     * @private
     */
    this._readyPromise = null
    
    /**
     * 就绪状态 resolve 函数
     * @type {Function|null}
     * @private
     */
    this._readyResolve = null
    
    /**
     * 是否已就绪
     * @type {boolean}
     * @private
     */
    this._isReady = false
    
    /**
     * WebView 配置
     * @type {Object|null}
     * @private
     */
    this._webviewConfig = options.webview || null
    
    // 注册所有策略
    this._registerStrategies()
    
    // 初始化就绪 Promise
    this._initReadyPromise()
    
    // 如果传入了 WebView 配置，初始化 WebView 策略
    if (this._webviewConfig) {
      this._initializeWebViewStrategy()
    }
  }

  /**
   * 初始化就绪 Promise
   * @private
   */
  _initReadyPromise() {
    this._readyPromise = new Promise((resolve) => {
      this._readyResolve = resolve
    })
  }

  /**
   * 初始化 WebView 策略
   * @private
   */
  _initializeWebViewStrategy() {
    const { webviewRef, vueContext } = this._webviewConfig
    
    if (!webviewRef || !vueContext) {
      this.logger.local?.warn('[UploadManager] WebView 配置不完整，跳过 WebView 策略初始化')
      return
    }
    
    try {
      const webviewStrategy = this.strategySelector.getStrategy(STRATEGY_NAMES.WEBVIEW)
      if (webviewStrategy) {
        webviewStrategy.initialize(webviewRef, vueContext)
        this.logger.local?.info('[UploadManager] WebView 策略已初始化')
      }
    } catch (error) {
      this.logger.local?.error(`[UploadManager] WebView 策略初始化失败: ${error.message}`)
    }
  }

  /**
   * 设置 WebView 配置（延迟初始化）
   * 
   * 如果在构造时没有传入 WebView 配置，可以稍后设置
   * 
   * @param {Object} webviewRef - WebView 组件引用
   * @param {Object} vueContext - Vue 组件实例
   */
  setWebViewConfig(webviewRef, vueContext) {
    this._webviewConfig = { webviewRef, vueContext }
    this._initializeWebViewStrategy()
  }

  /**
   * 注册所有上传策略
   * @private
   */
  _registerStrategies() {
    this.strategySelector.register(new WebViewStrategy())
    this.strategySelector.register(new UniAppStrategy())
    this.logger.local?.info(`[UploadManager] Strategies registered: ${STRATEGY_NAMES.WEBVIEW}, ${STRATEGY_NAMES.UNIAPP}`)
  }

  /**
   * 上传文件到 OSS
   * 
   * 策略选择逻辑：
   * 1. 根据文件大小动态选择策略：
   *    - 文件 < 50MB：优先使用 UniAppStrategy（表单上传，简单快速）
   *    - 文件 >= 50MB：优先使用 WebViewStrategy（OSS SDK，支持分片）
   * 2. 如果首选策略未就绪，按优先级降级
   * 3. 支持策略级降级（第一个策略失败立即尝试下一个）
   * 4. 所有策略都失败则抛出异常
   * 
   * @param {Object} file - 文件对象
   * @param {string} file.path - 文件路径
   * @param {string} file.name - 文件名
   * @param {number} file.size - 文件大小（字节）
   * 
   * @param {Object} options - 上传选项
   * @param {Function} [options.onProgress] - 进度回调 (percent: 0-100)
   * @param {Function} [options.onSuccess] - 成功回调 (url, metadata)
   * @param {Function} [options.onFailure] - 失败回调 (error)
   * @param {Object} [options.ossConfig] - OSS 配置
   * 
   * @returns {Promise<string>} OSS 文件 URL
   * @throws {Error} 上传失败时抛出错误
   */
  async upload(file, options = {}) {
    const startTime = Date.now()
    
    // 1. 获取策略优先级
    const strategyPriority = this._getStrategyPriorityByFileSize(file.size)
    // this._logFileInfo(file, strategyPriority)
    
    // 2. 查找可用策略
    const readyStrategies = this._findReadyStrategies(strategyPriority)
    
    // 3. 补充 OSS 配置
    this._ensureOSSConfig(options)
    
    // 4. 依次尝试策略
    return await this._tryStrategies(readyStrategies, file, options, startTime)
  }

  /**
   * 记录文件信息
   * @private
   */
  _logFileInfo(file, strategyPriority) {
    this.logger.local?.info(`[UploadManager] File size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    this.logger.local?.info(`[UploadManager] Strategy priority: [${strategyPriority.join(', ')}]`)
  }

  /**
   * 查找已就绪的策略
   * @private
   */
  _findReadyStrategies(strategyPriority) {
    const readyStrategies = []
    const notReadyStrategies = []
    const unsupportedStrategies = []
    
    for (const strategyName of strategyPriority) {
      const strategy = this.strategySelector.getStrategy(strategyName)
      if (!strategy) continue
      
      if (!strategy.isSupported()) {
        unsupportedStrategies.push(strategyName)
        continue
      }
      
      if (strategy.isReady()) {
        readyStrategies.push({ name: strategyName, strategy })
      } else {
        notReadyStrategies.push(strategyName)
      }
    }
    
    // 如果没有可用策略，抛出错误
    if (readyStrategies.length === 0) {
      this._throwNoStrategyError(notReadyStrategies, unsupportedStrategies)
    }
    
    // this.logger.local?.info(`[UploadManager] Available strategies: [${readyStrategies.map(s => s.name).join(', ')}]`)
    return readyStrategies
  }

  /**
   * 抛出无可用策略错误
   * @private
   */
  _throwNoStrategyError(notReadyStrategies, unsupportedStrategies) {
    let errorMsg = '无可用的上传策略。'
    
    if (notReadyStrategies.length > 0) {
      errorMsg += ` 未就绪: [${notReadyStrategies.join(', ')}]。`
      if (notReadyStrategies.includes(STRATEGY_NAMES.WEBVIEW)) {
        errorMsg += ' WebView 策略需要等待初始化完成，请稍后重试。'
      }
    }
    
    if (unsupportedStrategies.length > 0) {
      errorMsg += ` 不支持: [${unsupportedStrategies.join(', ')}]。`
    }
    
    if (notReadyStrategies.length === 0 && unsupportedStrategies.length === 0) {
      errorMsg += ' 未找到任何上传策略。'
    }
    
    this.logger.local?.error(`[UploadManager] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  /**
   * 确保 OSS 配置完整
   * @private
   */
  
  _ensureOSSConfig(options={}) {
    options.ossConfig = options.ossConfig || {}
    const { ossConfig } = options
    // 使用默认值填充空缺配置
    ossConfig.bucket = ossConfig.bucket || this.bucket
    ossConfig.region = ossConfig.region || this.region
    // 自动生成 endpoint
    if (!ossConfig.endpoint && ossConfig.bucket && ossConfig.region) {
      ossConfig.endpoint = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com`
    }
  }

  /**
   * 依次尝试策略上传（使用 Promise 链式调用）
   * @private
   */
  async _tryStrategies(readyStrategies, file, options, startTime) {
    return readyStrategies.reduce((promise, { name: strategyName, strategy }, index) => {
      return promise.catch(async (previousError) => {
        // 如果不是第一个策略，说明前面的策略失败了
        if (index > 0) {
          this.logger.local?.warn(
            `[UploadManager] Strategy ${readyStrategies[index - 1].name} failed: ${previousError.message}, trying next strategy...`
          )
        }
        
        this.logger.local?.info(`[UploadManager] Trying strategy ${index + 1}/${readyStrategies.length}: ${strategyName}`)
        try {
          const result = await this._uploadWithStrategy(strategy, strategyName, file, options, startTime)
          // 上传成功
          this.lastUsedStrategy = strategyName
          return result
          
        } catch (error) {
          // 如果是最后一个策略，记录错误并抛出
          if (index === readyStrategies.length - 1) {
            this.logger.local?.error(`[UploadManager] All strategies failed, last error: ${error.message}`)
          }
          throw error
        }
      })
    }, Promise.reject(new Error('No strategies available')))
  }

  /**
   * 使用指定策略上传
   * @private
   */
  async _uploadWithStrategy(strategy, strategyName, file, options, startTime) {
    const wrappedOptions = {
      ...options,
      onProgress: options.onProgress,
      onSuccess: (url, metadata) => {
        const duration = Date.now() - startTime
        this.logger.local?.info(`[UploadManager] Upload success: ${url} (${duration}ms) using ${strategyName}`)
        options.onSuccess?.(url, metadata)
      },
      onFailure: (error) => {
        const duration = Date.now() - startTime
        this.logger.local?.error(`[UploadManager] Upload failed: ${error.message} (${duration}ms)`)
        options.onFailure?.(error)
      }
    }

    return await strategy.upload(file, wrappedOptions)
  }

  /**
   * 根据文件大小获取策略优先级
   * 
   * 策略：
   * - 文件 < 50MB：[STRATEGY_NAMES.UNIAPP, STRATEGY_NAMES.WEBVIEW]（优先表单上传）
   * - 文件 >= 50MB：[STRATEGY_NAMES.WEBVIEW, STRATEGY_NAMES.UNIAPP]（优先 OSS SDK）
   * 
   * @param {number} fileSize - 文件大小（字节）
   * @returns {Array<string>} 策略优先级数组
   * @private
   */
  _getStrategyPriorityByFileSize(fileSize) {
    if (fileSize < this.fileSizeThreshold) {
      // 小文件：优先使用 UniAppStrategy（表单上传）
      return [STRATEGY_NAMES.UNIAPP, STRATEGY_NAMES.WEBVIEW]
    } else {
      // 大文件：优先使用 WebViewStrategy（OSS SDK 分片上传）
      return [STRATEGY_NAMES.WEBVIEW, STRATEGY_NAMES.UNIAPP]
    }
  }

  /**
   * 设置文件大小阈值
   * 
   * @param {number} threshold - 阈值（字节）
   */
  setFileSizeThreshold(threshold) {
    this.fileSizeThreshold = threshold
    this.logger.local?.info(`[UploadManager] File size threshold set to: ${threshold} bytes (${(threshold / 1024 / 1024).toFixed(2)} MB)`)
  }

  /**
   * 获取文件大小阈值
   * 
   * @returns {number} 阈值（字节）
   */
  getFileSizeThreshold() {
    return this.fileSizeThreshold
  }

  /**
   * 取消正在进行的上传
   * 
   * 注意：取消功能依赖于各个策略的实现
   */
  cancel() {
    this.logger.local?.info('[UploadManager] Cancel requested')
    
    // 尝试取消所有策略（因为不知道哪个策略正在上传）
    this.strategySelector.getAllStrategies().forEach(strategy => {
      try {
        strategy.cancel()
      } catch (error) {
        // 忽略取消错误
      }
    })
  }

  /**
   * 获取最后一次上传使用的策略名称
   * 
   * @returns {string} 策略名称
   */
  getCurrentStrategyName() {
    return this.lastUsedStrategy
  }

  /**
   * 初始化 WebView 策略
   * 
   * 必须在使用 WebView 策略前调用
   * 会自动监听 webview_ready 信号
   * 
   * @deprecated 使用构造函数的 webview 选项或 setWebViewConfig() 方法
   * @param {Object} webviewRef - WebView 组件引用
   * @param {Object} vueContext - Vue 组件实例
   */
  initializeWebViewStrategy(webviewRef, vueContext) {
    this.logger.local?.warn('[UploadManager] initializeWebViewStrategy() 已废弃，请使用构造函数的 webview 选项或 setWebViewConfig() 方法')
    this.setWebViewConfig(webviewRef, vueContext)
  }

  /**
   * 处理来自 WebView 的消息
   * 
   * 自动处理 webview_ready 信号和上传回调
   * 
   * @param {Object} event - WebView message 事件
   * @returns {boolean} 是否处理了消息
   */
  handleWebViewMessage(event) {
    const data = event?.detail?.data?.[0]
    if (!data) {
      this.logger.local?.warn('[UploadManager] WebView 消息数据为空')
      return false
    }

    const webviewStrategy = this.strategySelector.getStrategy(STRATEGY_NAMES.WEBVIEW) 
    if (!webviewStrategy) {
      this.logger.local?.error('[UploadManager] WebView 策略未找到')
      return false
    }

    // 处理消息
    webviewStrategy.handleMessage(data)
    
    // 如果是 webview_ready 信号，检查是否所有策略都已就绪
    if (data.action === 'webview_ready') {
      this._checkAndResolveReady()
    }
    
    return true
  }

  /**
   * 检查并解析就绪状态
   * @private
   */
  _checkAndResolveReady() {
    // 如果已经就绪，不再重复处理
    if (this._isReady) {
      return
    }
    
    // 检查所有策略是否都已就绪
    if (this.areAllStrategiesReady()) {
      this._isReady = true
      // 解析 Promise
      if (this._readyResolve) {
        this._readyResolve()
      }
    }
  }

  /**
   * 等待所有策略就绪
   * 
   * 返回一个 Promise，当所有策略都就绪时 resolve
   * 如果已经就绪，立即 resolve
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * // 使用 await
   * await uploadManager.ready()
   * console.log('所有策略已就绪')
   * 
   * @example
   * // 使用 then
   * uploadManager.ready().then(() => {
   *   console.log('所有策略已就绪')
   * })
   */
  ready() {
    return this._readyPromise
  }

  /**
   * 检查所有策略是否已就绪
   * 
   * @returns {boolean} 是否所有支持的策略都已就绪
   */
  areAllStrategiesReady() {
    const allStrategies = this.strategySelector.getAllStrategies()
    return allStrategies.every(strategy => {
      const isSupported = strategy.isSupported()
      const isReady = strategy.isReady()
      
      // 不支持的策略不影响就绪状态
      if (!isSupported) {
        return true
      }
      
      return isReady
    })
  }

  /**
   * 检查是否已就绪（同步方法）
   * 
   * @returns {boolean} 是否已就绪
   */
  isReady() {
    return this._isReady
  }
}

// 导出单例
let instance = null

/**
 * 获取 UploadManager 单例
 * 
 * @param {Object} options - 初始化选项
 * @param {Object} [options.webview] - WebView 配置
 * @param {Object} [options.webview.webviewRef] - WebView 组件引用
 * @param {Object} [options.webview.vueContext] - Vue 组件实例
 * @returns {UploadManager}
 */
export function getUploadManager(options = {}) {
  if (!instance) {
    instance = new UploadManager(options)
  } else if (options.webview) {
    // 如果已经有实例，但传入了新的 WebView 配置，更新配置
    instance.setWebViewConfig(options.webview.webviewRef, options.webview.vueContext)
  }
  return instance
}

export default UploadManager
