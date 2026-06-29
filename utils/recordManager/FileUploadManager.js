/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 20:48:08
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 19:10:32
 * @FilePath: \gl_tape\utils\recordManager\FileUploadManager.js
 */

import { getUploadManager } from '@/utils/uploadManager'
import { FileStatus } from '@/utils/common'
// import { decryptAES } from '@/lib/aes.js'

/**
 * 文件上传管理器
 * @description: 基于新的 UploadManager，支持两种上传策略（UniAppStrategy、WebViewStrategy）
 * @feature: oss-upload-refactor
 * @purpose: 为 UploadService 提供新的上传能力，同时保持接口兼容
 * 
 * 特点：
 * 1. 基于新的 UploadManager，支持两种上传策略
 * 2. 适配 UploadService 的接口，无缝集成
 * 3. 自动处理 OSS Token 获取和解密
 * 4. 模拟 WebView 回调格式，兼容现有逻辑
 * 
 * 使用示例：
 * ```javascript
 * import FileUploadManager from '@/utils/recordManager/FileUploadManager.js'
 * 
 * const fileUploadManager = FileUploadManager.getInstance()
 * 
 * // 初始化（在 HomeFrame 中调用）
 * await fileUploadManager.init({
 *   webviewRef: this.$refs.uploaderWebview,
 *   vueContext: this
 * })
 * 
 * // 上传文件
 * await fileUploadManager.uploadRecord(record, (result) => {
 *   // 处理上传结果
 * })
 * ```
 */
class FileUploadManager {
  static instance = null

  constructor() {
    /**
     * UploadManager 实例
     * @type {UploadManager}
     */
    this.uploadManager = null
    
    /**
     * 初始化完成的 Promise
     * @type {Promise<void>}
     * @private
     */
    this._initPromise = null
    
    /**
     * 初始化完成的 resolve 函数
     * @type {Function|null}
     * @private
     */
    this._initResolve = null
    
    // 创建初始化 Promise
    this._initPromise = new Promise((resolve) => {
      this._initResolve = resolve
    })
  }

  /**
   * 获取单例实例
   * @returns {FileUploadManager}
   */
  static getInstance() {
    if (!FileUploadManager.instance) {
      FileUploadManager.instance = new FileUploadManager()
    }
    return FileUploadManager.instance
  }

  /**
   * 初始化上传管理器
   * 
   * @param {Object} options - 初始化选项
   * @param {Object} [options.webviewRef] - WebView 组件引用（可选）
   * @param {Object} [options.vueContext] - Vue 组件实例（可选）
   */
  async init(options = {}) {
    try {
      // 防止重复初始化
      if (this.uploadManager) {
        uni.$logger.local.debug('[FileUploadManager] 已初始化，跳过重复初始化')
        
        // 如果传入了新的 WebView 配置，更新配置
        if (options.webviewRef && options.vueContext) {
          this.uploadManager.setWebViewConfig(options.webviewRef, options.vueContext)
          uni.$logger.local.info('[FileUploadManager] WebView 配置已更新')
        }
        return
      }
      
      // 获取 UploadManager 实例，传入 WebView 配置
      // UploadManager 会自动初始化 WebView 策略
      this.uploadManager = getUploadManager({
        webview: options.webviewRef && options.vueContext ? {
          webviewRef: options.webviewRef,
          vueContext: options.vueContext
        } : null
      })
      
      uni.$logger.local.info('[FileUploadManager] 初始化成功')
      
      // 解析初始化 Promise
      if (this._initResolve) {
        this._initResolve()
        this._initResolve = null
      }
    } catch (error) {
      uni.$logger.local.error(`[FileUploadManager] 初始化失败: ${error.message}`)
      throw error
    }
  }
  
  /**
   * 等待初始化完成
   * 
   * @returns {Promise<void>}
   */
  async waitForInit() {
    if (this.uploadManager) {
      return
    }
    return this._initPromise
  }

  /**
   * 处理来自 WebView 的消息
   * 
   * @param {Object} event - WebView message 事件
   */
  handleWebViewMessage(event) {
    if (!event?.detail?.data?.[0]) {
      return
    }

    // 直接转发给 UploadManager 处理
    // UploadManager 会自动处理 webview_ready 信号和上传回调
    if (this.uploadManager) {
      this.uploadManager.handleWebViewMessage(event)
    } else {
      uni.$logger.local.warn('[FileUploadManager] uploadManager 未初始化，无法处理 WebView 消息')
    }
  }

  /**
   * 获取最后一次上传使用的策略
   * 
   * 注意：这是最后一次上传实际使用的策略
   * 系统会根据文件大小和就绪状态自动选择策略
   * 
   * @returns {string} 策略名称
   */
  getCurrentStrategy() {
    if (!this.uploadManager) {
      return 'unknown'
    }
    return this.uploadManager.getCurrentStrategyName()
  }

