/*
 * @Description:
 * @Author: huyue
 * @Date: 2024-09-05 14:05:25
 * @LastEditors: huyue
 * @LastEditTime: 2024-09-13 11:08:55
 */
import http from '../request/http'

module.exports = {
  /**获取APP更新 */
  findSoureList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.soure.findSoureList',
      projectName: 'boutique',
      ...data
    })
  },
  /** 查询可发放礼券-分页查询商户券列表 */
  findCouponList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.merchantCoupon.pageForZYApp',
      projectName: 'boutique',
      onlyUsable: true,
      currentPage: 1,
      pageSize: 99999,
      ...data
    })
  },
  /**查询用户是否领券  */
  findCustomerReceivedStatus (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customerCoupon.pageForZYApp',
      projectName: 'boutique',
      ...data,
      currentPage: 1,
      pageSize: 99999,
      statusList: [0, 1]
    })
  },
  /**历史成交客户  */
  historyDealOrderPage (data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.historyDealOrder.page',
      projectName: 'boutique',
      ...data
    })
  },
  // 历史订单列表
  getQuotationList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.page',
      projectName: 'boutique',
      ...data
    })
  },
  // 历史订单列表
  getOrderList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.for.pad.page',
      projectName: 'boutique',
      ...data
    })
  },
  // 新历史订单列表
  getOrderListPage (data) {
    return http.post({
      method: 'dj.pad.api.history.order.page',
      projectName: 'pad',
      ...data
    })
  },
  // 查询延保类类目列表
  getGoodsCategoryList (data) {
    return http.post({
      method: 'dj.pad.api.goodsCategoryConfiguration.extendedWarranty',
      projectName: 'pad',
      ...data
    })
  },

  /**客户邀约记录  */
  customerInviteRecordPage (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customerInviteRecord.page',
      projectName: 'boutique',
      ...data
    })
  },

  /**轻改素材配置 */
  getBoutiqueMaterialConfig (data) {
    return http.post({
      method: 'dj.api.boutique.recepiton.material.merchant.detail',
      projectName: 'boutique',
      ...data
    })
  },

  /** 案例视频 */
  getCaseList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.material.case.find',
      projectName: 'boutique',
      ...data
    })
  },
  /** 获取类目 */
  getCategory (data) {
    return http.post({
      method: 'dj.api.boutique.recepiton.material.merchant.category',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 客户邀约记录-邀约类型数目统计
   */
  getInviteRecordCount (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customerInviteRecord.inviteStatus.count',
      projectName: 'boutique',
      ...data
    })
  },
  // 案例视频中心埋点
  caseVideoCenter (data) {
    return http.post({
      method: 'dj.api.boutique.reception.material.point.insert',
      projectName: 'boutique',
      ...data
    })
  },
  // 权益提单相关接口
  // 查询店铺配置
  getShopMerchantPointConfig (data) {
    return http.post({
      method: 'dj.api.smartcarlife.shopMerchantPointConfig.get',
      projectName: 'boutique',
      ...data
    })
  },
  /** 根据订单状态统计订单数*/
  statByStatus (data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.statByStatus',
      projectName: 'boutique',
      ...data
    })
  },
  // 根据4s店商户好获取二级流浪方列表
  getSubShopMerchantList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.diversionMerchant.getDiversionMerchantRef',
      projectName: 'boutique',
      ...data
    })
  },
  /**搜索订单(含套餐) */
  getWorkPackageGoodsList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.search.containPackageGoods',
      projectName: 'boutique',
      ...data
    })
  },
  // 获取商户订单设置
  getMerchantRecordingSettings (data) {
    return http.post({
      // method: 'dj.api.smartcarlife.recordingSettings.getMerchantRecordingSettings',
      method: 'dj.api.smartcarlife.order.field.lightChange.setting.list',
      projectName: 'boutique',
      ...data
    })
  },
  // 获取园区店配置
  getYqStoreConfig (data) {
    return http.post({
      method: 'dj.api.smarcarlife.yqMerchantConfig.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /**补录订单数 */
  waitinputorder (data) {
    return http.post({
      method: 'dj.api.smartcarlife.weapp.waitinputorder.count',
      projectName: 'boutique',
      ...{ ...data, inputStatus: 0 }
    })
  },
  /**交易流水号 */
  transactionSerialNumber (data) {
    return http.post({
      method: 'dj.api.smartcarlife.weapp.waitinputorder.page',
      projectName: 'boutique',
      ...data
    })
  },
  // 根据商户号获取可选商品列表
  getSelectOrderGoodsList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.selectOrderGoods.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**战败商品列表- upradeFlag(N为基础,Y为升级)  */
  getOrderBaseGoodsList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.orderUpgradeGoods.listByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  /** 选择支付方式下单 */
  createWithPay (data) {
    console.log(data)
    return http.post({
      method: 'dj.api.smartcarlife.order.createWithPay',
      projectName: 'boutique',
      ...data
    })
  },
  /** 订单补录 */
  supplementOrder (data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.supplementOrder',
      projectName: 'boutique',
      ...data
    })
  },
  // 获取精品升级场景 太阳膜类商品部位数据
  getPositionList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.goodsPosition.list',
      projectName: 'boutique',
      ...data
    })
  },
  /** 查询该店员工日报是否开启 */
  staffDailyReportMerchantValid (data) {
    // return api.post('dj.api.smartcarlife.staff.daily.report.merchant.valid', data)
    return http.post({ method: 'dj.api.smartcarlife.staff.daily.report.popup.need', projectName: 'boutique', ...data })
  },

  /** 校验手机号是否配置打卡和是否打卡 */
  clockInConfigPhone (data) {
    // return api.post('dj.api.smartcarlife.staff.daily.report.merchant.valid', data)
    return http.post({ method: 'dj.api.smartcarlife.clock.in.config.phone', projectName: 'boutique', ...data })
  },
  /** 获取商户基本信息 */
  getServiceBaseInfo (data) {
    return http.post({ method: 'dj.api.smartcarlife.serviceMerchant.getServiceBaseInfo', projectName: 'boutique', ...data })
  },
  /** 查询园区店是否开启签名配置 */
  getSignatureSwitch (data) {
    return http.post({ method: 'dj.api.smartcarlife.serviceMerchant.getSignatureSwitch', projectName: 'boutique', ...data })
  },
  // 获取服务商库存管理模式（是否使用膜卷号）
  getServiceFilmRollSetting (data) {
    return http.post({ method: 'dj.api.smarcarlife.stock.management.mode', projectName: 'boutique', ...data })
  },
  /** 获取转化员上一笔订单的销售顾问 */
  getLastUserOrderInfo (data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.getLastUser',
      projectName: 'boutique',
      ...data
    })
  },
  /**根据订单号获取订单详情(含套餐) */
  getPackageGoodsDetail (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.packageGoodsDetail', projectName: 'boutique', ...data })
  },
  /**
   * 查询日报门店主营品牌
   */
  getDailyReportCarBrand (data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.car.brand',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 查询员工日报是否填写列表
   *
   */
  getStaffDailyReportDetailWeeklyList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.weekly.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 查询日报详情
   */
  getStaffDailyReportDetail (data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /** 修改订单备注 */
  updateOrderRemark (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.updateRemark', projectName: 'boutique', ...data })
  },
  /** 修改工单时间 */
  updateOrderTime (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.updateOrderTime', projectName: 'boutique', ...data })
  },
  /** 获取企微活码 */
  getWorkWechatLiveQRCode (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.getWorkWechatLiveQRCode', projectName: 'boutique', ...data })
  },
  /** 升级商品生成条形码 */
  createBarCode (data) {
    return http.post({ method: 'dj.api.smartcarlife.common.createBarCode', projectName: 'boutique', ...data })
  },
  /**撤销工单  */
  revokeOrder (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.revoke', projectName: 'boutique', ...data })
  },
  /** 获取园区店配置技师数据 */
  getQYTechnicianList (data) {
    return http.post({ method: 'dj.api.smartcarlife.roleTechnician.list', projectName: 'boutique', ...data })
  },
  // 生成生成小程序码
  createQrcodeImage (data) {
    // dj.api.smartcarlife.serviceMerchant.getByMerchantId
    return http.post({ method: 'dj.api.smartcarlife.common.createWeappQrcode', projectName: 'boutique', ...data })
  },
  /**
   * 保存日报
   */
  saveStaffDailyReport (data) {
    data.dailyReportSource = 2
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.save',
      projectName: 'boutique',
      ...data
    })
  },
  /** 不升级常用字符列表 */
  getConfigList (data) {
    return http.post({ method: 'dj.api.smartcarlife.config.list', projectName: 'boutique', ...data })
  },
  /** 战败订单批量补录 */
  notUpgradeOrder (data) {
    return http.post({ method: 'dj.api.smartcarlife.order.notUpgrade.batchInsert', projectName: 'boutique', ...data })
  },
  /**改变支付订单状态  */
  createPayOrder (data) {
    return http.post({ method: 'dj.api.smartcarlife.payOrder.create', projectName: 'boutique', ...data })
  },
  /** 质保价格编辑接口 */
  modifyWarrantyPrice (data) {
    return http.post({
      method: 'dj.api.smartcarlife.customer.warrantyCard.modifyWarrantyPrice',
      projectName: 'boutique',
      ...data
    })
  },

  /** 退款中拦截 */
  refundApplyRecordIsExist (data) {
    return http.post({
      method: 'dj.api.smartcarlife.refundApplyRecord.isExist',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 查询商户套餐推荐配置列表
   */
  getBoutiquePackageList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.receptionMaterialRecommendPackageConfig.getByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   *  日报填报前参数校验
   */
  dailyReportCheck (data) {
    return http.post({
      method: 'dj.api.smartcarlife.staff.daily.report.data.check',
      projectName: 'boutique',
      ...data
    })
  },
}
