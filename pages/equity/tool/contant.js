const FORM_LIST = [
  [
    {
      label: '场景名称',
      value: 'baseSceneCode',
      type: 'select',
      key: 'baseSceneCode',
      required: true
    },
    {
      label: '销售顾问/录单员',
      value: 'referrer',
      type: 'select',
      key: 'employeeName',
      required: true
    },
    {
      label: '交付专员',
      value: 'deliveryName',
      type: 'select',
      required: true,
      key: 'deliveryEmployeeName'
    }
  ],
  [
    {
      label: '姓名',
      value: 'owner',
      maxlength: '-1',
      type: 'input',
      required: true
    },
    {
      label: '联系电话',
      value: 'phone',
      maxlength: '11',
      type: 'input',
      required: true,
      inputType: 'number'
    },
    {
      label: '客户来源',
      value: 'salesType',
      type: 'radio',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '门店引流-售前'
        },
        {
          value: '1',
          name: '门店引流-售后'
        },
        {
          value: '2',
          name: '自然到店'
        }
      ],
      required: true
    },
    {
      label: '性别',
      value: 'ownerGender',
      type: 'radio',
      current: '男',
      radioList: [
        {
          value: '男',
          name: '先生'
        },
        {
          value: '女',
          name: '女士'
        }
      ]
    },
    {
      label: '年龄区间',
      value: 'ageRange',
      type: 'select',
      key: 'ageRange'
    },
    {
      label: '所在城市',
      value: 'city',
      type: 'select',
      key: 'city'
    },
    {
      label: '证件号码',
      value: 'certificateNo',
      maxlength: '18',
      type: 'input',
      required: false
    },
    {
      label: '兴趣爱好',
      value: 'hobby',
      maxlength: '200',
      type: 'input'
    },
    {
      label: '陪伴人员',
      value: 'companion',
      maxlength: '200',
      type: 'input'
    }
  ],
  [
    {
      label: '车型',
      value: 'carBrandText',
      type: 'select',
      key: 'carBrand',
      required: false
    },
    {
      label: '车辆颜色',
      value: 'carColor',
      maxlength: '20',
      type: 'input'
    },
    {
      label: '车架号',
      value: 'carVin',
      maxlength: '17',
      type: 'input',
      required: false
    },
    {
      label: '座位数',
      value: 'seat',
      type: 'select',
      key: 'seat',
      required: true
    },
    {
      label: '车辆发票价',
      value: 'price',
      maxlength: '8',
      type: 'input',
      required: true,
      inputType: 'digit'
    }
  ],
  [
    {
      label: '订单类型',
      value: 'djOrderType',
      type: 'select',
      key: 'name',
      required: true
    },
    {
      label: '购买商品',
      value: 'skuGoods',
      type: 'select',
      key: 'skuGoods',
      addHtml: 'skuGoods',
      required: true,
      isArray: true
    }
  ],
  [
    {
      label: '收款方',
      value: 'payee',
      type: 'radio',
      key: 'name',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '嘀加收款',
          disabled: false
        },
        {
          value: '1',
          name: '4s店收款',
          disabled: false
        }
      ]
    },
    {
      label: '支付方式',
      value: 'payType',
      type: 'radio',
      key: 'name',
      current: '1',
      radioList: [
        // {
        //   value: '3',
        //   name: 'POS机'
        // },
        // {
        //   value: '6',
        //   name: '对公转账'
        // },
        // {
        //   value: '7',
        //   name: '其他收款'
        // }
      ],
      addHtml: 'otherPay'
    },
    {
      label: '嘀加收款时间',
      value: 'pay2Time',
      key: 'todayShow',
      type: 'select',
      required: true,
      hidden: false
    },
    {
      label: '备注',
      value: 'notes',
      maxlength: '30',
      type: 'textarea',
      placeholder: '请输入 (30字以内)',
      class: 'cell-break'
    }
  ]
]

