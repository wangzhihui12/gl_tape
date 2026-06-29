<template>
  <view class="income-container" @click="handleTouch">
    <template v-if="isShow">
      <view class="income-header">
        <!-- <view class="level-box" @click="jump('Promotion')">
          <view class="sprite-icon icon-zj-icon"></view>
          <view class="level-label">职级</view>
          <view class="level-desc">{{ jobTypeList[incomeDetail.jobType] }}</view>
          <view class="sprite-icon icon-js-icon"></view>
        </view> -->
        <!-- <view class="time-box" @click="jump('Calendar')">
          <view class="sprite-icon icon-work-icon"></view>
          <view class="level-label">本月出勤</view>
          <view class="time-day">{{ incomeDetail.checkInDays }}/{{ incomeDetail.shouldCheckInDays }}</view>
          <view class="time-go"></view>
        </view> -->
      </view>
      <view class="footer-box flex-center" v-if="!showPassword">
        <view class="sprite-icon icon-tips-b"></view>
        最终的交付数以厂家提供的交付数为准，个人填写的交付数仅为工资测算参考。
      </view>
      <view class="income-body" v-if="incomeDetail.merchants.length && !showPassword">
        <view class="income-store">
          <My-Store :merchants="incomeDetail.merchants"></My-Store>
        </view>
        <view class="income-item">
          <Day-Tips :merchants="incomeDetail.merchants"></Day-Tips>
        </view>
      </view>

      <Password v-if="showPassword" @close="closePassword"></Password>
    </template>
    <view class="dailog-panel" v-else>
      <view class="dailog-box">
        <view class="dailog-header flex">
          <view class="dailog-close" @click="close"><uni-icons type="closeempty" size="20"></uni-icons></view>
        </view>
        <view class="sprite-icon icon-prompt"></view>
        <view class="dailog-tips">温馨提示</view>
        <view class="dailog-desc">收入计算功能仅限广联直营驻店销售人员使用</view>
        <view class="dailog-btn" @click="close">好的</view>
      </view>
    </view>
  </view>
</template>

<script>
import DayTips from './DayTips'
import Password from './Password.vue'
import MyStore from './MyStore'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [pointTrack],
  components: { DayTips, Password, MyStore },
  data() {
    return {
      showPassword: true,
      pageName: '',
      // showPassword: false,
      jobTypeList: {
        0: '实习生(理论)',
        1: '实习生(实践)',
        2: '初级驻店',
        3: '中级驻店',
        4: '高级驻店',
        5: '小店长',
        6: '大店长',
        7: '初级区域督导',
        8: '中级区域督导',
        9: '高级区域督导'
      },
      incomeDetail: {
        staffName: 'string',
        staffPhone: 'string',
        jobType: 'string',
        checkInDays: 0,
        shouldCheckInDays: 0,
        merchants: []
      },
      isShow: true,
      times: 0
    }
  },
  inject: ['hideFooter', 'showPage'],
  async mounted() {
    this.hideFooter(false)
    const { phone } = uni.$storage.get('userInfo')
    const res = await uni.$api.pointApi.incomeMeasurementConfig({ staffPhone: phone })
    const phoneList = res.whiteConfig || {}
    if (res.configFlag == 0 || (res.configFlag == 2 && phoneList.staffPhone == phone)) {
      this.isShow = true
    } else {
      this.isShow = false
      return
    }
    this.incomeCalculation()
    this.start()
  },
  destroyed() {
    this.hideFooter(true)
    clearInterval(this.interval)
  },
  methods: {
    closePassword(val, page) {
      if (val) {
        this.close()
      }
      if (page) {
        this.pageName = '收入测算首页'
        this.eventCode = 'app_income_home'
        this.enterPage()
      }
      this.showPassword = false
    },
    /**
     * 每1s执行一次，执行60次后，触发close方法
     * @returns {undefined}
     */
    start() {
      this.interval = setInterval(() => {
        this.times++
        if (this.times == 60) {
          this.close()
          clearInterval(this.interval)
        }
      }, 1000)
    },
    /**
     * 点击页面时，清除定时器
     */
    handleTouch() {
      this.times = 0
    },
    close() {
      this.$emit('selectTab', 0)
    },
    /**
     * 员工收入测算
     * @returns {Promise<void>}
     */
    incomeCalculation() {
      uni.$api.pointApi.incomeCalculation().then(res => {
        console.log(res, 999)
        this.incomeDetail = res
      })
    },
    /**
     * 跳转到对应的页面
     * @param {String} name  pages/HomeFrame/components/Point/下的vue文件名
     * @param {Number|String} val  传递的参数
     */
    jump(name) {
      this.showPage(name, { jobType: this.incomeDetail.jobType })
    }
  }
}
</script>

