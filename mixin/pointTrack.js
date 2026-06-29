/*
 * @Author: yangming@didihu.com.cn yangming@didihu.com.cn
 * @Date: 2025-05-01 11:00:20
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-07 09:58:48
 * @FilePath: \gl-tape\mixin\pointTrack.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const FILTER_PAGE = ['收入测算试算页']
const REPORT_MAN = 5
let REPORT_STATUS = false
import dayjs from 'dayjs'
export default {
  data() {
    return {
      currentTime: null
    }
  },
  mounted() {
    if (!FILTER_PAGE.includes(this.pageName) && this.pageName) {
      this.enterPage()
    }
  },
  methods: {
    init() {
      this.enterPage()
    },
    // 上报埋点
    report(recordList) {
      REPORT_STATUS = true
      uni.$api.commonApi
        .recordInsert({ recordList })
        .then(res => {
          if (res) {
            let recordTrackList = uni.$storage.get('recordTrackList') || []
            recordTrackList = recordTrackList.slice(REPORT_MAN)
            uni.$storage.set('recordTrackList', recordTrackList)
            REPORT_STATUS = false
          }
        })
        .catch(err => {
          REPORT_STATUS = false // 允许下次重试
        })
    },
    collect() {
      const { phone: phoneNumber, name: loginAccount, uuid, sceneType: scene, userType } = uni.$storage.get('userInfo')
      const params = {
        userType,
        loginAccount,
        phoneNumber,
        uuid,
        scene,
        prePagePath: '/',
        pagePath: this.pageName,
        eventCode: this.eventCode,
        eventTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        batchId: this.currentTime,
        systemSource: 3,
        eventType: 2
      }
      const recordTrackList = uni.$storage.get('recordTrackList') || []
      recordTrackList.push(params)
      uni.$storage.set('recordTrackList', recordTrackList)
      if (recordTrackList.length >= REPORT_MAN && !REPORT_STATUS) {
        this.report(recordTrackList.slice(0, REPORT_MAN))
      }
    },
    // 离开页面埋点
    leavePage() {
      this.collect()
    },
    // 进入页面埋点
    enterPage() {
      this.currentTime = Date.now()
      this.collect()
    }
  },
  beforeDestroy() {
    if (!FILTER_PAGE.includes(this.pageName) && this.pageName) {
      this.leavePage()
    }
  }
}
