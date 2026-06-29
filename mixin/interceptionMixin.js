let modalQueue = [],
  eventRequest = []
export default {
  data() {
    return {}
  },
  computed: {
    userInfo() {
      return uni.$storage.get('userInfo') || {}
    },
    isNewReport() {
      return this.$store.state.user.newReport
    }
  },
  mounted() {},
  methods: {
    /**
     *
     * @param {是否需要检测企微打卡} checkWW
     * @returns
     */
    async checkDailyReport(checkWW = true) {
      modalQueue = []
      eventRequest = []
      let { sceneType, isSuper, loginRole } = this.userInfo
      if (!(isSuper || loginRole == 3 || loginRole == 5 || loginRole == 6)) {
        //  判断员工是否已打卡上班
        if (checkWW) eventRequest.push(this.clockedIntoWork())
        let apiName = {
          0: this.equityStaffDailyReport,
          1: this.staffDailyReport,
          7: this.usedCarDailyReport
        }
        eventRequest.push(apiName[sceneType]())
      }
      return new Promise(resolve => {
        Promise.all(eventRequest).then(results => {
          results = results.slice(-2)
          let resultFlag = results.some(item => item)
          this.showNextModal()
          resolve(resultFlag)
        })
      })
    },
    showNextModal() {
      if (modalQueue.length > 0) {
        const modalInfo = modalQueue.pop()
        // if (wx.__HAS_SHOW_MODAL) return;
        // wx.__HAS_SHOW_MODAL = true;
        uni.showModal({
          title: modalInfo.title,
          content: modalInfo.content,
          showCancel: modalInfo.showCancel,
          cancelColor: '#292D33',
          confirmText: modalInfo.confirmText,
          confirmColor: '#347BFF',
          success: res => {
            // wx.__HAS_SHOW_MODAL = false;
            // if (res.cancel) _this.showNextModal();
            if (res.cancel) this.showNextModal()
            modalInfo.eventCallback(res)
          }
        })
      }
    },
    /**
     * 轻改日报
     */
    staffDailyReport() {
      let { userInfo, isNewReport } = this
      return new Promise((resolve, reject) => {
        uni.$api.interceptionApi
          .staffDailyReportMerchantValid({
            merchantId: userInfo.shopMerchantId,
            yqMerchantId: userInfo.merchantId,
            staffUuid: userInfo.uuid,
            sceneType: 1
          })
          .then(data => {
            console.log(data)
            if (data) {
              // 获取当前日期
              let currentDate = new Date()
              // 获取上一天的日期
              let previousDate = new Date(currentDate)
              previousDate.setDate(currentDate.getDate() - 1)
              // toISOString 方法会丢失时区 导致与北京时间差八小时
              let hour = previousDate.getHours() + 8
              previousDate.setHours(hour)
              // 格式化日期为"yyyy-mm-dd"
              let formattedDate = previousDate.toISOString().split('T')[0]
              // if (wx.__HAS_NOTLOGIN_MODAL) return false; //
              this.addModalToQueue('日报提醒', '您有未填写的日报，请点击前往。', '前往填写', false, 2, res => {
                if (res.confirm) {
                  console.log(formattedDate)
                  const pages = getCurrentPages(),
                    currentPage = pages[pages.length - 1]
                  if (currentPage.route == 'pages/boutique/tool/index') {
                    if (isNewReport)
                      uni.redirectTo({
                        url: `/pages/common/dailyNewspaper/index?componentName=StaffDailyReport&currentDate=${formattedDate}`
                      })
                    else uni.$emit('jumpToDailyReport', formattedDate)
                  } else {
                    if (isNewReport)
                      uni.navigateTo({
                        url: `/pages/common/dailyNewspaper/index?componentName=StaffDailyReport&currentDate=${formattedDate}`
                      })
                    else
                      uni.navigateTo({
                        url: `/pages/boutique/tool/index?componentName=DailyReport&currentDate=${formattedDate}`
                      })
                  }
                }
              })
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(err => {
            resolve()
          })
      })
    },
    /**
     * 二手车日报
     */
    usedCarDailyReport() {
      let { userInfo } = this
      return new Promise(async (resolve, reject) => {
        const data = await uni.$api.interceptionApi.checkUsedCarStaffIsNew({
          merchantId: userInfo.shopMerchantId,
          yqMerchantId: userInfo.merchantId,
          staffUuid: userInfo.uuid,
          staffPhone: userInfo.phone,
          sceneType: 7
        })
        if (!data)
          resolve(false) //检测是否新员工或调店 flase不检测日报 true检测日报
        else {
          const _data = await uni.$api.interceptionApi.checkUsedCarStaffDailyReportValid({
            sellerMerchantId: userInfo.shopMerchantId
          }) //true 已填写 false 未填写
          if (!_data) {
            // 获取当前日期
            let currentDate = new Date()
            // 获取上一天的日期
            let previousDate = new Date(currentDate)
            previousDate.setDate(currentDate.getDate() - 1)
            // toISOString 方法会丢失时区 导致与北京时间差八小时
            let hour = previousDate.getHours() + 8
            previousDate.setHours(hour)
            // 格式化日期为"yyyy-mm-dd"
            let formattedDate = previousDate.toISOString().split('T')[0]
            this.addModalToQueue('日报提醒', '您有未填写的日报，请点击前往。', '前往填写', false, 2, res => {
              if (res.confirm) {
                const pages = getCurrentPages(),
                  currentPage = pages[pages.length - 1]
                if (currentPage.route == 'pages/usedCar/tool/index') uni.$emit('jumpToDailyReport', formattedDate)
                else
                  uni.navigateTo({
                    url: `/pages/usedCar/tool/index?componentName=DailyReport&currentDate=${formattedDate}`
                  })
              }
            })
            resolve(true)
          } else resolve(false)
        }
      })
    },
    clockedIntoWork() {
      return new Promise((resolve, reject) => {
        uni.$api.interceptionApi
          .clockInConfigPhone({})
          .then(res => {
            let { need, clockIn } = res
            // 已配置未打卡
            if (need == 1 && clockIn == 0) {
              // 有配置并且没有打卡就提示
              this.addModalToQueue('打卡提醒', '您当前企微未打卡，无法录单，请前往企微打卡后再试，如有异议请联系管理员。', '知道了', false, 4, res => {
                if (res.confirm) {
                  // wx.$router.go("tabWorkOrder.staffDaily", {
                  //   // reportDate: formattedDate,
                  // });
                }
              })
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(err => {
            resolve(false)
          })
      })
    },
    /**延保日报 */
    equityStaffDailyReport() {
      let { userInfo, isNewReport } = this
      return new Promise((resolve, reject) => {
        uni.$api.interceptionApi
          .staffDailyReportMerchantValid({
            merchantId: userInfo.shopMerchantId,
            yqMerchantId: userInfo.merchantId,
            staffUuid: userInfo.uuid,
            sceneType: 0
          })
          .then(data => {
            if (data) {
              // 获取当前日期
              let currentDate = new Date()
              // 获取上一天的日期
              let previousDate = new Date(currentDate)
              previousDate.setDate(currentDate.getDate() - 1)
              // toISOString 方法会丢失时区 导致与北京时间差八小时
              let hour = previousDate.getHours() + 8
              previousDate.setHours(hour)
              // 格式化日期为"yyyy-mm-dd"
              let formattedDate = previousDate.toISOString().split('T')[0]
              // if (wx.__HAS_NOTLOGIN_MODAL) return false; //
              this.addModalToQueue('日报提醒', '您有未填写的日报，请点击前往。', '前往填写', false, 2, res => {
                if (res.confirm) {
                  const pages = getCurrentPages(),
                    currentPage = pages[pages.length - 1]
                  if (currentPage.route == 'pages/equity/tool/index') {
                    if (isNewReport)
                     uni.redirectTo({
                        url: `/pages/common/dailyNewspaper/index?componentName=StaffDailyReport&currentDate=${formattedDate}`
                      })
                    else uni.$emit('jumpToDailyReport', formattedDate)
                  } else {
                    if (isNewReport)
                      uni.navigateTo({
                        url: `/pages/common/dailyNewspaper/index?componentName=StaffDailyReport&currentDate=${formattedDate}`
                      })
                    else
                      uni.navigateTo({
                        url: `/pages/equity/tool/index?componentName=DailyReport&currentDate=${formattedDate}`
                      })
                  }
                }
              })
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(err => {
            resolve()
          })
      })
    },
    addModalToQueue(title, content, confirmText, showCancel, priority, eventCallback) {
      if (modalQueue.findIndex(val => val.content == content) < 0)
        modalQueue.push({
          title,
          content,
          confirmText,
          showCancel,
          priority,
          eventCallback
        })
      modalQueue.sort((a, b) => a.priority - b.priority)
    },
    /**
     *  查询当前员工处罚情况
     */
    async inspectionOfProhibitionBill() {
      const data = await uni.$api.interceptionApi.checkStaffStudyPunish()
      if (data)
        uni.showModal({
          title: '温馨提示',
          content: '未完成学习任务，禁止提单！\n请在平板电脑上展业助手-学习中心完成学习。',
          showCancel: false,
          cancelColor: '#292D33',
          confirmText: '确定',
          confirmColor: '#347BFF'
        })
      return Promise.resolve(data)
    },
    // 限制录单
    async getLimitRecord() {
      const data = await uni.$api.commonApi.getLimitRecord()
      if (data) console.log(data, '限制录单')
      return Promise.resolve(data)
    },
    async getAbnormalOrderLock() {
      let { sceneType } = this.userInfo
      const data = await uni.$api.commonApi.getAbnormalOrderLock({ sceneType: sceneType })
      if (data) console.log(data, '异常订单锁单信息')
      return Promise.resolve(data)
    }
  }
}
