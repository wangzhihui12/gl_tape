// mediaResourceManager.js (修复版)
class MediaResourceManager {
  constructor() {
    this.resourceCache = new Map() // 全局资源缓存
    this.expirationTime = 30 * 24 * 60 * 60 * 1000 // 缓存有效期：30天
    this.maxConcurrentDownloads = 5 // 最大并发下载数
    this.currentDownloads = 0 // 当前下载数
    this.downloadQueue = [] // 下载队列
    this.initStorage() // 初始化存储
  }

  /**
   * 初始化存储目录
   */
  async initStorage() {
    try {
      // 安全检查 uni.env 是否存在
      let cacheDir = '/tmp/media_cache' // 默认路径
      if (typeof uni !== 'undefined' && uni.env && uni.env.USER_DATA_PATH) {
        cacheDir = `${uni.env.USER_DATA_PATH}/media_cache`
      } else if (typeof plus !== 'undefined') {
        // App端
        cacheDir = `${plus.io.convertLocalFileSystemURL('_doc')}/media_cache`
      }

      this.cacheDir = cacheDir
      this.loadFromStorage()
    } catch (error) {
      console.error('初始化媒体缓存目录失败:', error)
      // 降级到使用临时路径
      this.cacheDir = '/tmp'
      this.loadFromStorage()
    }
  }

  /**
   * 获取资源（支持预加载控制）
   * @param {string} url - 资源URL
   * @param {boolean} immediate - 是否立即下载（高优先级）
   * @returns {Promise<string>} - 本地资源路径
   */
  async getResource(url, immediate = false) {
    // 检查缓存中是否存在有效资源
    const cached = this.getCache(url)
    if (cached) {
      // 验证文件是否存在
      if (await this.checkFileExists(cached.url)) {
        return cached.url
      } else {
        // 文件不存在，从缓存中移除
        this.removeCache(url)
      }
    }

    // 返回一个Promise，加入下载队列
    return new Promise((resolve, reject) => {
      const downloadTask = {
        url,
        resolve,
        reject,
        priority: immediate ? 1 : 0 // 优先级：1=高，0=普通
      }

      if (immediate) {
        // 高优先级任务插入队列前面
        this.downloadQueue.unshift(downloadTask)
      } else {
        // 普通任务添加到队列末尾
        this.downloadQueue.push(downloadTask)
      }

      // 尝试处理队列
      this.processDownloadQueue()
    })
  }

  /**
   * 处理下载队列
   */
  processDownloadQueue() {
    // 如果已达最大并发数，等待
    if (this.currentDownloads >= this.maxConcurrentDownloads) {
      return
    }

    // 如果队列为空，无需处理
    if (this.downloadQueue.length === 0) {
      return
    }

    // 按优先级排序（高优先级在前）
    this.downloadQueue.sort((a, b) => b.priority - a.priority)

    // 取出下一个任务
    const task = this.downloadQueue.shift()

    // 增加当前下载数
    this.currentDownloads++

    // 执行下载
    this.downloadResource(task.url)
      .then(localPath => {
        // 缓存资源
        this.setCache(task.url, localPath)
        // 完成任务
        task.resolve(localPath)
      })
      .catch(error => {
        task.reject(error)
      })
      .finally(() => {
        // 减少当前下载数
        this.currentDownloads--
        // 继续处理队列
        this.processDownloadQueue()
      })
  }