<style scoped lang="scss">
.income-container {
  position: relative;
  .income-header {
    position: absolute;
    top: toRpx(-120);
    right: toRpx(64);
    display: flex;
    .level-box {
      width: toRpx(464);
      height: toRpx(84);
      background: #f0f6ff00;
      border: 2rpx solid #c0d8fb;
      border-radius: toRpx(42);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 toRpx(32);
      .level-desc {
        font-size: toRpx(28);
        color: #181a1f;
        margin-left: toRpx(38);
        margin-top: toRpx(2);
      }
    }
    .time-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: toRpx(398);
      height: toRpx(84);
      background: #f0f6ff00;
      border: 2rpx solid #b0ccf5;
      border-radius: toRpx(42);
      margin-left: toRpx(32);
      padding: 0 toRpx(32);
      .level-label {
        font-size: toRpx(28);
        color: #181a1f;
        margin-top: toRpx(2);
      }
      .time-day {
        font-size: toRpx(36);
        color: #2d66f7;
        font-weight: 600;
        margin-left: toRpx(48);
      }
      .time-go {
        border-bottom: toRpx(10) solid transparent;
        border-left: toRpx(14) solid #2d66f7;
        border-top: toRpx(10) solid transparent; /* 箭头颜色 */
      }
    }
  }
  .footer-box {
    color: #3773f8;
    font-size: 24rpx;
    width: 100%;
    font-weight: 600;
    position: absolute;
    bottom: -58rpx;
    left: 0;
    text-align: center;
  }
}
.income-body {
  display: grid;
  grid-template-columns: 68% 32%;
  column-gap: 48rpx;
  height: calc(100vh - 268rpx);
  width: calc(100% - 110rpx);
  margin-top: 32rpx;
  .income-store {
    background: #f2f7ff;
    border: 4rpx solid #ffffff;
    box-shadow: inset 0 4rpx 8rpx 0 #ffffff80;
    border-radius: 48rpx;
    overflow: hidden;
  }
  .income-item {
    height: 100%;
    background: #f0f5ff;
    border: 4rpx solid #ffffff;
    box-shadow: inset 0 4rpx 8rpx 0 #ffffff80;
    border-radius: 48rpx;
  }
}
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    background-image: linear-gradient(179deg, #d6e9ff 12%, #ffffff 100%); /* 顶部渐变和底部白色 */
    background-size:
      100% 110rpx,
      100% calc(100% - 110rpx); /* 分别设置渐变和白色的背景大小 */
    background-repeat: no-repeat, no-repeat; /* 确保背景不重复 */
    background-position: top, bottom; /* 分别设置渐变和白色的位置 */
    width: 1040rpx;
    height: 784rpx;
    background: #ffffff;
    border-radius: 48rpx;
    padding-bottom: 96rpx;
    .dailog-header {
      padding: 40rpx 48rpx;
      .dailog-close {
        margin-left: auto;
        text-align: right;
        .uni-icons {
          color: #808291 !important;
          font-size: 40rpx;
        }
      }
    }
    .icon-prompt {
      margin: 0 auto;
    }
    .dailog-tips {
      margin-top: 54rpx;
      font-size: 40rpx;
      color: #1a1a1a;
      text-align: center;
    }
    .dailog-desc {
      font-size: 32rpx;
      color: #808291;
      text-align: center;
      margin-top: 16rpx;
    }
    .dailog-btn {
      width: 400rpx;
      height: 96rpx;
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 32rpx 0 #ffffff80;
      border-radius: 16rpx;
      margin: 96rpx auto 0;
      font-size: 36rpx;
      color: #ffffff;
      line-height: 96rpx;
      text-align: center;
    }
  }
}
</style>