  /**
   * 上传文件记录
   * 
   * 适配 UploadService 的接口，处理上传并返回 WebView 格式的结果
   * 
   * @param {Object} record - 文件记录
   * @param {string} record.recordId - 记录 ID
   * @param {string} record.fileName - 文件名
   * @param {string} record.filePath - 文件路径
   * @param {number} record.status - 文件状态
   * @param {Function} callback - 上传完成回调
   * @returns {Promise<void>}
   */
  async uploadRecord(record, callback) {
    try {
      uni.$logger.local.info(`[FileUploadManager] 开始上传文件: ${record.fileName}`)
      // 处理无文件或文件不存在的情况
      if (record.status === FileStatus.NoFile || record.status === FileStatus.NotExist) {
        uni.$logger.local.info('[FileUploadManager] 文件不存在，直接返回')
        
        // 构造结果，模拟 WebView 回调格式
        const result = {
          detail: {
            data: [{
              code: 0,
              message: 'no file',
              recordId: record.recordId,
              fileName: record.fileName,
              filePath: record.filePath,
              status: record.status
            }]
          }
        }
        
        callback && callback(result)
        return
      }

      // 获取 OSS Token
      const token = await uni.$api.commonApi.getToken({})
      // const { lsaccessKeySecret, securityToken, lsaccessKeyId } = await uni.$api.commonApi.getToken({})
      let { lsaccessKeySecret, securityToken, lsaccessKeyId, bucketName='', region='' } = token || {}
      // 解密配置
      // bucketName = await this._tryDecrypt(bucketName, 'Bucket')
      // region = await this._tryDecrypt(region, 'Region')
      // lsaccessKeySecret = await this._tryDecrypt(lsaccessKeySecret, 'AccessKeySecret')
      // lsaccessKeyId = await this._tryDecrypt(lsaccessKeyId, 'AccessKeyId')

      // 获取文件大小
      const filePath = record.filePath + record.fileName
      let fileSize = 0
      try {
        const fileInfo = await this._getFileInfo(filePath)
        fileSize = fileInfo.size
        uni.$logger.local.info(`[FileUploadManager] 文件大小: ${fileSize} bytes`)
      } catch (error) {
        uni.$logger.local.warn(`[FileUploadManager] 无法获取文件大小: ${error.message}，使用默认值 0`)
      }

      // 构造文件对象
      const file = {
        path: filePath,
        name: record.fileName,
        size: fileSize
      }

      // 构造 OSS 配置
      const ossConfig = {
        accessKeyId: lsaccessKeyId,
        accessKeySecret: lsaccessKeySecret,
        stsToken: securityToken,
        bucket: bucketName,
        region: region
      }

      // 使用 UploadManager 上传
      // UploadManager 会根据策略优先级自动选择已就绪的策略
      const url = await this.uploadManager.upload(file, {
        ossConfig,
        onProgress: (percent) => {
          // uni.$logger.local.debug(`[FileUploadManager] 上传进度: ${percent}%`)
        },
        onSuccess: (url, metadata) => {
          // 记录实际使用的策略
          // const usedStrategy = this.uploadManager.getCurrentStrategyName()
          // uni.$logger.local.info(`[FileUploadManager] 上传成功: ${url}, 使用策略: ${usedStrategy}`)
        },
        onFailure: (error) => {
          uni.$logger.local.error(`[FileUploadManager] 上传失败: ${error.message}`)
        }
      })

      // 构造上传结果，模拟 WebView 回调格式
      const uploadResult = {
        detail: {
          data: [{
            code: 0,
            message: 'success',
            recordId: record.recordId,
            fileName: record.fileName,
            filePath: record.filePath,
            data: {
              oss: {
                res: {
                  requestUrls: [url]
                }
              }
            }
          }]
        }
      }

      // 调用回调
      callback && callback(uploadResult)
    } catch (error) {
      uni.$logger.local.error(`[FileUploadManager] 上传失败: ${error.message}`)
      
      // 构造错误结果
      const errorResult = {
        detail: {
          data: [{
            code: -1,
            message: error.message,
            recordId: record.recordId,
            fileName: record.fileName,
            filePath: record.filePath
          }]
        }
      }
      
      callback && callback(errorResult)
      return
    }
  }

  /**
   * 解密字符串
   * @private
   */
  async _tryDecrypt(str, label) {
    if (str && (str.includes('=') || str.length > 50)) {
      let decrypted =str //await decryptAES(str)
      if (decrypted) {
        if (label == 'Region' && decrypted.includes('.')) {
          decrypted = decrypted.split('.')[0]
        }
      }
      return decrypted
    }
    return str
  }

  /**
   * 获取文件信息
   * @private
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 文件信息 { size, ... }
   */
  async _getFileInfo(filePath) {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      plus.io.getFileInfo({
        filePath: filePath,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(new Error(err.errMsg || 'Failed to get file info'))
        }
      })
      // #endif
      
      // #ifdef H5
      // H5 环境无法直接获取文件大小，返回默认值
      resolve({ size: 0 })
      // #endif
    })
  }

  /**
   * 取消正在进行的上传
   */
  cancel() {
    if (this.uploadManager) {
      this.uploadManager.cancel()
      uni.$logger.local.info('[FileUploadManager] 取消上传')
    }
  }

  /**
   * 销毁实例，清理资源
   */
  destroy() {
    // 清理引用
    // this.uploadManager = null
    // uni.$logger.local.info('[FileUploadManager] 实例已销毁')
  }

  /**
   * 获取所有支持的策略
   * 
   * @returns {Array<string>} 策略名称数组
   */
  getSupportedStrategies() {
    if (!this.uploadManager) {
      return []
    }
    return this.uploadManager.getSupportedStrategies()
  }
}

// 导出单例
export default FileUploadManager.getInstance()
