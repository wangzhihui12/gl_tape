import http from '../request/http'
import { env } from '../../env'


const ENV = env == 'ip' ? 'develop' : env,
  configUrl = `https://config-center-backend.glsx.com.cn/glsxAdmin/config?env=${ENV}`


/**
 * 
 * @param {*} templateType  1: 驻店 2：门店 3：洽谈
 * 
 * @returns 
 */
const getDailyTemplate = async (templateType) => {
  try {
    const configModule = {
      1: 'staff-daily-template',
      2: 'store-daily-template',
      3: 'negotiation-details-template',
    }[templateType]
    const data = await http.uni_request({ url: `${configUrl}&moduleUrl=${configModule}` })
    return Promise.resolve(data)
  } catch (error) {
    return Promise.reject(error)
  }
}
/**
 * 查询日报是否填写列表
 * @param {*} data 
 * @returns 
 */
const getReportList = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.weekly.list',
    projectName: 'boutique',
    ...data
  })
}
/**
查询日报详情
 */
const getReportDetail = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.detail.get',
    projectName: 'boutique',
    ...data
  })
}
/**
是否需要新版本日报填报
 */

const isNewVersionNeed = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.new.version.isNeed',
    projectName: 'boutique',
    ...data
  })
}
/**
查询门店日报本月待邀约数 
 */
const getMonthlyPendingCount = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.monthly.pending.get',
    projectName: 'boutique',
    ...data
  })
}
/**
查询洽谈明细驻店人员名单
 */
const getDiscussionStaffList = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.discussion.staff.list',
    projectName: 'boutique',
    ...data
  })
}
/**
日报草稿数据保存
 */
const saveDraft = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.dynamic.draft.save',
    projectName: 'boutique',
    ...data
  })
}
/**
日报数据提交
 */
const submitReport = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.dailyReport.dynamic.save',
    projectName: 'boutique',
    ...data
  })
}
/**
 * 当前门店驻店人员在选中成交日期交付的延保及权益订单
 */
const getGoodsOrderList = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.goodsOrder.product.outputValue.list',
    projectName: 'boutique',
    ...data
  })
}
/**
 * 查询员工账号上架门店的小场景值
 */
const getStaffBaseSceneCodeList = async (data = {}) => {
  return http.post({
    method: 'dj.api.smartcarlife.scene.config.getUserScene',
    projectName: 'boutique',
    ...data
  })
}
/**
 * 查询门店上架的小场景值
 */
const getStoreBaseSceneCodeList = async (data = {}) => {
  return http.post({
    method: 'dj.api.scenemerchantref.findByMerchantIdAndSceneType',
    projectName: 'boutique',
    ...data
  })
}

module.exports = {
  getDailyTemplate,
  getReportList,
  getReportDetail,
  isNewVersionNeed,
  getMonthlyPendingCount,
  saveDraft,
  getDiscussionStaffList,
  submitReport,
  getGoodsOrderList,
  getStaffBaseSceneCodeList,
  getStoreBaseSceneCodeList
}