const DEFEAT_FORM_LIST = [
  [
    {
      label: '场景名称',
      value: 'baseSceneCode',
      type: 'select',
      key: 'baseSceneCode',
      required: true
    },
    {
      label: '战败日期',
      value: 'todayShow',
      type: 'select',
      // key: 'staffName',
      required: true
    },
    {
      label: '推荐人员',
      value: 'defeatEmployeeName',
      type: 'select',
      key: 'defeatEmployeeName',
      required: true,
      showText: 'shopMerchantName'
    }
  ],
  [
    {
      label: '车主姓名',
      value: 'customerName',
      maxlength: '16',
      type: 'input',
      required: true
    },
    {
      label: '手机号',
      value: 'customerPhone',
      maxlength: '11',
      type: 'input',
      required: true,
      inputType: 'number'
    },
    {
      label: '客户来源',
      value: 'salesType',
      type: 'radio',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '门店引流-售前'
        },
        {
          value: '1',
          name: '门店引流-售后'
        },
        {
          value: '2',
          name: '自然到店'
        }
      ],
      required: true
    },
    {
      label: '战败理由',
      value: 'deafeatReason',
      maxlength: '30',
      type: 'textarea',
      placeholder: '请输入 (30字以内)',
      class: 'cell-break',
      required: true,
      addHtml: 'reasonList',
      noBorder: true
    }
  ]
]

const defeat_titleList = [null, { addHtml: 'customer' }]

const payTypeList = [
  {
    value: '1',
    name: '微信支付'
  },
  {
    value: '2',
    name: '门店收款'
  },
  {
    value: '3',
    name: 'POS机'
  },
  {
    value: '4',
    name: '支付宝支付'
  },
  {
    value: '5',
    name: '嘀加收款'
  },
  {
    value: '6',
    name: '对公转账'
  },
  {
    value: '7',
    name: '其他收款'
  }
]

const popupTypeEnum = {
  0: {
    key: 'employeeName',
    list: 'employeeList',
    targetIdKey: 'referrerId',
    targetNameKey: 'referrer',
    sourceIdKey: 'uuid',
    sourceNameKey: 'staffName'
  },
  1: {
    key: 'deliveryEmployeeName',
    list: 'employeeList',
    targetIdKey: 'deliveryId',
    targetNameKey: 'deliveryName',
    sourceIdKey: 'uuid',
    sourceNameKey: 'staffName'
  },
  2: {
    key: 'subShopMerchantName',
    list: 'subShopMerchantList',
    targetIdKey: 'subShopMerchantId',
    targetNameKey: 'subShopMerchantName',
    sourceIdKey: 'subMerchantId',
    sourceNameKey: 'subMerchantName'
  },
  3: {
    key: 'sellerName',
    list: '',
    targetIdKey: 'sellerUserId',
    targetNameKey: 'sellerName',
    sourceIdKey: 'uuid',
    sourceNameKey: 'staffName'
  },
  4: {
    key: 'carBrand',
    list: ''
  },
  5: {
    key: 'couponInfo',
    list: ''
  },
  6: {
    key: 'frontGear',
    list: ''
  },
  7: {
    key: 'frontWindow',
    list: ''
  },
  8: {
    key: 'rearGear',
    list: ''
  },
  9: {
    key: 'rearWindow',
    list: ''
  },
  10: {
    key: 'sunRoof',
    list: ''
  },
  11: {
    key: 'package',
    list: ''
  },
  12: {
    key: 'skuGoods',
    list: ''
  },
  13: {
    key: 'todayShow',
    list: ''
  },
  16: {
    key: 'ageRange'
  },
  17: {
    key: 'city'
  },
  18: {
    key: 'seat'
  },
  19: {
    key: 'customer'
  },
  20: {
    key: 'defeatCustomer'
  },
  27: {
    key: 'defeatEmployeeName',
    targetIdKey: 'referrerId',
    targetNameKey: 'referrer'
  },
  28: {
    // 订单类型弹窗（OrderTypePopup）
    key: 'djOrderType',
    list: ''
  },
  29: {
    // 场景名称弹窗（SceneList）
    key: 'baseSceneCode',
    list: ''
  }
}
const titleList = [null, { addHtml: 'customer' }, { name: '车辆信息' }, { name: '增值车损险' }, { name: '其他信息' }]
const UpdateOrderInfo = [
  [
    {
      label: '车主姓名',
      value: 'owner',
      maxlength: '10',
      type: 'input',
      required: true
    },
    {
      label: '手机号',
      value: 'phone',
      maxlength: '11',
      inputType: 'number',
      type: 'input',
      required: true
    },
    {
      label: '客户类型',
      value: 'salesType',
      type: 'radio',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '门店引流-售前'
        },
        {
          value: '1',
          name: '门店引流-售后'
        },
        {
          value: '2',
          name: '自然到店'
        }
      ]
    },
    {
      label: '车架号（VIN码）',
      value: 'carVin',
      maxlength: '17',
      type: 'input'
    },
    {
      label: '身份证号',
      value: 'certificateNo',
      maxlength: '18',
      type: 'input'
    },
    {
      label: '订单备注',
      value: 'notes',
      maxlength: '100',
      type: 'textarea',
      placeholder: '请输入 (100字以内)',
      class: 'cell-break'
    }
  ]
]

