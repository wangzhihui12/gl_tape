/*
 * @Author: limin
 * @Date: 2025-01-15
 * @Description: 录音管理策略工厂 (Strategy Pattern)
 */

import NativeRecorder from './NativeRecorder'
import NativeSave from './NativeSave'
import PollingSave from './PollingSave'

// 录音模式配置
// true: 使用 NativeRecorder (长录音，直接保存文件)
// false: 使用 uni.getRecorderManager + 30s 轮询保存逻辑
export const USE_NATIVE_RECORDER = true

// --- Recorder Strategies (录音器策略) ---

/**
 * UniApp 原生录音策略
 * 封装 uni.getRecorderManager()
 */
class UniRecorderStrategy {
  constructor() {
    this.manager = uni.getRecorderManager()
    this.name = 'uni.getRecorderManager'
  }
  
  start(options) {
    this.manager.start(options)
  }
  
  stop() {
    this.manager.stop()
  }
  
  onStart(cb) {
    this.manager.onStart(cb)
  }
  
  onStop(cb) {
    this.manager.onStop(cb)
  }
  
  onError(cb) {
    this.manager.onError(cb)
  }
}

// NativeRecorder 已经实现了相同的接口，直接作为策略使用

// --- Strategy Factory (策略工厂) ---

class StrategyFactory {
  /**
   * 获取录音器策略
   * @returns {Object} 录音器实例 (Strategy)
   */
  static getRecorderStrategy() {
    // #ifdef APP-PLUS
    if (USE_NATIVE_RECORDER && plus.os.name === 'Android') {
      return NativeRecorder
    }
    // #endif
    return new UniRecorderStrategy()
  }
  
  /**
   * 获取保存策略
   * @param {Object} context 上下文 (通常是 TempRecord 实例需要的参数)
   * @returns {Object} 保存策略实例
   */
  static getSaveStrategy(...args) {
    let StrategyClass = PollingSave
    // #ifdef APP-PLUS
    if (USE_NATIVE_RECORDER && plus.os.name === 'Android') {
      StrategyClass = NativeSave
    }
    // #endif
    return new StrategyClass(...args)
  }
}

export default StrategyFactory 
