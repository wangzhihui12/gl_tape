import http from '../request/http'
import { gscPost } from '../request/signHttp'

module.exports = {
  /** 查询该店员工日报是否开启 */
  staffDailyReportMerchantValid (data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.popup.need',
      projectName: 'boutique',
      ...data
    })
  },
  /** 校验手机号是否配置打卡和是否打卡 */
  clockInConfigPhone (data) {
    return http.post({
      method: 'dj.api.smartcarlife.clock.in.config.phone',
      projectName: 'boutique',
      ...data
    })
  },
  /**
     *  查询当前员工处罚情况
     */
  checkStaffStudyPunish (data) {
    return http.post({
      method: 'dj.api.carboutique.staff.study.punish',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 二手车查询员工昨天是否新入职或调店
   */
  checkUsedCarStaffIsNew (data) {
    return http.post({
      method: 'dj.api.smartcarlife.secondHandCar.staffDailyReport.popup.need',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 查询员工是否需要填写二手车日报
   */
  checkUsedCarStaffDailyReportValid (data) {
    return gscPost('/carDailyReport/yesterday/check', {
      ...data
    })
  },
}
