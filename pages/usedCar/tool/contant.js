const FORM_LIST = [
  [
    {
      label: '销售顾问',
      value: 'employeeName',
      type: 'select',
      // key: 'staffName',
      required: true,
      showText: 'shopMerchantName'
    },
    {
      label: '交付专员',
      value: 'deliveryEmployeeName',
      type: 'select',
      required: true,
      // key: 'staffName',
      hidden: true,
      showText: 'shopMerchantName'
    },
    {
      label: '二级流量方',
      value: 'subShopMerchantName',
      type: 'select',
      required: true,
      // key: 'subMerchantName',
      hidden: true
    },
    {
      label: '转化人员',
      value: 'sellerName',
      type: 'select',
      // key: 'staffName',
      required: true,
      showText: 'merchantName'
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
      label: '客户来源',
      value: 'salesType',
      type: 'radio',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '售前'
        },
        {
          value: '1',
          name: '售后'
        }
      ],
      required: true
    },
    {
      label: '性别',
      value: 'customerSex',
      type: 'radio',
      current: '1',
      radioList: [
        {
          value: '1',
          name: '男'
        },
        {
          value: '2',
          name: '女'
        }
      ]
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
      label: '选择车型',
      value: 'carBrand',
      type: 'select',
      key: 'carInfo'
    },
    {
      label: '车架号（VIN）',
      value: 'standNo',
      maxlength: '17',
      type: 'input'
    },
    {
      label: '车牌号',
      value: 'plateNumber',
      maxlength: '8',
      type: 'input'
    },
    {
      label: '是否体验',
      value: 'experienceFlag',
      type: 'radio',
      current: 'Y',
      radioList: [
        {
          value: 'Y',
          name: '是'
        },
        {
          value: 'N',
          name: '否'
        }
      ]
    }
  ],
  [
    {
      label: '精品礼券',
      value: 'couponInfo',
      type: 'select',
      key: 'name',
      required: true
    },
    {
      label: '请选择产品',
      onlyLabel: true,
      required: true,
      noBorder: true
    },
    {
      label: '前挡',
      value: 'frontGear',
      type: 'select',
      key: 'name',
      labellIcon: 'front-gear',
      addHtml: 'frontGear',
      hidden: true
    },
    {
      label: '前侧窗玻璃',
      value: 'frontWindow',
      type: 'select',
      key: 'name',
      labellIcon: 'front-window',
      addHtml: 'frontWindow',
      hidden: true
    },
    {
      label: '后侧窗玻璃',
      value: 'rearGear',
      type: 'select',
      key: 'name',
      labellIcon: 'rear-gear',
      addHtml: 'rearGear',
      hidden: true
    },
    {
      label: '后档',
      value: 'rearWindow',
      type: 'select',
      key: 'name',
      labellIcon: 'rear-window',
      addHtml: 'rearWindow',
      hidden: true
    },
    {
      label: '天窗',
      value: 'sunRoof',
      type: 'select',
      key: 'name',
      labellIcon: 'sun-roof',
      addHtml: 'sunRoof',
      hidden: true
    },
    {
      label: '套餐',
      value: 'package',
      type: 'select',
      key: 'name',
      addHtml: 'package'
    },
    {
      label: '其他精品',
      value: 'skuGoods',
      type: 'select',
      key: 'name',
      addHtml: 'skuGoods'
    },
    {
      label: '收款方式',
      value: 'payeeType',
      type: 'radio',
      key: 'name',
      current: '1',
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
      value: 'selectPayType',
      type: 'radio',
      key: 'name',
      current: '0',
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
    }
  ],
  [
    {
      label: '备注',
      value: 'remark',
      maxlength: '100',
      type: 'textarea',
      placeholder: '请输入 (100字以内)',
      class: 'cell-break'
    }
  ]
]

