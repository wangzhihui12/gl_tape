<template>
  <!--  -->
  <view class="daily-report">
    <view class="common-title flex">
      填写日报
      <!-- <view class="common-title-btns flex">
        <view class="title-btn">{{orderObj.staffName}}</view>
        <view class="title-btn">轻改</view>
      </view> -->
    </view>
    <scroll-view
      :class="['repoet-view',{full:!orderObj.isDateWithin7Days}]"
      scroll-y
      :scroll-into-view="to"
      @scroll="to = ''"
    >
      <view class="repoet-box">
        <template v-if="loadComplete">
          <view :class="[{'hide-box':!orderObj.isDateWithin7Days && !orderObj.onBreak}]">
            <view class="box">
              <view class="sub-title">驻店日报</view>
              <template v-for="(i,index) in reportObject">
                <view
                  class="form-item flex"
                  :key="index"
                  :id="i.refId || ''"
                >
                  <view class="label flex">
                    {{i.label}}
                    <template v-if="index == 0 || (i.required && orderObj.pickerValue == 0)">
                      <view class="required">*</view>
                    </template>
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
                        :maxlength="3"
                        :key="dateKey[i.value]"
                        auto-blur
                      >
                    </template>
                    <template v-else-if="i.type == 'picker'">
                      <view class="picker flex">
                        <template v-for="(item,ind) in i.range">
                          <view
                            class="picker-item flex"
                            :key="`${index}_${ind}`"
                            @click="changePicker(item.id, i)"
                          >
                            <view class="icon">
                              <template v-if="item.id == orderObj[i.submitValue]">
                                <uni-icons
                                  type="checkbox-filled"
                                  :size="18"
                                  color="#3B73FF"
                                ></uni-icons>
                              </template>
                              <template v-else>
                                <uni-icons
                                  type="circle"
                                  :size="18"
                                  color="#8C8C8C"
                                ></uni-icons>
                              </template>
                            </view>
                            {{item.name}}
                          </view>
                        </template>
                      </view>
                    </template>
                    <template v-else>
                      {{orderObj[i.value]}}
                    </template>
                  </view>
                </view>
              </template>
            </view>
            <view class="car-band-box">
              <type-tab-component
                styleV2
                :typeList="carBandList"
                :tabIndex.sync="tabIndex"
                nameKey="tabName"
              ></type-tab-component>
              <view
                class="car-band-form-box"
                :style="[{height: `${filterTemplateList(carBandList[tabIndex]).length * 96}rpx`}]"
              >
                <template v-for="(item,index) in carBandList">
                  <view
                    :class="['box',{show:index == tabIndex}]"
                    :key="index"
                  >
                    <template v-for="(i,ind) in filterTemplateList(item)">
                      <view
                        :class="['form-item flex',{name:i.name}]"
                        :key="`${index}_${ind}`"
                        :id="i.refId ? `${i.refId}_${index}` : ''"
                      >
                        <view class="label flex">
                          {{i.label}}
                          <template v-if="i.required && orderObj.pickerValue == 0">
                            <view class="required">*</view>
                          </template>
                        </view>
                        <view class="value flex">
                          <template v-if="filterDisabled(isEditReport) || i.disabled">
                            <template v-if="item[i.key] != null">
                              {{item[i.key] }}
                            </template>
                            <template v-else>
                              <view class="placeholder">{{i.inputPlaceholder || '请输入'}}</view>
                            </template>
                          </template>
                          <template v-else>
                            <input
                              class="input"
                              :type="i.type || 'text'"
                              :value="item[i.key]"
                              :placeholder="i.inputPlaceholder || '请输入'"
                              placeholder-class="placeholder"
                              @blur="handleCarInputBlur($event, i , item , index)"
                              :maxlength="i.maxlength || 3"
                              :key="dateKey[`${i.key}_${index}`]"
                              auto-blur
                            >
                          </template>
                        </view>
                      </view>
                    </template>
                  </view>
                </template>
              </view>
            </view>
            <view class="box">
              <view class="sub-title">个人日报</view>
              <view class="form-item flex">
                <view class="label flex">
                  备注
                </view>
                <view class="value">
                  <textarea
                    class="textarea"
                    v-model="orderObj.remark"
                    placeholder="请输入 (500字以内)"
                    placeholder-class="placeholder"
                    confirm-type="done"
                    auto-height
                    :maxlength="500"
                    :disabled="filterDisabled(isEditReport)"
                  ></textarea>
                </view>
              </view>
            </view>
            <view class="box info">
              <template v-for="(item,index) in infoObj">
                <view
                  class="info-item"
                  :key="index"
                >
                  <view class="info-label">{{item.label}}</view>
                  <view class="info-value">{{item.format()}}</view>
                </view>
              </template>
            </view>
            <view class="block"></view>
          </view>
          <template v-if="!orderObj.isDateWithin7Days && !orderObj.onBreak">
            <view class="nothing flex">
              <image
                src="../../../../assets/images/common/report-no-data.webp"
                class="icon"
              />
              暂不支持补填操作
            </view>
          </template>
        </template>
      </view>

    </scroll-view>
    <template v-if="orderObj.isDateWithin7Days">
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
      :title="noticeObj.title"
      :text="noticeObj.text"
      :type="noticeObj.type || 'success'"
      :buttons="noticeObj.buttons"
    ></NoticePopup>
  </view>
