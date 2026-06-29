<template>
  <view class="card" @click="handleAvtivityItemClick()">
    <view v-if="tabIndex === 1" class="time-limit-countdown">
      <template v-if="countdownObj._timeout">
        <view class="countdown-label timeout-label">活动开始</view>
      </template>
      <template v-else-if="countdownObj._remainSeconds < 3600">
        <!-- 小于1小时，显示分钟/秒 -->
        <view class="countdown-label">即将开始</view>
        <view class="countdown-num">{{ countdownObj._countdownMinute }}</view>
        <view class="countdown-label">分</view>
        <view class="countdown-num">{{ countdownObj._countdownSecond }}</view>
        <view class="countdown-label">秒</view>
      </template>
      <template v-else-if="countdownObj._remainSeconds < 86400">
        <!-- 小于24小时，显示小时/分钟 -->
        <view class="countdown-label">即将开始</view>
        <view class="countdown-num">{{ countdownObj._countdownHour }}</view>
        <view class="countdown-label">时</view>
        <view class="countdown-num">{{ countdownObj._countdownMinute }}</view>
        <view class="countdown-label">分</view>
      </template>
      <template v-else-if="countdownObj._showDays">
        <!-- 大于24小时，显示天/小时 -->
        <view class="countdown-label">即将开始</view>
        <view class="countdown-num">{{ countdownObj._leftDays }}</view>
        <view class="countdown-separator">天</view>
        <view class="countdown-num">{{ countdownObj._leftHours }}</view>
        <view class="countdown-separator">时</view>
      </template>
      <template v-else>
        <view class="countdown-label">即将开始</view>
        <view class="countdown-num">--</view>
        <view class="countdown-separator">:</view>
        <view class="countdown-num">--</view>
        <view class="countdown-separator">:</view>
        <view class="countdown-num">--</view>
      </template>
    </view>
    <image class="card-item-img" :src="item.activityCover" mode="aspectFit" />
    <view class="card-item-content">
      <view class="card-item-title">{{ item.name }}</view>
      <view class="card-item-text" v-if="tabIndex !== 1">
        <view class="card-item-label">活动进度</view>
        <view class="card-item-progress" v-if="tabIndex !== 2">
          <view class="card-item-progress-bar" :style="{ width: Math.floor(Number(item.process) || 0) + '%' }"></view>
          <view class="card-item-progress-text">{{ Math.floor(Number(item.process) || 0) }}%</view>
        </view>
        <view class="card-item-value" v-else>
          <view class="gray">已结束</view>
        </view>
      </view>
      <view class="card-item-text">
        <view class="card-item-label">活动时间</view>
        <view class="card-item-value">{{ dayjs(item.startTime).format('YYYY.MM.DD HH:mm') }} - {{ dayjs(item.endTime).format('YYYY.MM.DD HH:mm') }}</view>
      </view>
      <view class="card-item-text" @click.stop="rulesShow(item)">
        <view class="card-item-label">评选规则</view>
        <view class="card-item-value blueValue">查看</view>
      </view>
      <!-- <view class="card-item-status">{{ item.status }}</view> -->
    </view>
  </view>
