const title = {
  attendance: '申诉考勤',
  record: '申诉平板'
}

const formItem = {
  attendance: [
    {
      label: '本月实际出勤天数',
      value: 'actualAttendanceDays',
      unit: '天',
    },
    {
      label: '申诉修改实际出勤天数',
      value: 'applyActualAttendanceDays',
      unit: '天',
      maxlength: 5
    }
  ],
  record: [
    {
      label: '平板录音完成总数',
      value: 'padRecordNum',
      unit: '条'
    },
    {
      label: '申诉修改平板录音总数',
      value: 'applyPadRecordNum',
      unit: '条',
      maxlength: 3
    }
  ]
}
const BOUTIQUE_ORDER_COUNT_FIELDS = [
  {
    label: '窗膜',
    prop: 'windowFilmDealCount'
  },
  {
    label: '车衣',
    prop: 'carCoverDealCount'
  },
  {
    label: '精品',
    prop: 'boutiqueAccessoryDealCount'
  }
]

// 权益订单数统计字段
const EQUITY_ORDER_COUNT_FIELDS = [
  {
    label: '整车延保',
    prop: 'wholeCarWarrantyDealCount'
  },
  {
    label: '轮胎险',
    prop: 'tireInsuranceAchieveCount'
  },
  {
    label: '安心包max',
    prop: 'safePackageMaxAchieveCount'
  },
  {
    label: '安心包Lite',
    prop: 'safePackageLiteAchieveCount'
  },
  {
    label: '安心包',
    prop: 'safePackageAchieveCount'
  },
  {
    label: '电池延保',
    prop: 'batteryWarrantyDealCount'
  },
  {
    label: '北汽无忧成交',
    prop: 'baicWorryFreeDealCount'
  },
  {
    label: '广爱无忧成交',
    prop: 'guangAiWorryFreeDealCount'
  },
  {
    label: '广联权益',
    prop: 'guangLianBenefitDealCount'
  }
]
export {
  title,
  formItem,
  BOUTIQUE_ORDER_COUNT_FIELDS,
  EQUITY_ORDER_COUNT_FIELDS
}