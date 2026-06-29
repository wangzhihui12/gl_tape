// ${pathEnum.evaluation}
import { gscPost } from '../request/signHttp'
module.exports = {
  /** 评估单列表 */
  evalOrderList(data) {
    return gscPost(
      `/evalOrder/page`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单详情 */
  evalOrderDetail(data) {
    return gscPost(
      `/evalOrder/detail`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单创建 */
  evalOrderCreate(data) {
    return gscPost(
      `/evalOrder/create`,
      {
        ...data
      },
      { returnAll: true, duplicatePrevention: true }
    )
  },
  /** 评估单分页状态数量 */
  evalOrderPageCount(data) {
    return gscPost(
      `/evalOrder/pageCount`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单更新 */
  evalOrderUpdate(data) {
    return gscPost(
      `/evalOrder/edit`,
      {
        ...data
      },
      { returnAll: true, duplicatePrevention: true }
    )
  },
  /** 评估单重新报价 */
  evalOrderOwnerReQuote(data) {
    return gscPost(
      `/evalOrder/ownerReQuote`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 签订买卖合同 */
  evalOrderSignContract(data) {
    return gscPost(
      `/evalOrder/signingSaleContract`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单取消合同 */
  evalOrderCancelContract(data) {
    return gscPost(
      `/evalOrder/cancelSaleContract`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单重新提交 */
  evalOrderConfirmVehicleDelivery(data) {
    return gscPost(
      `/confirmVehicleDelivery/reSubmit`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 确认交车 */
  confirmDelivery(data) {
    return gscPost(
      `/confirmVehicleDelivery/confirmVehicleDelivery`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 支付定金 */
  payDepositApplication(data) {
    return gscPost(
      `/applyPayment/payDepositApplication`,
      {
        ...data
      },
      { returnAll: true }
    )
  },

  /** 发起代保管协议签署 */
  signAgreement(data) {
    return gscPost(
      `/applyPayment/payFinal`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 检查代保管协议签署状态 */
  checkSignAgreement(data) {
    return gscPost(
      `/applyPayment/checkSignAgreement`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 检查车辆是否存在重复评估单 */
  checkRepeat(data) {
    return gscPost(
      `/evalOrder/checkRepeat`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 车辆ocr识别 */
  vinOcr(data) {
    return gscPost(
      `/evalOrder/vinOcr`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 行驶证ocr识别 */
  carLicenseOcr(data) {
    return gscPost(
      `/evalOrder/carLicenseOcr`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 获取合同详情 */
  getContractDetail(data) {
    return gscPost(
      `/evalElectronicContract/getDetail`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 获取保管人列表 */
  getCustodyAgreementList(data) {
    return gscPost(
      `/custodyAgreement/custodyAgreementList`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 新增保管人 */
  addCustodyAgreement(data) {
    return gscPost(
      `/custodyAgreement/addCustodyAgreement`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 发送代保管人协议 */
  sendCustodyAgreement(data) {
    return gscPost(
      `/custodyAgreement/sendCustodyAgreement`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 销售协议预览 */
  salesAgreementPreview(data) {
    return gscPost(
      `/evalOrder/salesAgreementPreview`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 线上合同预览 */
  viewOnlineContract(data) {
    return gscPost(
      `/evalOrder/viewOnlineContract`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /** 评估单简单详情 */
  evalOrderSimpleDetail(data) {
    return gscPost(
      `/evalOrder/simpleDetail`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /**省市区 */
  apiRegion(data) {
    const queryString = Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&')
    return gscPost(`/evalOrder/apiRegion/search${queryString ? '?' + queryString : ''}`, { ...data }, { returnAll: true })
  },
  /** 撤销合同 */
  revokeSaleContract(data) {
    return gscPost(
      `/evalOrder/revokeSaleContract`,
      {
        ...data
      },
      { returnAll: true }
    )
  },
  /**
   * 根据VIN查询查博士数据
   */
  queryByVin(data) {
    return gscPost('/chaboshi/queryByVin', data, { returnAll: true })
  }
}