</template>

<script type='text/ecmascript-6'>

var weekday = require('dayjs/plugin/weekday')
import dayjs from 'dayjs'
dayjs.extend(weekday)
import TypeTabComponent from '@/components/TypeTabComponent.vue'
import NoticePopup from '@/components/NoticePopup.vue'
export default {
  components: {
    TypeTabComponent,
    NoticePopup
  },
  props: {
    currentDate: String,
    currentMonth: String,
    enterType: String,
  },
  name: 'DailyReport',
  data () {
    return {
      noticeObj: {},
      tabIndex: 0,
      to: '',
      dateKey: {},
      loadComplete: false,
      reportObject: Object.freeze([
        {
          label: '当日调休',
          value: 'pickerValue',
          type: 'picker',
          required: true,
          rangeKey: 'name',
          range: [
            { id: 'N', name: '在岗' },
            { id: 'Y', name: '调休' }
          ],
          submitValue: 'onBreak'
        },
        {
          label: '今日驻店人数（按店）',
          value: 'staffCount',
          type: 'input',
          required: true,
          inputType: 'number',
          refId: 'staffCount'
        },
      ]),
      orderObj: {},
      carBandList: [],
      hwOhterObjArray: Object.freeze([
        {
          label: '店端实际交车数',
          key: 'deliveryCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          refId: 'deliveryCount',
        },
        {
          label: '店端总未触客数',
          key: 'notDeliveryCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          refId: 'notDeliveryCount',
        },
        {
          label: '实际售前触客数',
          key: 'equityToShopCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          inputPlaceholder: '',
          refId: 'equityToShopCount',
        },
        {
          label: '实际售后触客数',
          key: 'afterSaleEquityToShopCount',
          type: 'number',
          required: false,
          min: 0,
          max: 100,
        }
      ]),
      defaultObjArray: Object.freeze([
        {
          label: '店端实际交车数',
          key: 'deliveryCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          refId: 'deliveryCount',
        },
        {
          label: '实际售前触客数',
          key: 'equityToShopCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          inputPlaceholder: '',
          refId: 'equityToShopCount',
        },
        {
          label: '实际售后触客数',
          key: 'afterSaleEquityToShopCount',
          type: 'number',
          required: false,
          min: 0,
          max: 100,
        },
        {
          label: '今日店端实际发券数',
          key: 'issueCouponCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          inputPlaceholder: '',
          blurFun: 'handleIssueCouponCountBlur'
        },
        {
          label: '本月待邀约',
          key: 'waitInviteCount',
          type: 'number',
          required: true,
          min: 0,
          max: 3000,
          maxlength: 4,
          inputPlaceholder: ''
        },
        {
          label: '今日流失',
          key: 'customerLossCount',
          type: 'number',
          required: true,
          min: 0,
          max: 3000,
          maxlength: 4,
          inputPlaceholder: ''
        },
      ]),
      weeklyList: [],
      isEditReport: false,
      buttons: Object.freeze([
        {
          text: '返回首页',
          type: 'primary'
        }
      ]),
      infoObj: Object.freeze([
        {
          label: '今日成交数',
          format: () => {
            let { carBandList, tabIndex } = this,
              item = carBandList[tabIndex] || {}
            return item.totalOrderCount || 0
          }
        },
        {
          label: '个人成交总金额',
          format: _ => {
            return `¥${this.orderObj.totalOrderMoney || 0}`
          }
        }
      ]),
      editableDay: null
    }
  },
  computed: {
    userInfo () {
      return uni.$storage.get("userInfo")
    },
    mouthNumber () {
      return dayjs(this.currentMonth).daysInMonth()
    },
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
        if (this.carBandList.length) this.getStaffDailyReportDetail()
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
    async initData () {
      let inT1T5 = await uni.$api.commonApi.checkTodayInT1T5(),
        { merchantId, merchantName, name, uuid, shopMerchantId, shopMerchantName } = this.userInfo
      this.orderObj = {
        yqMerchantId: merchantId,
        yqMerchantName: merchantName,
        staffName: name,
        staffUuid: uuid,
        merchantId: shopMerchantId,
        merchantName: shopMerchantName
      }
      if (inT1T5) this.editableDay = dayjs().subtract(1, 'M').startOf('M')
      this.getDailyReportCarBrand()
    },
    async getDailyReportCarBrand () {
      let { userInfo } = this,
        { shopMerchantId } = userInfo
      const data = await uni.$api.boutiqueApi.getDailyReportCarBrand({
        merchantId: shopMerchantId,
        sceneType: 1
      })
      data.map(e => {
        let { firstBrandId, firstBrandName, brandName } = e
        e.tabName = firstBrandId == -1 ? firstBrandName : brandName
      })
      this.carBandList = data
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
        weekDayList,
        yearMonth: currentMonth,
        starDay: 1,
        starDayLabel: dayjs(startDay).format('YYYY/MM/DD'),
        reportStartDate: startDay,
        endDayLabel: dayjs(endDay).format('YYYY/MM/DD'),
        reportEndDate: endDay,
        formatYearMonth: currentMonth
      }
      this.getStaffDailyReportDetailWeeklyList(params)
    },
    async getStaffDailyReportDetailWeeklyList (params) {
      let { shopMerchantId, merchantId, uuid } = this.userInfo
      const data = await uni.$api.boutiqueApi.getStaffDailyReportDetailWeeklyList({
        staffUuid: uuid,
        yqMerchantId: merchantId,
        merchantId: shopMerchantId,
        ...params,
        sceneType: 1,
        reportTypeList: [-1]
      })
      let selectedDay = []
      params.weekDayList.map(e => {
        let { date } = e
        if (!data.includes(date)) selectedDay.push({
          date
        })
      })
      this.weeklyList = data
      this.$emit('setCalendarSelected', selectedDay)
    },
    async getStaffDailyReportDetail () {
      this.isEditReport = false
      this.loadComplete = false
      let {
        currentDate,
        userInfo,
        carBandList,
        hwOhterObjArray,
        orderObj,
        editableDay
      } = this,
        { shopMerchantId, merchantId, uuid } = userInfo
      uni.showLoading({
        mask: true
      })
      const data = await uni.$api.boutiqueApi.getStaffDailyReportDetail({
        yqMerchantId: merchantId,
        merchantId: shopMerchantId,
        staffUuid: uuid,
        reportDate: currentDate,
        sceneType: 1,
        reportTypeList: [-1]
      })
      uni.hideLoading()
      let { brandDataList, remark } = data
      if (brandDataList && brandDataList.length) {
        carBandList = carBandList.map((item, index) => {
          this.dateKey[`deliveryCount_${index}`] = Date.now()
          this.dateKey[`notDeliveryCount_${index}`] = Date.now()
          this.dateKey[`equityToShopCount_${index}`] = Date.now()
          this.dateKey[`afterSaleEquityToShopCount_${index}`] = Date.now()
          let carBand = brandDataList.find(ele => {
            if ([0, 1, 3, 4, 5, 6].includes(ele.brandType)) {
              return ele.brandType == item.brandType
            } else if (ele.brandType == 2) {
              return ele.firstBrandId == item.firstBrandId
            }
          })
          if (carBand != null) {
            let {
              firstBrandId,
              firstBrandName,
              brandId,
              brandName,
              brandType,
              tabName
            } = item
            item = {
              ...carBand,
              firstBrandId,
              firstBrandName,
              brandId,
              brandName,
              brandType,
              tabName
            }
            if (item.firstBrandId == -1) {
              item.issueCouponCount = item.issueCouponCount != null ? item.issueCouponCount : item.recordIssueCouponCount || 0
            }
          } else {
            hwOhterObjArray.forEach(e => {
              item[e.key] = null
            })
          }
          return item
        })
      }
      let diffDay = dayjs().diff(dayjs(currentDate), 'day'),
        disabledReport = false
      if (editableDay && editableDay.diff(dayjs(currentDate), 'day') > 0) disabledReport = true
      this.hwOhterObjArray = hwOhterObjArray
      this.carBandList = carBandList
      this.orderObj = {
        ...orderObj,
        reportDate: currentDate,
        isDateWithin7Days: editableDay ? !disabledReport : diffDay < 7,
        remark,
        lastStaffName: data.lastStaffName,
        lastStaffUuid: data.lastStaffUuid,
        recordStaffCount: data.staffCount,
        totalOrderMoney: data.totalOrderMoney,
        totalOrderCount: data.totalOrderCount,
        glWorryFreeCount: data.glWorryFreeCount,
        cancelOrderCount: data.cancelOrderCount,
        cancelOrderMoney: data.cancelOrderMoney,
        templateType: data.templateType || 0,
        staffCount: data.staffCount,
        onBreak: data.onBreak ? data.onBreak : diffDay < 7 ? data.onBreak || 'N' : '',
        pickerValue: data.onBreak == 'Y' ? 1 : 0,
        staffCountError: false,
      }
      this.tabIndex = 0
      this.loadComplete = true
      this.dateKey.staffCount = Date.now()
    },
    handleBlur (e, i) {
      let { value } = e.detail,
        { orderObj, userInfo } = this,
        key = i.value
      if (value) {
        let numbers = value.match(/\d+/g)
        numbers = numbers ? numbers.join('') : ''
        if (numbers.length > 1) numbers = numbers.replace(/^0+/, '')
        this.orderObj[key] = Math.min(Math.max(Number(numbers), 0), 100).toString()
        this.dateKey[key] = Date.now()
      } else {
        this.orderObj[key] = ''
        this.dateKey[key] = Date.now()
      }
      if (
        this.isNotEmpty(orderObj.recordStaffCount) &&
        this.isNotEmpty(value) &&
        orderObj.recordStaffCount != value &&
        orderObj.lastStaffUuid &&
        userInfo.uuid != orderObj.lastStaffUuid
      ) {
        this.noticeObj = {
          title: '重要提示',
          text: `今日驻店人数与 ${orderObj.lastStaffName} 提交不一致，再次确认！不一致提交日报时，今日驻店人数将被清空。`,
          type: 'warning',
          buttons: [
            {
              text: '确定',
              type: 'primary',
            }
          ]
        }
        this.$nextTick(() => this.$refs.reportNotice.open())
      }
    },
    isNotEmpty (value) {
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      )
    },
    handleCarInputBlur (e, i, item, index) {
      let { value } = e.detail,
        { key, max } = i
      if (value) {
        let numbers = value.match(/\d+/g)
        numbers = numbers ? numbers.join('') : ''
        if (numbers.length > 1) numbers = numbers.replace(/^0+/, '')
        item[key] = Math.min(Math.max(Number(numbers), 0), max).toString()
        this.dateKey[`${key}_${index}`] = Date.now()
      } else {
        item[key] = ''
        this.dateKey[`${key}_${index}`] = Date.now()
      }
      if (i.blurFun) this[i.blurFun](item, index)
    },
    handleIssueCouponCountBlur (item) {
      if (item.issueCouponCount < item.recordIssueCouponCount) {
        uni.showToast({
          title: `填写的今日店端实际发券数不能小于实际发券数！当前实际发券数=${item.recordIssueCouponCount}`,
          icon: 'none'
        })
        return true
      }
      return false
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
        let { orderObj, carBandList, hwOhterObjArray, defaultObjArray } = this,
          couponFlag = false
        orderObj.isAdmin = false
        orderObj.oprBy = orderObj.staffUuid
        orderObj.sceneType = 1
        orderObj.brandDataList = carBandList
        if (couponFlag) return
        if (orderObj.pickerValue == 0) {
          if (['', null].includes(orderObj.staffCount)) throw {
            message: '今日驻店人数（按店）',
            refId: 'staffCount'
          }
          carBandList.map((item, index) => {
            if (item.firstBrandId == -1) {
              defaultObjArray.map(el => {
                if (el.required && ['', null].includes(item[el.key])) throw {
                  message: `${item.tabName}${el.label}`,
                  refId: `${el.refId}_${index}`,
                  tabIndex: index
                }
              })
              couponFlag = this.handleIssueCouponCountBlur(item)
            }
            else hwOhterObjArray.map(el => {
              if (el.required && ['', null].includes(item[el.key])) throw {
                message: `${item.tabName}${el.label}`,
                refId: `${el.refId}_${index}`,
                tabIndex: index
              }
            })
          })
        }
        if (couponFlag) return
        if (orderObj.onBreak == 'Y') {
          orderObj.brandDataList.forEach(item => {
            item.notDeliveryCount = item.notDeliveryCount || 0
            item.equityToShopCount = item.equityToShopCount || 0
          })
        }
        const data = await uni.$api.boutiqueApi.saveStaffDailyReport(orderObj)
        uni.hideLoading()
        if (data) {
          let _text = '返回首页'
          if (this.enterType == 'wageAppeal') _text = '返回上一页'
          this.isEditReport = false
          this.noticeObj = {
            title: '提交成功',
            text: '您的日报已提交成功',
            type: 'success',
            buttons: [
              {
                text: _text,
                type: 'primary',
                callback: _ => {
                  uni.navigateBack()
                  if (this.enterType == 'wageAppeal') uni.$emit('backToWageAppeal')
                }
              }
            ]
          }
          this.$nextTick(() => this.$refs.reportNotice.open())
        }
      } catch (errorObj) {
        uni.hideLoading()
        if (errorObj.tabIndex != null) this.tabIndex = errorObj.tabIndex
        if (errorObj.message) {
          uni.showToast({
            title: `${errorObj.message}不能为空`,
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
      let { weeklyList, currentDate, orderObj: { isDateWithin7Days } } = this
      return weeklyList.includes(currentDate) && !disabledStatus || !isDateWithin7Days
    },
    changePicker (value, i) {
      const disabled = this.filterDisabled(this.isEditReport)
      if (disabled) return
      this.orderObj[i.value] = {
        'Y': 1,
        'N': 0
      }[value]
      this.orderObj[i.submitValue] = value
    },
    filterTemplateList (item) {
      let { hwOhterObjArray, defaultObjArray, orderObj: { templateType } } = this
      if (item.firstBrandId == -1) {
        return defaultObjArray
      }
      if (templateType == 3) {
        return hwOhterObjArray.filter(function (item) {
          return item.templateValue != 3
        })
      } else {
        return hwOhterObjArray
      }
    },
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  .hide-box {
    opacity: 0;
    height: 100%;
    overflow: hidden;
  }
  .common-title-btns {
    margin: 0 toRpx(48) 0 auto;
    gap: toRpx(16);
    .title-btn {
      height: toRpx(80);
      border-radius: toRpx(16);
      background: #3b73ff1a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 toRpx(40);
      color: #333333;
      font-size: toRpx(28);
    }
  }

  .repoet-view {
    height: calc(100% - #{toRpx(248)});
    position: relative;
    .repoet-box {
      height: 100%;
    }
  }
  .full {
    height: calc(100% - #{toRpx(120)});
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
        margin-right: toRpx(16);
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

        .input,
        .picker {
          width: 100%;
          height: 100%;
          text-align: right;
          line-height: toRpx(96);
          justify-content: flex-end;
          font-size: toRpx(28);
        }
        .picker {
          gap: toRpx(48);
          &-item {
            line-height: toRpx(34);
            .icon {
              margin-right: toRpx(10);
              height: toRpx(32);
            }
          }
        }
        .placeholder {
          color: #999999;
          font-size: toRpx(28);
          line-height: toRpx(28);
        }
        .textarea {
          width: calc(100% - #{toRpx(24)});
          text-align: right;
          margin: toRpx(10) 0 0 toRpx(24);
          // line-height: toRpx(28);
          font-size: toRpx(28);
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
  .car-band-box {
    margin: 0 toRpx(48) toRpx(16);
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    overflow: hidden;
    border-radius: toRpx(32);
    .car-band-form-box {
      position: relative;
      .box {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        visibility: hidden;
      }
      .show {
        visibility: visible;
      }
    }
    .box {
      margin: 0;
      border-radius: 0 0 toRpx(32);
    }
  }
  .info {
    display: flex;
    padding: 0 toRpx(32) toRpx(16);
    flex-wrap: wrap;
    &-item {
      width: 25%;
      color: #222222;
      font-size: toRpx(28);
      font-weight: 500;
    }
    &-label {
      color: #777777;
      font-size: toRpx(24);
      line-height: toRpx(48);
      padding: toRpx(24) 0 toRpx(8);
    }
    &-value {
      padding-bottom: toRpx(8);
    }
  }
  .block {
    width: 100%;
    height: toRpx(16);
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
}
</style>