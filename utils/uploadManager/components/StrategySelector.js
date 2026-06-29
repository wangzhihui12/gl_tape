/*
 * @Author: AI Assistant
 * @Date: 2025-01-28
 * @Description: 策略选择器 - 管理上传策略的注册和选择（简化版）
 * @Feature: oss-upload-refactor
 */

import UploadStrategy from '../strategies/UploadStrategy.js'

/**
 * 策略选择器（简化版）
 * 
 * 功能：
 * 1. 注册上传策略
 * 2. 根据名称获取策略
 * 3. 获取所有已注册的策略
 * 
 * 简化说明：
 * - 移除了未使用的方法
 * - 保留核心功能
 */
class StrategySelector {
  constructor() {
    /**
     * 策略 Map
     * key: 策略名称, value: 策略实例
     * @type {Map<string, UploadStrategy>}
     */
    this.strategies = new Map()
  }

  /**
   * 注册策略
   * 
   * @param {UploadStrategy} strategy - 策略实例
   * @throws {Error} 如果策略不是 UploadStrategy 的实例
   */
  register(strategy) {
    if (!(strategy instanceof UploadStrategy)) {
      throw new Error('Strategy must extend UploadStrategy')
    }
    
    const name = strategy.getName()
    this.strategies.set(name, strategy)
  }

  /**
   * 根据名称获取策略
   * 
   * @param {string} name - 策略名称 ('webview', 'uniapp')
   * @returns {UploadStrategy|null} 策略实例，不存在时返回 null
   */
  getStrategy(name) {
    return this.strategies.get(name) || null
  }

  /**
   * 获取所有已注册的策略
   * 
   * @returns {Array<UploadStrategy>} 策略实例数组
   */
  getAllStrategies() {
    return Array.from(this.strategies.values())
  }
}

// 导出选择器类
export default StrategySelector
