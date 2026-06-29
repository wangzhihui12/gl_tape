<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-28 18:19:19
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-09-06 14:42:32
 * @FilePath: \gl-tape\pages\common\webview.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <web-view ref="webview" :src="url"></web-view>
</template>

<script type="text/ecmascript-6">
import systemTrack from '../../mixin/systemTrack';
export default {
  name: '',
  data () {
    return {
      url: '',
      viewerUrl: '/hybrid/html/web/viewer.html',
    }
  },
  mixins: [systemTrack],
  onLoad (options) {
    console.log(options,'options')
    if(options.fileUrl) this.url = `${this.viewerUrl}?file=${options.fileUrl}`
    else this.url = options.url
    if (options.title) {
      this.url = `${this.url}&title=${options.title}`
    }
  },
  mounted () {
  },
  methods: {
    onBackPress(options) {
      if (options.from === 'backbutton') {
        // 阻止默认返回
        this.back()
        return true
      }
      return false
    },
    back () {
      uni.navigateBack()
      uni.$emit('pageBack')
    },
  }
}
</script>

<style scoped lang="scss"></style>
