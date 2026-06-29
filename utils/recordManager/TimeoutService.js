/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-12-06 10:13:02
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:34:24
 * @FilePath: /gl_tape/utils/recordManager/TimeoutService.js
 */
class TimeoutService {
  TIMEOUT = 40 // 40分钟
  Miniute = 60 * 1000
  TIMER_DURATION = this.TIMEOUT * this.Miniute
  CHECK_INTERVAL = 1 * this.Miniute // 1分钟检查一次
  onStop = null
  __timerId = null
  _lastActiveTime = 0
  constructor(onStop) {
    this.onStop = onStop
  }
  start() {
    uni.$on('reset_timeout', this.handleTouchStart)
    this.watch()
  }
  async stopRecorder() {
    return this.onStop()
  }
  // 初始化或启动监听
  watch() {
    // 1. 无论是否已启动，先更新活跃时间
    this._lastActiveTime = Date.now()
    // 2. 如果定时器已在运行，直接返回，避免重复创建
    // 这是相比原方案最大的优化：全周期只有一个 setInterval 实例
    if (this.__timerId) return
    // 3. 启动周期性检查
    this.__watchStart()
  }
  __watchStart() {
    this.__timerId = setInterval(async () => {
      const now = Date.now()
      // 直接计算时间差，比维护 counter 计数器更准确、更简单
      if (now - this._lastActiveTime >= this.TIMER_DURATION) {
        await this.__watchStop()
        if (!this.__timerId) uni.$logger.local.info(`== 检测到${this.TIMEOUT}分钟闲置未操作，自动停止录音 ==`)
      }
    }, this.CHECK_INTERVAL)
    if (this.__timerId) uni.$logger.local.info('== 开启闲置检测 ==')
  }
  async __watchStop() {
    await this.stopRecorder()
    this.endWatchClick()
  }
  endWatchClick() {
    if (this.__timerId) {
      clearInterval(this.__timerId)
      this.__timerId = null
    }
    this._lastActiveTime = null
    uni.$logger.local.info('== 停止闲置检测 ==')
  }
  handleTouchStart() {
    //实现防抖
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
    this._debounceTimer = setTimeout(() => {
      this._lastActiveTime = Date.now()
    }, 1000)
  }
  stop() {
    uni.$off('reset_timeout', this.handleTouchStart)
    this.endWatchClick()
  }
}
export default TimeoutService
