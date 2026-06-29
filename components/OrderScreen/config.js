const screenList = [
  {
    title: '场景名称',
    componentName: 'SceneList',
    params: {
      cacheData: [],
      idKey: 'baseSceneCode'
    },
    hasToggle: true,
    toggle: false
  },
  {
    title: '转化人员',
    suffix: 'merchantName',
    componentName: 'EmployeeList',
    params: {
      cacheData: [],
      idKey: 'sellerUserIdList'
    },
    hasToggle: true,
    toggle: false
  },
  {
    title: '销售顾问',
    suffix: 'shopMerchantName',
    componentName: 'EmployeeList',
    params: {
      cacheData: [],
      idKey: 'userIdList'
    },
    hasToggle: true,
    toggle: false
  },
  {
    title: '订单时间',
    componentName: 'TimeList',
    params: {
      idKey: ['placeOrderStartDateStr', 'placeOrderEndDateStr'],
      currentIdKey: 'orderTimeId'
    }
  },
  {
    title: '支付时间',
    componentName: 'TimeList',
    params: {
      idKey: ['installUpgradeBeginTimeStr', 'installUpgradeEndTimeStr'],
      currentIdKey: 'payTimeId'
    }
  },
  {
    title: '订单状态',
    componentName: 'OrderStatusList',
    params: {
      idKey: 'statusList'
    }
  },
  {
    title: '异常标记',
    componentName: 'ErrorOrderList',
    params: {
      idKey: 'abnormalFlag'
    }
  },
  {
    title: '支付方式',
    componentName: 'PayList',
    params: {
      idKey: 'payType'
    }
  }
]

export default { screenList }
