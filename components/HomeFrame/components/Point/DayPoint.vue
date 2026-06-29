<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-20 10:32:31
-->
<template>
  <view class="point-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">
        <text>{{ pageName }}</text>
      </view>
    </view>
    <view class="finish-title">
      已完成
      <text>{{ completed }}/{{ dayList.length }}</text>
    </view>
    <view class="day-list">
      <view class="day-item" v-for="(i, index) in dayList" :key="index">
        <view class="day-logo"><image :src="i.logo"></image></view>
        <view class="day-desc">
          <view class="day-title">{{ i.typeName }}</view>
          <view class="day-content">{{ i.content }}</view>
        </view>
        <uni-icons type="checkmarkempty" v-if="i.completed" size="20"></uni-icons>
        <view class="day-go" @click="handleGo(i)" v-else>去完成</view>
      </view>
    </view>
    <view class="dailog-panel" v-if="show">
      <view class="dailog-box">
        <view class="dailog-close" @click="show = false"><uni-icons type="closeempty" size="20"></uni-icons></view>
        <view class="dailog-logo"><image :src="selectItem.logo"></image></view>
        <view class="dailog-title">{{ selectItem.typeName }}</view>
        <view class="dailog-content">{{ selectItem.rules }}</view>

        <view class="dailog-footer">
          <template v-if="selectItem.jump">
            <view class="dailog-btn disabled" @click="show = false">关闭</view>
            <view class="dailog-btn" @click="$emit('jump', selectItem.jumpUrl)">跳转（{{ second }}s）</view>
          </template>
          <view class="dailog-btn" v-else @click="show = false">好的</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '每日积分',
      eventCode: 'app_point_day',
      second: 3,
      timer: null,
      selectItem: {},
      list: [
        { title: '考勤打卡', typeCode: 'T006', content: '完成日常打卡', rules: '请打开嘀加智慧云企业微信进行上下班打卡', logo: require('@/assets/images/point/day-time.webp') },
        { title: '日报填写', typeCode: 'T005', content: '完成日报填写', rules: '请打开嘀加智慧云企业微信生意助手员工版填写日报', logo: require('@/assets/images/point/day-report.webp') },
        { title: '平板接待', typeCode: 'T007', content: '完成平板接待', rules: '即将跳转至展业助手开始接待', logo: require('@/assets/images/point/day-ipad.webp'), jump: true },
        { title: '飞行督导带教', typeCode: 'T001', content: '带教课程学习', rules: '请联系督导、运营了解最近培训计划并参与培训', logo: require('@/assets/images/point/day-training.webp') },
        { title: '总部集中培训', typeCode: 'T002', content: '总部集中培训', rules: '请联系督导、运营了解最近培训计划并参与培训', logo: require('@/assets/images/point/day-train.webp') },
        { title: '学习类', typeCode: 'T004', content: '完成学习课程', rules: '请联系督导、运营了解最近培训计划并参与培训', logo: require('@/assets/images/point/day-course.webp') },
        { title: '预学习', typeCode: 'T003', content: '完成预学习', rules: '即将跳转至客户档案通过录入预交车客户学习推荐套餐方案话术或客户案例广场学习更多套餐方案话术（如门店未开通客户档案则无法访问，请联系运营部门开通）', logo: require('@/assets/images/point/day-study.webp'), jump: true, jumpUrl: 'CustomerFile' },
        { title: '行为异常', typeCode: 'T008', content: '完成预学习', rules: '即将跳转至客户档案通过录入预交车客户学习推荐套餐方案话术或客户案例广场学习更多套餐方案话术', logo: require('@/assets/images/point/day-study.webp') }
      ],
      dayList: [],
      completed: 0,
      show: false
    }
  },
  watch: {
    show(val) {
      console.log(this.$store.state.user.haveCustomerAccess, 'this.$store.state.user.haveCustomerAccess')
      if (!val) {
        clearInterval(this.timer)
        this.second = 3
      }
    }
  },
  mounted() {},
  methods: {
    getDetail(countDate, day) {
      uni.$api.pointApi.pointDayTask({ countDate: `${countDate}-${day}` }).then(res => {
        res.forEach(item => {
          const index = this.list.findIndex(i => i.typeCode === item.typeCode)
          item.logo = this.list[index].logo
          item.jump = this.list[index].jump
          item.jumpUrl = this.list[index].jumpUrl
          item.content = this.list[index].content
          item.rules = this.list[index].rules
        })
        this.dayList = res
        if (!this.$store.state.user.haveCustomerAccess) {
          this.dayList.forEach(i => {
            if (i.jumpUrl) {
              i.jump = false
            }
          })
        }
        this.completed = res.filter(i => i.completed).length
      })
    },
    handleGo(val) {
      console.log(val)
      this.selectItem = val
      if (val.jump) {
        this.timer = setInterval(() => {
          this.second--
          if (this.second == 1) {
            clearInterval(this.timer)
            this.$emit('jump', val.jumpUrl)
          }
        }, 1000)
      }
      this.show = true
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>
<style scoped lang="scss">
.point-box {
  position: relative;
}
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    width: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    background-image: linear-gradient(179deg, #d6e9ff 12%, #ffffff 100%); /* 顶部渐变和底部白色 */
    background-size:
      100% 110rpx,
      100% calc(100% - 110rpx); /* 分别设置渐变和白色的背景大小 */
    background-repeat: no-repeat, no-repeat; /* 确保背景不重复 */
    background-position: top, bottom; /* 分别设置渐变和白色的位置 */
    border-radius: 48rpx;
    .dailog-close {
      text-align: right;
      margin-right: 48rpx;
      margin-top: 48rpx;
      .uni-icons {
        color: #808291 !important;
        font-size: 40rpx;
      }
    }
    .dailog-logo {
      text-align: center;
      image {
        width: 228rpx;
        height: 228rpx;
      }
    }
    .dailog-title {
      font-size: 40rpx;
      color: #1a1a1a;
      text-align: center;
      margin-top: 40rpx;
    }
    .dailog-content {
      font-size: 32rpx;
      color: #808291;
      text-align: center;
      line-height: 46rpx;
      margin-top: 16rpx;
      padding: 0 64rpx;
    }
    .dailog-footer {
      display: flex;
      justify-content: center;
      margin: 80rpx 0 70rpx;
    }
    .dailog-btn {
      width: 400rpx;
      height: 96rpx;
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 32rpx 0 #ffffff80;
      border-radius: 16rpx;
      text-align: center;
      font-size: 36rpx;
      color: #ffffff;
      line-height: 96rpx;
      &.disabled {
        background-color: #f0f1f5;
        background-image: none;
        color: #1a1a1a;
        margin-right: 48rpx;
      }
    }
  }
}
.nav-bar {
  width: 100%;
  height: 96rpx;
  margin-top: 48rpx;
  display: flex;
  align-items: center;
  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }
  .title {
    font-weight: 700;
    font-size: 32rpx;
    color: #1a1a1a;
    flex: 1;
    text-align: center;
    text {
      margin-left: -96rpx;
    }
  }
}
.finish-title {
  font-size: 36rpx;
  color: #1a1a1a;
  margin-left: 160rpx;
  font-weight: 700;
  text {
    font-size: 64rpx;
    color: #4673ff;
    margin-left: 24rpx;
  }
}
.day-list {
  margin-top: 40rpx;
  padding: 0rpx 128rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48rpx;
  .day-item {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx 40rpx;
    display: flex;
    align-items: center;
    .day-logo {
      image {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;
      }
    }
    .day-desc {
      .day-title {
        font-size: 32rpx;
        color: #292d33;
        line-height: 48rpx;
      }
      .day-content {
        font-size: 26rpx;
        color: #808291;
        width: 282rpx;
        line-height: 48rpx;
      }
    }
    .uni-icons {
      margin-left: auto;
      color: #14cc68 !important;
      font-size: 30rpx;
      font-weight: 700;
    }
    .day-go {
      width: 148rpx;
      height: 64rpx;
      background: #f0f1f5;
      border-radius: 32rpx;
      text-align: center;
      font-size: 28rpx;
      color: #4673ff;
      line-height: 64rpx;
      margin-left: auto;
    }
  }
}
</style>