  /**
   * 批量预加载资源
   * @param {string[]} urls - 资源URL数组
   * @param {number} maxConcurrent - 本次预加载的最大并发数
   * @returns {Promise<Array<{url: string, success: boolean, result: any}>>}
   */
  async preloadResources(urls, maxConcurrent = 3) {
    // 保存原始并发限制
    const originalMaxConcurrent = this.maxConcurrentDownloads
    // 临时调整并发限制
    this.maxConcurrentDownloads = Math.min(maxConcurrent, originalMaxConcurrent)

    // 过滤掉已缓存的资源
    const uncachedUrls = urls.filter(url => !this.hasValidCache(url))

    // 创建所有下载Promise
    const downloadPromises = uncachedUrls.map(url =>
      this.getResource(url)
        .then(result => ({ url, success: true, result }))
        .catch(error => ({ url, success: false, result: error }))
    )

    try {
      // 等待所有下载完成
      const results = await Promise.allSettled(downloadPromises)

      // 格式化结果
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            url: uncachedUrls[index],
            success: false,
            result: result.reason
          }
        }
      })
    } finally {
      // 恢复原始并发限制
      this.maxConcurrentDownloads = originalMaxConcurrent
    }
  }

  /**
   * 下载资源并保存到持久化存储
   * @param {string} url - 资源URL
   * @returns {Promise<string>} - 本地资源路径
   */
  downloadResource(url) {
    return new Promise((resolve, reject) => {
      // 发起下载
      uni.downloadFile({
        url: url,
        success: res => {
          if (res.statusCode === 200) {
            // 将临时文件保存到持久化存储
            this.saveFileToPersistentStorage(res.tempFilePath, url)
              .then(savedPath => resolve(savedPath))
              .catch(err => {
                // 如果保存失败，返回临时路径（可能无法持久化）
                console.warn('保存文件到持久化存储失败，使用临时路径:', err)
                resolve(res.tempFilePath)
              })
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`))
          }
        },
        fail: err => {
          reject(new Error(`网络错误: ${err.errMsg}`))
        }
      })
    })
  }

  /**
   * 将临时文件保存到持久化存储
   * @param {string} tempFilePath - 临时文件路径
   * @param {string} url - 原始URL（用于生成文件名）
   * @returns {Promise<string>} - 持久化文件路径
   */
  async saveFileToPersistentStorage(tempFilePath, url) {
    return new Promise((resolve, reject) => {
      try {
        // 在App端使用 uni.saveFile 保存到持久化存储
        if (typeof plus !== 'undefined') {
          uni.saveFile({
            tempFilePath: tempFilePath,
            success: res => {
              console.log('文件保存成功:', res.savedFilePath)
              resolve(res.savedFilePath)
            },
            fail: err => {
              console.warn('App端保存文件失败，使用原始路径:', err)
              resolve(url)
            }
          })
        }
        // 在其他平台（H5、小程序）直接使用原始路径
        else {
          console.log('非App端，使用原始路径')
          resolve(url)
        }
      } catch (error) {
        console.warn('保存文件异常，使用原始路径:', error)
        resolve(url)
      }
    })
  }

  /**
   * 生成文件名
   * @param {string} url - 资源URL
   * @returns {string} - 文件名
   */
  generateFileName(url) {
    // 使用URL的hash值和扩展名生成文件名
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const ext = pathname.substring(pathname.lastIndexOf('.'))
      const hash = this.simpleHash(url)
      return `${hash}${ext}`
    } catch (error) {
      // URL解析失败时使用简单hash
      const hash = this.simpleHash(url)
      return `${hash}.tmp`
    }
  }

  /**
   * 简单的字符串哈希函数
   * @param {string} str - 输入字符串
   * @returns {string} - 哈希值
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 检查文件是否存在
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>} - 文件是否存在
   */
  checkFileExists(filePath) {
    return new Promise(resolve => {
      // 在App端检查文件是否存在
      if (typeof plus !== 'undefined') {
        plus.io.resolveLocalFileSystemURL(
          filePath,
          () => {
            resolve(true)
          },
          () => {
            resolve(false)
          }
        )
      }
      // 在其他平台假设文件存在
      else {
        // 对于临时路径，我们假设它们在一段时间内有效
        resolve(true)
      }
    })
  }

  // 检查资源是否有效（未过期）
  hasValidCache(url) {
    if (!this.resourceCache.has(url)) {
      return false
    }

    const cached = this.resourceCache.get(url)
    const now = Date.now()

    if (now - cached.downloadTime > this.expirationTime) {
      return false
    }

    return true
  }

  // 获取缓存资源
  getCache(url) {
    if (!this.hasValidCache(url)) {
      return null
    }

    return this.resourceCache.get(url)
  }

  // 设置缓存资源
  setCache(url, localPath) {
    const resourceInfo = {
      url: localPath,
      downloadTime: Date.now() // 记录下载时间
    }

    this.resourceCache.set(url, resourceInfo)
    this.saveToStorage() // 保存到本地存储
  }

  // 移除缓存
  removeCache(url) {
    this.resourceCache.delete(url)
    this.saveToStorage()
  }

  // 从本地存储加载缓存信息
  loadFromStorage() {
    try {
      const cachedData = uni.getStorageSync('media_resource_cache')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        for (const [url, data] of Object.entries(parsed)) {
          this.resourceCache.set(url, {
            url: data.url,
            downloadTime: data.downloadTime
          })
        }
      }
    } catch (error) {
      console.warn('加载媒体资源缓存失败:', error)
    }
  }

  // 保存缓存信息到本地存储
  saveToStorage() {
    try {
      const cacheObject = {}
      // 限制存储的缓存数量，避免localStorage溢出
      const maxCacheItems = 1000
      let count = 0

      for (const [url, data] of this.resourceCache.entries()) {
        if (count >= maxCacheItems) break
        cacheObject[url] = {
          url: data.url,
          downloadTime: data.downloadTime
        }
        count++
      }

      uni.setStorageSync('media_resource_cache', JSON.stringify(cacheObject))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // localStorage空间不足，清理过期项
        console.warn('localStorage空间不足，自动清理')
        this.cleanupExpired()

        // 再次尝试保存
        try {
          const cacheObject = {}
          for (const [url, data] of this.resourceCache.entries()) {
            cacheObject[url] = {
              url: data.url,
              downloadTime: data.downloadTime
            }
          }
          uni.setStorageSync('media_resource_cache', JSON.stringify(cacheObject))
        } catch (retryError) {
          console.error('重试保存失败:', retryError)
        }
      } else {
        console.warn('保存媒体资源缓存失败:', error)
      }
    }
  }

  // 清理过期资源（手动调用）
  cleanupExpired() {
    const now = Date.now()
    let cleanedCount = 0

    for (const [url, cached] of this.resourceCache.entries()) {
      if (now - cached.downloadTime > this.expirationTime) {
        // 清理过期资源
        this.removeFile(cached.url)
        this.resourceCache.delete(url)
        cleanedCount++
      }
    }

    // 如果有清理操作，更新本地存储
    if (cleanedCount > 0) {
      this.saveToStorage()
      console.log(`[MediaManager] 已清理 ${cleanedCount} 个过期资源`)
    }

    return cleanedCount
  }

  /**
   * 删除文件
   * @param {string} filePath - 文件路径
   */
  removeFile(filePath) {
    try {
      // 在App端删除保存的文件
      if (typeof plus !== 'undefined') {
        uni.removeSavedFile({
          filePath: filePath,
          success: () => {
            console.log('文件删除成功:', filePath)
          },
          fail: err => {
            console.warn('文件删除失败:', filePath, err)
          }
        })
      }
    } catch (error) {
      console.warn('删除文件时出错:', error)
    }
  }
}

// 创建全局单例
const mediaResourceManager = new MediaResourceManager()

export default mediaResourceManager
