<!--
 * @Author: yangming@didihu.com.cn yangming@didihu.com.cn
 * @Date: 2025-05-01 10:52:25
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-06 15:14:30
 * @FilePath: \gl-tape\components\HomeFrame\components\Attendance\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="attendance-container">
    <Calendar></Calendar>
  </view>
</template>
<script type="text/ecmascript-6">
import Calendar from './Calendar.vue'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [pointTrack],
  data() {
    return {
      pageName: '我的考勤',
      eventCode: 'app_work_home',
    }
  },
  components: {Calendar}
}
</script>
<style scoped lang="scss">
.attendance-container {
}
</style>
