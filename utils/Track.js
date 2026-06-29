const TRACK_INTERVAL_TIME = 30 * 1e3
let TRACK_TIME
import dayjs from 'dayjs'
class Track {
  constructor() {
    console.log('---------------- 埋点初始化 ----------------')
    this.sendTrack()
  }
  add (data = {}) {
    const {
      phone: phoneNumber,
      name: loginAccount,
      uuid,
      sceneType: scene,
      userType
    } = uni.$storage.get('userInfo') || {},
      trackList = uni.getStorageSync('TRACK_LIST') || []
    let pages = getCurrentPages(),
      currentPage = pages[pages.length - 1],
      prePage = {}
    if (pages.length > 1) prePage = pages[pages.length - 2]
    let item = {
      userType,
      loginAccount,
      phoneNumber,
      uuid,
      scene,
      prePagePath: data.prePagePath || prePage.route || '/',
      pagePath: data.pagePath || currentPage.route || '/',
      eventTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      systemSource: 3,
      eventType: data.eventType || 0
    }
    if (data.batchId) item.batchId = data.batchId
    if (data.eventCode) item.eventCode = data.eventCode
    if (data.businessParam) item.businessParam = JSON.stringify(data.businessParam)
    if (data.businessId) item.businessId = data.businessId
    trackList.push(item)
    uni.setStorageSync('TRACK_LIST', trackList)
    if (!TRACK_TIME) {
      console.log('---------------- 重新打开定时埋点 ----------------')
      this.sendTrack() //开启定时埋点
    }
    if (trackList.length > 9) this.sendTrackData()
  }


  /**定时发送埋点数据 */
  sendTrack () {
    TRACK_TIME = setInterval(() => {
      this.sendTrackData()
    }, TRACK_INTERVAL_TIME)
  }

  async sendTrackData () {
    const recordList = uni.getStorageSync('TRACK_LIST') || []
    if (recordList.length) {
      const res = await uni.$api.commonApi.recordInsert({ recordList })
      if (res) uni.setStorageSync('TRACK_LIST', [])
    } else {
      clearInterval(TRACK_TIME)
      TRACK_TIME = null
      console.log('---------------- 暂停定时埋点 ----------------')
    }
  }
}

export default Track