const EQUITY_FORM_LIST = [
  [
    {
      label: '车架号',
      value: 'vin',
      maxlength: '17',
      type: 'input'
    },
    {
      label: '车辆发票价',
      value: 'invoicePrice',
      type: 'input',
      readonly: true
    },
    {
      label: '座位数',
      value: 'seat',
      type: 'select',
      key: 'seat'
    },
    {
      label: '发动机号',
      value: 'engineNo',
      maxlength: '30',
      type: 'input'
    },
    {
      label: '车辆颜色',
      value: 'vehicleColor',
      maxlength: '5',
      type: 'input'
    },
    {
      label: '购车日期',
      value: 'billingDate',
      type: 'select',
      key: 'calendar'
    },
    {
      label: '品牌车系',
      value: 'carBrandText',
      type: 'select',
      key: 'carBrand'
    }
  ],
  [
    {
      label: '客户类型',
      value: 'customerTypeName',
      type: 'select',
      key: 'customerType'
    },
    {
      label: '姓名',
      value: 'customerName',
      maxlength: '100',
      type: 'input'
    },
    {
      label: '联系电话',
      value: 'customerPhone',
      maxlength: '11',
      type: 'input'
    },
    {
      label: '证件类型',
      value: 'cardTypeName',
      type: 'select',
      key: 'cardType'
    },
    {
      label: '证件号码',
      value: 'cardNo',
      maxlength: '18',
      type: 'input'
    },
    {
      label: '联系地址',
      value: 'customerAddress',
      maxlength: '100',
      type: 'input'
    }
  ],
  [
    {
      hidden: true,
      rowHtml: 'goodsHtml'
    },
    {
      label: '生效日期',
      value: 'effectiveDate',
      type: 'select',
      key: 'futureCalendar'
    },
    {
      hidden: true,
      rowHtml: 'tireHtml'
    },
    {
      label: '购车类型',
      value: 'buyCarTypeName',
      type: 'select',
      key: 'buyCarType'
    },
    {
      label: '第一受益人',
      value: 'compensationName',
      type: 'input'
    }
  ],
  [
    {
      hidden: true,
      rowHtml: 'uploadHtml'
    }
  ],
  [
    {
      label: '含加改装件',
      value: 'inclueType',
      type: 'radio',
      current: '1',
      radioList: [
        {
          value: '1',
          name: '是'
        },
        {
          value: '2',
          name: '否'
        }
      ]
    },
    {
      hidden: true,
      rowHtml: 'conversion'
    }
  ],
  [
    {
      label: '店面名称',
      value: 'merchantName',
      type: 'input',
      readonly: true
    },
    {
      label: '联系电话',
      value: 'merchantPhone',
      maxlength: '20',
      type: 'input'
    },
    {
      label: '联系地址',
      value: 'merchantAddress',
      maxlength: '100',
      type: 'input'
    }
  ]
]

