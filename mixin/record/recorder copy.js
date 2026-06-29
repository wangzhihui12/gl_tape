/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-12-26 10:03:54
 * @LastEditors: limin
 * @LastEditTime: 2025-08-12 10:32:25
 * @FilePath: \gl_tape\mixin\record\recorder.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { AudioManager, TempRecord, RecordDto, helpler } from '../../utils/recordManager/index'
import { mapMutations, mapState, mapGetters } from 'vuex'
import utils from '@/utils/utils.js'
import { storageApi } from '@/utils/cache'
import permision from '@/js_sdk/wa-permission/permission.js'
export default {
  provide() {
    return {
      getRecorder: () => this.record
    }
  },
  async mounted() {
    this.audioManager = new AudioManager(this.onAudioStart, this.onAudioStop, this.onError)
    this.initDto()
    this.record = new TempRecord(this.tempRecord, this.triggleTempNumber)
    this.triggleTempNumber()
  },
  watch: {
    /**
     * 监听客户信息是否发生变化
     * @param {object} val 监听客户信息
     */
    // customerInfo: {
    //   handler(val) {
    //     this.handler(val, this.updateCustomerInfo)
    //   },
    //   deep: true
    // },
    customerKey: {
      handler() {
        this.handler(this.customerInfo, this.updateCustomerInfo)
      },
      deep: true
    },
    booksList: {
      handler(val) {
        this.handler(val, this.updateBookList)
      }
    },
    receptionStatus: {
      handler(val) {
        this.handler(val, this.updateReceptionStatus)
      }
    },
    receptionKey: {
      handler(val) {
        this.handler(this.receptionTrack, this.updateMaterialPointList)
      }
    }
  },
  computed: {
    ...mapState(['user.customerInfo']),
    ...mapGetters(['customerInfo', 'receptionStatus', 'booksList', 'receptionTrack', 'receptionKey', 'customerKey'])
  },
  methods: {
    ...mapMutations('audio', ['setReceptionStatus', 'setBooks', 'setPerRecordNumber']),
    ...mapMutations(['clearCustomerInfo']),
    //开始录音
    startAudio: utils.throttle(async function (isInitData = true) {
      const isPermission = await this.checkBeforeStart()
      if (!isPermission) return
      uni.$logger.local.info('〖接待管理Recorder〗 == 开始接待 ')
      isInitData && this.initReception()
      this.initTime()
      this.audioManager.start()
    }, 300),

    initReception() {
      this.setBooks([])
      this.clearCustomerInfo()
      this.setReceptionStatus('')
    },
    async onAudioStart() {
      if (this.audioManager.counter === 0) {
        await this.record.add()
      } else {
        this.record.addAudio()
      }
    },
    async onAudioStop() {
      if (this.audioManager.isRecording) {
        uni.$logger.local.info('〖接待管理Recorder〗 == 接待中，再次开启录音！ ')
        this.audioManager.start()
      } else {
        uni.$logger.local.info('〖接待管理Recorder〗 == 断开录音！ ')
      }
    },
    onAudioError(error) {
      const message = error.message
      this.reportError(`录音异常: error: ${message}`, message)
    },
    /**
     * 结束接待
     * @params {boolean} status true 不保存记录/AUDIO_STATUS.ABNORMAL 只要断开录音
     * @returns {void}
     */
    async stopAudio(isNotSave = false) {
      uni.$logger.local.info('〖接待管理Recorder〗 == 结束接待！ ')
      this.stop()
      await this.saveAndClearRecord(isNotSave)
    },
    async saveAndClearRecord(isNotSave = false) {
      if (isNotSave) {
        uni.$logger.local.info('〖接待管理Recorder〗 == 不保存记录！ ')
        this.record.clearSavedFiles()
        this.record.clearLocalRecord()
        return
      }
      this.record.setReceptionEndTime() //设置接待结束时间
      //如果不需要保存记录
      await this.record.save()
    },
    stop() {
      this.endWatchClick()
      this.record.clearLoopTimer()
      if (this.audioManager.isRecording) {
        this.audioManager.stop()
      }
    },
    handler(params, fn) {
      if (this.audioManager.isRecording || this.record?.currentRecord?.endReasonType == 1) {
        fn.call(this, params)
      }
    },
    reset() {
      this.audioManager = null
      this.record = null
      this.tempRecord = null
    },
    initDto() {
      const { shopMerchantId, phone, sceneType, uuid, name, merchantId, channelType, merchantName } = storageApi.getUserInfo()
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
        bussinessType: sceneType == 0 ? 1 : 2, // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
        channelType: channelType || 1 //1问界 2 比亚迪 3 其他
      })
      this.sceneType = sceneType
      this.tempRecord = dto
    },
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
    },
    updateBookList(booksList) {
      const receptionCustomerPaySourceList = booksList.map(item => {
        return {
          id: item.id,
          sourceType: item.id,
          sourceUrl: item.imgUrl
        }
      })
      this.record.updatePreRecords({ receptionCustomerPaySourceList })
    },
    updateMaterialPointList(receptionTrack) {
      const { merchantId, staffUuid, staffName } = this.tempRecord
      let receptionCustomerMaterialPointList = []
      Object.keys(receptionTrack).map(key => {
        receptionCustomerMaterialPointList.push({
          ...receptionTrack[key],
          merchantId,
          staffUuid,
          staffName,
          businessScene: this.sceneType
        })
      })
      this.record.updatePreRecords({ receptionCustomerMaterialPointList })
    },
    updateReceptionStatus(status) {
      this.record.updatePreRecords({ receptionStatus: status })
    },
    getRecorder() {
      return this.record
    },
    async triggleTempNumber() {
      const _records = await this.record.getRecords()
      this.setPerRecordNumber(_records.length)
    },
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
    },
    async checkBeforeStart() {
      const isPermission = await this.isPermission()
      const isRecording = this.audioManager.isRecording
      return isPermission && !isRecording
    }
  },
  beforeDestroy() {
    this.stop()
    this.reset()
  }
}
