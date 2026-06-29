/**
 * popupType
 * 0:销售顾问/录单员
 * 1：交付专员
 * 2：二级流量方
 * 3：转化人员
 * 4：车品牌
 * 5: 礼券
 * 6：前档
 * 7：前侧窗玻璃
 * 8：后侧窗玻璃
 * 9：后档
 * 10：天窗
 * 11：套餐
 * 12：其他精品
 * 13：时间选择
 * 14: 代保管人员
 * 15: 商品类目
 * 16: 年龄区间
 * 17：所在城市
 * 18: 座位数
 * 19: 客户档案
 * 20: 战败客户档案
 * 21: 客户类型
 * 22: 证件类型
 * 23: 购车类型
 * 24: 车辆使用性质
 * 25: 选择品牌车系
 * 26: 变速箱类型
 * 27: 权益战败推荐人员
 */

const componentConfig = {
  0: {
    name: 'EmployeeList',
    title: '销售顾问/录单员',
    placeholder: '请输入姓名',
    idKey: ['referrerId', 'userId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  1: {
    name: 'EmployeeList',
    title: '交付专员',
    placeholder: '请输入姓名',
    nullTips: '请选择交付专员',
    idKey: ['deliveryId', 'deliveryUserId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  2: {
    name: 'DiversionMerchant',
    title: '二级流量方',
    hideSearch: true,
    idKey: 'subShopMerchantId',
    cacheData: [],
    loadComplete: false
  },
  3: {
    name: 'EmployeeList',
    title: '转化人员',
    placeholder: '请输入姓名',
    idKey: 'sellerUserId',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  4: {
    name: 'CarModelList',
    title: '选择车型',
    placeholder: '查找',
    idKey: 'carSeriesId',
    nullTips: '请选择车型',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  5: {
    name: 'CouponList',
    title: '选择礼券',
    placeholder: '查找',
    idKey: 'customerCouponCode',
    nullTips: '优惠券不能为空',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  6: {
    name: 'GoodsList',
    title: '选择商品(可多选)',
    placeholder: '请输入名称',
    idKey: 'goodsId',
    nullTips: '请勾选商品',
    goodsType: [1], //前档
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  7: {
    name: 'GoodsList',
    title: '选择商品(可多选)',
    placeholder: '请输入名称',
    idKey: 'goodsId',
    nullTips: '请勾选商品',
    goodsType: [2], // 前侧窗玻璃
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  8: {
    name: 'GoodsList',
    title: '选择商品(可多选)',
    placeholder: '请输入名称',
    idKey: 'goodsId',
    nullTips: '请勾选商品',
    goodsType: [3], // 后侧窗玻璃
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  9: {
    name: 'GoodsList',
    title: '选择商品(可多选)',
    placeholder: '请输入名称',
    idKey: 'goodsId',
    nullTips: '请勾选商品',
    goodsType: [4], // 后档
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  10: {
    name: 'GoodsList',
    title: '选择商品(可多选)',
    placeholder: '请输入名称',
    idKey: 'goodsId',
    nullTips: '请勾选商品',
    goodsType: [5, 6, 7], // 天窗
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  11: {
    name: 'PackageList',
    title: '选择套餐',
    placeholder: '查找',
    nullTips: '请勾选套餐',
    idKey: 'packageCode',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  12: {
    name: 'SkuGoodsList',
    title: '选择商品',
    nullTips: '请勾选商品',
    placeholder: '查找',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  13: {
    name: 'DateTime',
    title: '选择时间',
    hideSearch: true,
    loadComplete: false
  },
  14: {
    name: 'AgreementList',
    title: '代保管人员',
    placeholder: '请输入姓名',
    idKey: 'id',
    cacheData: [],
    loadComplete: false,
    hideSearch: true,
    noData: false
  },
  15: {
    name: 'GoodsCategory',
    title: '选择商品类目',

    hideSearch: true,
    loadComplete: false
  },
  16: {
    name: 'AgeRange',
    title: '年龄区间',
    nullTips: '请选择年龄区间',
    idKey: 'ageRange',
    hideSearch: true,
    loadComplete: false
  },
  17: {
    name: 'City',
    title: '所在城市',
    hideSearch: true,
    loadComplete: false,
    nullTips: '请选择所在城市',
    cacheData: [],
    noData: false,
    idKeys: ['provinceText', 'cityText']
  },
  18: {
    name: 'Seat',
    title: '座位数',
    nullTips: '请选择座位数',
    idKey: 'seat',
    hideSearch: true,
    loadComplete: false
  },
  19: {
    name: 'Customer',
    title: '客户档案',
    loadComplete: false,
    placeholder: '查找',
    nullTips: '请选择客户',
    idKey: 'customerId',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  20: {
    name: 'Customer',
    title: '客户档案',
    loadComplete: false,
    placeholder: '查找',
    nullTips: '请选择客户',
    idKey: 'id',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false,
    defeat: true
  },
  21: {
    name: 'Options',
    title: '客户类型',
    nullTips: '请选择客户类型',
    idKey: 'customerType',
    hideSearch: true,
    loadComplete: false,
    options: [
      {
        optionId: 1,
        optionLabel: '个人'
      },
      {
        optionId: 2,
        optionLabel: '企业'
      },
      {
        optionId: 3,
        optionLabel: '个人(港澳)'
      },
      {
        optionId: 4,
        optionLabel: '个人(台)'
      },
      {
        optionId: 5,
        optionLabel: '个人(军官)'
      }
    ]
  },
  22: {
    name: 'Options',
    title: '证件类型',
    nullTips: '请选择证件类型',
    idKey: 'cardType',
    hideSearch: true,
    loadComplete: false,
    options: [
      {
        optionId: 1,
        optionLabel: '身份证'
      },
      {
        optionId: 2,
        optionLabel: '统一社会信息代码'
      },
      {
        optionId: 3,
        optionLabel: '港澳返乡证'
      },
      {
        optionId: 4,
        optionLabel: '台胞证'
      },
      {
        optionId: 5,
        optionLabel: '军官证'
      },
      {
        optionId: 7,
        optionLabel: '护照'
      }
    ]
  },
  23: {
    name: 'Options',
    title: '购车类型',
    nullTips: '请选择购车类型',
    idKey: 'buyCarType',
    hideSearch: true,
    loadComplete: false,
    options: [
      {
        optionId: 0,
        optionLabel: '贷款车'
      },
      {
        optionId: 1,
        optionLabel: '全款车'
      }
    ]
  },
  24: {
    name: 'Options',
    title: '车辆使用性质',
    nullTips: '请选择车辆使用性质',
    idKey: 'vehicleNature',
    hideSearch: true,
    loadComplete: false,
    options: [
      {
        optionId: 0,
        optionLabel: '营运'
      },
      {
        optionId: 1,
        optionLabel: '非营运'
      }
    ]
  },
  25: {
    name: 'CarBrand',
    title: '选择品牌车系',
    placeholder: '查找',
    idKey: 'vehicleShapeId',
    nullTips: '请选择品牌车系',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false,
    hideSearch: true,
    popupStyle: 'height:90vh;'
  },
  26: {
    name: 'Gearbox',
    title: '变速箱类型',
    nullTips: '请选择变速箱类型',
    idKey: 'gearbox',
    hideSearch: true,
    loadComplete: false
  },
  27: {
    name: 'EmployeeList',
    title: '销售顾问/录单员',
    placeholder: '请输入姓名',
    idKey: ['referrerId', 'userId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false,
    defeat: true
  },
  28: {
    name: 'OrderTypePopup',
    title: '订单类型',
    hideSearch: true,
    hideFooter: false,
    // 绑定 CreateOrder 中的字段名
    idKey: 'djOrderType',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  29: {
    name: 'SceneList',
    title: '场景名称',
    hideSearch: true,
    // 选择场景后存 code 字段，用于回显选中
    idKey: 'baseSceneCodeValue',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
}
export default { componentConfig }
