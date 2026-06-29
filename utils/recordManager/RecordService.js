/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-14 16:22:23
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:29:54
 * @FilePath: /gl_tape/utils/recordManager/RecordService.js
 */
import { AudioManager, RecordDto, helpler, StrategyFactory, TimeoutService } from './index.js'
import { storageApi } from '@/utils/cache'
import permision from '@/js_sdk/wa-permission/permission.js'
import store from '@/store'

class RecordService {
  static instance = null

  constructor() {
    this.audioManager = null
    this.record = null
    this.tempRecord = null
    this.debounceTimers = {}
    this._startAudioPromise = null
    this.timeoutService = null
    // 初始化 (单例模式下只执行一次)
    this.init()
  }

  static getInstance() {
    if (!RecordService.instance) {
      RecordService.instance = new RecordService()
    }
    return RecordService.instance
  }

  init() {
    try {
      uni.$logger.local.info('【录音服务RecordService】 == 初始化')
      this.audioManager = new AudioManager(this.onAudioStart.bind(this), this.onAudioStop.bind(this), this.onAudioError.bind(this))
      this.initDto()
      // attributesProvider 需要绑定 this，因为 getBussinessType 依赖实例方法
      this.record = StrategyFactory.getSaveStrategy(this.tempRecord, this.triggleTempNumber.bind(this), this.attributesProvider.bind(this))
      this.timeoutService = new TimeoutService(this.onTimeOut.bind(this))
      this.triggleTempNumber()

      // 启动状态监听
      // this.startStateListener()
      this.initWatchers()
    } catch (e) {
      uni.$logger.local.error(`【录音服务RecordService】 == 初始化异常: ${e.message}`)
    }
  }
  initWatchers() {
    // 监听 customerKey
    this.unwatchCustomer = store.watch(
      (state, getters) => getters.customerKey,
      () => {
        const customerInfo = store.getters.customerInfo
        this.handler(customerInfo, this.updateCustomerInfo, 1000)
      },
      { immediate: true }
    )
    // 监听 receptionStatus
    this.unwatchStatus = store.watch(
      (state, getters) => getters.receptionStatus,
      val => {
        this.handler(val, this.updateReceptionStatus, 200)
      },
      { immediate: true }
    )
    this.unwatchBookList = store.watch(
      (state, getters) => getters.booksList,
      val => {
        this.handler(val, this.updateBookList, 1500)
      },
      { immediate: true }
    )
    this.unwatchReceptionKey = store.watch(
      (state, getters) => getters.receptionKey,
      () => {
        const receptionTrack = store.getters.receptionTrack
        this.handler(receptionTrack, this.updateMaterialPointList, 1000)
      },
      { immediate: true }
    )
  }

  // --- 业务逻辑 (从 recorder.js 迁移) ---

  async startAudio(isInitData = true) {
    if (this._startAudioPromise) return this._startAudioPromise
    this._startAudioPromise = (async () => {
      try {
        const isPermission = await this.checkBeforeStart()
        if (!isPermission) return
        uni.$logger.local.info('【录音服务RecordService】 == 开始接待 ')
        if (isInitData) {
          this.initReception()
        }
        this.audioManager.start()
        this.timeoutService.start()
        return true // 返回 true 表示成功启动
      } catch (e) {
        uni.$logger.local.error(`【录音服务RecordService】 == startAudio 异常: ${e.message}`)
      } finally {
        this._startAudioPromise = null
      }
    })()
    return this._startAudioPromise
  }

  getBussinessType(sceneType) {
    return sceneType == 0 ? 1 : 2 // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
  }

  attributesProvider() {
    const { shopMerchantId, phone, sceneType, uuid, name, merchantId, channelType, merchantName } = storageApi.getUserInfo() || {}
    const dynamicAttrs = {
      staffUuid: uuid,
      staffName: name,
      serviceMerchantId: merchantId,
      loginPhone: phone,
      merchantId: shopMerchantId,
      merchantName,
      bussinessType: this.getBussinessType(sceneType),
      channelType: channelType || 1 //1问界 2 比亚迪 3 其他
    }
    // uni.$logger.local.warn(`【录音服务RecordService】 == 创建新记录，注入动态属性: ${JSON.stringify(dynamicAttrs)}`)
    return dynamicAttrs
  }

