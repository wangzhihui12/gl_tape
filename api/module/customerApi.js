import http from '../request/http'
import environment from '@/env'

module.exports = {
  /**查询当前门店是否有客户档案权限 */
  haveCustomerAccess (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.findPermissionsMerchantList',
      projectName: 'boutique',
      ...data
    })
  },
  /**查询当前门店客户档案列表 */
  getCustomerFileList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.customerInfoPage',
      projectName: 'boutique',
      ...data
    })
  },
  /*  删除客户档案*/
  delCustomerFile (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.deleteVisitsInfo',
      projectName: 'boutique',
      ...data
    })
  },
  /** 根据业务查询接待场景 */
  findAllSence (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.findAllSence',
      projectName: 'boutique',
      ...data
    })
  },
  /**根据业务查询客户标签  */
  findCustomerTags (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.findSenceTag',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   *  查询客户档案详情
   */
  findVisitsInfo (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.findVisitsInfo',
      projectName: 'boutique',
      ...data
    })
  },
  /*
   * 保存客户档案
   */
  saveVisitsInfo (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.saveVisitsInfo',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   *  更新客户档案
   */
  updateVisitsInfo (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.updateVisitsInfo',
      projectName: 'boutique',
      ...data
    })
  },
  /**查询客户档案列表  */
  getCustomerInfoList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.customerInfoList',
      projectName: 'boutique',
      ...data
    })
  },
  /**接待客户素材
   *
   */
  getMaterialResponsePage (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.getMaterialResponsePage',
      projectName: 'boutique',
      ...data
    })
  },
  /**素材详情  查询素材详情 */
  getMaterialDetail (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customervisits.getMaterialById',
      projectName: 'boutique',
      ...data
    })
  },
  /**直营驻店人员 */
  saleOpen (data) {
    return http.post({
      method: 'dj.api.car.boutique.resident.direct.sale.merchant',
      projectName: 'boutique',
      ...data
    })
  }
}
