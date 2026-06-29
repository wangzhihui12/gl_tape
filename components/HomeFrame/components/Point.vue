<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-12-31 16:53:31
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-17 21:26:09
 * @FilePath: \gl-tape\components\HomeFrame\components\Point.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="point-container">
    <view class="tab-box">
      <view @click="selectTab(index)" :class="{ 'tab-item': true, active: activeIndex == index }" v-for="(i, index) in tabList" :key="index">{{ i.name }}</view>
    </view>
    <component :is="tabName" ref="centerRef" @selectTab="selectTab"></component>
  </view>
</template>

<script type="text/ecmascript-6">
import Point from './Point/index.vue'
import Income from './Income/index.vue'
import Attendance from './Attendance/index.vue'
import { mapState } from 'vuex'
export default {
  name: '',
  components: {
    Point,
    Income,
    Attendance
  },
  data () {
    return {
      activeIndex: 0,
      componentList:['Attendance','Income'],
      tabName: 'Attendance',
      tabList:[
        {
          name:'我的考勤',
        },
      ]
    }
  },
  computed: {
    ...mapState(['point.tabIndex']),
  },
  watch: {
    '$store.state.point.tabIndex'(val) {
      console.log(val)
      this.activeIndex = val
      this.tabName = this.componentList[val]
    }
  },
  mounted() {
    this.$store.dispatch('setTab', 0)
  },
  methods: {
    selectTab(index){
      this.$store.dispatch('setTab', index)
    }
  },
}
</script>
<style scoped lang="scss">
.tab-box {
  margin-top: toRpx(68);
  width: toRpx(290);
  height: toRpx(84);
  line-height: toRpx(74);
  background: rgba(101, 171, 250, 0.12);
  border-radius: toRpx(20);
  display: flex;
  align-items: center;
  justify-content: center;
  .tab-item {
    font-size: toRpx(28);
    color: #1a1a1a;
    text-align: center;
    width: 50%;
    &.active {
      width: toRpx(260);
      height: toRpx(72);
      background: #ffffff;
      border-radius: toRpx(16);
      text-align: center;
      font-weight: 600;
      color: #4673ff;
    }
  }
}
</style>
