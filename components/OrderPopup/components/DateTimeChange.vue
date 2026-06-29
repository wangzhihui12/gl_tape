<template>
  <view class="date-list">
    <picker-view class="picker picker_max" :value="dateValues" indicator-class="indicator" @change="changeDate">
      <picker-view-column>
        <template v-for="(item, index) in days">
          <view class="view" :key="index">{{ item }}</view>
        </template>
      </picker-view-column>
    </picker-view>
    <picker-view class="picker" :value="hourValues" indicator-class="indicator" @change="changeHour">
      <picker-view-column>
        <template v-for="(item, index) in hours">
          <view class="view" :key="index">{{ item }}</view>
        </template>
      </picker-view-column>
    </picker-view>
    <picker-view class="picker" :value="minuteValues" indicator-class="indicator" @change="changeMinutes">
      <picker-view-column>
        <template v-for="(item, index) in minutes">
          <view class="view" :key="index">{{ item }}</view>
        </template>
      </picker-view-column>
    </picker-view>
  </view>
</template>

<script type="text/ecmascript-6">
import dayjs from 'dayjs'
export default {
  name: 'DateTimeChange',
  inject: ['userInfo'],
  data () {
    return {
      hours: [],
      days: [],
      minutes: [],
      dateValues: [],
      hourValues: [],
      minuteValues: [],
      loading: true,
      currentDate: '',
      currentHour: '',
      currentMinute: ''
    }
  },
  props: {
    // 开始时间，格式：YYYY/MM/DD
    startTime: {
      type: String,
      default: '2019/01/01'
    },
    // 结束时间，格式：YYYY/MM/DD
    endTime: {
      type: String,
      default: '2029/01/01'
    },
    // 默认选中的时间，格式：YYYY/MM/DD HH:mm:ss
    defaultTime: {
      type: String,
      default: ''
    }
  },

  mounted () {
    this.initDate()
  },
  methods: {
    initDate () {
      console.log('initDate')
      this.dateValues = []
      this.hourValues = []
      this.minuteValues = []
      this.getDateList(this.startTime, this.endTime)
    },
    getDateList (starDay, endDay) {
      const arr = [];
      const dates = [];

      // 设置两个日期UTC时间
      const db = new Date(starDay);
      const de = new Date(endDay);
      // 获取两个日期GTM时间
      const s = db.getTime() - 24 * 60 * 60 * 1000;
      const d = de.getTime() - 24 * 60 * 60 * 1000;
      console.log(db,de)

      // 获取到两个日期之间的每一天的毫秒数
      for (let i = s; i <= d;) {
        i = i + 24 * 60 * 60 * 1000;
        arr.push(parseInt(String(i)));
      }

      // 获取每一天的时间  YY-MM-DD
      for (const j in arr) {
        const time = new Date(arr[j]);
        const year = time.getFullYear();
        const mouth = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1);
        const day = time.getDate() >= 10 ? time.getDate() : '0' + time.getDate();
        const YYMMDD = year + '/' + mouth + '/' + day;
        dates.push(YYMMDD);
      }
      this.getHourList(dates)
    },
    getHourList (days) {
      const hours = [], today = new Date();
      for (let hour = 0; hour < today.getHours() + 1; hour++) {
        hours.push(hour.toString().padStart(2, '0'));
      }

      this.getMinuteList(days, hours)
    },
    getMinuteList (days, hours) {
      const minutes = [];
      const today = new Date()
      for (let minute = 0; minute < today.getMinutes() + 1; minute++) {
        minutes.push(minute.toString().padStart(2, '0'));
      }

      this.hours = hours
      this.days = days
      this.minutes = minutes

      // 设置默认时间
      if (this.defaultTime) {
        // 如果有传入默认时间，则使用传入的时间
        const defaultDate = this.defaultTime.split(' ')[0]
        const defaultTime = this.defaultTime.split(' ')[1]
        const defaultHour = defaultTime.split(':')[0]
        const defaultMinute = defaultTime.split(':')[1]

        this.currentDate = defaultDate
        this.currentHour = defaultHour
        this.currentMinute = defaultMinute

        // 设置选中索引
        this.dateValues = [days.indexOf(defaultDate) || 0]
        this.hourValues = [hours.indexOf(defaultHour) || 0]
        this.minuteValues = [minutes.indexOf(defaultMinute) || 0]
      } else {
        // 否则使用当前时间
        const HOUR_STR = today.getHours().toString().padStart(2, '0')
        const MINUTE_STR = today.getMinutes().toString().padStart(2, '0')
        const TODAY_STR = dayjs().format('YYYY/MM/DD')

        this.currentDate = TODAY_STR
        this.currentHour = HOUR_STR
        this.currentMinute = MINUTE_STR

        // 设置选中索引
        const todayIndex = days.indexOf(TODAY_STR)
        const hourIndex = hours.indexOf(HOUR_STR)
        const minuteIndex = minutes.indexOf(MINUTE_STR)

        this.dateValues = [todayIndex >= 0 ? todayIndex : 0]
        this.hourValues = [hourIndex >= 0 ? hourIndex : 0]
        this.minuteValues = [minuteIndex >= 0 ? minuteIndex : 0]
      }

      this.loading = false
      setTimeout(() => {
        this.minuteValues = this.minuteValues
        this.loading = false
      }, 100)
      this.$emit('onComplete')
    },
    changeDate (e) {
      const { days } = this
      const { value } = e.detail
      const index = value[0]
      this.currentDate = days[index]
      // 选择过去时间需要重新初始化时分
      const today = dayjs().format('YYYY/MM/DD')
      const timeType = this.currentDate != today ? 1 : 0
      this.getAllTimeOrPartTime(timeType)
    },
    changeHour (e) {
      const { hours, days, dateValues } = this
      const { value } = e.detail
      const index = value[0]
      this.currentHour = hours[index]

      // 处理当前天切换别的小时,别的分不能选后面分到60的问题
      // const dayIndex = dateValues[0]
      // this.currentDate = days[dayIndex]
      const today = dayjs().format('YYYY/MM/DD')
      const timeType = this.currentDate != today ? 1 : 0
      this.getAllTimeOrPartTimeMinute(timeType)
    },
    changeMinutes (e) {
      const { minutes } = this
      const { value } = e.detail
      const index = value[0]
      this.currentMinute = minutes[index]
    },
    getAllTimeOrPartTime (type) {
      const today = new Date()
      const hours = [], minutes = [], hour_len = type == 1 ? 24 : today.getHours() + 1, minute_len = type == 1 ? 60 : today.getMinutes() + 1;
      for (let hour = 0; hour < hour_len; hour++) {
        hours.push(hour.toString().padStart(2, '0'));
      }
      for (let minute = 0; minute < minute_len; minute++) {
        minutes.push(minute.toString().padStart(2, '0'));
      }
      this.hours = hours
      this.minutes = minutes
    },
    getAllTimeOrPartTimeMinute (type) {
      const today = new Date()
      const currentHour = today.getHours()
      const timeType = this.currentHour != currentHour ? 1 : 0
      const minutes = [], minute_len = type == 1 || timeType == 1 ? 60 : today.getMinutes() + 1;
      for (let minute = 0; minute < minute_len; minute++) {
        minutes.push(minute.toString().padStart(2, '0'));
      }
      this.minutes = minutes
    },
    getResult () {
      let str = ''
      str = this.currentDate + ' ' + this.currentHour + ':' + this.currentMinute + ":00"
      const result = dayjs(str).format('YYYY/MM/DD HH:mm:ss')
      return result
    }
  }
}
</script>

<style scoped lang="scss">
.date-list {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  .picker {
    height: 100%;
    text-align: center;
    .view {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: toRpx(32);
      height: toRpx(72);
    }
  }
  /deep/.indicator {
    height: toRpx(72);
  }
}
</style>
