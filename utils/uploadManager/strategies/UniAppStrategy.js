/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:36:49
 * @LastEditors: limin
 * @LastEditTime: 2026-02-06 19:07:55
 * @FilePath: \gl_tape\utils\uploadManager\strategies\UniAppStrategy.js
 */

import UploadStrategy from './UploadStrategy.js'

// 导入加密库（只加载一次）
const base64 = require('@/utils/ossUploadFile/base64.js')
const Crypto = require('@/utils/ossUploadFile/crypto.js')
import { STRATEGY_NAMES } from '../constants.js'
/**
 * UniApp 上传策略（推荐方案）
 * 
 * 特点：
 * 1. 使用 uni.uploadFile API 直接上传到 OSS
 * 2. 无需 WebView，性能更好，内存占用更小
 * 3. 支持进度回调
 * 4. 统一的分片上传流程（小文件分片数为 1）
 * 5. 支持取消上传
 */
class UniAppStrategy extends UploadStrategy {
  ossFolder = 'quality/'
  constructor() {
    super()
    
    /**
     * 当前上传任务
     * @type {Object|null}
     */
    this.uploadTask = null
  }

  /**
   * 上传文件
   * 
   * 使用 uni.uploadFile + OSS 表单上传（PostObject）
   * 
   * 注意：OSS 表单上传不支持分片上传，每次上传整个文件
   * 
   * @param {Object} file - 文件对象
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async upload(file, options) {
    const { ossConfig } = options
    
    if (!ossConfig) {
      throw new Error('OSS config not provided')
    }

    // 生成 OSS 文件路径
    const ossKey = this.generateOSSKey(file.name, options)
    const fileUrl = `${ossConfig.endpoint}/${ossKey}`

    // uni.$logger?.local?.info(`[UniAppStrategy] Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) to ${ossKey}`)
    
    // 直接上传整个文件
    return this.uploadFile(file, ossKey, fileUrl, ossConfig, options)
  }

  /**
   * 上传文件到 OSS
   * 
   * 使用 uni.uploadFile + OSS 表单上传（PostObject）
   * 
   * @param {Object} file - 文件对象
   * @param {string} ossKey - OSS 文件路径
   * @param {string} fileUrl - 完整文件 URL
   * @param {Object} ossConfig - OSS 配置
   * @param {Object} options - 上传选项
   * @returns {Promise<string>} 文件 URL
   */
  async uploadFile(file, ossKey, fileUrl, ossConfig, options) {
    return new Promise((resolve, reject) => {
      // 生成 policy 和 signature
      const { policy, signature } = this._generatePolicy(ossKey, ossConfig)
      
      // 构造上传表单数据
      const formData = {
        key: ossKey,
        OSSAccessKeyId: ossConfig.accessKeyId,
        policy: policy,
        signature: signature,
        'success_action_status': '200'
      }
      
      // 如果有 STS Token，添加到表单
      if (ossConfig.stsToken) {
        formData['x-oss-security-token'] = ossConfig.stsToken
      }
      console.log('formData', formData,ossConfig)
      // 创建上传任务
      this.uploadTask = uni.uploadFile({
        url: ossConfig.endpoint,
        filePath: file.path,
        name: 'file',
        formData: formData,
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            // uni.$logger?.local?.info(`[UniAppStrategy] Upload success: ${fileUrl}`)
            options.onSuccess?.(fileUrl, { size: file.size, name: file.name })
            resolve(fileUrl)
          } else {
            const error = new Error(`Upload failed with status ${res.statusCode}`)
            uni.$logger?.local?.error(`[UniAppStrategy] ${error.message}`)
            options.onFailure?.(error)
            reject(error)
          }
        },
        fail: (err) => {
          const error = new Error(err.errMsg || 'Upload failed')
          uni.$logger?.local?.error(`[UniAppStrategy] ${error.message}`)
          options.onFailure?.(error)
          reject(error)
        }
      })

      // 监听上传进度
      this.uploadTask.onProgressUpdate((res) => {
        options.onProgress?.(res.progress)
      })
    })
  }

  /**
   * 生成 OSS Policy 和 Signature
   * 
   * OSS PostObject 表单上传的安全验证机制：
   * 1. Policy：定义上传权限和限制（过期时间、文件大小、bucket 等）
   * 2. Signature：使用 AccessKeySecret 对 policy 进行 HMAC-SHA1 签名
   * 3. OSS 服务器验证签名，确保请求来自授权用户
   * 
   * @param {string} ossKey - OSS 文件路径
   * @param {Object} ossConfig - OSS 配置
   * @returns {Object} { policy, signature }
   * @private
   */
  _generatePolicy(ossKey, ossConfig) {
    // 生成过期时间（1小时后）
    const expiration = new Date(Date.now() + 3600 * 1000).toISOString()
    
    // 构造 policy（定义上传规则）
    const policyObj = {
      expiration: expiration,
      conditions: [
        { bucket: ossConfig.bucket },
        ['eq', '$key', ossKey],
        ['content-length-range', 0, 1048576000] // 最大 1GB
      ]
    }
    
    // Base64 编码 policy
    const policyBase64 = base64.encode(JSON.stringify(policyObj))
    
    // HMAC-SHA1 签名（使用 AccessKeySecret）
    const bytes = Crypto.HmacSHA1(policyBase64, ossConfig.accessKeySecret)
    const signature = Crypto.enc.Base64.stringify(bytes)
    
    return {
      policy: policyBase64,
      signature: signature
    }
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
    const folder = options.ossFolder || this.ossFolder
    return `${folder}/${fileName}`
  }

  /**
   * 取消上传
   */
  cancel() {
    if (this.uploadTask) {
      this.uploadTask.abort()
      this.uploadTask = null
      uni.$logger?.local?.info('[UniAppStrategy] Upload cancelled')
    }
  }

  /**
   * 检查是否支持
   * 
   * @returns {boolean} 是否支持
   */
  isSupported() {
    return typeof uni !== 'undefined' && typeof uni.uploadFile === 'function'
  }

  /**
   * 获取策略名称
   * 
   * @returns {string} 'uniapp'
   */
  getName() {
    return STRATEGY_NAMES.UNIAPP
  }
}

// 导出策略类
export default UniAppStrategy
