<template>
  <view class="calendar-container">
    <view class="calendar-box">
      <view class="calendar-years">
        <view class="calendar-year">{{ currentInfo.year }}年{{ currentInfo.month }}月</view>
        <view class="appeal-record" @click="switchMonth"><view class="sprite-icon icon-calendar"></view>{{ currentInfo.month == defaultMonth ? '上个月' : '当前月'}}</view>
        <!-- <view class="appeal-record" @click="viewAppeal">
          <view class="sprite-icon icon-appeal-record"></view>考勤申诉记录
        </view> -->
      </view>
      <view class="calendar-body">
        <view class="calendar-weekdays">
          <view class="calendar-weekday" v-for="weekday in weekdays" :key="weekday">
            {{ weekday }}
          </view>
        </view>
        <view class="calendar-dates">
          <view :class="['calendar-date', `lines${getMaxLen}`]" v-for="(date, index) in clockInDateList" :key="index">
            <template v-if="date.day">
              <view @click="openDetail(date)">
                <view v-if="date.dayState != 1" :class="getTagClass(date)">
                  {{ DAY_STATE[date.dayState] }}</view>
                <view class="current-date" v-if="currentInfo.month == defaultMonth && date.day == currentInfo.day">今</view>
                <view class="date-num" v-else>{{ date.day || '' }}</view>
                <template v-if="!date.isDefault">
                  <view
                    :class="['date-desc first-child', date.clockInState != 0 || date.clockInAbnormalAttire ? 'date-red' : '']">
                    {{
                      date.clockInState == 3 ? '缺卡' : date.clockInTime1 }}<view v-if="date.clockInAbnormalAttire"
                      class="sprite-icon icon-dress-code"></view>
                  </view>
                  <view
                    :class="['date-desc', date.clockOutState != 0 || date.clockOutAbnormalAttire ? 'date-red' : '']">{{
                      date.clockOutState == 3 ? '缺卡' : date.clockOutTime1 }}<view v-if="date.clockOutAbnormalAttire"
                      class="sprite-icon icon-dress-code"></view>
                  </view>
                </template>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>
    <detailPop ref="detail" :detailInfo="selectInfo" @close="close"></detailPop>
    <AppealRecord ref="appeal" :recordList="recordList"></AppealRecord>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import detailPop from './detailPop.vue'
