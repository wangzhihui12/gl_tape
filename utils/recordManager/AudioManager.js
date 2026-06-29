/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-12-04 18:17:23
 * @LastEditors: limin
 * @LastEditTime: 2026-01-20 09:23:27
 * @FilePath: \gl_tape\utils\recordManager\AudioManager.js
 */
import StrategyFactory  from './strategies'

class AudioManager {
  startOptions = {
    duration: 10 * 60 * 1000, //默认10分钟
    sampleRate: 16000,
    numberOfChannels: 1
  }
  __isRecording = false
  __counter = 0
  events = {}

  /**
   * AudioManager类的构造函数
   * 负责初始化音频管理器实例，包括音频录制的开始、停止和错误处理
   * @param {Function} onStart - 音频录制开始时的回调函数
   * @param {Function} onStop - 音频录制停止时的回调函数
   * @param {Function} onError - 音频录制遇到错误时的回调函数
   */
  constructor(onStart, onStop, onError) {
    this.on()
    this.events = {
      onStart,
      onStop,
      onError
    }
  }
  on() {
    // 使用策略工厂获取录音管理器实例
    this.recorderManager = StrategyFactory.getRecorderStrategy()
    
    // 统一日志输出，利用多态特性，不再需要 if 判断
    uni.$logger.local.info(`AudioManager: Using ${this.recorderManager.name}`)

    this.recorderManager.onStart(this.onStart.bind(this))
    this.recorderManager.onStop(this.onStop.bind(this))
    this.recorderManager.onError(this.onError.bind(this))
  }
  /**
   * 启动录音管理器开始录音
   * 此方法用于初始化录音过程，它将配置参数应用到录音管理器，并开始录音
   */
  start() {
    uni.$logger.local.info('〖录音管理Audio〗 == 开启录音 ')
    this.recorderManager.start(this.startOptions)
  }
  /**
   * 异步处理录音开始时的回调函数
   *
   * 此函数在录音开始时被调用，主要用于执行一些初始化操作和状态更新
   * 它首先记录了一条信息到日志，然后执行事件的onStart方法，
   * 并且更新内部计数器和录音状态标志
   */
  async onStart(res) {
    // 记录录音开始的信息到日志
    uni.$logger.local.info('〖录音管理Audio〗 == 开启录音回调 '+JSON.stringify(res))
    // 等待事件的onStart方法执行完成
    await this.events.onStart(res)
    // 内部计数器增加，用于跟踪录音开始的次数
    this.__counter++
    // 设置录音状态标志为true，表示当前正在录音
    this.__isRecording = true
  }
  /**
   * 停止录音功能
   *
   * 此方法用于停止当前正在进行的录音操作它首先记录了停止录音的信息，
   * 然后重置了当前的录音状态，最后通过调用RecorderManager的stop方法来停止录音
   */
  stop() {
    // 记录停止录音的信息
    uni.$logger.local.info('〖录音管理Audio〗 == 停止录音 ')
    // 重置录音状态
    this.reset()
    // 调用RecorderManager的stop方法来停止录音
    this.recorderManager.stop()
  }
  /**
   * 异步处理停止录音的回调函数
   * @param {Object} res - 停止录音的回调结果对象
   *
   * 此函数用于在录音停止时执行相应的逻辑它接收一个回调结果对象作为参数，
   * 该对象包含有关停止录音的信息它首先记录了一条信息表示录音已停止，
   * 然后调用events对象上的onStop方法处理具体的停止录音逻辑
   */
  async onStop(res) {
    uni.$logger.local.info('〖录音管理Audio〗 == 停止录音回调 ')
    await this.events.onStop(res)
  }
  /**
   * 异步处理错误的方法
   *
   * 当遇到错误时，此方法会被调用，它将等待错误事件处理完成
   * 主要作用是将错误传递给注册在this.events上的错误事件处理器
   *
   * @param {Error} err - 发生的错误对象
   */
  async onError(err) {
    await this.events.onError(err)
  }
  /**
   * 获取当前是否正在录音的状态
   *
   * 此方法用于获取实例当前的录音状态它返回一个布尔值，表示是否正在录音
   * 该方法没有参数
   *
   * @returns {boolean} 当前是否正在录音true表示正在录音，false表示未在录音
   */
  get isRecording() {
    return this.__isRecording
  }
  /**
   * 获取当前计数器的值
   *
   * 此方法作为属性访问器，用于获取内部私有属性 __counter 的值
   * 它没有参数
   * 返回值为当前计数器的值
   */
  get counter() {
    return this.__counter
  }

  setCounter(val) {
    this.__counter = val
  }

  /**
   * 重置录音状态
   *
   * 此方法用于将录音管理器的状态重置为初始状态，即不是正在录音，且计数器清零
   * 它主要用于准备开始新的录音过程或取消当前录音过程时，清理所有录音相关状态
   */
  reset() {
    // 记录重置录音状态的日志信息
    uni.$logger.local.info('〖录音管理Audio〗 == 重置录音状态 ')
    // 设置__isRecording属性为false，表示当前不处于录音状态
    this.__isRecording = false
    // 将__counter计数器重置为0，此计数器可能用于记录录音过程中的某些度量，如录音时间
    this.__counter = 0
  }
}
export default AudioManager
