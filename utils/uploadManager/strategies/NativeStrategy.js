/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:36:49
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 01:46:21
 * @FilePath: \simgle_app\utils\uploadManager\strategies\NativeStrategy.js
 */
import UploadStrategy from './UploadStrategy.js'

/**
 * 原生 Android OSS SDK 上传策略（高性能方案）
 * 
 * 特点：
 * 1. 直接调用 Android 原生 OSS SDK
 * 2. 性能最优，内存占用最小
 * 3. 支持 OSS SDK 内置的 multipart upload 和断点续传
 * 4. 仅支持 Android 平台
 * 
 * 依赖：
 * - com.aliyun.dpa:oss-android-sdk:2.9.13
 * 
 * 权限：
 * - android.permission.INTERNET
 * - android.permission.ACCESS_NETWORK_STATE
 * - android.permission.READ_EXTERNAL_STORAGE
 * - android.permission.WRITE_EXTERNAL_STORAGE
 */
class NativeStrategy extends UploadStrategy {
  constructor() {
    super()
    
    /**
     * OSS 客户端实例
     * @type {Object|null}
     */
    this.ossClient = null
    
    /**
     * 当前上传任务
     * @type {Object|null}
     */
    this.currentUpload = null
  }

  /**
   * 上传文件
   * 
   * 自动判断是否使用 multipart upload：
   * - 小文件（< 10MB）：直接上传
   * - 大文件（>= 10MB）：使用 multipart upload（带断点续传）
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async upload(file, options) {
    // 确保 OSS 客户端已初始化
    if (!this.ossClient) {
      await this.initializeOSSClient(options)
    }

    // 检查是否需要使用 multipart upload
    // 注意：Native SDK 内部处理分片，不使用 ChunkManager
    if (this.chunkManager && this.chunkManager.shouldUseChunkedUpload(file)) {
      uni.$logger?.local?.info(`[NativeStrategy] Using multipart upload for large file: ${file.name} (${file.size} bytes)`)
      return this.uploadMultipart(file, options)
    }

    // 小文件直接上传
    return this.uploadDirect(file, options)
  }

  /**
   * 直接上传文件（小文件）
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async uploadDirect(file, options) {
    return new Promise(async (resolve, reject) => {
      // #ifdef APP-PLUS
      try {
        uni.$logger?.local?.info(`[NativeStrategy] Starting direct upload: ${file.name}, size: ${file.size}, path: ${file.path}`)
        
        // 转换文件路径：file:// -> 绝对路径
        let filePath = file.path
        if (filePath.startsWith('file://')) {
          // 移除 file:// 前缀，得到绝对路径
          filePath = filePath.replace('file://', '')
          uni.$logger?.local?.info(`[NativeStrategy] Converted file path: ${filePath}`)
        }
        
        // 验证文件是否存在
        const fileExists = await this._checkFileExists(filePath)
        if (!fileExists) {
          const error = `File not found: ${filePath}`
          uni.$logger?.local?.error(`[NativeStrategy] ${error}`)
          reject(new Error(error))
          return
        }
        uni.$logger?.local?.info(`[NativeStrategy] File exists, proceeding with upload`)
        
        // 导入 Android 类
        const PutObjectRequest = plus.android.importClass('com.alibaba.sdk.android.oss.model.PutObjectRequest')
        const OSSProgressCallback = plus.android.importClass('com.alibaba.sdk.android.oss.callback.OSSProgressCallback')
        const OSSCompletedCallback = plus.android.importClass('com.alibaba.sdk.android.oss.callback.OSSCompletedCallback')

        // 生成 OSS 文件路径
        const ossKey = this.generateOSSKey(file.name, options)
        uni.$logger?.local?.info(`[NativeStrategy] OSS key: ${ossKey}, bucket: ${options.ossConfig.bucket}`)

        // 创建上传请求
        const request = new PutObjectRequest(
          options.ossConfig.bucket,
          ossKey,
          filePath  // 使用转换后的路径
        )
        
        uni.$logger?.local?.info(`[NativeStrategy] Upload request created with path: ${filePath}`)

        // 设置进度回调
        request.setProgressCallback(
          plus.android.implements(OSSProgressCallback, {
            onProgress: (request, currentSize, totalSize) => {
              const percent = Math.round((currentSize / totalSize) * 100)
              uni.$logger?.local?.debug(`[NativeStrategy] Upload progress: ${percent}% (${currentSize}/${totalSize})`)
              options.onProgress?.(percent)
            }
          })
        )
        
        uni.$logger?.local?.info(`[NativeStrategy] Starting asyncPutObject...`)

        // 添加超时机制（30秒）
        const uploadTimeout = setTimeout(() => {
          uni.$logger?.local?.error(`[NativeStrategy] Upload timeout after 30 seconds`)
          reject(new Error('Upload timeout'))
          this.currentUpload = null
        }, 30000)

        // 执行上传
        this.currentUpload = this.ossClient.asyncPutObject(
          request,
          plus.android.implements(OSSCompletedCallback, {
            onSuccess: (request, result) => {
              clearTimeout(uploadTimeout)  // 清除超时定时器
              uni.$logger?.local?.info(`[NativeStrategy] onSuccess callback triggered`)
              
              const fileUrl = `${options.ossConfig.endpoint}/${ossKey}`
              const metadata = {
                size: file.size,
                name: file.name
              }
              
              options.onSuccess?.(fileUrl, metadata)
              resolve(fileUrl)
              this.currentUpload = null
              
              uni.$logger?.local?.info(`[NativeStrategy] Upload success: ${fileUrl}`)
            },
            onFailure: (request, clientException, serviceException) => {
              clearTimeout(uploadTimeout)  // 清除超时定时器
              uni.$logger?.local?.error(`[NativeStrategy] onFailure callback triggered`)
              
              let errorMessage = 'Upload failed'
              let errorCode = 'UNKNOWN_ERROR'
              
              if (clientException) {
                const clientMsg = clientException.getMessage()
                errorMessage = clientMsg || errorMessage
                errorCode = 'CLIENT_ERROR'
                uni.$logger?.local?.error(`[NativeStrategy] Client exception: ${clientMsg}`)
              }
              
              if (serviceException) {
                const serviceMsg = serviceException.getMessage()
                const statusCode = serviceException.getStatusCode()
                errorMessage = serviceMsg || errorMessage
                errorCode = statusCode || errorCode
                uni.$logger?.local?.error(`[NativeStrategy] Service exception: ${serviceMsg}, status: ${statusCode}`)
              }
              
              const error = {
                code: errorCode,
                message: errorMessage
              }
              
              options.onFailure?.(error)
              reject(new Error(error.message))
              this.currentUpload = null
            }
          })
        )
        
        uni.$logger?.local?.info(`[NativeStrategy] asyncPutObject called, waiting for callback...`)
      } catch (e) {
        uni.$logger?.local?.error(`[NativeStrategy] Exception in uploadDirect: ${e.message}`)
        uni.$logger?.local?.error(`[NativeStrategy] Stack: ${e.stack}`)
        reject(new Error(`Native upload failed: ${e.message}`))
      }
      // #endif
      
      // #ifndef APP-PLUS
      reject(new Error('Native strategy only supported on APP-PLUS'))
      // #endif
    })
  }

  /**
   * Multipart 上传（大文件，带断点续传）
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async uploadMultipart(file, options) {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      try {
        // 导入 Android 类
        const MultipartUploadRequest = plus.android.importClass('com.alibaba.sdk.android.oss.model.MultipartUploadRequest')
        const OSSProgressCallback = plus.android.importClass('com.alibaba.sdk.android.oss.callback.OSSProgressCallback')
        const OSSCompletedCallback = plus.android.importClass('com.alibaba.sdk.android.oss.callback.OSSCompletedCallback')

        // 生成 OSS 文件路径
        const ossKey = this.generateOSSKey(file.name, options)

        // 创建 multipart 上传请求
        const request = new MultipartUploadRequest(
          options.ossConfig.bucket,
          ossKey,
          file.path
        )

        // 设置分片大小（5MB）- 匹配 ChunkManager 的策略
        request.setPartSize(5 * 1024 * 1024)

        // 启用断点续传（checkpoint 文件用于恢复）
        const checkpointDir = plus.io.convertLocalFileSystemURL('_doc/oss_checkpoint/')
        request.setCheckpointDir(checkpointDir)

        // 设置进度回调
        request.setProgressCallback(
          plus.android.implements(OSSProgressCallback, {
            onProgress: (request, currentSize, totalSize) => {
              const percent = Math.round((currentSize / totalSize) * 100)
              options.onProgress?.(percent)
            }
          })
        )

        // 执行 multipart 上传
        this.currentUpload = this.ossClient.asyncMultipartUpload(
          request,
          plus.android.implements(OSSCompletedCallback, {
            onSuccess: (request, result) => {
              const fileUrl = `${options.ossConfig.endpoint}/${ossKey}`
              const metadata = {
                size: file.size,
                name: file.name
              }
              
              options.onSuccess?.(fileUrl, metadata)
              resolve(fileUrl)
              this.currentUpload = null
              
              uni.$logger?.local?.info(`[NativeStrategy] Multipart upload success: ${fileUrl}`)
            },
            onFailure: (request, clientException, serviceException) => {
              const error = {
                code: serviceException?.getStatusCode() || 'CLIENT_ERROR',
                message: serviceException?.getMessage() || clientException?.getMessage() || 'Multipart upload failed'
              }
              
              options.onFailure?.(error)
              reject(new Error(error.message))
              this.currentUpload = null
              
              uni.$logger?.local?.error(`[NativeStrategy] Multipart upload failed: ${error.message}`)
            }
          })
        )
      } catch (e) {
        reject(new Error(`Native multipart upload failed: ${e.message}`))
      }
      // #endif
      
      // #ifndef APP-PLUS
      reject(new Error('Native strategy only supported on APP-PLUS'))
      // #endif
    })
  }

  /**
   * 上传分片（Native 策略不使用）
   * 
   * Native 策略使用 OSS SDK 内置的 multipart upload
   * 此方法不应被调用
   * 
   * @throws {Error} 不支持此方法
   */
  async uploadChunk(file, chunkInfo, options) {
    throw new Error('NativeStrategy uses built-in multipart upload, uploadChunk should not be called directly')
  }

