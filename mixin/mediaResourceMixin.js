// mediaResourceMixin.js - 提供预加载功能的mixin
import mediaResourceManager from '../utils/mediaResourceManager/mediaResourceManager.js'

export default {
  methods: {
    /**
     * 预加载资源
     * @param {string|string[]} urls - 资源URL或URL数组
     * @param {number} maxConcurrent - 最大并发数
     * @returns {Promise<Array<{url: string, success: boolean, result: any}>>}
     */
    async preloadMediaResources(urls, maxConcurrent = 3) {
      const urlList = Array.isArray(urls) ? urls : [urls]
      return await mediaResourceManager.preloadResources(urlList, maxConcurrent)
    },

    /**
     * 获取单个资源（支持优先级控制）
     * @param {string} url - 资源URL
     * @param {boolean} immediate - 是否立即获取（高优先级）
     * @returns {Promise<string>} - 本地资源路径
     */
    async getMediaResource(url, immediate = false) {
      return await mediaResourceManager.getResource(url, immediate)
    },

    /**
     * 检查资源是否已缓存
     * @param {string} url - 资源URL
     * @returns {boolean} - 是否已缓存
     */
    hasMediaResourceCached(url) {
      return mediaResourceManager.hasValidCache(url)
    },

    /**
     * 清理过期的媒体资源缓存
     * @returns {number} - 清理的资源数量
     */
    cleanupExpiredMediaResources() {
      return mediaResourceManager.cleanupExpired()
    }
  }
}
