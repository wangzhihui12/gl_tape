/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-14 14:30:10
 * @LastEditors: limin
 * @LastEditTime: 2026-01-22 15:47:06
 * @FilePath: \gl_tape\utils\recordManager\RecordCacheManager.js
 */
/**
 * 缓存配置表
 * 用于定义哪些字段需要走 LocalStorage 暂存策略
 */
const CACHE_CONFIG = {
  MATERIAL_POINTS: {
    keyPrefix: 'MATERIAL_POINTS_',           // Storage Key 前缀
    targetField: 'receptionCustomerMaterialPointList' // 对应的 Record 字段名
  }
}

/**
 * 记录缓存管理器
 * 统一管理大字段的暂存、合并与清理
 */
const RecordCacheManager = {
  /**
   * 暂存数据
   * @param {string} recordId - 记录ID
   * @param {string} type - 缓存类型 (key of CACHE_CONFIG)
   * @param {any} data - 数据
   */
  set(recordId, type, data) {
    if (!recordId || !CACHE_CONFIG[type]) return
    try {
      const config = CACHE_CONFIG[type]
      uni.setStorageSync(config.keyPrefix + recordId, data)
    } catch (e) {
      uni.$logger.local.error(`RecordCacheManager: Set ${type} failed: ${e.message}`)
    }
  },

  /**
   * 消费缓存：读取缓存 -> 返回数据 -> 删除缓存
   * @param {Object} record - 记录对象 (仅用于获取ID)
   * @returns {Object} 从缓存恢复的数据对象
   */
  consumeAll(record) {
    if (!record || !record.id) return {}
    const restoredData = {}
    Object.values(CACHE_CONFIG).forEach(config => {
      try {
        const key = config.keyPrefix + record.id
        const data = uni.getStorageSync(key)
        if (data) {
          restoredData[config.targetField] = data
          uni.removeStorageSync(key) // 消费即焚
        }
      } catch (e) {
        uni.$logger.local.warn(`RecordCacheManager: Consume ${config.keyPrefix} failed: ${e.message}`)
      }
    })
    return restoredData
  },

  /**
   * 清理指定记录的所有缓存
   * @param {string} recordId
   */
  clearAll(recordId) {
    if (!recordId) return
    Object.values(CACHE_CONFIG).forEach(config => {
      try {
        uni.removeStorageSync(config.keyPrefix + recordId)
      } catch (e) {}
    })
  }
}

export default RecordCacheManager
