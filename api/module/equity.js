import http from '../request/http'

// 轻量去重：同参数短时间内复用同一个 Promise，避免页面/弹窗多次触发
const __sceneListPromiseCache = new Map()

module.exports = {
    /**查询存在订单数据的场景列表 */
    getSceneListWithOrder(data) {
      const key = `getSceneListWithOrder:${JSON.stringify(data || {})}`
      if (__sceneListPromiseCache.has(key)) return __sceneListPromiseCache.get(key)
      const p = http.post({
        method: 'dj.api.smartcarlife.scene.config.getUserScene',
        projectName: 'boutique',
        ...data
      }).finally(() => {
        // 释放缓存，避免长期持有
        __sceneListPromiseCache.delete(key)
      })
      __sceneListPromiseCache.set(key, p)
      return p
    },
    /**保存用户最近选中的场景值 */
    saveUserRecentScene(data) {
      return http.post({
        method: 'dj.api.smartcarlife.scene.recent.saveUserScene',
        projectName: 'boutique',
        ...data
      })
    },
    /**查询用户最近选中的场景值 */
    getUserRecentScene(data) {
      return http.post({
        method: 'dj.api.smartcarlife.scene.recent.getUserScene',
        projectName: 'boutique',
        ...data
      })
    },
  /**新建车损报价单 */
  quotationAdd(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.add',
      projectName: 'boutique',
      ...data
    })
  },
  /** 报价单支付订单生成(带上签名)返回订单号(商户地址)  */
  quotationUpgrade(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.pay.order.generate',
      projectName: 'boutique',
      ...data
    })
  },
  // 校验订单是否需要上传合同协议
  checkZyPayFlag(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.zyPayUrl.check',
      projectName: 'boutique',
      ...data
    })
  },

  // 查询店铺配置
  getShopMerchantPointConfig(data) {
    return http.post({
      method: 'dj.api.smartcarlife.shopMerchantPointConfig.get',
      projectName: 'boutique',
      ...data
    })
  },

  /** 查询报价单信息 */
  getQuotationInfoById(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.find.by.id',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 订单详情
   */
  getOrderDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /**pos支付 */
  getPosQr(data) {
    return http.post({
      method: 'dj.api.smartcarlife.payOrder.create',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   *   查询门店录单设置
  },
   */
  orderSettingList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.order.field.setting.list',
      projectName: 'boutique',
      ...data
    })
  },

  /** 报价单分页列表 */
  quotationPage(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.page',
      projectName: 'boutique',
      ...data
    })
  },
  /** 根据id查询报价单数据 */
  getQuotationInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.generate',
      projectName: 'boutique',
      ...data
    })
  },
  /** 修改车损报价单客户基本信息信息 */
  updateCustomerInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.customer.base.info.update',
      projectName: 'boutique',
      ...data
    })
  },

  /** 报价单订单分状态统计信息 */
  orderStatistics(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.order.status.statistics',
      projectName: 'boutique',
      ...data
    })
  },
  // 查询订单是否支持状态变更
  getOrderRefundStep(data) {
    return http.post({
      method: 'dj.api.smartcarlife.refundApplyRecord.isExist',
      projectName: 'boutique',
      ...data
    })
  },
  /**报价单-撤销工单 */
  cancelOrderById(data) {
    return http.post({
      method: 'dj.api.smartcarlife.quotation.cancel',
      projectName: 'boutique',
      ...data
    })
  },
  // 车损报价单战败订单创建
  defeatOrderCreate(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.add.defeat.order',
      projectName: 'boutique',
      ...data
    })
  },
  // 更新合同协议内容
  updateZyInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.zyPayUrl.update',
      projectName: 'boutique',
      ...data
    })
  },
  /** 根据商户号商品id获取可选升级商品列表 */
  quotationGoodsList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.quotationGoods.list',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * /** 修改车损报价单信息 */
  updateQuotation(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.update',
      projectName: 'boutique',
      ...data
    })
  },
  getCheckEmployeeList(data) {
    // 0->2.0 1->1.1 2->1.2 3->1.3 场景对应
    // data.sceneList = [1]
    return http.post({
      method: 'dj.api.smartcarlife.employee.onTheJob.getByMerchantId',
      projectName: 'boutique',
      ...data
    })
    // return api.post("dj.api.smartcarlife.employee.getByMerchantId", data);
  },
  /** 更新报价单状态 */
  updateOrderStatus(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.status.update',
      projectName: 'boutique',
      ...data
    })
  },

  /**
   * 服务信息详情
   *
   */
  getServiceInfoDetail(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.detail',
      projectName: 'boutique',
      ...data
    })
  },
  /** 权益单分页列表 */
  equityPage(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.page',
      projectName: 'boutique',
      ...data
    })
  },
  /** 权益单统计信息 */
  equityStatistics(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.statics',
      projectName: 'boutique',
      ...data
    })
  },
  // 更新客户签名
  updateCustomerNameUrlAPI(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.updateCustomerNameUrl',
      projectName: 'boutique',
      ...data
    })
  },
  /** 查询合同*/
  equityOrderList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.listContracts',
      projectName: 'boutique',
      ...data
    })
  },
  /** 打印合同*/
  printContract(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.print',
      projectName: 'boutique',
      ...data
    })
  },
  /**
   * 提交前检查车架号是否已购买
   */
  checkVinBuyEquityOrder(data) {
    return http.post(
      {
        method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.vin.check',
        projectName: 'boutique',
        ...data
      },
      true
    )
  },
  /**提交权益单
   *
   */
  addEquityOrder(data) {
    return http.post(
      {
        method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.add',
        projectName: 'boutique',
        ...data
      },
      true
    )
  },
  /**
   * 订单号查服务信息详情
   */
  getEquityOrderByOrderId(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.equityOrder.handler',
      projectName: 'boutique',
      ...data
    })
  },
  // 查询订单是否支持状态变更
  getOrderRefundStep(data) {
    return http.post({
      method: 'dj.api.smartcarlife.refundApplyRecord.isExist',
      projectName: 'boutique',
      ...data
    })
  },
  /** 标记错误订单 */
  errorOrderById(data) {
    return http.post({
      method: 'dj.api.smartcarlife.quotation.correct',
      projectName: 'boutique',
      ...data
    })
  }
}
