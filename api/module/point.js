/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-12-19 11:02:01
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-04-23 17:19:15
 * @FilePath: \gl-tape\api\module\point.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import http from '../request/http'

module.exports = {
  /**驻店规则列表 */
  pointRuleList(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.rule.list',
      projectName: 'boutique',
      ...data
    })
  } /**驻店规则详情列表 */,
  pointRuleDetail(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.rule.detail.list',
      projectName: 'boutique',
      ...data
    })
  } /**积分记录 */,
  pointRecordList(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.record.list',
      projectName: 'boutique',
      ...data
    })
  } /**驻店月份排名 */,
  pointMonthRanking(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.month.ranking',
      projectName: 'boutique',
      ...data
    })
  } /**每日积分-项目完成情况 */,
  pointDayTask(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.every.day.task',
      projectName: 'boutique',
      ...data
    })
  },
  /**积分首页 */
  getPoint(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.home.page',
      projectName: 'boutique',
      ...data
    })
  },
  /**积分奖励规则 */
  rewardRule(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.reward.rule',
      projectName: 'boutique',
      ...data
    })
  },
  badgeList(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.point.month.badge.list',
      projectName: 'boutique',
      ...data
    })
  },
  incomeMeasurementConfig(data) {
    return http.post({
      method: 'dj.smartcarlife.api.incomeMeasurement.switch.config.search',
      projectName: 'boutique',
      ...data
    })
  },

  /**员工收入测算获取员工信息 */
  incomeCalculation(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.incomeCalculation.staffInfo',
      projectName: 'boutique',
      ...data
    })
  },
  /**获取员工绩效测算详情 */
  incomeCalculationDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.incomeCalculation.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /**分页查询员工月度工资统计列表 */
  pageStat(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.monthSalary.pageStat',
      projectName: 'boutique',
      ...data
    })
  },
  /**获取员工（测算/历史）月度工资明细 */
  monthSalaryDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.monthSalary.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /**获取试算门店工资绩效配置详细 */

  getLatestConfigDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.incomeCalculation.getLatestConfigDetail',
      projectName: 'boutique',
      ...data
    })
  },
  /**员工工资试算*/

  monthSalaryCalculation(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.incomeCalculation.monthSalaryCalculation',
      projectName: 'boutique',
      ...data
    })
  },
  /**员工考勤日历 */
  calendarDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.clock.in.staff.calendar',
      projectName: 'boutique',
      ...data
    })
  },
  /**查询员工提示信息 */
  getTipsMessage(data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.tipsMessage.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**直级介绍配置查询 */
  getJobConfig(data) {
    return http.post({
      method: 'dj.smartcarlife.api.job.rank.config.search',
      projectName: 'boutique',
      ...data
    })
  },
  /** 优惠券二级列表 */
  getGrantRecord(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.coupon.grant.record',
      projectName: 'boutique',
      ...data
    })
  },
  /** 优惠券领取 */
  receiveCoupon(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.coupon.receive',
      projectName: 'boutique',
      ...data
    })
  },
  /** 统计 优惠券 类型总数  */
  statisticsCount(data) {
    return http.post({
      method: 'dj.api.smartcarlife.resident.coupon.statistics.count',
      projectName: 'boutique',
      ...data
    })
  },
  /** 查询附近地址 */
  searchStoreAddress(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.coupon.address.search',
      projectName: 'boutique',
      ...data
    })
  },
  /** 查询勋章列表 */
  searchLevelConfig(data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.level.config.page',
      projectName: 'boutique',
      ...data
    })
  },
  /** 我的考勤相关接口 */
  /** 员工考勤日历 */
  newCalendar(data) {
    return http.post({
      method: 'dj.api.car.boutique.clock.in.staff.calendar.new',
      projectName: 'boutique',
      ...data
    })
  },
  /** 打卡申诉列表 */
  getAppealList(data) {
    return http.post({
      method: 'dj.api.car.boutique.clock.in.staff.appeal.list',
      projectName: 'boutique',
      ...data
    })
  },
  /** 提交打卡申诉 */
  appealCommit(data) {
    return http.post({
      method: 'dj.api.car.boutique.clock.in.staff.appeal.commit',
      projectName: 'boutique',
      ...data
    })
  },
  /** 考勤出勤明细 */
  attendanceDetail(data) {
    return http.post({
      method: 'dj.api.car.boutique.clock.in.staff.attendance.detail',
      projectName: 'boutique',
      ...data
    })
  },
  appealExist(data) {
    return http.post({
      method: 'dj.api.car.boutique.clock.in.staff.appeal.exist',
      projectName: 'boutique',
      ...data
    })
  }
}
