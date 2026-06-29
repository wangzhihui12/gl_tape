const ORDER_STATUS = {
  0: '待交付',
  1: '交付中',
  2: '交付完成'
}

const PAYMENT_STATUS = {
  0: '待支付',
  1: '已结清'
}
const OP_TYPE = {
  1: '创建交付工单',
  2: '确认客户到店',
  3: '确认客户提车'
}
module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  OP_TYPE
}