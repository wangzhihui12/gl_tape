<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-28 18:19:19
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-09-06 14:42:32
 * @FilePath: \gl-tape\pages\common\webview.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <web-view :src="url"></web-view>
</template>

<script type="text/ecmascript-6">
import report from "@/mixin/report.js";
export default {
  name: '',
  mixins:[report],
  data () {
    return {
      url: '',
      viewerUrl: '/hybrid/html/web/viewer.html',
    }
  },
  onLoad (options) {
    if(options.fileUrl) this.url = `${this.viewerUrl}?file=${options.fileUrl}`
    else this.url = options.url
    if (options.title) uni.setNavigationBarTitle({
      title: options.title
    })
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang="scss"></style>
