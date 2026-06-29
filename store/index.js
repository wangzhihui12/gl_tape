/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-07 17:09:50
 * @LastEditors: limin
 * @LastEditTime: 2024-12-27 21:11:57
 * @FilePath: \gl_tape\store\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import user from './modules/user'
import audio from './modules/audio'
import update from './modules/update'
import sys from './modules/sys'
import point from './modules/point'
import boutique from './modules/boutique'
import createActivityTracker from './plugins/activityTracker'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    audio,
    update,
    sys,
    point,
    boutique
  },
  getters,
  plugins: [
    createActivityTracker([
      // 'setCustomerInfo',
      'setReceptionTrack',
      // 'setPaymentType',
      // 'setCurrentCarInfo'
    ])
  ]
})

// Vue.prototype.$store = store;

export default store