  /**
   * 初始化 OSS 客户端
   * 
   * @param {Object} options - 上传选项
   */
  async initializeOSSClient(options) {
    // #ifdef APP-PLUS
    try {
      // 导入 Android 类
      const OSSClient = plus.android.importClass('com.alibaba.sdk.android.oss.OSSClient')
      const ClientConfiguration = plus.android.importClass('com.alibaba.sdk.android.oss.ClientConfiguration')
      const OSSPlainTextAKSKCredentialProvider = plus.android.importClass('com.alibaba.sdk.android.oss.common.auth.OSSPlainTextAKSKCredentialProvider')

      // 获取 OSS 配置
      const config = await this.getOSSConfig(options)
      
      // 创建凭证提供者
      const credentialProvider = new OSSPlainTextAKSKCredentialProvider(
        config.accessKeyId,
        config.accessKeySecret
      )

      // 创建客户端配置
      const clientConfig = new ClientConfiguration()
      clientConfig.setConnectionTimeout(15000)  // 连接超时 15 秒
      clientConfig.setSocketTimeout(15000)      // Socket 超时 15 秒
      clientConfig.setMaxConcurrentRequest(5)   // 最大并发请求数
      clientConfig.setMaxErrorRetry(2)          // 最大错误重试次数

      // 创建 OSS 客户端
      this.ossClient = new OSSClient(
        plus.android.runtimeMainActivity(),
        config.endpoint,
        credentialProvider,
        clientConfig
      )
      
      uni.$logger?.local?.info('[NativeStrategy] OSS client initialized')
    } catch (e) {
      uni.$logger?.local?.error(`[NativeStrategy] Failed to initialize OSS client: ${e.message}`)
      throw new Error(`Failed to initialize OSS client: ${e.message}`)
    }
    // #endif
    
    // #ifndef APP-PLUS
    throw new Error('Native strategy only supported on APP-PLUS')
    // #endif
  }

