module.exports = {
  data: {
    orderObj: [
      {
        label: '工单编号',
        key: 'orderCode',
        copy: true
      },
      {
        label: '工单时间',
        key: 'time',
        dateChange: true
      },
      {
        label: '工单状态',
        key: 'status',
        color: '#14CC68',
        status: true
      },
      {
        label: '支付方式',
        key: 'payType',
        payType: true
      }
    ],
    customerObj: [
      {
        label: '客户姓名',
        key: 'customerName'
      },
      {
        label: '性别',
        key: 'customerSex',
        enum: {
          1: '男',
          2: '女'
        }
      },
      {
        label: '手机号',
        key: 'customerPhone',
        color: '#347BFF',
        callBack: 'makePhoneCall',
        copy: true
      },
      {
        label: '车型',
        key: 'carType'
      },
      {
        label: '车架号',
        key: 'standNo'
      },
      {
        label: '车牌号',
        key: 'plateNumber'
      },
      {
        label: '是否体验',
        key: 'experienceFlag',
        enum: {
          Y: '是',
          N: '否'
        }
      },
      {
        label: '销售顾问',
        arr: ['merchantName', 'employeeName']
      },
      {
        label: '转化专员',
        arr: ['sellerMerchantName', 'sellerName']
      },
      {
        label: '备注',
        key: 'remark'
      }
    ],
    payType: {
      0: '战败',
      1: '微信支付',
      2: '门店收款',
      3: 'pos机支付',
      4: '支付宝支付',
      5: '嘀加收款',
      6: '对公转账',
      7: '其它收款'
    },
    orderType: [
      {
        name: '全部',
        active: true,
        value: []
      },
      {
        name: '升级下单',
        value: [1, 2, 3, 4, 6]
      },
      {
        name: '核销抵扣',
        value: [5]
      }
    ],
    status: {
      14: {
        text: '审批中',
        color: '#FF9D0A',
        background: '#FFF5E6'
      },
      12: {
        text: '已退款',
        color: '#F7A431',
        background: '#FFF5E6'
      },
      11: {
        text: '错误订单',
        color: '#F59619',
        background: ' #FFF6EB'
      },
      10: {
        text: '已关闭',
        color: '#8F959E'
      },
      9: {
        text: '已撤销',
        color: '#8F959E',
        background: '#F0F0F0'
      },
      1: {
        text: '待跟进',
        color: '#FF9D0A',
        background: '#FFF5E6'
      },
      2: {
        text: '战败',
        color: '#F24724',
        background: '#FDECE9'
      },
      3: {
        text: '待支付',
        color: '#FF9D0A',
        background: '#FFF5E6'
      },
      4: {
        text: '已支付',
        color: '#35C376',
        background: '#EAF9F1'
      },
      6: {
        text: '已评价',
        color: '#347BFF',
        background: '#EAF1FF'
      }
    },
    // 订单状态 1 待跟进， 2 不升级， 3 待支付，4 已支付，6 已评价 ， 9 已撤销
    statusList: [
      {
        name: '待跟进',
        value: [1]
      },
      {
        name: '已支付',
        value: [4]
      },
      {
        name: '待支付',
        value: [3]
      },
      {
        name: '已撤销',
        value: [9]
      },
      {
        name: '战败',
        value: [2]
      },
      {
        name: '已评价',
        value: [6]
      },
      {
        name: '已关闭',
        value: [10]
      },
      {
        name: '错误订单',
        value: [11]
      }
    ],
    grassInfo: {},
    orderCode: '',
    userInfo: {},
    goodsOrderApplyStatus: {
      1: '审批中', //区域运营待审核
      2: '审批中', //线上运营待审核
      3: '审核通过',
      4: '审批驳回'
    },
    orderType: {
      1: '正常订单',
      2: '打折策略',
      3: '买赠策略',
      4: '冲量活动',
      5: '组合付款',
      6:'内部结算'
    }
  }
}
