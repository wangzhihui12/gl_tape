<template>
  <view class="wage-appeal">
    <view class="common-title">工资申诉</view>
    
    <scroll-view scroll-y class="section">
      <!-- 考勤/日报/平板录音卡片区 -->
      <view class="card-row">
        <!-- 实际出勤天数 -->
        <view class="card-item">
          <view class="card-top">
            <view class="card-title">实际出勤天数</view>
            <view class="card-value">{{ appealData.actualAttendanceDays != null ? appealData.actualAttendanceDays : '-' }}
              <view v-if="appealData.actualAttendanceDays != null" class="card-unit">天</view>
            </view>
          </view>
          <view class="card-desc">根据打卡数据产生</view>
          <view v-if="appealData.attendanceAppealable" class="action-btn" @click="handleAppeal('attendance')">申诉考勤</view>
        </view>

        <!-- 日报完成天数 -->
        <view class="card-item">
          <view class="card-top">
            <view class="card-title">日报完成天数</view>
            <view class="card-value">{{ appealData.dailyReportDays != null ? appealData.dailyReportDays : '-' }}
              <view v-if="appealData.dailyReportDays != null" class="card-unit">天</view>
            </view>
          </view>
          <view class="card-desc">填写驻店日报天数</view>
          <view class="deduction">扣款 <text :class="{'amount': appealData.dailyReportDeductionAmount != null}">{{appealData.dailyReportDeductionAmount ? '-' : ''}}{{ appealData.dailyReportDeductionAmount != null ? appealData.dailyReportDeductionAmount + '元' : '-' }}</text></view>
          <view class="missing-days" v-if="appealData.missingDailyReportDates && appealData.missingDailyReportDates.length">
            <text class="warning-text">缺失天数为</text> <text class="warning-content"><text v-for="(day, idx) in appealData.missingDailyReportDates" :key="idx">{{ day }}{{ idx < appealData.missingDailyReportDates.length - 1 ? '、' : '' }}</text>号</text>
          </view>
          <view v-if="appealData.dailyReportable" class="action-btn" @click="handleAppeal('dailyReport')">去补日报</view>
        </view>

        <!-- 平板录音完成总数 -->
        <view class="card-item">
          <view class="card-top">
            <view class="card-title">平板录音完成总数</view>
            <view class="card-value">{{ appealData.padRecordNum != null ? appealData.padRecordNum : '-' }}
              <view v-if="appealData.padRecordNum != null" class="card-unit">条</view>
            </view>
          </view>
          <view class="card-desc">触客总数为 <text :class="{'blue-text': appealData.touchCustomerTotal != null}">{{ appealData.touchCustomerTotal != null ? appealData.touchCustomerTotal + '条' : '-' }}</text></view>
          <view class="deduction">扣款 <text :class="{'amount': appealData.padDeductionAmount != null}">{{ appealData.padDeductionAmount ? '-' : '' }}{{ appealData.padDeductionAmount != null ? appealData.padDeductionAmount + '元' : '-' }}</text></view>
          <view v-if="appealData.padAppealable" class="action-btn" @click="handleAppeal('record')">申诉平板</view>
        </view>
      </view>

      <!-- 订单数统计 -->
      <view class="section-title">
        订单数统计
        <text class="subtitle">订单数若有异常请跟总部联系</text>
      </view>
      <view class="order-stats-box">
        <template v-for="(item, index) in orderStats">
          <view class="stat-item" :key="index" v-if="item.value">
            <view class="stat-label">{{ item.label }}</view>
            <view class="stat-value">{{ item.value }}</view>
          </view>
        </template>
      </view>

      <!-- 申诉答复记录 -->
      <view class="section-title">申诉答复记录</view>
      <view class="reply-container">
        <view class="reply-list">
          <view class="reply-item" v-for="(item, index) in replyList" :key="index">
            <view class="reply-content">{{ !item.replyContent ? '已处理' : item.replyContent }}</view>
            <view class="reply-footer">
              <text>申诉类型：{{ item.appealType === 1 ? '考勤' : '平板' }}</text>
              <text class="time">{{ formatTime(item.replyDate, 'YYYY-MM-DD HH:mm:ss') }}</text>
            </view>
          </view>
          <view v-if="replyList.length === 0" class="empty-text">
            <image class="empty-image" src="../../../assets/images/common/nothing.webp"></image>
            <view>暂无记录</view>
          </view>
        </view>
      </view>
    </scroll-view>
    <AttendanceRecord :appealStartTime="appealData.appealStartTime" :appealEndTime="appealData.appealEndTime" ref="attendanceRecord" :lastRecord="lastRecord" :currentCount="currentCount" :popType="popType" :month="month" />
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { EQUITY_ORDER_COUNT_FIELDS, BOUTIQUE_ORDER_COUNT_FIELDS } from './components/contant'
import AttendanceRecord from './components/AttendanceRecord.vue';
export default {
  name: 'WageAppeal',
  components: {
    AttendanceRecord
  },
  props: {
    lastMonth: {
      type: String,
      default: ''
    }
  },
  watch: {
    lastMonth: {
      handler(val) {
        this.month = val
        console.log('month', val)
        this.$emit('monthChange', val)
        this.loadData(val)
      },
      immediate: true
    }
  },
  data() {
    return {
      month: '',
      appealData: {
      },
      replyList: [],
      popType: '',
      currentCount: '',
      lastRecord: {}
    }
  },
  computed: {
    orderStats() {
      let { sceneType } = uni.$storage.get('userInfo')
      if (sceneType == 1) {
        return BOUTIQUE_ORDER_COUNT_FIELDS
      } else if (sceneType == 0) {
        return EQUITY_ORDER_COUNT_FIELDS
      } else {
        return []
      }
    }
  },
  created() {
    uni.$on('backToWageAppeal', () => {
      this.loadData(this.month)
    })
  },
  beforeDestroy() {
    uni.$off('backToWageAppeal')
  },
  methods: {
    // 格式化时间
    formatTime(time, formatStr) {
      if (!time) return '-';
      return dayjs(time).format(formatStr);
    },
    async loadData(month) {
      // 模拟加载数据，实际应调用接口
      console.log('Loading data for month:', month)
      const { phone } = uni.$storage.get('userInfo')
      // 参数
      const params = {
        appealMonth: month,
        staffPhone: phone
      }
      const {sceneType} = uni.$storage.get('userInfo')
      const params1 = {
        ...params,
        sceneType
      }
      const res = await uni.$api.commonApi.getWageAppealOverview(params)
      this.appealData = res || {}
      // 工资申诉订单统计查询
      const res1 = await uni.$api.commonApi.getWageAppealStatistics(params1)
      this.orderStats.forEach(item => {
        this.$set(item, 'value', res1[item.prop])
      })
      const res2 = await uni.$api.commonApi.replyList(params)
      this.replyList = res2 || []
    },
    async handleAppeal(type) {
      console.log(type, 'type')
      // 根据类型跳转或弹窗
      if (type === 'dailyReport') {
        // 去补日报逻辑
        const {sceneType} = uni.$storage.get('userInfo')
        const len = this.appealData.missingDailyReportDates.length
        const currentDate = `${this.month}-${this.appealData.missingDailyReportDates[len - 1]}`
        if (sceneType == 1) {
          uni.navigateTo({
            url: `/pages/boutique/tool/index?componentName=DailyReport&currentDate=${currentDate}&enterType=wageAppeal`
          })
        } else if (sceneType == 0) {
          uni.navigateTo({
            url: `/pages/equity/tool/index?componentName=DailyReport&currentDate=${currentDate}&enterType=wageAppeal`
          })
        }
      } else {
        // 申诉弹窗或其他逻辑
        this.popType = type
        const params = {
          appealMonth: this.month,
          appealType: type == 'record' ? 2 : type == 'attendance' ? 1 : ''
        }
        const res = await uni.$api.commonApi.getWageAppealLatestRecord(params)
        console.log('getWageAppealLatestRecord', res)
        this.lastRecord = res || {}
        if (type == 'record') {
          this.currentCount = this.appealData.padRecordNum
          this.lastRecord.shopCount = this.appealData.touchCustomerTotal
        } else if (type == 'attendance') {
          this.currentCount = this.appealData.actualAttendanceDays
        }
        this.$refs.attendanceRecord.open()
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.wage-appeal {
  width: 100%;
  height: 100%;
}

.header {
  font-size: toRpx(36);
  font-weight: 500;
  color: #333;
  margin-bottom: toRpx(32);
}
.section {
  height: calc(100% - #{toRpx(120)});
}
.card-row {
  display: flex;
  justify-content: space-between;
  margin: 0 toRpx(48) toRpx(40) toRpx(48);
}

.card-item {
  width: 32%;
  background: #fff;
  border-radius: toRpx(24);
  padding: toRpx(32) toRpx(24);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: toRpx(16);
    
    .card-title {
      font-size: toRpx(28);
      font-weight: 500;
      color: #333;
    }
    
    .card-value {
      font-size: toRpx(28);
      font-weight: 500;
      color: #333;
    }
    .card-unit {
      display: inline-block;
      font-size: toRpx(24);
    }
  }
  
  .card-desc {
    font-size: toRpx(24);
    color: #999;
    margin-bottom: toRpx(16);
    text {
      margin-left: toRpx(8);
    }
    
    .blue-text {
      color: #3B73FF;
    }
  }
  
  .deduction {
    font-size: toRpx(24);
    color: #666;
    margin-bottom: toRpx(24);
    text {
      margin-left: toRpx(8);
    }
    
    .amount {
      color: #FF6B00;
      font-weight: 500;
    }
  }
  
  .missing-days {
    font-size: toRpx(24);
    color: #757980;
    margin-bottom: toRpx(24);
    line-height: 1.4;
    .warning-text {
      margin-right: toRpx(8);
    }
    .warning-content {
      color: #2A82E4;
    }
  }
  
  .action-btn {
    margin-top: auto;
    width: 100%;
    height: toRpx(64);
    line-height: toRpx(64);
    text-align: center;
    background: #EFF4FF;
    border-radius: toRpx(32);
    color: #3B73FF;
    font-size: toRpx(28);
  }
}

.section-title {
  margin: 0 toRpx(48);
  font-size: toRpx(28);
  font-weight: 500;
  color: #333;
  margin-bottom: toRpx(24);
  display: flex;
  align-items: center;
  
  .subtitle {
    font-size: toRpx(24);
    color: #999EA8;
    font-weight: normal;
    margin-left: toRpx(8);
  }
}

.order-stats-box {
  background: #fff;
  border-radius: toRpx(24);
  padding: toRpx(32) toRpx(24);
  display: flex;
  flex-wrap: wrap;
  margin: 0 toRpx(48);
  margin-bottom: toRpx(40);
  
  .stat-item {
    width: 25%; // 四列布局
    margin-bottom: toRpx(32);
    
    &:nth-last-child(-n+4) {
      margin-bottom: 0;
    }
    
    .stat-label {
      font-size: toRpx(24);
      color: #777;
      margin-bottom: toRpx(8);
    }
    
    .stat-value {
      font-size: toRpx(32);
      font-weight: 500;
      color: #222;
    }
  }
}
.reply-container {
  padding-bottom: toRpx(32);
}
.reply-list {
  flex: 1;
  background: #fff;
  border-radius: toRpx(24);
  padding: toRpx(32) toRpx(24);
  margin: 0 toRpx(48);
  box-sizing: border-box;
  overflow: hidden;
  
  .reply-item {
    background: #FAFAFA;
    border-radius: toRpx(16);
    padding: toRpx(24);
    margin-bottom: toRpx(24);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .reply-content {
      font-size: toRpx(28);
      color: #292D33;
      line-height: 1.5;
      margin-bottom: toRpx(16);
      word-break: break-all;
    }
    
    .reply-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: toRpx(24);
      color: #757B85;
      
      .time {
        margin-left: toRpx(24);
        color: #999EA8;
      }
    }
  }
  
  .empty-text {
    text-align: center;
    color: #999EA8;
    font-size: toRpx(24);
    margin: 0 auto;
    .empty-image {
      width: toRpx(128);
      height: toRpx(128);
    }
  }
}
</style>