const EQUITY_FORM_TITLE_LIST = [
  { name: '车辆信息', collapseAll: true },
  { name: '客户信息', collapseAll: true },
  { name: '产品信息', collapseAll: true },
  { name: '上传资料', collapseAll: true },
  { name: '加改装信息', collapseAll: true },
  { name: '店面信息', collapseAll: true }
]
const EQUITY_POPUP_ENUM = {
  18: {
    value: 'seat',
    key: 'seat'
  },
  21: {
    options: true,
    key: 'customerType',
    targetIdKey: 'customerType',
    targetNameKey: 'customerTypeName'
  },
  22: {
    options: true,
    key: 'cardType',
    targetIdKey: 'cardType',
    targetNameKey: 'cardTypeName'
  },
  23: {
    options: true,
    key: 'buyCarType',
    targetIdKey: 'buyCarType',
    targetNameKey: 'buyCarTypeName'
  },
  25: {
    key: 'carBrand'
  },
  28: {
    // 订单类型弹窗（OrderTypePopup）
    key: 'djOrderType',
    list: ''
  }
}

/**轮胎配置 */
const tireObjList = [
  {
    attr: 'leftFrontDTO',
    sort: 0,
    attributeGroup: 'tireDTONew',
    attributeName: 'tireDTONew'
  },
  {
    attr: 'rightFrontDTO',
    sort: 1,
    attributeGroup: 'tireDTONew',
    attributeName: 'tireDTONew'
  },
  {
    attr: 'leftRearDTO',
    sort: 2,
    attributeGroup: 'tireDTONew',
    attributeName: 'tireDTONew'
  },
  {
    attr: 'rightRearDTO',
    sort: 3,
    attributeGroup: 'tireDTONew',
    attributeName: 'tireDTONew'
  },
  {
    attr: 'leftFrontBatch',
    sort: 0,
    attributeGroup: 'tireBatchNew',
    attributeName: 'tireBatchNew'
  },
  {
    attr: 'rightFrontBatch',
    sort: 1,
    attributeGroup: 'tireBatchNew',
    attributeName: 'tireBatchNew'
  },
  {
    attr: 'leftRearBatch',
    sort: 2,
    attributeGroup: 'tireBatchNew',
    attributeName: 'tireBatchNew'
  },
  {
    attr: 'rightRearBatch',
    sort: 3,
    attributeGroup: 'tireBatchNew',
    attributeName: 'tireBatchNew'
  }
]

const EQUITY_FORM_RULE = {
  vin: [
    { required: true, message: '车架号不能为空' },
    {
      validator: (rule, value) => {
        // VIN 车架号格式校验：17位字符，支持大写 A-H/J-N/P-Z、0-9（排除 I、O、Q）
        const VALID_VIN_REG = /^[A-HJ-NPR-Z0-9]{17}$/i
        return VALID_VIN_REG.test(value) ? null : { message: '请输入 17 位有效字符（支持大写 A-H/J-N/P-Z、0-9）' }
      }
    }
  ],
  seat: [{ required: true, message: '座位数不能为空' }],
  engineNo: [
    { required: true, message: '发动机号不能为空' },
    {
      validator: (rule, value) => {
        return /^[a-zA-Z0-9]{6,16}$/.test(value) ? null : { message: '发动机号请输入6-16位数字和字母组合' }
      }
    }
  ],
  vehicleColor: [{ required: true, message: '车身颜色不能为空' }],
  billingDate: [{ required: true, message: '购车日期不能为空' }],
  vehicleBrandId: [{ required: true, message: '品牌车系不能为空' }],
  customerType: [{ required: true, message: '客户类型不能为空' }],
  customerName: [{ required: true, message: '姓名不能为空' }],
  customerPhone: [
    { required: true, message: '联系电话不能为空' },
    {
      validator: (rule, value) => {
        const phoneRex = /^[1]([3-9])[0-9]{9}$/
        return !phoneRex.test(value) ? { message: '请输入正确的手机号' } : null
      }
    }
  ],
  cardNo: [
    { required: true, message: '证件号码不能为空' },
    {
      validator: (rule, value) => {
        let reg = /[a-zA-Z0-9]{18}/.test(value)
        let tip = '证件号码请输入18位数字或字母'
        return reg ? null : { message: tip }
      },
      trigger: 'change'
    }
  ],
  customerAddress: [{ required: true, message: '联系地址不能为空' }],
  effectiveDate: [{ required: true, message: '生效日期不能为空' }],
  tireBrand: [{ required: true, message: '轮胎品牌不能为空' }],
  tireScale: [{ required: true, message: '轮胎规格不能为空' }],
  leftFrontDTO: [{ required: true, message: '左前胎DOT不能为空' }],
  leftFrontBatch: [{ required: true, message: '左前胎生产批次不能为空' }],
  rightFrontDTO: [{ required: true, message: '右前胎DOT不能为空' }],
  rightFrontBatch: [{ required: true, message: '右前胎生产批次不能为空' }],
  leftRearDTO: [{ required: true, message: '左后胎DOT不能为空' }],
  leftRearBatch: [{ required: true, message: '左后胎生产批次不能为空' }],
  rightRearDTO: [{ required: true, message: '右后胎DOT不能为空' }],
  rightRearBatch: [{ required: true, message: '右后胎生产批次不能为空' }],
  compensationName: [{ required: true, message: '第一受益人不能为空' }],
  merchantPhone: [{ required: true, message: '联系电话不能为空' }],
  merchantAddress: [{ required: true, message: '联系地址不能为空' }]
}