</template>
<script>
import dayjs from 'dayjs'
export default {
  name: 'ActivityCard',

  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    tabIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dayjs,
      isShowActivityDetails: false,
      countdownTimer: null,
      countdownObj: null
    }
  },
  mounted() {
    this.countdownObj = {
      _timeout: false,
      _showCountdown: true,
      _showDays: false,
      _remainSeconds: 0,
      _countdownHour: '00',
      _countdownMinute: '00',
      _countdownSecond: '00',
      _leftDays: '00',
      _leftHours: '00'
    }
    // 初始化倒计时
    if (this.tabIndex === 1 && this.item.startTime) {
      this.updateCountdown()
      this.countdownTimer = setInterval(() => {
        this.updateCountdown()
      }, 1000)
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },

  methods: {
    handleAvtivityItemClick() {
      if (this.tabIndex !== 1) {
        this.$emit('handleAvtivityItemClick')
      }
    },
    rulesShow(item) {
      this.$emit('rulesShow', item)
    },
    // 更新倒计时逻辑
    updateCountdown() {
      const now = Date.now()
      const startTime = new Date(this.item.startTime).getTime()
      const diff = startTime - now

      // 如果活动已经开始，显示"活动开始"
      if (diff <= 0) {
        this.$set(this.countdownObj, '_timeout', true)
        this.$set(this.countdownObj, '_showCountdown', false)
        this.$set(this.countdownObj, '_showDays', false)
        return
      }

      this.$set(this.countdownObj, '_timeout', false)

      // 计算剩余秒数
      const _remainSeconds = Math.floor(diff / 1000)
      this.$set(this.countdownObj, '_remainSeconds', _remainSeconds)

      // 根据剩余时间设置不同的显示格式
      if (_remainSeconds < 3600) {
        // 小于1小时，显示分钟/秒
        this.$set(this.countdownObj, '_showCountdown', true)
        this.$set(this.countdownObj, '_showDays', false)
        this.$set(this.countdownObj, '_countdownHour', this.formatTwoDigits(Math.floor(_remainSeconds / 60)))
        this.$set(this.countdownObj, '_countdownMinute', this.formatTwoDigits(Math.floor(_remainSeconds / 60)))
        this.$set(this.countdownObj, '_countdownSecond', this.formatTwoDigits(Math.floor(_remainSeconds % 60)))
      } else if (_remainSeconds < 86400) {
        // 小于24小时，显示小时/分钟
        this.$set(this.countdownObj, '_showCountdown', true)
        this.$set(this.countdownObj, '_showDays', false)
        this.$set(this.countdownObj, '_countdownHour', this.formatTwoDigits(Math.floor(_remainSeconds / 3600)))
        this.$set(this.countdownObj, '_countdownMinute', this.formatTwoDigits(Math.floor((_remainSeconds % 3600) / 60)))
        this.$set(this.countdownObj, '_countdownSecond', this.formatTwoDigits(Math.floor(_remainSeconds % 60)))
      } else {
        // 大于24小时，显示天/小时
        this.$set(this.countdownObj, '_showCountdown', false)
        this.$set(this.countdownObj, '_showDays', true)
        this.$set(this.countdownObj, '_leftDays', Math.floor(_remainSeconds / 86400))
        this.$set(this.countdownObj, '_leftHours', this.formatTwoDigits(Math.floor((_remainSeconds % 86400) / 3600)))
      }
    },

    // 格式化数字为两位数
    formatTwoDigits(num) {
      return num < 10 ? `0${num}` : `${num}`
    }
  }
}
</script>
<style lang="scss" scoped>
.card {
  position: relative;
  width: 100%;
  //   height: toRpx(516);
  background-color: #fff;
  border-radius: toRpx(24);
  font-size: 0;
  box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
  overflow: hidden;
  .time-limit-tag {
    position: absolute;
    top: 0;
    left: 0;
    width: toRpx(122);
    height: toRpx(48);
    background-image: url('../../../../assets/images/common/limit-page.webp');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 1;
    color: #fff;
  }

  .time-limit-countdown {
    position: absolute;
    right: toRpx(18);
    top: toRpx(16);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: toRpx(24);
    z-index: 1;

    .countdown-num {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      width: toRpx(40);
      height: toRpx(40);
      border-radius: toRpx(4);
      background: #00000059;
      margin: 0 toRpx(4);
    }
    .countdown-separator {
      color: #0000004d;
    }
    .countdown-label,
    .countdown-unit {
      color: #00000059;
      margin: 0 toRpx(4);
    }
    .timeout-label {
      height: toRpx(40);
      line-height: toRpx(44);
      border-radius: toRpx(4);
      background: #00000059;
      color: #fff;
      padding: toRpx(4) toRpx(8);
      padding: 0 toRpx(12);
      font-size: toRpx(24);
    }
  }

  .card-item-img {
    width: 100%;
    height: toRpx(312);
    border-radius: toRpx(16) toRpx(16) 0 0;
  }

  .card-item-content {
    padding: toRpx(32);
  }

  .card-item-title {
    font-size: toRpx(30);
    color: #292d33;
    font-weight: 500;
    margin-bottom: toRpx(24);
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .card-item-text {
    position: relative;
    display: flex;
    align-items: center;
    font-size: toRpx(24);
    margin-bottom: toRpx(14);
    &:last-child {
      margin-bottom: 0;
    }
    .card-item-label {
      width: toRpx(96);
      color: #999ea8;
      margin-right: toRpx(24);
    }

    .card-item-value {
      color: #666666;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      .dot-value {
        width: toRpx(12);
        height: toRpx(12);
        border-radius: 50%;
        background: #2cca74;
        margin-right: toRpx(8);
      }
      .gray {
        color: #666666;
      }
    }
    .blueValue {
      color: #4673ff;
    }
  }

  .card-item-progress {
    width: toRpx(366);
    height: toRpx(16);
    background: linear-gradient(128.8deg, rgba(117, 188, 255, 0.35) 0%, rgba(44, 102, 247, 0.35) 100%);
    border-radius: toRpx(8);

    .card-item-progress-text {
      color: #3b73ff;
      font-size: toRpx(24);
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }

    .card-item-progress-bar {
      height: 100%;
      background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);
      border-radius: toRpx(8);
    }
  }
}
</style>
