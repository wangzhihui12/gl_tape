/**
 * popupType
 * 0:销售顾问
 * 1：交付专员
 * 2：车品牌
 * 4: 订单
 * 5: 日历
 */

const componentConfig = {
  0: {
    name: 'EmployeeList',
    title: '选择人员',
    placeholder: '请输入姓名',
    idKey: ['userId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  1: {
    name: 'EmployeeList',
    title: '选择人员',
    placeholder: '请输入姓名',
    idKey: ['userId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  2: {
    name: 'EmployeeList',
    title: '多选',
    multiple: true,
    placeholder: '请输入姓名',
    nullTips: '请选择交付专员',
    idKey: ['userId'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  },
  3: {
    name: 'CarModelList',
    title: '选择车型',
    placeholder: '查找',
    idKey: 'vehicleShapeId',
    nullTips: '请选择车型',
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false,
  },
  4: {
    name: 'OrderList',
    title: '选择订单',
    placeholder: '请输入订单号',
    idKey: ['orderCode'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false,
    hideSearch: true
  },
  5:{
    name: 'DateTime',
    title: '选择日期时间',
    placeholder: '选择日期时间',
    idKey: ['date'],
    cacheData: [],
    loadComplete: false,
    searchValue: '',
    noData: false
  }

}
export default { componentConfig }
