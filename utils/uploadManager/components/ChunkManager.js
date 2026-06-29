/*
 * @Author: AI Assistant
 * @Date: 2025-01-28
 * @Description: 分片管理器 - 处理大文件分片上传和断点续传
 * @Feature: oss-upload-refactor
 */

/**
 * ChunkManager - 分片上传和断点续传管理器
 * 
 * 注意：当前未使用此管理器
 * 
 * 原因：
 * 1. OSS 表单上传（PostObject）不支持分片上传
 * 2. uni.uploadFile 只能上传完整文件，不能上传文件的一部分
 * 3. 真正的分片上传需要使用 OSS SDK 或 REST API
 * 
 * 如果需要分片上传，请使用 WebViewStrategy（OSS SDK）
 * 
 * 功能（保留用于未来扩展）：
 * 1. 判断文件是否需要分片上传
 * 2. 根据文件大小动态计算最优分片大小
 * 3. 执行分片上传流程
 * 4. 保存和恢复上传检查点（断点续传）
 * 5. 清理过期检查点
 * 
 * 设计原则：
 * - 所有上传策略共享此逻辑，避免代码重复
 * - 使用 LocalStorage 持久化检查点数据
 * - 支持断点续传，提高大文件上传可靠性
 */
class ChunkManager {
  constructor() {
    /**
     * 基础分片大小（用作降级）
     * @type {number}
     */
    this.basePartSize = 1024 // 1KB
    
    /**
     * 大文件阈值（超过此大小使用分片上传）
     * @type {number}
     * 
     * 注意：当前禁用分片上传
     * 
     * 原因：
     * - OSS 表单上传（PostObject）不支持分片上传
     * - uni.uploadFile 只能上传完整文件
     * - 真正的分片上传需要使用 OSS SDK（WebViewStrategy）
     * 
     * 配置说明：
     * - Infinity：禁用分片上传（当前配置）
     * - 10 * 1024 * 1024：10MB 阈值（如果启用分片）
     * - 100 * 1024：100KB 阈值（测试用）
     */
    this.largeFileThreshold = Infinity // 禁用分片上传
    
    /**
     * LocalStorage 中存储检查点的键名
     * @type {string}
     */
    this.checkpointStorage = 'upload_checkpoints'
  }

  /**
   * 判断文件是否应该使用分片上传
   * 
   * @param {Object} file - 文件对象
   * @param {number} file.size - 文件大小（字节）
   * @returns {boolean} true 表示需要分片上传
   */
  shouldUseChunkedUpload(file) {
    return file.size > this.largeFileThreshold
  }

  /**
   * 根据文件大小计算最优分片大小
   * 
   * 策略：文件越大，分片越大，减少请求次数
   * 
   * 分片策略（测试环境）：
   * - > 1MB   → 100KB 分片
   * - > 500KB → 50KB 分片
   * - > 100KB → 20KB 分片
   * - 其他    → 20KB 分片（降级）
   * 
   * 分片策略（生产环境）：
   * - > 1GB   → 10MB 分片
   * - > 100MB → 5MB 分片
   * - > 50MB  → 2MB 分片
   * - > 10MB  → 1MB 分片
   * - 其他    → 1MB 分片（降级）
   * 
   * @param {number} fileSize - 文件大小（字节）
   * @returns {number} 最优分片大小（字节）
   */
  getOptimalPartSize(fileSize) {
    const KB = 1024
    const MB = 1024 * 1024

    // 测试环境：小分片策略
    const testStrategies = [
      { threshold: 1 * MB, size: 100 * KB },      // > 1MB → 100KB 分片
      { threshold: 500 * KB, size: 50 * KB },     // > 500KB → 50KB 分片
      { threshold: 100 * KB, size: 20 * KB }      // > 100KB → 20KB 分片
    ]

    // 生产环境：大分片策略
    const prodStrategies = [
      { threshold: 1 * 1024 * MB, size: 10 * MB }, // > 1GB → 10MB 分片
      { threshold: 100 * MB, size: 5 * MB },       // > 100MB → 5MB 分片
      { threshold: 50 * MB, size: 2 * MB },        // > 50MB → 2MB 分片
      { threshold: 10 * MB, size: 1 * MB }         // > 10MB → 1MB 分片
    ]

    // 根据阈值选择策略（100KB 阈值表示测试环境）
    const strategies = this.largeFileThreshold === 100 * KB ? testStrategies : prodStrategies
    const defaultSize = this.largeFileThreshold === 100 * KB ? 20 * KB : 1 * MB

    // 找到第一个匹配的策略
    for (const { threshold, size } of strategies) {
      if (fileSize > threshold) {
        return size
      }
    }

    // 降级到默认分片大小
    return defaultSize
    return this.basePartSize * 1024
  }

