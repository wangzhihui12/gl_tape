/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-07 17:09:53
 * @LastEditors: limin
 * @LastEditTime: 2025-01-07 16:10:32
 * @FilePath: \gl_tape\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import App from './App'
// import config from '@/config.js'
import store from '@/store'
import GlsxImage from './components/GlsxImage'
import MessageBox from './components/MessageBox/index'
import wnCanvas from './components/Canvas/wn-canvas'
import UpdateBox from './components/UpdateBox'
import webView from './components/WebView'
import uView from 'uview-ui'
import PageComponent from './components/PageComponent'
Vue.use(uView)
Vue.use(webView)
Vue.component('GlsxImage', GlsxImage)
Vue.component('MessageBox', MessageBox)
Vue.component('wnCanvas', wnCanvas)
Vue.component('UpdateBox', UpdateBox)
Vue.component('PageComponent', PageComponent)
Vue.config.productionTip = false
App.mpType = 'app'
// Vue.prototype.$ossDomain = config.OSS_DOMAIN
// import permision from '@/js_sdk/wa-permission/permission.js'
// Vue.prototype.$permision = permision
import './init'
new Vue({
  store,
  ...App
}).$mount()
