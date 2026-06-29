import dayjs from "dayjs"
const energyProFormList = [
  {
    label: '服务年限',
    value: 'servicePeriod',
    type: 'input',
    readonly: true,
    suffix: '年',
  },
  {
    label: '车辆登记日期',
    value: 'vehicleRegistrationDate',
    type: 'single-calendar',
    endDate: dayjs().format('YYYY-MM-DD')
  },
  {
    label: '车型排量',
    value: 'vehicleDisplacement',
    type: 'input',
    suffix: 'L',
    inputType: 'digit',
    inputLimit: {
      type: 'digit',
      minVal: 0,
      maxVal: 100
    },
  },
  {
    label: '原厂质保',
    value: 'warranty',
    cellHtml: 'warranty'
  },
  {
    label: '合同购买时里程数',
    value: 'mileage',
    type: 'input',
    suffix: 'KM',
    inputType: 'digit',
    inputLimit: {
      type: 'digit',
      minVal: 0
    },
  }
]

// 权益表单
const equityProFormList = [
  {
    label: '服务年限',
    value: 'servicePeriod',
    type: 'input',
    readonly: true,
    suffix: '年',
  },
  {
    label: '无忧保障服务费',
    value: 'actualSalesPrice',
    placeholder: '非必填',
    type: 'input',
    inputType: 'digit',
    inputLimit: {
      type: 'digit',
      maxVal: 100000,
      minVal: 0
    },
    maxlength: '9',
  },
  {
    label: '无忧卡卡号',
    value: 'card',
    type: 'input',
    maxlength: '6',
    noBorder: true,
    noCellHeight: true,
    isJudgeShow: true,
    isShowObj: {
      attr: 'entityCardFlag',
      list: ['Y']
    }
  }
]

// 延保配置服务项目
const extendServiceFormList = [
  {
    label: '服务年限',
    value: 'servicePeriod',
    type: 'input',
    readonly: true,
    suffix: '年',
    cellStyle: 'height: var(--fontSize90);'
  },
  {
    value: 'displacementPower',
    rowHtml: 'displacementPower',
    hidden: true
  },
  {
    label: '购车发票日期',
    value: 'buyDate',
    type: 'single-calendar',
    endDate: dayjs().format('YYYY-MM-DD')
  },
  {
    label: '原厂质保开始日期',
    value: 'qualityBeginDate',
    type: 'single-calendar',
  },
  {
    label: '原厂质保年限',
    value: 'warrantyPeriod',
    type: 'input',
  },
  {
    label: '原厂质保公里（万公里）',
    value: 'warrantyKm',
    type: 'input',
  },
  {
    label: '合同购买时的公里数',
    value: 'mileage',
    type: 'input',
  }
]


// 燃油车4大件
const oilProFormList = [
  {
    label: '服务年限',
    value: 'servicePeriod',
    type: 'input',
    readonly: true,
    suffix: '年',
  },
  {
    label: '车辆登记日期',
    value: 'vehicleRegistrationDate',
    type: 'single-calendar',
    endDate: dayjs().format('YYYY-MM-DD')
  },
  {
    label: '车辆使用性质',
    value: 'vehicleNatureName',
    type: 'select',
    key: 'vehicleNature'

  },
  {
    label: '变速箱类型',
    value: 'gearbox',
    type: 'select',
    key: 'gearbox'
  },
  {
    label: '车型排量',
    value: 'vehicleDisplacement',
    type: 'input',
    suffix: 'L',
    inputLimit: {
      type: 'digit',
      minVal: 0,
      maxVal: 100
    },
  },
  {
    label: '原厂质保',
    value: 'warranty',
  },
  {
    label: '合同购买时里程数',
    value: 'mileage',
    type: 'input',
    suffix: 'KM',
    inputLimit: {
      type: 'digit',
      minVal: 0
    },
  }
]

const displacementPowerSwitch = [
  {
    label: '排量',
    value: 0
  },
  {
    label: '功率',
    value: 1
  }
]

const TIRE_FORM_LIST = [
  {
    label: '轮胎品牌',
    value: 'tireBrand',
    maxlength: '20',
    type: 'input',
  },
  {
    label: '轮胎规格',
    value: 'tireScale',
    maxlength: '20',
    type: 'input',
    labelTips: '位置示例',
    tipsUrl: 'https://img02.glsx.com.cn/weapp/resource/app-zyzs/equity/tire-tips-1.webp'
  },
  {
    hidden: true,
    rowHtml: 'tireHtml'
  }
]

const TIRE_LIST = [
  {
    name: '左前胎',
    tipsUrl: 'https://img02.glsx.com.cn/weapp/resource/app-zyzs/equity/tire-tips-2.webp',
    list: [
      {
        label: '轮胎DOT号',
        value: 'leftFrontDTO',
        type: 'input',
        maxlength: '20',
      },
      {
        label: '轮胎生产批次',
        value: 'leftFrontBatch',
        type: 'input',
        maxlength: '20',
      }
    ]
  },
  {
    name: '右前胎',
    list: [
      {
        label: '轮胎DOT号',
        value: 'rightFrontDTO',
        type: 'input',
        maxlength: '20',
      },
      {
        label: '轮胎生产批次',
        value: 'rightFrontBatch',
        type: 'input',
        maxlength: '20',
      }
    ]
  },
  {
    name: '左后胎',
    list: [
      {
        label: '轮胎DOT号',
        value: 'leftRearDTO',
        type: 'input',
        maxlength: '20',
      },
      {
        label: '轮胎生产批次',
        value: 'leftRearBatch',
        type: 'input',
        maxlength: '20',
      }
    ]
  },
  {
    name: '右后胎',
    list: [
      {
        label: '轮胎DOT号',
        value: 'rightRearDTO',
        type: 'input',
        maxlength: '20',
      },
      {
        label: '轮胎生产批次',
        value: 'rightRearBatch',
        type: 'input',
        maxlength: '20',
      }
    ]
  }
]
export {
  energyProFormList,
  equityProFormList,
  extendServiceFormList,
  oilProFormList,
  displacementPowerSwitch,
  TIRE_FORM_LIST,
  TIRE_LIST
}
