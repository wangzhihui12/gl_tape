<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-10 14:54:29
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-15 20:51:52
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\Promotion.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="job-container" @click="handleTouch">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title"><text>晋升介绍</text></view>
    </view>
    <view class="job-box">
      <view class="job-header">
        <view class="job-tab flex-center">
          <view class="tab-item flex" v-for="(item, index) in tabList" :key="index" :class="{ active: item.value === activeIndex }" @click="changeTab(item.value)">
            <text>{{ item.label }}</text>
            <view class="sprite-icon icon-two-arrow" v-if="index < tabList.length - 1"></view>
            <view class="level-top" v-if="transfer.jobType == item.value">
              <view class="sprite-icon icon-my-level"></view>
            </view>
          </view>
        </view>
      </view>
      <view class="job-content">
        <view class="job-item" v-for="(item, index) in jobList" :key="index">
          <view class="item-title flex">
            <view class="sprite-icon icon-promotion"></view>
            <text>{{ item.title }}</text>
          </view>
          <view class="item-content" v-html="jobDetail[item.value]" v-if="jobDetail[item.value]"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import point from '@/mixin/point'
import firstTime from '@/mixin/firstTime'
export default {
  mixins: [point, firstTime],
  props: {
    transfer: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      jobDetail: {},
      activeIndex: '',
      //1-实习生(实践) ，2-初级驻店，3-中级驻店，4-高级驻店，10-见习驻店
      tabList: [
        {
          label: '实习生',
          value: 1
        },
        {
          label: '见习驻店',
          value: 10
        },
        {
          label: '初级驻店',
          value: 2
        },
        {
          label: '中级驻店',
          value: 3
        },
        {
          label: '高级驻店',
          value: 4
        }
      ],
      jobList: [
        {
          title: '职级介绍',
          value: 'rankIntroduction'
        },
        {
          title: '晋升介绍',
          value: 'promotionIntroduction'
        },
        {
          title: '降级介绍',
          value: 'downgradeIntroduction'
        }
      ]
    }
  },
  methods: {
    getDetail() {
      this.activeIndex = this.transfer.jobType
      this.getJobConfig()
    },
    changeTab(index) {
      this.activeIndex = index
      this.getJobConfig(index)
    },
    getJobConfig() {
      uni.showLoading({
        mask: true
      })
      uni.$api.pointApi.getJobConfig({ jobType: this.activeIndex }).then(res => {
        this.jobDetail = res || {}
        console.log(this.jobDetail, 'jobDetail')
        uni.hideLoading()
      })
    }
  }
}
</script>

<style scoped lang="scss">
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
.job-box {
  width: calc(100vw - 128rpx);
  margin: 30rpx auto 0;
  box-sizing: border-box;
  background: rgba($color: #fff, $alpha: 0.35);
  border-radius: 48rpx 48rpx 0 0;
  .job-header {
    height: 128rpx;
    .job-tab {
      height: 100%;
    }
  }
  .job-tab {
    .tab-item {
      width: 15%;
      justify-content: space-between;
      padding-left: 4%;
      position: relative;
      .level-top {
        position: absolute;
        top: -50rpx;
        left: 40rpx;
      }
      &.active {
        color: #2c66f7;
        font-weight: 600;
      }
    }
  }
  .job-content {
    padding: 34rpx;
    border-radius: 48rpx;
    background: #fff;
    height: calc(100vh - 350rpx);
    overflow-y: auto;
    .job-item {
      .item-title {
        font-size: 32rpx;
        color: #2c66f7;
        line-height: 48rpx;
        height: 70rpx;
        text {
          margin-top: -4rpx;
        }
      }
      .item-content {
        padding-left: 64rpx;
      }
    }
  }
}
</style>
