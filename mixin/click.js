/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-08 11:28:48
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-02 17:50:40
 * @FilePath: \gl_tape\mixin\click.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const recorderManager = uni.getRecorderManager()
const plug = uni.requireNativePlugin('html5app-recordaudio')
import interruptRecord from '@/utils/recordManager/interruptRecord'
const UPLOAD_STATUS = {
  // 上传状态
  success: 1,
  fail: 2
}
const AUDIO_STATUS = {
  START: 'start', //录音中
  END: 'end', //录音结束
  ABNORMAL: 'abnormal' //40分钟未触碰平板，断开录音，不提交记录
}
const audioTime = 10 * 60 * 1000
let timer_interval = null
import { mapMutations, mapState } from 'vuex'
import utils from '@/utils/utils.js'
import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update-nvue.js'
export default {
  data() {
    return {
      voicePath: '',
      times: 0,
      timeout: 240,
      reaction: 1
    }
  },
  async mounted() {
    uni.$logger.local.info(`进入接待首页！`)
    this.throttledUpdatePreRecords = utils.throttle(this.updatePreRecords.bind(this), 300)
    this.checkPackage() //检查安装包
    this.handleCheck() // 检查更新
    this.handleSave(false)
    // 获取当前页面栈数组
    // const pages = getCurrentPages()
    // const currentPage = pages[pages.length - 1]
    // const route = currentPage.route
    // const url = ['pages/equity/index', 'pages/boutique/index']
    // if (url.includes(route)) return
    // this.initTime()
  },
  watch: {
    /**
     * 监听客户信息是否发生变化
     * @param {object} val 监听客户信息
     */
    changeData: {
      handler(val) {
        this.throttledUpdatePreRecords(val)
      },
      deep: true
    }
  },
  computed: {
    ...mapState('audio', ['receptionStatus', 'booksList', 'audioInfo']),
    ...mapState(['user.customerInfo']),
    changeData() {
      const customerInfo = this.$store?.state?.user?.customerInfo || {}
      const booksList = this.booksList || []
      const receptionStatus = this.receptionStatus
      return { customerInfo, booksList, receptionStatus }
    }
  },
  methods: {
    ...mapMutations('audio', ['setReceptionStatus', 'setBooks', 'setAudioInfo']),
    updatePreRecords(val) {
      if (this.audioInfo.audioStatus != AUDIO_STATUS.START) return
      const { customerInfo, booksList, receptionStatus } = val
      const params = this.getParams(customerInfo, booksList, receptionStatus)
      interruptRecord.updatePreRecords(params)
    },
    checkPackage() {
      const { deviceId: tabletSerialNumber } = uni.getDeviceInfo()
      uni.$api.commonApi.checkAppUpload({ tabletSerialNumber }).then(res => {
        if (res) {
          this.getAllApply()
        }
      })
      // this.getAllApply()
    },
    getAllApply() {
      // #ifdef APP-PLUS
      const main = plus.android.runtimeMainActivity()
      const pManager = plus.android.invoke(main, 'getPackageManager')
      const ApplicationInfo = plus.android.importClass('android.content.pm.ApplicationInfo')
      const packages = plus.android.invoke(pManager, 'getInstalledPackages', 0)
      const total = plus.android.invoke(packages, 'size')
      let appInfoList = []
      if (!total) {
        appInfoList = uni.$storage.get('appInfoList')
      }
      for (let i = 0; i < total; i++) {
        try {
          const packageInfo = plus.android.invoke(packages, 'get', i)
          // 获取包名
          const packName = plus.android.getAttribute(packageInfo, 'packageName')
          const versionName = plus.android.getAttribute(packageInfo, 'versionName')
          const versionCode = plus.android.getAttribute(packageInfo, 'versionCode')

          const appInfo = plus.android.invoke(pManager, 'getApplicationInfo', packName, 0)
          const appName = plus.android.invoke(pManager, 'getApplicationLabel', appInfo)

          // 是否是系统软件
          const isSystem = packageInfo.plusGetAttribute('applicationInfo').plusGetAttribute('flags') & (ApplicationInfo.FLAG_SYSTEM != 0) ? true : false
          // 判断是否是系统文件
          if (!isSystem) {
            appInfoList.push({
              packName,
              versionName,
              versionCode,
              appName
            })
          }
        } catch (e) {
          appInfoList = []
        }
      }
      plus.android.autoCollection(main)
      const { deviceId: tabletSerialNumber } = uni.getDeviceInfo()
      if (appInfoList.length < 2) {
        appInfoList = []
      }
      uni.$storage.set('appInfoList', appInfoList)
      console.log(appInfoList, 'appInfoList')
      uni.$api.commonApi
        .saveOrUpdateEmployeeAppUsage({ tabletSerialNumber, appVersion: plus.runtime.version, gameAppList: JSON.stringify(appInfoList) })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
      // #endif
    },
    handleCheck() {
      const { textList, tempFileURL, version } = uni.$storage.get('mock_data')
      const res = utils.compareVersions(plus?.runtime?.version, version)
      if (res > -1) {
        return
      }
      const e = {
        result: {
          is_silently: false,
          is_mandatory: true,
          name: '',
          title: '',
          contents: textList.join('\n'),
          version: version,
          url: tempFileURL,
          stable_publish: true
        }
      }
      checkUpdate(e)
    },
    // //关闭提示
    tipCancel() {
      this.stopAudio()
      this.setReceptionStatus(0)
      this.setAudioInfo({ endReasonType: 1 })
      if (this.$refs.tipBox) {
        this.$refs.tipBox.close()
        let { sceneType } = uni.$storage.get('userInfo')
        uni.reLaunch({
          url: sceneType == 0 ? '/pages/equity/index' : '/pages/boutique/index'
        })
      }
    },
    //结束提示
    tipConfirm() {
      this.times = 0
      this.$refs.tipBox?.close()
    },
    closeAudio() {
      this.endWatchClick()
      this.stopAudio(AUDIO_STATUS.ABNORMAL)
      this.setReceptionStatus(0)
      this.setAudioInfo({ endReasonType: 1 })
    },
    getParams(customerInfo, booksList, receptionStatus) {
      const { shopMerchantId, phone, sceneType, uuid, name, merchantId, channelType, merchantName } = uni.$storage.get('userInfo'),
        { customerName, phoneNumber, salesUuid, carModel, staffName } = customerInfo || {},
        receptionCustomerPaySourceList = booksList.map(item => {
          return {
            id: item.id,
            sourceType: item.id,
            sourceUrl: item.imgUrl
          }
        }),
        { receptionStartTime, receptionEndTime, endReasonType } = this.audioInfo,
        { deviceId: appCode } = uni.getDeviceInfo(),
        receptionTrack = this.$store.state.user.receptionTrack,
        receptionCustomerMaterialPointList = []
      Object.keys(receptionTrack).map(key => {
        receptionCustomerMaterialPointList.push({
          ...receptionTrack[key],
          merchantId: shopMerchantId,
          businessScene: sceneType,
          staffUuid: uuid,
          staffName: name
        })
      })
      let version = plus.runtime.version
      let params = {
        // appVersion: version,
        staffUuid: uuid,
        staffName: name,
        serviceMerchantId: merchantId,
        carModel,
        endReasonType, //原因 1.异常 0.正常
        customerName,
        phoneNumber,
        appCode,
        loginPhone: phone,
        salesName: staffName,
        salesUuid,
        receptionStatus, //接待结果 1.成交 0.战败
        receptionStartTime,
        receptionEndTime,
        receptionCustomerPaySourceList, //1.付款凭证文件路径 2.客户购车发票文件路径 3.客户延保合同文件路径
        merchantId: shopMerchantId,
        merchantName,
        bussinessType: sceneType == 0 ? 1 : 2, // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
        channelType: channelType || 1, //1问界 2 比亚迪 3 其他
        receptionCustomerMaterialPointList
      }
      return params
    },
    /**
     * 修改文件名。
     * @param {string} oldFilePath  旧的文件路径
     * @param {string} newFileName  新的文件名
     */
    renameFile(oldFilePath, newFileName) {
      return new Promise((resolve, reject) => {
        plus.io.resolveLocalFileSystemURL(
          oldFilePath,
          entry => {
            console.log(111)
            entry.getParent(
              _oldFile => {
                console.log(222)
                entry.moveTo(
                  _oldFile,
                  '/' + newFileName,
                  newFilePath => {
                    resolve()
                    uni.$logger.local.info(`文件重命名成功！${newFilePath.fullPath}`)
                    // console.log('newFilePath', newFilePath.fullPath)
                  },
                  () => {
                    reject()
                  }
                )
              },
              () => {
                reject()
              }
            )
          },
          () => {
            reject()
          }
        )
      })
    },

    //开始录音
    startAudio: utils.throttle(async function () {
      if (this.audioInfo.audioStatus == AUDIO_STATUS.START) return
      uni.$logger.local.info('开始接待')
      this.setBooks([])
      this.$store.dispatch('clearCustomerInfo')
      this.setReceptionStatus('')
      this.initTime()
      this.setAudioInfo({ audioList: [], audioStatus: AUDIO_STATUS.START })
      recorderManager.onStart(() => {
        uni.$logger.local.info('开启录音！')
        //开始录音保持记录，1s延时是因为第一段录音结束时间的文件修改时间等于第二段开始的文件修改时间，加上1s延时，就不会这个问题
        setTimeout(() => {
          const params = this.getParams(this.$store.state.user.customerInfo, this.booksList, this.receptionStatus)
          interruptRecord.addPreRecords(params)
        }, 1000)
      })
      recorderManager.start({
        duration: audioTime,
        sampleRate: 16000,
        numberOfChannels: 1
      })
      recorderManager.onStop(async res => {
        //第一段录音结束，还在接待中，则开启第二段录音
        if (this.audioInfo.audioStatus == AUDIO_STATUS.START) {
          uni.$logger.local.info('接待中，再次开启录音！')
          uni.getRecorderManager().start({
            duration: audioTime,
            sampleRate: 16000,
            numberOfChannels: 1
          })
        } else {
          uni.$logger.local.info('断开录音！')
        }
      })
    }, 300),
    /**
     * 保存记录
     * 首先查看有没有没有保存的记录records，没有就直接返回
     * 存在没有保存的记录，首先把临时的录音文件，保存永久的录音文件，并重新命名
     * @params {boolean} isNormal 是否是正常保存
     * @returns {void}
     */
    async handleSave(isNormal = true) {
      const records = interruptRecord.getPreRecord()
      console.log(records, 'records')
      if (!records) return
      uni.$logger.local.info(`${isNormal ? '正常' : '异常'}保存记录`)
      if (isNormal) {
        Object.assign(records, this.getParams(this.$store.state.user.customerInfo, this.booksList, this.receptionStatus))
      }
      const audioPath = records.audioPath
      let recordUrlList = []
      const { phone } = uni.$storage.get('userInfo')
      try {
        // 把临时文件保存为永久录音文件
        for (let i = 0; i < audioPath.length; i++) {
          uni.$logger.local.info(`获取文件路径${audioPath[i]} `)
          const saveResult = await uni.saveFile({
            tempFilePath: audioPath[i]
          })
          let oldFilePath
          const getPreAudioList = interruptRecord.getPreAudioList || []
          if (saveResult[1] && saveResult[1].savedFilePath) {
            oldFilePath = saveResult[1].savedFilePath
            this.removeSavedFile(getPreAudioList[i])
            uni.$logger.local.info(`保存文件结果路径${oldFilePath}`)
          } else {
            oldFilePath = getPreAudioList[i]
            uni.$logger.local.info(`临时文件不存在，找到之前保存的文件${oldFilePath}`)
          }
          let newFileName = String(phone).slice(-4) + '_' + oldFilePath.replace(/.+\/(\d+\.mp3)/, '$1')
          try {
            await this.renameFile(oldFilePath, newFileName)
          } catch {
            uni.$logger.local.error(`${newFileName}文件重命名失败`)
            newFileName = oldFilePath.replace(/.+\/(\d+\.mp3)/, '$1')
          }
          const newFilePath = oldFilePath.replace(/(.+\/)(\d+\.mp3)/, '') + newFileName
          const path = await utils.getFileSaveFolderOnClient()
          recordUrlList.push({ status: UPLOAD_STATUS.fail, file: path + newFilePath })
        }
      } catch (error) {
        uni.$logger.local.error(`${phone}上传保存失败:${JSON.stringify(error)}`)
      }
      delete records.audioPath
      let saveRecords = Object.assign(records, { recordUrlList })
      // 如果是正常保存，保存为待上传，并删除待提交记录，如果是异常保存，则更新待提交记录
      if (isNormal) {
        this.saveRecord(saveRecords)
      } else {
        interruptRecord.updatePreRecords(saveRecords, true)
      }
    },
    removeSavedFile(filePath) {
      uni.removeSavedFile({
        filePath: filePath,
        complete: function (res) {
          uni.$logger.local.info(`删除轮询的文件${filePath}`)
        }
      })
    },

    /**
     * 删除待提交记录
     * @returns {void}
     */
    removeRecords() {
      const records = interruptRecord.getPreRecord()
      interruptRecord.removePreRecord(records.id)
    },
    /**
     * 保存待上传的记录，并删除待提交的记录
     * @param {object} record 记录信息
     * @returns {void}
     */
    async saveRecord(record) {
      uni.$logger.local.info(`添加记录${JSON.stringify(record)}`)
      const unlock = await uni.$recordManager.lock()
      console.log('record', record)
      await uni.$dbManager.addRecord(record)
      interruptRecord.removePreRecord(record.id)
      unlock()
    },
    /**
     * 结束接待
     * @params {boolean} status true 不保存记录/AUDIO_STATUS.ABNORMAL 只要断开录音
     * @returns {void}
     */
    stopAudio: utils.throttle(async function (status) {
      uni.$logger.local.info('结束接待！')
      //   const result = await this.$permision.requestAndroidPermission(
      //     "android.permission.RECORD_AUDIO"
      //   );
      //   if (result !== 1) {
      //     uni.showToast({
      //       title: "为了记录语音通话，请打开录音权限",
      //       icon: "none",
      //     });
      //     return;
      //   }
      //如果是40分钟未触碰平板，只要断开录音即可
      if (status == AUDIO_STATUS.ABNORMAL) {
        this.setAudioInfo({ audioStatus: AUDIO_STATUS.ABNORMAL })
        uni.$logger.local.info('40分钟未触碰平板，断开录音！')
        recorderManager.stop()
        return
      }
      //如果是40分钟未触碰平板后完成接待，需要保存记录
      if (this.audioInfo.audioStatus == AUDIO_STATUS.ABNORMAL && status != true) {
        uni.$logger.local.info('40分钟未触碰平板，保存记录！')
        this.setAudioInfo({ audioStatus: AUDIO_STATUS.END })
        this.handleSave()
        return
      }
      if (this.audioInfo.audioStatus != AUDIO_STATUS.START) {
        return
      }
      this.setAudioInfo({ audioStatus: AUDIO_STATUS.END })
      //直接退出
      uni.showLoading({
        mask: true
      })
      setTimeout(() => {
        uni.hideLoading()
        if (this.audioInfo.audioStatus == AUDIO_STATUS.END) {
          this.handleSave()
        }
      }, 3000)
      this.endWatchClick()
      if (status) {
        uni.$logger.local.info('退出接待,不保存记录！')
        this.removeRecords()
      }
      recorderManager.stop()
    }, 1500),
    //监听点击事件
    initTime() {
      if (timer_interval) {
        this.endWatchClick()
      }
      timer_interval = setInterval(() => {
        this.times++
        console.log(this.times, 'this.times')
        if (this.times >= this.timeout) {
          //关闭录音
          this.closeAudio()
        }
      }, 1000 * 10)
    },
    endWatchClick() {
      console.log(timer_interval, 'endWatchClick')
      if (timer_interval) clearInterval(timer_interval)
      timer_interval = null
      this.times = 0
    },
    handleTouchStart() {
      this.times = 0
    }
  },
  beforeCreate() {
    // this.endWatchClick && this.endWatchClick()
  }
}
