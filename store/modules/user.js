/*
 * @Description:
 * @Author: huyue
 * @Date: 2024-04-07 18:15:11
 * @LastEditors: limin
 * @LastEditTime: 2025-01-03 20:52:28
 */
// import { setToken, getToken, removeToken } from '@/utils/token';;


export default {
  state () {
    return {
      customerInfo: {
        customerName: "",
        carBrand: "",
        carModel: "",
        phoneNumber: "",
        salesUuid: "",
        staffName: "",
        newCarFare: '',
        carModelId: '',
        carBuyers: '',
        carPurchaseMethod: '',
        oneCarBrand: '',
        oneCarBrandId: ''
      },
      historyStatus: Date.now(),
      carBrands: [],
      employeeList: [],
      paymentType: [],
      haveCustomerAccess: true, //2025-7月版本 客户档案权限设置为默认为true
      boutiqueMediaConfig: {},
      receptionTrack: {}, //接待记录埋点
      boutiqueDefaultCarBrandId: '',
      viewKey: Date.now(),
      boutiqueCarList: [],
      receptionKey: Date.now(), //接待记录埋点KEY
      defaultCarId: '',
      customerKey: Date.now(), //客户信息KEY
      currentCarInfo: {},//当前选中的车品牌车系
      carBrandOpenStatus: false, // 车品牌选择弹窗是否打开
      newReport: false, // 是否新日报
    };
  },
  mutations: {
    getCustomerInfo (state) {
      return state.customerInfo;
    },
    setCustomerInfo (state, data = {}) {
      // state.customerInfo = data;
      uni.$storage.set("customerInfo", JSON.stringify(data));
      state.customerInfo = data
      state.customerKey = Date.now()
    },
    setReceptionTrack (state, { key, value }) {
      state.receptionTrack[key] = value
      state.receptionKey = Date.now()
    },
    clearReceptionTrack (state) {
      state.receptionTrack = {}
      state.receptionKey = Date.now()
    },
    updateViewKey (state) {
      state.viewKey = Date.now();
    },
    setPaymentType (state, value) {
      state.paymentType = value;
    },
    setCarBrandsList (state, value) {
      state.carBrands = value;
    },
    setEmployeeList (state, value) {
      state.employeeList = value;
    },
    setCurrentCarInfo (state, data = {}) {
      state.currentCarInfo = data;
    },
    clearCustomerInfo (state) {
      const info = {
        customerName: "",
        carBrand: "",
        carModel: "",
        phoneNumber: "",
        salesUuid: "",
        staffName: "",
        newCarFare: '',
        carModelId: '',
        carBuyers: '',
        carPurchaseMethod: '',
        oneCarBrand: '',
        oneCarBrandId: ''
      };
      uni.$storage.set("customerInfo", JSON.stringify(info));
      state.customerInfo = info
      state.customerKey = Date.now()
    },
    setCarBrandOpenStatus (state, value) {
      state.carBrandOpenStatus = value;
    },
    setNewReport (state, value) {
      state.newReport = value;
    },
    
  },
  actions: {
    // 获取用户详情
    getCustomerInfo ({ state }) {
      return state.customerInfo;
    },
    setCustomerInfo ({ commit }, value) {
      // uni.$logger.local.info(`当前接待客户信息: ${JSON.stringify(value)}`)
      commit("setCustomerInfo", value);
    },
    clearCustomerInfo ({ commit }) {
      commit("clearCustomerInfo");
    },
    clearHistory ({ state }) {
      state.historyStatus = Date.now();
    },
    setPaymentType ({ commit }, value) {
      commit('setPaymentType', value)
    },
    setCarBrandsList ({ commit }, value) {
      commit('setCarBrandsList', value)
    },
    setEmployeeList ({ commit }, value) {
      commit('setEmployeeList', value)
    },
     setReceptionTrack ({ commit }, { key, value }) {
      commit('setReceptionTrack', { key, value })
    },
   clearReceptionTrack ({ commit }) {
      commit('clearReceptionTrack')
    },
    updateViewKey ({ commit }) {
      commit('updateViewKey')
    },
    setCurrentCarInfo ({ commit }, value) {
      commit("setCurrentCarInfo", value);
    },
    setCarBrandOpenStatus ({ commit }, value) {
      commit('setCarBrandOpenStatus', value)
    },
    
    setNewReport ({ commit }, value) {
      commit('setNewReport', value)
    },
  },
};