const DEFEAT_FORM_LIST = [
  [
    {
      label: '战败日期',
      value: 'todayShow',
      type: 'select',
      // key: 'staffName',
      required: true
    },
    {
      label: '销售顾问/录单员',
      value: 'employeeName',
      type: 'select',
      // key: 'staffName',
      required: true,
      showText: 'shopMerchantName'
    },
    {
      label: '交付专员',
      value: 'deliveryEmployeeName',
      type: 'select',
      required: true,
      // key: 'staffName',
      hidden: true,
      showText: 'shopMerchantName'
    },
    {
      label: '二级流量方',
      value: 'subShopMerchantName',
      type: 'select',
      required: true,
      // key: 'subMerchantName',
      hidden: true
    },
    {
      label: '转化人员',
      value: 'sellerName',
      type: 'select',
      // key: 'staffName',
      required: true,
      showText: 'merchantName'
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
      label: '客户来源',
      value: 'salesType',
      type: 'radio',
      current: '0',
      radioList: [
        {
          value: '0',
          name: '售前'
        },
        {
          value: '1',
          name: '售后'
        }
      ],
      required: true,
      hidden: true
    },
    {
      label: '性别',
      value: 'customerSex',
      type: 'radio',
      current: '1',
      radioList: [
        {
          value: '1',
          name: '男'
        },
        {
          value: '2',
          name: '女'
        }
      ]
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
      label: '选择车型',
      value: 'carBrand',
      type: 'select',
      key: 'carInfo'
    },
    {
      label: '车架号（VIN）',
      value: 'standNo',
      maxlength: '17',
      type: 'input'
    },
    {
      label: '车牌号',
      value: 'plateNumber',
      maxlength: '8',
      type: 'input'
    },
    {
      label: '是否体验',
      value: 'experienceFlag',
      type: 'radio',
      current: 'Y',
      required: true,
      radioList: [
        {
          value: 'Y',
          name: '是'
        },
        {
          value: 'N',
          name: '否'
        }
      ]
    }
  ],
  [
    {
      label: '精品礼券',
      value: 'couponInfo',
      type: 'select',
      key: 'name',
      required: true,
      hidden: true
    },
    {
      label: '请选择产品',
      onlyLabel: true,
      required: true,
      noBorder: true
    },
    {
      label: '前挡',
      value: 'frontGear',
      type: 'select',
      key: 'name',
      labellIcon: 'front-gear',
      addHtml: 'frontGear',
      hidden: true
    },
    {
      label: '前侧窗玻璃',
      value: 'frontWindow',
      type: 'select',
      key: 'name',
      labellIcon: 'front-window',
      addHtml: 'frontWindow',
      hidden: true
    },
    {
      label: '后侧窗玻璃',
      value: 'rearGear',
      type: 'select',
      key: 'name',
      labellIcon: 'rear-gear',
      addHtml: 'rearGear',
      hidden: true
    },
    {
      label: '后档',
      value: 'rearWindow',
      type: 'select',
      key: 'name',
      labellIcon: 'rear-window',
      addHtml: 'rearWindow',
      hidden: true
    },
    {
      label: '天窗',
      value: 'sunRoof',
      type: 'select',
      key: 'name',
      labellIcon: 'sun-roof',
      addHtml: 'sunRoof',
      hidden: true
    },
    {
      label: '套餐',
      value: 'package',
      type: 'select',
      key: 'name',
      addHtml: 'package',
      hidden: true
    },
    {
      label: '其他精品',
      value: 'skuGoods',
      type: 'select',
      key: 'name',
      addHtml: 'skuGoods',
      hidden: true
    },
    {
      label: '收款方式',
      value: 'payeeType',
      type: 'radio',
      key: 'name',
      current: '1',
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
      ],
      hidden: true
    },
    {
      label: '支付方式',
      value: 'selectPayType',
      type: 'radio',
      key: 'name',
      current: '0',
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
      addHtml: 'otherPay',
      hidden: true
    }
  ],
  [
    {
      label: '车主拒升理由',
      value: 'refusalReason',
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
    targetIdKey: 'userId',
    targetNameKey: 'employeeName',
    sourceIdKey: 'uuid',
    sourceNameKey: 'staffName'
  },
  1: {
    key: 'deliveryEmployeeName',
    list: 'employeeList',
    targetIdKey: 'deliveryUserId',
    targetNameKey: 'deliveryEmployeeName',
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
  }
}

export { FORM_LIST, popupTypeEnum, payTypeList, DEFEAT_FORM_LIST }
