/*
 * @Author: AI Assistant
 * @Date: 2025-01-28
 * @Description: 配置管理器 - 管理上传策略配置（简化版）
 * @Feature: oss-upload-refactor
 */

/**
 * 配置管理器（简化版）
 * 
 * 功能：
 * 1. 管理上传配置
 * 2. 支持运行时配置更新
 * 
 * 简化说明：
 * - 移除了复杂的 LocalStorage 持久化
 * - 移除了未使用的方法
 * - 使用内存配置，简单高效
 */
class ConfigurationManager {
  constructor() {
    /**
     * 当前配置
     * @type {Object}
     */
    this.config = {
      strategyPriority: [STRATEGY_NAMES.UNIAPP, STRATEGY_NAMES.WEBVIEW], // 策略优先级
      retryConfig: {
        maxRetries: 3,        // 最大重试次数
        retryDelay: 1000      // 重试延迟（毫秒）
      }
    }
  }

  /**
   * 获取当前配置
   * 
   * @returns {Object} 配置对象
   */
  getCurrentConfig() {
    return this.config
  }

  /**
   * 更新配置
   * 
   * @param {Object} newConfig - 新配置（部分或全部）
   */
  async updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    }
    
    uni.$logger?.local?.info('[ConfigurationManager] Config updated')
  }

  /**
   * 获取首选上传策略
   * 
   * @returns {Promise<string>} 策略名称
   */
  async getPreferredStrategy() {
    return this.config.strategyPriority[0]
  }
}

// 导出管理器类
export default ConfigurationManager
