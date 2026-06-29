/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-17 15:40:18
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-17 15:41:00
 * @FilePath: \gl-tape\store\modules\point.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default {
  state() {
    return {
      tabIndex: 0
    }
  },
  mutations: {
    SET_Tab(state, value) {
      state.tabIndex = value
    }
  },
  actions: {
    setTab({ commit }, value) {
      commit('SET_Tab', value)
    }
  }
}
