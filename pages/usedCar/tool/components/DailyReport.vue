<template>
  <!--  -->
  <view class="daily-report">
    <view class="common-title">填写日报</view>
    <scroll-view
      :class="['repoet-view',{full:!isDateWithin7Days}]"
      scroll-y
      :scroll-into-view="to"
      @scroll="to = ''"
    >
      <view class="repoet-box">

        <template v-if="loadComplete">
          <view
            :class="['box',{'hide-box':!isDateWithin7Days && !orderObj.id}]"
            :key="repoetKey"
          >
            <view class="sub-title">二手车日报</view>

            <template v-for="(i,index) in reportObject">
              <view
                class="form-item flex"
                :key="index"
                :id="i.refId || ''"
              >
                <view class="label flex">
                  {{i.label}}
                  <view class="required">*</view>
                </view>
                <view class="value flex">
                  <template v-if="i.type == 'input'">
                    <input
                      class="input"
                      :type="i.inputType || 'text'"
                      :value="orderObj[i.value]"
                      :placeholder="i.placeholder || '请输入'"
                      placeholder-class="placeholder"
                      @blur="handleBlur($event, i)"
                      :disabled="filterDisabled(isEditReport)"
                      :maxlength="2"
                      :key="dateKey[i.value]"
                      auto-blur
                    >
                  </template>
                  <template v-else>
                    {{orderObj[i.value]}}
                  </template>
                  <view class="unit">台</view>
                </view>
              </view>
            </template>
          </view>
          <template v-if="!isDateWithin7Days && !orderObj.id">
            <view class="nothing flex">
              <image
                src="../../../../assets/images/common/report-no-data.webp"
                class="icon"
              />
              已超过 7 个自然日，暂不支持补填操作
            </view>
          </template>
        </template>

      </view>
    </scroll-view>
    <template v-if="isDateWithin7Days && !isFilled">
      <view class="btn-box flex">
        <template v-if="filterDisabled()">
          <template v-if="!isEditReport">
            <view
              class="btn"
              @click="isEditReport = true"
            >编辑</view>
          </template>
          <template v-else>
            <view
              class="btn cancel-btn"
              @click="isEditReport = false"
            >取消</view>
            <view
              class="btn"
              @click="submit"
            >保存</view>
          </template>
        </template>
        <template v-else>
          <view
            class="btn"
            @click="submit"
          >提交</view>
        </template>
      </view>
    </template>
    <NoticePopup
      ref="reportNotice"
      title="提交成功"
      text="您的日报已提交成功"
      type="success"
      :buttons="buttons"
      @buttonClick="back"
    ></NoticePopup>
  </view>
</template>

<script type='text/ecmascript-6'>