  /**
   * 检查文件是否存在
   * @private
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>}
   */
  async _checkFileExists(filePath) {
    return new Promise((resolve) => {
      // #ifdef APP-PLUS
      try {
        plus.io.resolveLocalFileSystemURL(
          filePath,
          () => resolve(true),
          () => resolve(false)
        )
      } catch (e) {
        resolve(false)
      }
      // #endif
      
      // #ifndef APP-PLUS
      resolve(false)
      // #endif
    })
  }

  /**
   * 获取 OSS 配置
   * 
   * @param {Object} options - 上传选项
   * @returns {Promise<Object>} OSS 配置
   */
  async getOSSConfig(options) {
    // 如果 options 中已提供 ossConfig，直接使用
    if (options.ossConfig) {
      return options.ossConfig
    }

    // 否则从后端获取
    return new Promise((resolve, reject) => {
      uni.request({
        url: '/api/oss/config',
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('Failed to get OSS config'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg))
        }
      })
    })
  }

  /**
   * 取消上传
   */
  cancel() {
    if (this.currentUpload) {
      // #ifdef APP-PLUS
      try {
        this.currentUpload.cancel()
        uni.$logger?.local?.info('[NativeStrategy] Upload cancelled')
      } catch (e) {
        uni.$logger?.local?.warn(`[NativeStrategy] Failed to cancel upload: ${e.message}`)
      }
      // #endif
      
      this.currentUpload = null
    }
  }

  /**
   * 检查是否支持
   * 
   * 仅在 Android 平台且 OSS SDK 可用时支持
   * 
   * @returns {boolean} 是否支持
   */
  isSupported() {
    // #ifdef APP-PLUS
    if (plus.os.name === 'Android') {
      try {
        // 尝试导入 OSS SDK 类
        plus.android.importClass('com.alibaba.sdk.android.oss.OSSClient')
        return true
      } catch (e) {
        uni.$logger?.local?.warn('[NativeStrategy] OSS SDK not available')
        return false
      }
    }
    // #endif
    
    return false
  }

  /**
   * 获取策略名称
   * 
   * @returns {string} 'native'
   */
  getName() {
    return 'native'
  }

  /**
   * 生成 OSS 文件路径
   * 
   * 直接使用传入的文件名（已做唯一处理）
   * 格式：uploads/{fileName}
   * 
   * @param {string} fileName - 文件名（已做唯一处理）
   * @param {Object} options - 上传选项
   * @returns {string} OSS 文件路径
   */
  generateOSSKey(fileName, options) {
    const folder = options.ossFolder || 'uploads'
    return `${folder}/${fileName}`
  }
}

// 导出策略类
export default NativeStrategy
