/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-08 11:28:48
 * @LastEditors: limin
 * @LastEditTime: 2026-01-21 15:56:43
 * @FilePath: \gl_tape\mixin\timeout.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const TIMEOUT = 40 // 40分钟
const Miniute = 60 * 1000
const TIMER_DURATION = TIMEOUT * Miniute 
const CHECK_INTERVAL = 1 * Miniute // 1分钟检查一次
import utils from '@/utils/utils'

export default {
  data() {
    return {
      __timerId: null,
      _lastActiveTime: 0
    }
  },
  methods: {
    // 结束提示
    async stopRecorder() {
      this.setReceptionStatus(0)
      await this.recordService.getRecorder().withError()
      await this.stop()
    },
    // 初始化或启动监听
    initTime() {
      // 1. 无论是否已启动，先更新活跃时间
      this._lastActiveTime = Date.now()
      // 2. 如果定时器已在运行，直接返回，避免重复创建
      // 这是相比原方案最大的优化：全周期只有一个 setInterval 实例
      if (this.__timerId) return
      // 3. 启动周期性检查
      this.__watchStart()
    },

    __watchStart() {
      this.__timerId = setInterval(async () => {
        const now = Date.now()
        // 直接计算时间差，比维护 counter 计数器更准确、更简单
        if (now - this._lastActiveTime >= TIMER_DURATION) {
          await this.__watchStop()
          if (!this.__timerId) uni.$logger.local.info(`== 检测到${ TIMEOUT }分钟闲置未操作，自动停止录音 ==`)
        }
      }, CHECK_INTERVAL)
      if (this.__timerId) uni.$logger.local.info('== 开启闲置检测 ==')
    },

    async __watchStop() {
      await this.stopRecorder()
      this.endWatchClick()
    },

    // 停止监听
    endWatchClick() {
      if (this.__timerId) {
        clearInterval(this.__timerId)
        this.__timerId = null
      }
      this._lastActiveTime = null
      uni.$logger.local.info('== 停止闲置检测 ==')
    },

    // 响应触摸事件
    // 使用 debounce 包装：在连续触摸过程中（如滑动屏幕）不更新，
    // 只有用户停止操作 1秒后，才更新一次时间戳
    handleTouchStart: utils.debounce(function() {
      this._lastActiveTime = Date.now()
    }, 1500),
  },
  created() {
    uni.$on('reset_timeout', this.handleTouchStart)
  },
  beforeDestroy() {
    uni.$off('reset_timeout', this.handleTouchStart)
    this.endWatchClick()
  }
}
