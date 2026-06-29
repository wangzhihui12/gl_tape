<template>
  <view class="calendar-container" @click="handleTouch">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title"><text>本月出勤</text></view>
    </view>
    <view class="calendar-box">
      <view class="calendar-years">
        <view class="calendar-year">{{ year }}年{{ month }}月</view>
      </view>
      <view class="calendar-body">
        <view class="calendar-weekdays">
          <view class="calendar-weekday" v-for="weekday in weekdays" :key="weekday">
            {{ weekday }}
          </view>
        </view>
        <view class="calendar-dates">
          <view class="calendar-date" v-for="(date, index) in dates" :key="index">
            <template v-if="date">
              <view class="date-num">{{ date }}</view>
              <view class="date-desc" v-if="isClock(date) == 2">出勤</view>
              <view class="date-desc date-card" v-if="isClock(date) == 1">未打卡</view>
            </template>
          </view>
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
  name: 'calendar',
  props: {
    // 是否显示周标题
    showWeekdays: {
      type: Boolean,
      default: true
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 当前所处日期 年月日
      nowDate: '7',
      datesd: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      clockInDateList: [],
      // 当前所处年
      year: new Date().getFullYear(),
      // 当前所处月
      month: new Date().getMonth() + 1,
      weekdays: ['一', '二', '三', '四', '五', '六', '日'],
      showNextMonth: true //是否显示查看下个月操作箭头，暂时只能看后一个月
    }
  },
  computed: {
    dates() {
      const firstDayOfMonth = new Date(this.year, this.month - 1, 1)
      const dates = []
      for (let i = 0, len = this.datesd.length; i < len; i++) {
        dates.push(this.datesd[i])
      }
      if (firstDayOfMonth.getDay() == 0) {
        // 第一行只有一天的情况
        for (let i = 1; i <= 6; i++) {
          dates.unshift(null)
        }
      } else {
        for (let i = 1; i < firstDayOfMonth.getDay(); i++) {
          dates.unshift(null)
        }
      }
      console.log(dates)
      return dates
    }
  },
  methods: {
    isClock(day) {
      if (this.day < day) {
        return
      }
      const clock = this.clockInDateList.find(i => i.day == day)
      return clock?.isClock
    },
    getDetail() {
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      uni.$api.pointApi.calendarDetail({ staffPhone }).then(res => {
        this.clockInDateList = res.clockInDateList || []
      })
    },
    /** 回显每日日期文本
     * @param {Object} date
     */
    isTodayText(date) {
      if (date === this.nowDate) {
        return '今天'
      }
      //   return uni.$jy.formatDate(date, 'D')
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
.calendar-box {
  width: calc(100vw - 128rpx);
  margin: 30rpx auto 0;
  height: calc(100vh - 220rpx);
  background: #ffffff;
  border-radius: 48rpx;
  padding: 64rpx;
  box-sizing: border-box;
  .calendar-years {
    color: #1a1a1a;
    font-size: 64rpx;
    font-weight: 600;
  }
  .calendar-weekdays {
    display: flex;
    height: 56rpx;
    margin-top: 30rpx;
    .calendar-weekday {
      flex: 1;
      font-size: 28rpx;
      color: #808291;
      text-align: right;
    }
  }
  .calendar-dates {
    display: flex;
    flex-wrap: wrap;

    .calendar-date {
      width: calc(100% / 7);
      height: calc((100vh - 550rpx) / 5);
      padding: 32rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      border: 2rpx solid #e7e7e7;
      + .calendar-date {
        border-left: none;
        border-top: none;
      }
      &:nth-child(7n + 1) {
        border-left: 2rpx solid #e7e7e7;
      }
      &:nth-child(-n + 7) {
        border-top: 2rpx solid #e7e7e7;
      }
      .date-desc {
        position: relative;
        font-size: 26rpx;
        margin-top: 30rpx;
        padding-left: 30rpx;
        &::before {
          content: '';
          position: absolute;
          width: 12rpx;
          top: 12rpx;
          left: 0rpx;
          height: 12rpx;
          background: #2cca74;
          border-radius: 50%;
        }

        &.date-card {
          color: #eb4e4e;
          &::before {
            background: #eb4e4e;
          }
        }
      }
    }
  }
}
</style>
