import http from '../request/http'

module.exports = {
  /** 销售顾问/录单员 & 交付专员 */
  getEmployeeList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.employee.onTheJob.getByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 二级流量方
   */

  getDiversionMerchantRef (data) {
    return http.post({
      method: 'dj.api.smartcarlife.diversionMerchant.getDiversionMerchantRef',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 获取门店品牌车型
   */

  getMerchantCarBrandList (data) {
    return http.post({
      method: 'dj.api.get.car.brandList',
      projectName: 'boutique',
      needCarSeries: true,
      ...data
    })
  },

  /***
   * 获取门店礼券列表
   */
  getMerchantCouponList (data) {
    return http.post({
      method: 'dj.api.smartCarLife.merchant.coupon.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 获取客户礼券列表
   */
  getCustomerCouponList (data) {
    return http.post({
      method: 'dj.api.customer.coupon.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 获取商品列表
   */
  getGoodsList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.selectOrderGoods.list',
      projectName: 'boutique',
      ...data
    })
  },

  /**获取订单列表筛选转化人员&销售顾问 */
  getOrderScreenEmployeeList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.employee.getByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 获取园区店配置
   */
  getYqStoreConfig (data) {
    return http.get({
      method: 'dj.api.smarcarlife.yqMerchantConfig.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 战败下单商品列表
   *
   */
  getOrderUpgradeGoodsList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.orderUpgradeGoods.listByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   *  获取精品升级场景 太阳膜类商品部位数据
   */
  getPositionList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.goodsPosition.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 获取提单客户档案列表
   *
   */
  getQuotationCustomerList (data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.customer.page',
      projectName: 'boutique',
      ...data
    })
  },
  /**搜索订单(含套餐) */
  getWorkPackageGoodsList (data) {
    let params = data || {}
    params.sceneType = 1
    return http.post(
      {
        method: 'dj.api.smartcarlife.order.search.containPackageGoods',
        projectName: 'boutique',
        ...data,
        pageSize: 10,
        pageSize: 999999,
        statusList: [1]
      },
      false,
      'dj',
      1000000
    )
  },
  /**
   * 获取车品牌
   */
  getCarBrandList (data = {}) {
    return http.post({
      method: 'scrm.api.carlife.common.getOnlyCarBrandList',
      projectName: 'carlife',
      ...data
    }, false, 'scrm')
  },
  /** 获取车系列表 */
  getCarSeriesList (data = {}) {
    return http.post({
      method: 'scrm.api.carlife.common.getCarSeriesList',
      projectName: 'carlife',
      ...data
    }, false, 'scrm')
  },
  /** 获取车型 */
  getCarTypeList (data = {}) {
    return http.post({
      method: 'scrm.api.carlife.common.getCarTypeList',
      projectName: 'carlife',
      ...data
    }, false, 'scrm')
  },
}
