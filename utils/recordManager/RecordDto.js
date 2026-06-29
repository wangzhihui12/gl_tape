/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 14:48:44
 * @LastEditors: limin
 * @LastEditTime: 2025-01-06 09:35:40
 * @FilePath: \gl_tape\utils\recordManager\RecordDto.js
 */
export default class RecordDto {
  staffUuid = ''
  staffName = ''
  serviceMerchantId = ''
  carModel = ''
  endReasonType = 1 //原因 1.异常 0.正常
  customerName = ''
  phoneNumber = ''
  appCode = ''
  loginPhone = ''
  salesName = ''
  salesUuid = ''
  receptionStatus = '' //接待结果 1.成交 0.战败
  receptionStartTime = ''
  receptionEndTime = ''
  receptionCustomerPaySourceList = [] //1.付款凭证文件路径 2.客户购车发票文件路径 3.客户延保合同文件路径
  merchantId = ''
  merchantName = ''
  bussinessType = 0 // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
  channelType = 1 //1问界 2 比亚迪 3 其他
  receptionCustomerMaterialPointList = []
  carBrand = ''
  carBrandId = ''
  oneCarBrand = ''
  oneCarBrandId = ''

  constructor(options) {
    Object.assign(this, options)
  }
}
