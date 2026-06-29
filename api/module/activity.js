import http from '../request/http'

module.exports = {
  /**活动列表 */
  activityPage(data) {
    return http.post({
      method: 'risk.manage.api.activity.pad.page',
      projectName: 'pad',
      ...data
    })
  },
  /**荣誉墙 */
  activityReward(data) {
    return http.post({
      method: 'risk.manage.api.activity.reward',
      projectName: 'pad',
      ...data
    })
  },
  /**
   * 获取活动弹框
   */
  getActivityMessagePopUpWindow(data) {
    return http.post({
      method: 'dj.pad.api.activity.message.pop.up.window',
      projectName: 'pad',
      ...data
    })
  },
  /**
   * 更新活动弹框状态
   */
  updateActivityMessagePopUpWindow(data) {
    return http.post({
      method: 'dj.pad.api.activity.pop.up.window.update',
      projectName: 'pad',
      ...data
    })
  },
  /**
   * 获取活动详情
   */
  getActivityDetail(data) {
    return http.post({
      method: 'dj.pad.api.activity.assign.activity.find',
      projectName: 'pad',
      ...data
    })
  },
}