var weekday = require('dayjs/plugin/weekday')
import dayjs from 'dayjs'
dayjs.extend(weekday)
import NoticePopup from '@/components/NoticePopup.vue'
export default {
  components: {
    NoticePopup
  },
  props: {
    currentDate: String,
    currentMonth: String
  },
  name: 'DailyReport',
  data () {
    return {
      repoetKey: Date.now(),
      to: '',
      dateKey: {},
      loadComplete: false,
      reportObject: Object.freeze([
        {
          label: '新车下订',
          value: 'orderQuantity',
          type: 'input',
          required: true,
          inputType: 'number',
          refId: 'orderQuantity'
        },
        {
          label: '新车交付',
          value: 'deliveryQuantity',
          type: 'input',
          required: true,
          inputType: 'number',
          refId: 'deliveryQuantity'
        },

      ]),
      orderObj: {},
      weeklyList: [],
      isEditReport: false,
      isFilled: false, //是否填写过选中天日报
      buttons: Object.freeze([
        {
          text: '返回首页',
          type: 'primary'
        }
      ])
    }
  },
  computed: {
    userInfo () {
      return uni.$storage.get("userInfo")
    },
    mouthNumber () {
      return dayjs(this.currentMonth).daysInMonth()
    },
    isDateWithin7Days () {
      return dayjs().diff(dayjs(this.currentDate), 'day') < 7
    }
  },
  watch: {
    currentMonth: {
      handler (val) {
        this.setMonthDay()
      },
      deep: true,
      immediate: true
    },
    currentDate: {
      handler (val) {
        // if (this.isDateWithin7Days) 
        this.getStaffDailyReportDetail()
        // else 
      },
      deep: true,
    }
  },
  mounted () {
    uni.$track.add({
      eventCode: 'app_daily_report'
    }) //驻店日报埋点
    this.initData()
  },
  methods: {
    back () {
      uni.navigateBack()
    },
    initData () {
      const { shopMerchantId, shopMerchantName } = this.userInfo
      this.orderObj = {
        sellerMerchantId: shopMerchantId,
        sellerMerchantName: shopMerchantName,
      }
      this.getStaffDailyReportDetail()
    },
    setMonthDay () {
      let { mouthNumber } = this,
        currentMonth = dayjs(this.currentMonth).format('YYYY-MM'),
        nowYear = dayjs(currentMonth).format('YYYY'),
        nowMonth = dayjs(currentMonth).format('MM'),
        maxDay = dayjs().format('D'),
        maxMonth = dayjs().format('YYYY-MM'),
        dayNum = currentMonth < maxMonth ? mouthNumber : maxDay,
        weekDayList = []
      if (currentMonth > maxMonth) return
      for (let i = 1; i <= dayNum; i++) {
        let date = dayjs(`${nowYear}-${nowMonth}-${i}`).format('YYYY-MM-DD'),
          week = ['日', '一', '二', '三', '四', '五', '六'][dayjs(date).weekday()]
        weekDayList.push({
          day: i,
          date,
          week,
          disabled: false
        })
      }
      let startDay = weekDayList[0].date,
        endDay = weekDayList[weekDayList.length - 1].date
      let params = {
        startDate: dayjs(startDay).format('YYYY-MM-DD'),
        endDate: dayjs(endDay).format('YYYY-MM-DD'),
      }
      this.getStaffDailyReportDetailWeeklyList(params, weekDayList)
    },
    async getStaffDailyReportDetailWeeklyList (params, weekDayList) {
      let { shopMerchantId } = this.userInfo
      const data = await uni.$api.usedCarApi.getCarDailyReportList({
        sellerMerchantId: shopMerchantId,
        ...params,
      })
      let selectedDay = [],
        reportDate = data.map(e => e.date) || []
      weekDayList.map(e => {
        let { date } = e
        if (!reportDate.includes(date)) selectedDay.push({
          date
        })
      })
      this.weeklyList = data
      this.$emit('setCalendarSelected', selectedDay)
      if (reportDate.length && reportDate.includes(this.currentDate)) this.getStaffDailyReportDetail()
    },
    async getStaffDailyReportDetail () {
      this.isEditReport = false
      this.loadComplete = false
      let { currentDate,
        weeklyList,
        orderObj } = this,
        item = weeklyList.find(item => item.date == currentDate)
      if (item && item.id) {
        uni.showLoading({
          mask: true
        })
        const data = await uni.$api.usedCarApi.getCarDailyReportDetail({
          id: item.id,
        })
        if (data) {
          orderObj.id = data.id
          orderObj.orderQuantity = data.orderQuantity
          orderObj.deliveryQuantity = data.deliveryQuantity
          this.isFilled = data.isFilled
        }
        uni.hideLoading()
        this.orderObj = orderObj
        this.loadComplete = true
        this.repoetKey = Date.now()
      } else {
        delete orderObj.id
        orderObj.orderQuantity = ''
        orderObj.deliveryQuantity = ''
        this.orderObj = orderObj
        this.loadComplete = true
        this.isFilled = false
        this.repoetKey = Date.now()
      }

    },
    handleBlur (e, i) {
      let { value } = e.detail,
        key = i.value
      if (value) {
        let numbers = value.match(/\d+/g)
        numbers = numbers ? numbers.join('') : ''
        if (numbers.length > 1) numbers = numbers.replace(/^0+/, '')
        this.orderObj[key] = Math.min(Math.max(Math.floor(Number(numbers)), 0), 99).toString()
      } else this.orderObj[key] = ''
      this.dateKey[key] = Date.now()
    },
    isNotEmpty (value) {
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      )
    },
    async submit () {
      uni.showLoading({
        title: '提交中',
        mask: true
      })
      uni.$track.add({
        eventCode: 'app_submit_daily_report'
      }) //提交驻店日报埋点
      try {
        let { orderObj, currentDate } = this,
          apiName = 'addCarDailyReport'
        if (orderObj.orderQuantity == null || orderObj.orderQuantity == '') throw {
          errorText: '新车下订',
          refId: 'orderQuantity'
        }
        if (orderObj.deliveryQuantity == null || orderObj.deliveryQuantity == '') throw {
          errorText: '新车交付',
          refId: 'deliveryQuantity'
        }
        if (orderObj.id != null) apiName = 'editCarDailyReport'
        const data = await uni.$api.usedCarApi[apiName]({
          date: currentDate,
          ...orderObj
        })
        uni.hideLoading()
        if (data && data.id) {
          this.isEditReport = false
          this.$refs.reportNotice.open()
        }
      } catch (errorObj) {
        uni.hideLoading()
        if (errorObj.errorText) {
          uni.showToast({
            title: `${errorObj.errorText}不能为空`,
            icon: 'none'
          })
          this.to = errorObj.refId
        } else uni.showToast({
          title: typeof errorObj == 'string' ? errorObj : errorObj.toString(),
          icon: 'none'
        })

      }
    },
    filterDisabled (disabledStatus) {
      let { weeklyList, currentDate, isDateWithin7Days } = this,
        repoetDateList = weeklyList.map(item => item.date)
      return repoetDateList.includes(currentDate) && !disabledStatus || !isDateWithin7Days
    },
    changePicker (e, i) {
      let { value } = e.detail
      this.orderObj[i.value] = value
      this.orderObj[i.submitValue] = value == 1 ? 'Y' : 'N'
    },
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  .repoet-view {
    height: calc(100% - #{toRpx(248)});
    position: relative;
  }
  .full {
    height: calc(100% - #{toRpx(120)});
  }
  .nothing {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    // background: #f1f4ff;
    backdrop-filter: blur(8px);
    z-index: 2;
    flex-direction: column;
    justify-content: center;
    color: #999999;
    font-size: toRpx(24);
    .icon {
      width: toRpx(344);
      height: toRpx(236);
    }
  }
  .box {
    margin: 0 toRpx(48) toRpx(16);
    border-radius: toRpx(16);
    background: #ffffff;
    padding-left: toRpx(32);
    .sub-title {
      line-height: toRpx(48);
      padding: toRpx(16) toRpx(32) toRpx(8) 0;
      color: #777777;
      font-size: toRpx(24);
      .staff-name {
        margin-left: auto;
        color: #4673ff;
        font-size: toRpx(24);
      }
    }

    .form-item {
      min-height: toRpx(96);
      border-bottom: toRpx(2) solid #f7f7f6;
      padding-right: toRpx(32);
      font-size: toRpx(28);
      color: #333333;
      &:last-of-type {
        border-bottom: none;
      }
      .label {
        flex-shrink: 0;
        .required {
          color: #f24724;
          font-size: toRpx(28);
          margin-left: toRpx(8);
        }
      }
      .value {
        width: 100%;
        height: 100%;
        justify-content: flex-end;
        font-size: toRpx(28);
        .unit {
          margin-left: toRpx(16);
        }
        .input,
        .picker {
          font-size: toRpx(28);
          width: 100%;
          height: 100%;
          text-align: right;
          line-height: toRpx(96);
          justify-content: flex-end;
          .arrow {
            position: relative;
            top: toRpx(2);
            margin-left: toRpx(4);
          }
        }
        .placeholder {
          color: #999999;
          font-size: toRpx(28);
        }
        .textarea {
          width: calc(100% - #{toRpx(24)});
          margin-left: toRpx(24);
          text-align: right;
        }
      }
    }
    .name {
      line-height: toRpx(48);
      height: toRpx(72);
      color: #777777;
      font-size: toRpx(24);
      border-bottom: none;
    }
  }
  .hide-box {
    opacity: 0;
  }
  .btn-box {
    height: toRpx(128);
    padding: 0 toRpx(128);
    gap: 0 toRpx(32);
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: toRpx(80);
      border-radius: toRpx(48);
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      font-size: toRpx(28);
      font-weight: 500;
    }
    .cancel-btn {
      background: #3b73ff1a;
      color: #4673ff;
    }
  }
}
</style>