  initReception() {
    store.commit('audio/setBooks', [])
    store.commit('clearCustomerInfo')
    store.commit('audio/setReceptionStatus', '')
  }

  async onAudioStart(res) {
    try {
      if (this.audioManager.counter === 0) {
        uni.$logger.local.info('〖RecordService〗 == First audio segment, adding record...')
        await this.record.add(res)
        uni.$logger.local.info('〖RecordService〗 == Record added successfully.')
      } else {
        this.record.addAudio(res)
      }
    } catch (e) {
      uni.$logger.local.error('〖RecordService〗 == onAudioStart error: ' + e.message)
    }
  }

  async onAudioStop() {
    if (this.audioManager.isRecording) {
      uni.$logger.local.info('【录音服务RecordService】 == 接待中，再次开启录音！ ')
      this.audioManager.start()
    } else {
      uni.$logger.local.info('【录音服务RecordService】 == 断开录音！ ')
    }
  }

  onAudioError(error) {
    const message = error.message
    this.reportError(`录音异常: error: ${message}`, message)
  }

  async stopAudio(isNotSave = false) {
    if (!this.isReceptioning()) {
      uni.$logger.local.warn('【录音服务RecordService】 == 未开始接待，不能结束接待！ ')
      return
    }
    uni.$logger.local.info('【录音服务RecordService】 == 结束接待！ ')
    this.stop()
    try {
      await this.saveAndClearRecord(isNotSave)
    } catch (error) {
      uni.$logger.local.error(`【录音服务RecordService】 == 结束接待保存失败: ${error.message}`)
      this.reportError('结束接待保存失败', error.message)
    }
  }

  async saveAndClearRecord(isNotSave = false) {
    if (isNotSave) {
      //如果不需要保存记录
      uni.$logger.local.info('【录音服务RecordService】 == 不保存记录！ ')
      await this.record.clearSavedFiles()
      await this.record.clearLocalRecord()
      return
    }
    await this.record.setReceptionEndTime() //设置接待结束时间
    await this.record.save()
  }

  stop() {
    this.record?.clearLoopTimer()
    this.stopAudioRecord()
  }
  onTimeOut() {
    store.commit('audio/setReceptionStatus', 0)
    this.record.withError()
    this.stopAudioRecord()
  }
  stopAudioRecord() {
    this.audioManager?.stop()
    this.timeoutService?.stop()
  }

  handler(params, fn, delay = 0) {
    if (this.isReceptioning()) {
      // if (delay > 0) {
      //   // 使用函数名作为防抖的 key
      //   // 注意：这里 fn.name 在压缩混淆后可能会变，但在 Service 内部引用是固定的
      //   this.debounce(fn.name, () => fn.call(this, params), delay)
      // } else {
        fn.call(this, params)
      // }
    }
  }

  isReceptioning() {
    return this.audioManager?.isRecording || this.record?.currentRecord?.endReasonType == 1
  }

  reset() {
    this.flushAllDebounceTimers()
    this.audioManager = null
    this.record = null
    this.tempRecord = null
  }

  initDto() {
    const { shopMerchantId, phone, sceneType, uuid, name, merchantId, channelType, merchantName } = storageApi.getUserInfo() || {}
    const { deviceId: appCode } = uni.getDeviceInfo()
    const dto = new RecordDto({
      staffUuid: uuid,
      staffName: name,
      serviceMerchantId: merchantId,
      endReasonType: 0, //原因 1.异常 0.正常
      loginPhone: phone,
      appCode,
      merchantId: shopMerchantId,
      merchantName,
      bussinessType: this.getBussinessType(sceneType),
      channelType: channelType || 1 //1问界 2 比亚迪 3 其他
    })
    this.tempRecord = dto
  }

