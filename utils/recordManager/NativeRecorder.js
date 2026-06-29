/*
 * @Author: limin
 * @Date: 2025-01-15
 * @Description: Android原生录音管理器 (Systematic Design)
 * @Purpose: 提供高性能、长时稳定的录音功能，替代 uni.getRecorderManager 在复杂场景下的不足
 * @DesignPattern: Singleton + State Machine + Observer
 */

import utils from '../utils.js'
import PathUtils from './PathUtils.js'

// 录音状态枚举
const RecorderState = {
  IDLE: 'idle',         // 空闲
  RECORDING: 'recording' // 录音中
}

// 默认配置
const DEFAULT_CONFIG = {
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 96000,
  format: 'aac', // 对应 mpeg_4 容器 + aac 编码
  basePath: PathUtils.DEFAULT_SAVE_PATH // 默认持久化保存路径
}

class NativeRecorder {
  static _instance = null

  constructor() {
    if (NativeRecorder._instance) {
      return NativeRecorder._instance
    }
    
    this._state = RecorderState.IDLE
    this._mediaRecorder = null
    this._currentFilePath = ''
    this._listeners = {
      start: [],
      stop: [],
      error: []
    }
    
    // 缓存 Java 类
    this._JavaFile = null
    this._JavaMediaRecorder = null

    // 绑定上下文，防止调用时 this 丢失
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    
    this.name = 'NativeRecorder (Android)' // 策略名称

    NativeRecorder._instance = this
  }

  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!NativeRecorder._instance) {
      NativeRecorder._instance = new NativeRecorder()
    }
    return NativeRecorder._instance
  }

  /**
   * 注册事件监听 (兼容 uni.getRecorderManager 接口)
   */
  onStart(callback) { this._addListener('start', callback) }
  onStop(callback) { this._addListener('stop', callback) }
  onError(callback) { this._addListener('error', callback) }

  /**
   * 内部添加监听器
   */
  _addListener(event, callback) {
    if (typeof callback === 'function') {
      this._listeners[event].push(callback)
    }
  }

  /**
   * 触发事件
   */
  _emit(event, data) {
    // 异步触发，避免阻塞主线程
    setTimeout(() => {
      this._listeners[event].forEach(cb => {
        try {
          cb(data)
        } catch (e) {
          uni.$logger.local.error(`[NativeRecorder] Event handler error (${event}):`, e)
        }
      })
    }, 0)
  }

  /**
   * 检查当前环境是否支持
   */
  _checkEnvironment() {
    // #ifndef APP-PLUS
    return false
    // #endif
    // #ifdef APP-PLUS
    if (plus.os.name !== 'Android') {
      return false
    }
    return true
    // #endif
  }

  /**
   * 延迟加载 Java 类
   */
  _loadJavaClasses() {
    // #ifdef APP-PLUS
    if (!this._JavaFile) {
      this._JavaFile = plus.android.importClass('java.io.File')
    }
    if (!this._JavaMediaRecorder) {
      this._JavaMediaRecorder = plus.android.importClass('android.media.MediaRecorder')
    }
    // #endif
  }

  /**
   * 确保保存目录存在 (带缓存)
   * @param {string} dirPath - 相对路径，如 _doc/uniapp_save/
   * @returns {Promise<string>} - 绝对路径 (Java File 使用)
   */
  async _ensureSaveDir(dirPath) {
    if (this._cachedDir?.path === dirPath && this._cachedDir.absPath) {
      return this._cachedDir.absPath
    }
    const absPath = await PathUtils.ensureDir(dirPath)
    this._cachedDir = { path: dirPath, absPath: absPath }
    return absPath
  }

  /**
   * 开始录音
   * @param {Object} options - 配置项 { sampleRate, numberOfChannels, encodeBitRate, path }
   */
  async start(options = {}) {
    if (!this._checkEnvironment()) {
      this._emit('error', { errMsg: 'Environment not supported (Android App only)' })
      return
    }

    // 如果正在录音，先停止
    if (this._state === RecorderState.RECORDING) {
      uni.$logger.local.warn('[NativeRecorder] Already recording, stopping first...')
      await this.stop()
    }

    // 设置为准备状态，加锁
    // 注意：虽然没有显式的 PREPARING 状态，但 RECORDING 状态配合下面的检查点逻辑
    // 已经实现了"准备中"的并发控制
    this._state = RecorderState.RECORDING

    try {
      // #ifdef APP-PLUS
      // 1. 导入必要的 Android 类
      this._loadJavaClasses()
      const MediaRecorder = this._JavaMediaRecorder
      const File = this._JavaFile

      // 2. 准备路径
      // 使用 TempRecord 统一管理的路径逻辑，避免多处硬编码
      // 这里的 options.path 如果未提供，使用 DEFAULT_CONFIG.basePath
      const basePath = options.path || DEFAULT_CONFIG.basePath
      // _ensureSaveDir 负责将相对路径转换为绝对路径
      // 【关键点】这里是异步操作，期间可能会被 stop() 中断
      const saveDirAbsPath = await this._ensureSaveDir(basePath)
      
      // 【检查点】如果异步期间状态变回 '' (IDLE)（说明被 stop 打断），则终止
      if (this._state !== RecorderState.RECORDING) {
        uni.$logger.local.warn('[NativeRecorder] Start cancelled during preparation')
        return
      }

      // 使用 UUID + 时间戳 确保文件名唯一性，防止多用户并发上传到 OSS 时文件名冲突
      // 格式: {uuid}_{timestamp}.mp3
      const uuidStr = utils.uuid(8, 16) // 生成8位长度的UUID，基数为16
      const fileName = `${Date.now()}_${uuidStr}.mp3`
      const saveFile = new File(saveDirAbsPath, fileName)
      // 确保文件不存在，避免覆盖（虽然时间戳几乎不可能重复）
      if (saveFile.exists()) {
          saveFile.delete()
      }
      this._currentFilePath = saveFile.getAbsolutePath()
      // 3. 初始化 MediaRecorder
      this._mediaRecorder = new MediaRecorder()
      
      // 4. 配置参数 (严格顺序: AudioSource -> OutputFormat -> AudioEncoder)
      this._mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC)
      this._mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
      this._mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
      
      // 应用自定义配置或默认配置
      const sampleRate = options.sampleRate || DEFAULT_CONFIG.sampleRate
      const channels = options.numberOfChannels || DEFAULT_CONFIG.numberOfChannels
      const bitRate = options.encodeBitRate || DEFAULT_CONFIG.encodeBitRate

      this._mediaRecorder.setAudioSamplingRate(sampleRate)
      this._mediaRecorder.setAudioChannels(channels)
      this._mediaRecorder.setAudioEncodingBitRate(bitRate)
      
      this._mediaRecorder.setOutputFile(this._currentFilePath)

      // 5. 准备并启动
      // prepare() 可能会因为硬件占用或权限问题抛出 IOException
      try {
        this._mediaRecorder.prepare()
        this._mediaRecorder.start()
      } catch (prepareErr) {
        throw new Error(`MediaRecorder prepare/start failed: ${prepareErr.message}`)
      }

      // 6. 更新状态
      // 此时状态应该已经是 RECORDING，无需再次设置，但为了保险确认一下
      if (this._state !== RecorderState.RECORDING) return
      
      uni.$logger.local.info(`[NativeRecorder] Started: ${this._currentFilePath}`)
      const fileUrl = 'file://' + this._currentFilePath
      this._emit('start', {
        filePath: this._currentFilePath,
        fullPath: fileUrl,
        fileName: fileName,
        basePath: basePath
      })
      // #endif
    } catch (e) {
      this._handleError('Start failed', e)
    }
  }

  /**
   * 停止录音
   */
  stop() {
    if (!this._checkEnvironment()) return

    if (this._state !== RecorderState.RECORDING) {
      // 已经是空闲，无需操作
      return
    }

    // 无论 MediaRecorder 是否初始化，stop 的意图都是结束录音
    // 如果 _mediaRecorder 为空，说明还在准备阶段，直接清理即可
    if (!this._mediaRecorder) {
      uni.$logger.local.warn('[NativeRecorder] Stopping while preparing (no mediaRecorder instance)')
      this._cleanup()
      return
    }

    try {
      // #ifdef APP-PLUS
      // 停止录音
      // 注意: 如果录音时间极短(小于1s)，stop() 可能会抛出 RuntimeException
      try {
        // 在 stop 之前先重置错误监听器，防止 stop 抛出的异常被误判
        // 但 Java 侧异常需要捕获
        this._mediaRecorder.stop()
      } catch (stopErr) {
        // 常见错误：RuntimeException: stop failed.
        // 原因：录音时间太短（通常小于 1 秒）或尚未开始
        uni.$logger.local.warn('[NativeRecorder] Stop exception (likely too short):', stopErr)
        // 这种情况下，文件可能无效或未生成，需要检查文件是否存在
      }
      
      uni.$logger.local.info(`[NativeRecorder] Stopped`)
      // 检查文件是否存在且大小 > 0
      this._loadJavaClasses()
      const File = this._JavaFile
      const file = new File(this._currentFilePath)
      if (file.exists() && file.length() > 0) {
        // 转换为 uni-app 可用的 file:// 路径
        const fileUrl = 'file://' + this._currentFilePath
        this._emit('stop', {
          filePath: fileUrl
        })
      } else {
        uni.$logger.local.warn('[NativeRecorder] Recorded file invalid (empty or missing)')
        // 可以选择是否抛出 error，或者静默失败
        // this._emit('error', { errMsg: 'Recorded file invalid' }) 
      }
      // #endif
    } catch (e) {
      this._handleError('Stop failed', e)
    } finally {
      this._cleanup()
    }
  }

  /**
   * 内部错误处理
   */
  _handleError(context, error) {
    uni.$logger.local.error(`[NativeRecorder] ${context}:`+ error.message)
    // 清理资源，直接重置为 IDLE
    this._cleanup()
    this._emit('error', { errMsg: `${context}: ${error.message}` })
  }

  /**
   * 资源清理
   */
  _cleanup() {
    if (this._mediaRecorder) {
      try {
        // #ifdef APP-PLUS
        this._mediaRecorder.release()
        // #endif
      } catch (e) {
        // ignore
      }
      this._mediaRecorder = null
    }
    this._state = RecorderState.IDLE
    // 注意：不清除 _currentFilePath，因为 stop 回调可能需要它
  }

  /**
   * 获取当前状态
   */
  getState() {
    return this._state
  }

  /**
   * 是否正在录音
   */
  isRecording() {
    return this._state === RecorderState.RECORDING
  }

  /**
   * 显式释放资源 (供页面销毁时调用)
   */
  release() {
    this.stop()
    this._cleanup()
  }
}

// 导出单例
export default new NativeRecorder()
