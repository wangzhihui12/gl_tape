let modalQueue = []
import api from '@/api/index.js'
let eventRequest = []
export const checkDailyReport = async sceneType => {
  let userInfo = uni.$storage.get('userInfo')
  // debugger
  // 判读是否要填写日报
  if (!(userInfo?.isSuper || userInfo?.loginRole == 3 || userInfo.loginRole == 5 || userInfo?.loginRole == 6)) {
    //  判断员工是否已打卡上班
    eventRequest.push(clockedIntoWork())
    eventRequest.push(sceneType ? equityStaffDailyReport(userInfo) : staffDailyReport(userInfo))
  }

  return new Promise(resolve => {
    Promise.all(eventRequest).then(results => {
      // const [reportStatus] = results;
      results = results.slice(-2)
      // console.log(reportStatus, results, results.length, results[results.length - 1], 'reportStatus');
      let resultFlag = results.some(item => item)
      showNextModal()
      console.log(resultFlag, 'resultFlag')
      resolve(resultFlag)
    })
  })
}
export const showNextModal = () => {
  let _this = this
  if (modalQueue.length > 0) {
    const modalInfo = modalQueue.pop()
    if (uni.__HAS_SHOW_MODAL) return
    uni.__HAS_SHOW_MODAL = true
    uni.showModal({
      title: modalInfo.title,
      content: modalInfo.content,
      showCancel: modalInfo.showCancel,
      cancelColor: '#292D33',
      confirmText: modalInfo.confirmText,
      confirmColor: '#347BFF',
      success: function (res) {
        uni.__HAS_SHOW_MODAL = false
        // if (res.cancel) _this.showNextModal();
        if (res.cancel) showNextModal()
        modalInfo.eventCallback(res)
      }
    })
  }
}

const staffDailyReport = userInfo => {
  return new Promise((resolve, reject) => {
    api.boutiqueApi
      .staffDailyReportMerchantValid({
        merchantId: userInfo.shopMerchantId,
        yqMerchantId: userInfo.merchantId,
        staffUuid: userInfo.uuid,
        sceneType: 1
      })
      .then(res => {
        if (res.data) {
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
          if (wx.__HAS_NOTLOGIN_MODAL) return false
          addModalToQueue('日报提醒', '您有未填写的日报，请点击前往。', '前往填写', false, 2, res => {
            if (res.confirm) {
              wx.$router.go('tabWorkOrder.upgradeStaffDaily', {
                reportDate: formattedDate
              })
            }
          })
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch(err => {
        resolve()
        console.log(err)
      })
  })
}
const equityStaffDailyReport = userInfo => {
  return new Promise((resolve, reject) => {
    api.boutiqueApi
      .staffDailyReportMerchantValid({
        merchantId: userInfo?.shopMerchantId,
        yqMerchantId: userInfo?.merchantId,
        staffUuid: userInfo?.uuid,
        sceneType: 0
      })
      .then(res => {
        if (res.data) {
          // 获取当前日期
          let currentDate = new Date()
          // 获取上一天的日期
          let previousDate = new Date(currentDate)
          previousDate.setDate(currentDate.getDate() - 1)
          console.log(previousDate, 'previousDate')
          // toISOString 方法会丢失时区 导致与北京时间差八小时
          let hour = previousDate.getHours() + 8
          previousDate.setHours(hour)
          // 格式化日期为"yyyy-mm-dd"
          let formattedDate = previousDate.toISOString().split('T')[0]
          console.log('formattedDate', formattedDate)
          if (wx.__HAS_NOTLOGIN_MODAL || userInfo?.isSuper || userInfo?.loginRole == 3 || userInfo.loginRole == 5 || userInfo?.loginRole == 6) return false
          addModalToQueue('日报提醒', '您有未填写的日报，请点击前往。', '前往填写', false, 4, res => {
            if (res.confirm) {
              wx.$router.go('tabWorkOrder.staffDaily', {
                reportDate: formattedDate
              })
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
}
export const clockedIntoWork = userInfo => {
  return new Promise((resolve, reject) => {
    api.boutiqueApi
      .clockInConfigPhone({})
      .then(res => {
        let { need, clockIn } = res.data
        // console.log(res, need == 0 && clockIn == 0, "clockInConfigPhone");
        // 已配置未打卡
        if (need == 1 && clockIn == 0) {
          // 有配置并且没有打卡就提示
          addModalToQueue('打卡提醒', '您当前企微未打卡，无法录单，请前往企微打卡后再试，如有异议请联系管理员。', '知道了', false, 4, res => {
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
}
const addModalToQueue = (title, content, confirmText, showCancel, priority, eventCallback) => {
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
}
