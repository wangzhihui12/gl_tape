import WebView from "./WebView";
export default {
  install(Vue, options) {
    // 添加 Vue 实例方法
    Vue.prototype.$webView = function (el) {
      // 创建组件构造函数
      const Constructor = Vue.extend(WebView);
      // 创建组件实例
      const instance = new Constructor();
      // 手动挂载组件到元素
      instance.$mount();
      // 插入到页面中
      el.appendChild(instance.$el);
    };
  },
};
