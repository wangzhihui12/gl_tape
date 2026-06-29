import { gscPost } from '../request/signHttp'
module.exports = {
  /** 二手车驻店日报列表 */
  getCarDailyReportList(data) {
    return gscPost('/carDailyReport/list', {
      ...data
    })
  },
  /**
   * 新增二手车驻店日报
   */
  addCarDailyReport(data) {
    return gscPost('/carDailyReport/add', {
      ...data
    })
  },
  /**
   * 二手车驻店日报详情
   */
  getCarDailyReportDetail(data) {
    return gscPost('/carDailyReport/detail', {
      ...data
    })
  },
  /**
   * 修改二手车驻店日报
   */
  editCarDailyReport(data) {
    return gscPost('/carDailyReport/edit', {
      ...data
    })
  },
  /**
   * 交付单列表
   */
  getDeliveryOrderPageList(data) {
    return gscPost('/deliveryOrderManage/getDeliveryOrderPageList', data, {
      returnAll: true
    })
  },
  /**
   * 交付单列表按照支付状态统计数量
   */
  getDeliveryOrderListCount(data) {
    return gscPost('/deliveryOrderManage/getDeliveryOrderListCount', data)
  },
  /**
   * 交付单详情
   */
  getDeliveryOrderDetail(data) {
    return gscPost('/deliveryOrderManage/getDeliveryOrderDetail', data)
  },
  /**
   * 交付单操作日志
   */
  getDeliveryOrderOpLog(data) {
    return gscPost('/deliveryOrderManage/getDeliveryOrderOpLog', data)
  },
  /**
   * 客户确认到店
   */
  confirmArrive(data) {
    return gscPost('/deliveryOrderManage/confirmArrive', data, { returnAll: true })
  },
  /**
   * 客户确认提车
   */
  confirmDelivery(data) {
    return gscPost('/deliveryOrderManage/confirmDelivery', data, { returnAll: true })
  },
  /**
   * 车辆检测报告管理列表
   */
  getCheckReportPageList(data) {
    return gscPost('/checkReport/pageList', data, { returnAll: true })
  },
  /**
   * 新增查询任务
   */
  checkReportCreate(data) {
    return gscPost('/checkReport/create', data, { returnAll: true })
  },
  /**
   * 数量统计
   */
  checkReportNumCount(data) {
    return gscPost('/checkReport/numCount', data, { returnAll: true })
  },
  /**
   * 检查是否具备访问按钮的权限
   */
  checkVisitButton(data) {
    return gscPost('/permissionAccess/checkVisitButton', data, { returnAll: true })
  }
}