  updateUserInfo() {
    try {
      uni.$logger.local.info('【录音服务RecordService】 == 更新用户信息')
      this.initDto()
      // 重新生成保存策略实例，以绑定新的 tempRecord (DTO)
      this.record = StrategyFactory.getSaveStrategy(this.tempRecord, this.triggleTempNumber.bind(this), this.attributesProvider.bind(this))
      this.triggleTempNumber()
    } catch (e) {
      uni.$logger.local.error(`【录音服务RecordService】 == 更新用户信息异常: ${e.message}`)
    }
  }

  debounce(key, fn, delay) {
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key].timer)
    }
    this.debounceTimers[key] = {
      fn,
      timer: setTimeout(() => {
        fn()
        delete this.debounceTimers[key]
      }, delay)
    }
  }
  flushAllDebounceTimers() {
    if (this.debounceTimers) {
      Object.keys(this.debounceTimers).forEach(key => {
        const item = this.debounceTimers[key]
        if (item) {
          clearTimeout(item.timer)
          try {
            item.fn()
            uni.$logger.local.info(`【录音服务RecordService】 == 强制执行防抖任务: ${key}`)
          } catch (e) {
            uni.$logger.local.error(`【录音服务RecordService】 == 强制执行防抖任务失败: ${key}, error: ${e.message}`)
          }
        }
      })
      this.debounceTimers = {}
    }
  }

  updateCustomerInfo(customerInfo = {}) {
    const { customerName, phoneNumber, salesUuid, carModel, staffName: salesName, carBrand, carBrandId, oneCarBrand, oneCarBrandId } = customerInfo
    this.record.updatePreRecords({
      customerName,
      phoneNumber,
      carModel,
      salesUuid,
      salesName,
      carBrand,
      carBrandId,
      oneCarBrand,
      oneCarBrandId
    })
  }

  updateBookList(booksList) {
    const receptionCustomerPaySourceList = booksList.map(item => {
      return {
        id: item.id,
        sourceType: item.id,
        sourceUrl: item.imgUrl
      }
    })
    this.record.updatePreRecords({ receptionCustomerPaySourceList })
  }

  updateMaterialPointList(receptionTrack) {
    const { merchantId, staffUuid, staffName } = this.tempRecord || {}
    const { sceneType } = uni.$storage.get('userInfo') || {}
    let receptionCustomerMaterialPointList = []
    Object.keys(receptionTrack).map(key => {
      receptionCustomerMaterialPointList.push({
        ...receptionTrack[key],
        merchantId,
        staffUuid,
        staffName,
        businessScene: sceneType
      })
    })
    // 优化：将高频更新的物料点数据存入 LocalStorage
    if (this.record) {
      this.record.cacheMaterialPoints(receptionCustomerMaterialPointList)
    }
  }

  updateReceptionStatus(status) {
    console.log('updateReceptionStatus', status)
    this.record.updatePreRecords({ receptionStatus: status })
  }

  getRecorder() {
    return this.record
  }

  async triggleTempNumber() {
    if (!this.record) return
    const _records = await this.record.getRecords()
    store.commit('audio/setPerRecordNumber', _records.length)
  }

  async isPermission(hintText = '为了记录语音通话，请打开录音权限') {
    const result = await permision.requestAndroidPermission('android.permission.RECORD_AUDIO')
    await helpler.sleep(0)
    if (result !== 1) {
      uni.showToast({
        title: hintText,
        icon: 'none'
      })
    }
    return result === 1
  }

  async checkBeforeStart() {
    const isPermission = await this.isPermission()
    const isRecording = this.audioManager.isRecording
    return isPermission && !isRecording
  }

  reportError(msg, errorMsg) {
    uni.$logger.local.error(`【录音服务RecordService】 == ${msg}`)
    // TODO: 如果有统一的上报机制，可以在这里调用
  }

  destroy() {
    this.unWatch()
    this.record?.destroy()
    this.stop()
    this.reset()
  }

  unWatch() {
    this.unwatchBookList?.()
    this.unwatchCustomer?.()
    this.unwatchReceptionKey?.()
    this.unwatchStatus?.()
  }
}

export default RecordService