  /**
   * 计算文件的分片信息
   * 
   * @param {Object} file - 文件对象
   * @param {number} file.size - 文件大小（字节）
   * @returns {Array<Object>} 分片信息数组
   * 
   * 返回格式：
   * [{
   *   chunkNumber: 1,      // 分片编号（从 1 开始）
   *   start: 0,            // 起始字节位置
   *   end: 5242880,        // 结束字节位置
   *   size: 5242880,       // 分片大小
   *   totalChunks: 10,     // 总分片数
   *   chunkSize: 5242880   // 分片大小（用于参考）
   * }, ...]
   */
  calculateChunks(file) {
    const chunkSize = this.getOptimalPartSize(file.size)
    const totalChunks = Math.ceil(file.size / chunkSize)
    const chunks = []

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      
      chunks.push({
        chunkNumber: i + 1,
        start,
        end,
        size: end - start,
        totalChunks,
        chunkSize
      })
    }

    return chunks
  }

  /**
   * 获取分片上传的上下文信息
   * 
   * 用于策略自己实现分片上传逻辑
   * 
   * @param {Object} file - 文件对象
   * @returns {Object} 分片上传上下文
   * 
   * 返回格式：
   * {
   *   uploadId: string,           // 唯一的上传 ID
   *   chunks: Array<Object>,      // 分片信息数组
   *   checkpoint: Object|null,    // 已有检查点（如果存在）
   *   uploadedChunks: Array<number>, // 已上传的分片编号
   *   uploadedParts: Array<Object>   // 已上传的分片信息
   * }
   */
  async getChunkedUploadContext(file) {
    const uploadId = this.generateUploadId(file)
    const chunks = this.calculateChunks(file)
    
    // 加载已有检查点（断点续传）
    const checkpoint = await this.loadCheckpoint(uploadId)
    const uploadedChunks = checkpoint?.uploadedChunks || []
    const uploadedParts = checkpoint?.uploadedParts || []

    return {
      uploadId,
      chunks,
      checkpoint,
      uploadedChunks,
      uploadedParts
    }
  }

  /**
   * 更新分片上传进度
   * 
   * 由策略在每个分片上传完成后调用
   * 
   * @param {string} uploadId - 上传 ID
   * @param {Object} file - 文件对象
   * @param {number} chunkNumber - 分片编号
   * @param {string} eTag - 分片 ETag
   * @param {Array<number>} uploadedChunks - 已上传的分片编号数组
   * @param {Array<Object>} uploadedParts - 已上传的分片信息数组
   * @param {number} totalChunks - 总分片数
   */
  async updateChunkProgress(uploadId, file, chunkNumber, eTag, uploadedChunks, uploadedParts, totalChunks) {
    // 保存检查点（用于断点续传）
    await this.saveCheckpoint(uploadId, {
      uploadId,
      fileName: file.name,
      uploadedChunks,
      uploadedParts,
      totalChunks
    })
  }

  /**
   * 生成唯一的上传 ID
   * 
   * 格式：{fileName}_{fileSize}_{timestamp}_{random}
   * 
   * @param {Object} file - 文件对象
   * @param {string} file.name - 文件名
   * @param {number} file.size - 文件大小
   * @returns {string} 唯一的上传 ID
   */
  generateUploadId(file) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${file.name}_${file.size}_${timestamp}_${random}`
  }

  /**
   * 保存检查点到 LocalStorage
   * 
   * @param {string} uploadId - 上传 ID
   * @param {Object} checkpoint - 检查点数据
   * @param {string} checkpoint.uploadId - 上传 ID
   * @param {string} checkpoint.fileName - 文件名
   * @param {Array<number>} checkpoint.uploadedChunks - 已上传的分片编号
   * @param {Array<Object>} checkpoint.uploadedParts - 已上传的分片信息
   * @param {number} checkpoint.totalChunks - 总分片数
   */
  async saveCheckpoint(uploadId, checkpoint) {
    try {
      const checkpoints = this.loadAllCheckpoints()
      checkpoints[uploadId] = {
        ...checkpoint,
        timestamp: Date.now()
      }
      uni.setStorageSync(this.checkpointStorage, JSON.stringify(checkpoints))
    } catch (error) {
      console.warn('[ChunkManager] Failed to save checkpoint:', error)
    }
  }

  /**
   * 从 LocalStorage 加载检查点
   * 
   * @param {string} uploadId - 上传 ID
   * @returns {Object|null} 检查点数据，不存在时返回 null
   */
  async loadCheckpoint(uploadId) {
    try {
      const checkpoints = this.loadAllCheckpoints()
      return checkpoints[uploadId] || null
    } catch (error) {
      console.warn('[ChunkManager] Failed to load checkpoint:', error)
      return null
    }
  }

  /**
   * 加载所有检查点
   * 
   * @returns {Object} 所有检查点数据（键为 uploadId）
   */
  loadAllCheckpoints() {
    try {
      const data = uni.getStorageSync(this.checkpointStorage)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      return {}
    }
  }

  /**
   * 清除检查点
   * 
   * @param {string} uploadId - 上传 ID
   */
  async clearCheckpoint(uploadId) {
    try {
      const checkpoints = this.loadAllCheckpoints()
      delete checkpoints[uploadId]
      uni.setStorageSync(this.checkpointStorage, JSON.stringify(checkpoints))
    } catch (error) {
      console.warn('[ChunkManager] Failed to clear checkpoint:', error)
    }
  }

  /**
   * 完成分片上传
   * 
   * 注意：OSS 表单上传（PostObject）不支持真正的分片上传
   * 当前实现的"分片"只是逻辑分片，用于：
   * 1. 显示上传进度
   * 2. 支持断点续传（重新上传时跳过已上传的分片）
   * 
   * 如果需要真正的 OSS 分片上传（Multipart Upload），需要：
   * 1. 使用 OSS SDK（在 WebView 中）
   * 2. 或者调用 OSS REST API（需要复杂的签名）
   * 
   * @param {string} uploadId - 上传 ID
   * @param {Object} file - 文件对象
   * @param {Array<Object>} parts - 已上传的分片信息
   * @param {Object} ossConfig - OSS 配置
   * @returns {Promise<string>} 文件 URL
   */
  async completeChunkedUpload(uploadId, file, parts, ossConfig) {
    // 对于表单上传，每个分片都是独立上传的完整文件
    // 这里只需要返回最后一个分片的 URL
    // 实际上，所有分片都上传到同一个 OSS key，后面的会覆盖前面的
    
    // 构造文件 URL
    const ossKey = parts[0]?.ossKey || `uploads/${file.name}`
    const fileUrl = `${ossConfig.endpoint}/${ossKey}`
    
    uni.$logger?.local?.info(`[ChunkManager] All chunks uploaded, file URL: ${fileUrl}`)
    
    return fileUrl
  }

  /**
   * 清理过期检查点（超过 24 小时）
   * 
   * 建议在应用启动时调用一次
   */
  async cleanupOldCheckpoints() {
    try {
      const checkpoints = this.loadAllCheckpoints()
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 小时

      Object.keys(checkpoints).forEach(uploadId => {
        const checkpoint = checkpoints[uploadId]
        if (now - checkpoint.timestamp > maxAge) {
          delete checkpoints[uploadId]
        }
      })

      uni.setStorageSync(this.checkpointStorage, JSON.stringify(checkpoints))
    } catch (error) {
      console.warn('[ChunkManager] Failed to cleanup checkpoints:', error)
    }
  }
}

// 导出单例
export default ChunkManager