const energyFormRule = {
  servicePeriod: [{ required: true, message: '服务年限不能为空' }],
  vehicleRegistrationDate: [{ required: true, message: '车辆登记日期不能为空' }],
  vehicleDisplacement: [
    { required: true, message: '车型排量不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '车型排量请输入仅有两位小数的数字' }
      }
    }
  ],
  warrantyPeriod: [
    { required: true, message: '原厂质保年限不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+$/.test(value) ? null : { message: '原厂质保年限请输入整数' }
      }
    }
  ],
  warrantyKm: [
    { required: true, message: '原厂质保里程数不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '原厂质保里程数请输入仅有两位小数的数字' }
      }
    }
  ],
  mileage: [
    { required: true, message: '合同购买时里程数不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '合同购买时里程数请输入仅有两位小数的数字' }
      }
    }
  ]
}

const oilFormRule = {
  servicePeriod: [{ required: true, message: '服务年限不能为空' }],
  vehicleRegistrationDate: [{ required: true, message: '车辆登记日期不能为空' }],
  vehicleNatureName: [{ required: true, message: '车辆使用性质不能为空' }],
  gearbox: [{ required: true, message: '变速箱类型不能为空' }],
  vehicleDisplacement: [
    { required: true, message: '车型排量不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '车型排量请输入仅有两位小数的数字' }
      }
    }
  ],
  warrantyPeriod: [
    { required: true, message: '原厂质保年限不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+$/.test(value) ? null : { message: '原厂质保年限请输入整数' }
      }
    }
  ],
  warrantyKm: [
    { required: true, message: '原厂质保里程数不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '原厂质保里程数请输入仅有两位小数的数字' }
      }
    }
  ],
  mileage: [
    { required: true, message: '合同购买时里程数不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '合同购买时里程数请输入仅有两位小数的数字' }
      }
    }
  ]
}

const extendServiceFormRule = {
  servicePeriod: [{ required: true, message: '服务年限不能为空' }],
  displacementPowerValue: [
    { required: true, message: '排量或功率不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '排量或功率请输入仅有两位小数的数字' }
      }
    }
  ],
  buyDate: [{ required: true, message: '购车发票日期不能为空' }],
  qualityBeginDate: [{ required: true, message: '原厂质保开始日期不能为空' }],
  warrantyPeriod: [
    { required: true, message: '原厂质保年限不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+$/.test(value) ? null : { message: '原厂质保年限请输入整数' }
      }
    }
  ],
  warrantyKm: [
    { required: true, message: '原厂质保公里不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '原厂质保公里请输入仅有两位小数的数字' }
      }
    }
  ],
  mileage: [
    { required: true, message: '合同购买时的公里数不能为空' },
    {
      validator: (rule, value) => {
        return /^\d+(\.\d{1,2})?$/.test(value) ? null : { message: '合同购买时的公里数请输入仅有两位小数的数字' }
      }
    }
  ]
}

export { FORM_LIST, popupTypeEnum, payTypeList, DEFEAT_FORM_LIST, titleList, UpdateOrderInfo, defeat_titleList, EQUITY_FORM_LIST, EQUITY_FORM_TITLE_LIST, EQUITY_POPUP_ENUM, tireObjList, EQUITY_FORM_RULE, energyFormRule, oilFormRule, extendServiceFormRule }
