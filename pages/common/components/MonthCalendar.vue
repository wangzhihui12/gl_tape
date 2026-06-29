<template>
  <view class="month-calendar">
    <view class="calendar-header">
      <view class="arrow-box" @click="changeYear(-1)">
        <uni-icons :style="{ opacity: canGoPrev ? 1 : 0 }" type="left" size="16" color="#414348"></uni-icons>
      </view>
      <view class="year-text">{{ displayYear }}</view>
      <view class="arrow-box" @click="changeYear(1)">
        <uni-icons :style="{ opacity: canGoNext ? 1 : 0 }" type="right" size="16" color="#414348"></uni-icons>
      </view>
    </view>
    
    <view class="month-grid">
      <view 
        class="month-item" 
        v-for="m in 12" 
        :key="m"
        :class="{
          'active': isSelected(m),
          'disabled': isDisabled(m)
        }"
        @click="onMonthClick(m)"
      >
        {{ m }}月
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs';
export default {
  name: 'MonthCalendar',
  props: {
    // 默认选中的日期，格式 YYYY-MM
    defaultDate: {
      type: String,
      default: ''
    }
  },
  data() {
    // 1. 先计算出上个月的时间对象
    const lastMonthDate = dayjs().subtract(1, 'month');

    // 2. 分别获取
    const yearNum = lastMonthDate.year();       
    const monthNum = lastMonthDate.month() + 1; 
    const todayYear = dayjs().year();
    const todayMonth = dayjs().month() + 1;
    const lastYear = lastMonthDate.year();
    return {
      today: { year: todayYear, month: todayMonth },
      displayYear: lastYear,
      selected: { year: yearNum, month: monthNum }
    }
  },
  computed: {
    canGoNext() {
      if (dayjs().month() === 0) return false
      return this.displayYear < this.today.year
    },
    canGoPrev() {
      return this.displayYear > this.today.year - 1
    }
  },
  watch: {
    defaultDate: {
      handler(val) {
        if (val) {
          const d = dayjs(val)
          if (!d.isValid()) return
          const y = d.year()
          const m = d.month() + 1
          this.selected = { year: y, month: m }
          this.displayYear = y
        }
      },
      immediate: true
    }
  },
  methods: {
    changeYear(step) {
      const targetYear = this.displayYear + step
      // 不允许切换到未来年份
      if (step > 0 && targetYear > this.today.year) return
      // 不允许切换到早于去年的年份
      if (step < 0 && targetYear < this.today.year - 1) return
      this.displayYear = targetYear
    },
    isSelected(m) {
      return this.selected.year === this.displayYear && this.selected.month === m
    },
    isDisabled(m) {
      // 未来年份的所有月份都不可选（虽然已经限制了年份切换，但作为兜底）
      if (this.displayYear > this.today.year) return true
      // 当前年份，超过当前月份的不可选
      if (this.displayYear === this.today.year && m > this.today.month - 1) return true
      return false
    },
    onMonthClick(m) {
      if (this.isDisabled(m)) return
      
      this.selected = {
        year: this.displayYear,
        month: m
      }
      
      const date = dayjs().year(this.displayYear).month(m - 1).date(1)
      this.$emit('confirm', date.format('YYYY-MM'))
    }
  }
}
</script>

<style lang="scss" scoped>
.month-calendar {
  padding: 16rpx 0;
}

.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
  
  .year-text {
    font-size: 28rpx;
    color: #37393D;
    margin: 0 60rpx;
  }
  
  .arrow-box {
    padding: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 32rpx;
  column-gap: 30rpx;
}

.month-item {
  height: 88rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: #37393D;
  border-radius: 12rpx;
  
  &.active {
    background-color: #4673FF;
    color: #fff;
  }
  
  &.disabled {
    color: #AAAFBD;
    background-color: transparent;
  }
}
</style>