import AppealRecord from './appealRecord.vue'
import { DAY_STATE, TYPE_LIST } from './contant'
export default {
  name: 'calendar',
  components: { detailPop, AppealRecord },
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
      recordList: [],
      weekdays: ['一', '二', '三', '四', '五', '六', '日'],
      showNextMonth: true, //是否显示查看下个月操作箭头，暂时只能看后一个月
      currentInfo: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      },
      defaultMonth: new Date().getMonth() + 1,
      selectInfo: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        data: {}
      },
      DAY_STATE,
      TYPE_LIST
    }
  },
  computed: {
    dates() {
      // 获取当前日期
      const now = new Date();
      const year = now.getFullYear();
      // const month = now.getMonth();
      // 需求添加切换月份，月份从currentInfo中获取
      const month = this.currentInfo.month - 1
      // 获取当月第一天是星期几，注意 getDay() 返回值 0 代表周日，1 - 6 代表周一到周六
      const firstDayOfMonth = new Date(year, month, 1);
      const firstDayWeekday = firstDayOfMonth.getDay();
      // 获取当月的总天数
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const totalDays = lastDayOfMonth.getDate();
      // 创建一个初始数组，根据当月第一天是星期几插入相应数量的 null
      const daysArray = [];
      for (let i = 0; i < (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1); i++) {
          daysArray.push(null);
      }

      for (let day = 1; day <= totalDays; day++) {
          daysArray.push(day);
      }
      // 用null补足最后一行
      const lastDayWeekday = lastDayOfMonth.getDay();
      const remainingDays = lastDayWeekday === 0 ? 0 : 7 - lastDayWeekday;
      for (let i = 0; i < remainingDays; i++) {
          daysArray.push(null);
      }

      return daysArray;
    },
    getMaxLen() {
      const max_len = Math.ceil(this.dates.length / 7)
      return max_len
    },
    getTagClass() {
      return (date) => {
        if (!date || date.dayState === null) {
          return ['tag'];
        }
        const item = TYPE_LIST.find(item => item.value == date.dayState);
        return item ? ['tag', item.class] : ['tag'];
      }
    }
  },
  mounted(options) {
    this.init()
  },
  methods: {
    init() {
      this.clockInDateList = []
      this.getNewCalendar()
      // this.getAppealList()
    },
    openDetail(date) {
      console.log(date, '====!!!')
      if (date.isDefault || date.dayState == 4) return
      this.selectInfo.data = date
      this.selectInfo.month = this.currentInfo.month
      this.$refs.detail.open()
    },
    viewAppeal() {
      if (this.recordList.length > 0) {
        this.$refs.appeal.open()
      } else {
        uni.showToast({
          title: "暂无记录",
          icon: "none",
        });
      }
    },
    close(isAppeal) {
      // 提交申诉后关闭需要刷新日历
      if (isAppeal) this.init()
    },
    getParams() {
      const { phone } = uni.$storage.get("userInfo")
      // 获取当前日期对象
      const now = new Date();
      // 当月第一天
      const firstDay = dayjs(new Date(this.currentInfo.year, this.currentInfo.month - 1, 1)).format('YYYY-MM-DD');
      // 当月最后一天
      const lastDay = dayjs(new Date(this.currentInfo.year, this.currentInfo.month, 0)).format('YYYY-MM-DD');
      return {
        startTime: firstDay + ' 00:00:00',
        endTime: lastDay + ' 23:59:59',
        staffPhone: phone
      }
    },
    // 接口调用
    async getNewCalendar() {
      const params = this.getParams()
      const res = await uni.$api.pointApi.newCalendar(params)
      if (res) {
        this.dates.forEach(item => {
          const clockData = res?.clockInDateList?.find(i => i.day == item)
          if (clockData && (this.currentInfo.month < this.defaultMonth ||  clockData.day < this.currentInfo.day)) {
            if (clockData.dayState == 4) clockData.isDefault = true
            clockData.clockInTime1 = clockData.clockInTime ? dayjs(new Date(clockData.clockInTime)).format('HH:mm') : null
            clockData.clockOutTime1 = clockData.clockOutTime ? dayjs(new Date(clockData.clockOutTime)).format('HH:mm') : null
            this.clockInDateList.push(clockData)
          } else {
            this.clockInDateList.push({
              // 设置默认值
              day: item,
              dayState: '1',
              isDefault: true
            })
          }
        })
      }
    },
    /** 申诉记录 */
    async getAppealList() {
      const params = this.getParams()
      params.pageSize = 40
      const res = await uni.$api.pointApi.getAppealList(params)
      this.recordList = res.list
    },
    // 切换月份
    switchMonth() {
      if (this.currentInfo.month == this.defaultMonth) {
        //  切换上个月
        this.currentInfo.month = new Date().getMonth()
        this.init()
      } else {
        //  切换当前月
        this.currentInfo.month = new Date().getMonth() + 1
        this.init()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.calendar-box {
  padding: toRpx(48) toRpx(64);
  box-sizing: border-box;
  width: calc(100% - #{toRpx(64)});
  height: calc(100vh - #{toRpx(276)});
  border: toRpx(4) solid #fff;
  background: #f2f7ff;
  box-shadow: inset 0 toRpx(4) toRpx(8) 0 #ffffff80;
  border-radius: toRpx(48);
  margin-top: toRpx(38);

  .calendar-years {
    color: #1a1a1a;
    font-size: toRpx(48);
    position: relative;

    .appeal-record {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0;
      right: 0;
      height: toRpx(64);
      background-color: #E6EDF7;
      color: #333;
      font-size: toRpx(28);
      padding: 0 toRpx(20);
      border-radius: toRpx(16);
      line-height: toRpx(64);

      .icon-appeal-record,
      .icon-calendar {
        margin-right: toRpx(8);
      }
    }
  }

  .calendar-weekdays {
    display: flex;
    height: toRpx(56);
    margin-top: toRpx(30);

    .calendar-weekday {
      flex: 1;
      font-size: toRpx(28);
      color: #808291;
      text-align: right;
      padding-right: toRpx(21);
    }
  }

  .calendar-dates {
    display: flex;
    flex-wrap: wrap;
    border-radius: toRpx(24);

    .calendar-date {
      position: relative;
      width: calc(100% / 7);
      background-color: #fff;
      padding: toRpx(22) toRpx(32);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      border: toRpx(2) solid #DEEAFC;

      +.calendar-date {
        border-left: none;
        border-top: none;
      }

      &:nth-child(7n + 1) {
        border-left: toRpx(2) solid #DEEAFC;
      }

      &:nth-child(-n + 7) {
        border-top: toRpx(2) solid #DEEAFC;
      }
      &:first-child {
        border-radius: toRpx(24) 0 0 0;
      }
      &:nth-child(7) {
        border-radius: 0 toRpx(24) 0 0;
      }
      &:nth-last-child(7) {
        border-radius: 0 0 0 toRpx(24);
      }
      &:last-child {
        border-radius: 0 0 toRpx(24) 0;
      }

      .tag {
        position: absolute;
        right: toRpx(29.14);
        top: toRpx(21.14);
        padding: toRpx(6) toRpx(16);
        font-size: toRpx(24);
        box-sizing: content-box;
        line-height: toRpx(32);
        border-radius: toRpx(12);

        &.blue {
          color: #00B8F0;
          background-color: rgba(0, 184, 240, 0.1);
        }

        &.red {
          color: #EB4E4E;
          background-color: rgba(235, 78, 78, 0.1);
        }

        &.gray {
          color: #B6BAC2;
          background-color: rgba(160, 163, 173, 0.1);
        }

        &.purple {
          color: #6D58F5;
          background-color: rgba(109, 88, 245, 0.1);
        }
      }

      .date-num {
        color: #1a1a1a;
        font-size: toRpx(36);
        margin-bottom: toRpx(32.8);
      }

      .current-date {
        width: toRpx(64);
        height: toRpx(64);
        border-radius: toRpx(80);
        opacity: 1;
        background: #ebf1fe;
        color: #3773F8;
        font-size: toRpx(36);
        line-height: toRpx(64);
        text-align: center;
        margin-bottom: toRpx(12);
      }

      .date-desc {
        display: flex;
        align-items: center;
        position: relative;
        font-size: toRpx(24);
        padding-left: toRpx(30);
        color: #808291;
        height: toRpx(32);
        line-height: toRpx(32);

        &.first-child {
          margin-bottom: toRpx(8);
        }

        &::before {
          content: '';
          position: absolute;
          width: toRpx(12);
          top: 50%;
          transform: translateY(-50%);
          left: 0;
          height: toRpx(12);
          background: #2cca74;
          border-radius: 50%;
        }

        &.date-red {
          color: #eb4e4e;

          &::before {
            background: #eb4e4e;
          }
        }

        .icon-dress-code {
          display: inline-block;
          margin-left: toRpx(8);
          margin-bottom: toRpx(6);
        }
      }

      &.lines5 {
        min-height: calc((100vh - #{toRpx(524)}) / 5);
      }

      &.lines6 {
        min-height: calc((100vh - #{toRpx(524)}) / 6);

        .date-num {
          margin-bottom: 0;
        }
        .date-desc.first-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
