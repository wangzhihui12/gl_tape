//文件子类型
export const fileSuibtype = {
  11: {
    name: '左前45度',
    type: 'image'
  },
  12: {
    name: '主驾驶全景',
    type: 'image'
  },
  13: {
    name: '仪表盘',
    type: 'image'
  },
  14: {
    name: '后排座椅',
    type: 'image'
  },
  15: {
    name: '中控台全景',
    type: 'image'
  },
  16: {
    name: '右后45度',
    type: 'image'
  },
  17: {
    name: '铭牌',
    type: 'image'
  },
  21: {
    name: '行驶证',
    type: 'image'
  },
  22: {
    name: '登记证1',
    type: 'image'
  },
  23: {
    name: '登记证2',
    type: 'image'
  },
  24: {
    name: '登记证3',
    type: 'image'
  },
  31: {
    name: '发动机概况',
    type: 'image'
  },
  32: {
    name: '车况解说',
    type: 'image'
  },
  41: {
    name: '其他图片',
    type: 'image'
  },
  42: {
    name: '其他视频',
    type: 'video'
  }
}

export const statusMap = {
  10: {
    name: '评估中',
    type: 'primary'
  },
  20: {
    name: '已报价',
    type: 'primary'
  },
  30: {
    name: '已签约',
    type: 'primary'
  },
  31: {
    name: '已签署确认单',
    type: 'primary'
  },
  32: {
    name: '已签署协议',
    type: 'primary'
  },
  40: {
    name: '已支付-定金',
    type: 'primary'
  },
  50: {
    name: '已支付-尾款',
    type: 'primary'
  },
  100: {
    name: '已完成',
    type: 'primary'
  },
  '-1': {
    name: '已驳回',
    type: 'primary'
  },
  1: {
    name: '合同签署中',
    type: 'primary'
  },
  2: {
    name: '定金支付中',
    type: 'primary'
  },
  3: {
    name: '尾款支付中',
    type: 'primary'
  }
}

export const vehicleCategoryMap = {
  1: '置换车',
  2: '报废车'
}
export const usageTypeMap = {
  1: '非营运',
  2: '营运',
  3: '营转非'
}

export const ownerTypeMap = {
  1: '个人',
  2: '单位'
}

export const sunroofMap = {
  1: '无天窗',
  2: '普通天窗',
  3: '全景天窗'
}

export const emissionStandardMap = {
  3: '国3',
  4: '国4',
  5: '国5',
  6: '国6'
}
export const buyNewCarMap = {
  1: '是',
  0: '否'
}
export const hasAccidentMap = {
  1: '是',
  0: '否'
}
export const overallRatingMap = {
  1: '优',
  2: '良',
  3: '中',
  4: '差'
}
