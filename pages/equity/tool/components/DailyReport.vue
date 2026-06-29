<template>
  <!--  -->
  <view class="daily-report">
    <view class="common-title flex">
      填写日报
      <template v-if="orderObj.onBreak">
        <view class="common-title-btns flex">
          <select-component
            :selectList="pickerTemplateList"
            @chooseType="handleTemplagePickerChange"
            styleV2
            :disabled="filterDisabled(isEditReport) || isHmStore"
            :defaultValue="orderObj.templateType"
            ref="selectComponent"
          />
        </view>
      </template>
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
              <view :class="['car-band-form-box',{'car-band-form-box-type-2': orderObj.templateType == 2}]">
                <template v-for="(item,index) in carBandList">
                  <view
                    :class="['box',{show:index == tabIndex}]"
                    :key="index"
                  >
                    <template v-for="(i,ind) in templateList">
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
                              :maxlength="3"
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
              <template v-for="(i,index) in personalObject">
                <view
                  class="form-item flex"
                  :key="index"
                >
                  <view class="label flex">
                    {{i.label}}
                  </view>
                  <view class="value flex">
                    <input
                      class="input"
                      :type="i.type || 'text'"
                      :value="orderObj[i.key]"
                      :placeholder="i.inputPlaceholder || '请输入'"
                      placeholder-class="placeholder"
                      @blur="handleCarInputBlur($event, i , orderObj , index)"
                      :maxlength="i.maxlength || 3"
                      :key="dateKey[`${i.key}_${index}`]"
                      auto-blur
                      :disabled="filterDisabled(isEditReport)"
                    >
                  </view>
                </view>
              </template>
              <!-- <view class="form-item flex">
                <view class="label flex">
                  未触客返店人数
                </view>
                <view class="value">
                  <input
                    class="input"
                    type="number"
                    :value="carBandList[tabIndex].notDeliveryReturnCount"
                    placeholder="请输入"
                    placeholder-class="placeholder"
                    @blur="handleCarInputBlur($event, {
                      key:'notDeliveryReturnCount',
                      max:100
                    } , carBandList[tabIndex] , tabIndex)"
                    :maxlength="3"
                    auto-blur
                    :key="`notDeliveryReturnCount_${tabIndex}`"
                    :disabled="filterDisabled(isEditReport)"
                  >
                </view>
              </view> -->
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
              <template v-for="(item,index) in infoObject">
                <view
                  class="info-item"
                  :key="index"
                >
                  <view class="info-label">{{item.label}}</view>
                  <view class="info-value">{{item.format ? item.format() : carBandList[tabIndex][item.key] || 0}}</view>
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
              @click="cancel"
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
import SelectComponent from '@/components/SelectComponent.vue'

export default {
  components: {
    TypeTabComponent,
    NoticePopup,
    SelectComponent
  },
  props: {
    currentDate: String,
    currentMonth: String,
    enterType: String
  },
  name: 'DailyReport',
  data () {
    return {
      noticeObj: {},
      pickerTemplateList: Object.freeze([
        { label: '单延保', value: 1 },
        { label: '权益延保', value: 2 },
        { label: '广联权益', value: 3 },
      ]),
      isHmStore: false,
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
          key: 'extendedWarrantyToShopCount',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          refId: 'extendedWarrantyToShopCount',
        },
        {
          label: '实际售后触客数',
          key: 'afterSaleExtendedWarrantyToShopCount',
          type: 'number',
          required: false,
          min: 0,
          max: 100,
        },
        {
          label: '未触客返店人数',
          key: 'notDeliveryReturnCount',
          type: 'number',
          min: 0,
          max: 100,
        }
      ]),
      weeklyList: [],
      isEditReport: false,
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
    infoObject () {
      let { tabIndex, carBandList, orderObj: { templateType, totalOrderMoney } } = this,
        { brandType, firstBrandId } = carBandList[tabIndex],
        /**模版为广联权益 */
        TemplateType3 = templateType == 3,// 
        NotAitoAndTemplateType3 = brandType != 0 || TemplateType3, //非问界 或者 广联权益  时隐藏
        infoArray = [
          {
            label: '个人成交总金额',
            format: _ => {
              return `¥${totalOrderMoney || 0}`
            }
          },
          {
            label: `售前整车延保成交数·${brandType == 0 ? '问界' : '鸿蒙'}`,
            key: 'extendedWarrantyCount',
            hide: firstBrandId == -1 || TemplateType3
          },
          {
            label: `售后整车延保成交数·${brandType == 0 ? '问界' : '鸿蒙'}`,
            key: 'afterSaleExtendedWarrantyCount',
            hide: firstBrandId == -1 || TemplateType3
          },
          {
            label: '轮胎险成交数',
            key: 'tireWarrantyCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '安心包成交数',
            key: 'axPackageCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '安心包MAX成交数',
            key: 'axPackageMaxCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '安心包Lite成交数',
            key: 'axPackageLiteCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '安心包Pro成交数',
            key: 'axPackageProCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '电池延保成交数',
            key: 'batteryExtendedWarrantyCount',
            hide: NotAitoAndTemplateType3
          },
          {
            label: '北汽无忧成交数',
            key: 'bqWorryFreeCount',
            hide: firstBrandId != -1 || TemplateType3
          },
          {
            label: '广爱无忧成交数',
            key: 'gaWorryFreeCount',
            hide: firstBrandId != -1 || TemplateType3
          },
          {
            label: '广联权益成交数',
            key: 'glWorryFreeCount',
            hide: templateType == 1
          }
        ]
      return infoArray.filter(item => !item.hide)
    },
    personalObject () {
      let { templateType } = this.orderObj,
        personalArray = [
          {
            label: '延保退单数',
            key: 'cancelOrderCount',
            type: 'number',
            required: true,
            min: 0,
            max: 100,
            refId: 'cancelOrderCount',
            hide: templateType == 3
          },
          {
            label: '延保退单金额',
            key: 'cancelOrderMoney',
            type: 'number',
            required: true,
            maxlength: 7,
            min: 0,
            max: 9999999,
            refId: 'cancelOrderMoney',
            hide: templateType == 3
          }
        ]
      return personalArray.filter(item => !item.hide)
    },
    templateList () {
      const { hwOhterObjArray, orderObj: { templateType } } = this
      const changeKeys = ['extendedWarrantyToShopCount', 'afterSaleExtendedWarrantyToShopCount']
      const isType12 = templateType == 1 || templateType == 2
      let base = hwOhterObjArray.map(item => {
        const obj = { ...item }
        if (isType12 && changeKeys.includes(obj.key)) {
          obj.label = `延保${obj.label}`
        } else if (!isType12 && changeKeys.includes(obj.key)) {
          obj.label = `权益${obj.label}`
          obj.key = obj.key === 'extendedWarrantyToShopCount' ? 'realEquityToShopCount' : 'afterSaleRealEquityToShopCount'
          if (obj.refId) obj.refId = obj.key
        }
        return obj
      })
      if (templateType == 2) {
        const afterIndex = base.findIndex(item => item.key == 'afterSaleExtendedWarrantyToShopCount')
        if (afterIndex !== -1) {
          const inserts = [
            { label: '权益实际售前触客数', key: 'realEquityToShopCount', type: 'number', required: true, min: 0, max: 100, refId: 'realEquityToShopCount' },
            { label: '权益实际售后触客数', key: 'afterSaleRealEquityToShopCount', type: 'number', required: false, min: 0, max: 100 }
          ]
          base = [...base.slice(0, afterIndex + 1), ...inserts, ...base.slice(afterIndex + 1)]
        }
      }
      return base
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
    },
  },
  mounted () {
    uni.$track.add({
      eventCode: 'app_daily_report'
    }) //驻店日报埋点
    this.initData()
    this.isEditReport = false
  },
  methods: {
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
      const { HMCarBandId, moreTemplatingIds } = await uni.$api.systemApi.getMockData(true)
      let { userInfo } = this,
        { shopMerchantId } = userInfo,
        hmPresent = false,
        containsShangJie = false
      const data = await uni.$api.boutiqueApi.getDailyReportCarBrand({
        merchantId: shopMerchantId,
        sceneType: 0
      })
      data.map(e => {
        let { firstBrandId, firstBrandName, brandName } = e
        e.tabName = firstBrandId == -1 ? firstBrandName : brandName
        if (e.firstBrandId == HMCarBandId) hmPresent = true
        if (moreTemplatingIds.includes(+e.brandId)) containsShangJie = true
      })
      this.carBandList = data
      this.isHmStore = hmPresent && !containsShangJie
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
        sceneType: 0,
        reportTypeList: [-1]
      })
      let selectedDay = []
      params.weekDayList.map(e => {
        let { date } = e
        if (!data.includes(date)) selectedDay.push({
          date
        })
      })
      console.log(data, selectedDay)
      this.weeklyList = data
      this.$emit('setCalendarSelected', selectedDay)
    },
    async getStaffDailyReportDetail () {
      this.hideSelect()
      this.isEditReport = false
      this.loadComplete = false
      let { currentDate,
        userInfo,
        carBandList,
        hwOhterObjArray,
        orderObj,
        isHmStore,
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
        sceneType: 0,
        reportTypeList: [-1]
      })
      uni.hideLoading()
      let { brandDataList, remark } = data
      if (brandDataList && brandDataList.length) {
        carBandList = carBandList.map((item, index) => {
          let dataKeyList = ['deliveryCount', 'notDeliveryCount',
            'extendedWarrantyToShopCount', 'afterSaleExtendedWarrantyToShopCount',
            'realEquityToShopCount', 'afterSaleRealEquityToShopCount']
          dataKeyList.map(key => {
            this.dateKey[`${key}_${index}`] = Date.now()
          })
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
              deliveryCountRecord: carBand.deliveryCount,
              notDeliveryCountRecord: carBand.notDeliveryCount,
              brandId,
              brandName,
              brandType,
              tabName
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
        templateType: isHmStore ? 1 : data.templateType || 1,
        staffCount: data.staffCount,
        onBreak: data.onBreak ? data.onBreak : diffDay < 7 ? data.onBreak || 'N' : 'N',
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
        console.log(key)
      } else {
        this.orderObj[key] = ''
        this.dateKey[key] = Date.now()
      }
      if (
        this.isNotEmpty(orderObj.recordStaffCount) &&
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
      let { orderObj,
        userInfo,
        carBandList
      } = this,
        { value } = e.detail,
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
      if (['deliveryCount', 'notDeliveryCount'].includes(key)) {
        let checkName = `${key}Record`,
          checkValue = carBandList[index][checkName]
        if (
          this.isNotEmpty(item[key]) &&
          this.isNotEmpty(carBandList[index][checkName]) &&
          checkValue != value &&
          orderObj.lastStaffUuid &&
          userInfo.uuid != orderObj.lastStaffUuid) {
          let context = i.label
          this.noticeObj = {
            title: '重要提示',
            text: `${context}与 ${orderObj.lastStaffName} 提交不一致，再次确认！不一致提交日报时，${context}将被清空。`,
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
      }
    },
    async submit () {
      uni.$track.add({
        eventCode: 'app_submit_daily_report'
      }) //提交驻店日报埋点
      try {
        let { orderObj, carBandList, templateList, userInfo, orderObj:{templateType} } = this
        orderObj.isAdmin = false
        orderObj.oprBy = orderObj.staffUuid
        orderObj.sceneType = 0
        orderObj.brandDataList = carBandList
        if (orderObj.pickerValue == 0) {
          if (['', null].includes(orderObj.staffCount)) throw {
            message: '今日驻店人数（按店）',
            refId: 'staffCount'
          }
          carBandList.map((item, index) => {
            templateList.map(el => {
              if (el.required && ['', null, undefined].includes(item[el.key])) throw {
                message: `${item.tabName}${el.label}`,
                refId: `${el.refId}_${index}`,
                tabIndex: index
              }
            })
          })
        }
        if (orderObj.onBreak == 'Y') {
          orderObj.brandDataList.forEach(item => {
            // 如果是调休,店端总未触客数&实际售前触客数默认值为空默认赋值为0
            item.notDeliveryCount = item.notDeliveryCount || 0
            if(templateType == 1 || templateType == 2) item.extendedWarrantyToShopCount = item.extendedWarrantyToShopCount || 0
            if(templateType == 3 || templateType == 2) item.realEquityToShopCount = item.realEquityToShopCount || 0
            
          })
        }
        // 非调休 日报填报前参数校验
        let check = await this.dailyReportCheck(orderObj)
        console.log(check, 'check')
        if (check && !(userInfo?.isSuper || userInfo?.loginRole == 3)) return false
        uni.showLoading({
          title: '提交中',
          mask: true
        })
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
    handleTemplagePickerChange ({ item }) {
      // const oldTemplateType = this.orderObj.templateType;
      // const newTemplateType = item.value;

      // // 更新模板类型
      // this.orderObj.templateType = newTemplateType;

      // // 如果模板类型发生变化，清空 carBandList 中受模板影响的字段
      // if (oldTemplateType !== newTemplateType) {
      //   this.carBandList = this.carBandList.map(carBand => {
      //     const resetFields = {};

      //     // 所有模板共用的字段保留，但以下字段可能因模板而异，需重置
      //     const fieldsToReset = [
      //       'extendedWarrantyToShopCount',
      //       'afterSaleExtendedWarrantyToShopCount',
      //       'realEquityToShopCount',
      //       'afterSaleRealEquityToShopCount'
      //     ];

      //     fieldsToReset.forEach(key => {
      //       resetFields[key] = null;
      //     });

      //     // 可选：如果新模板是“广联权益”(3)，也清空延保相关字段（如个人退单等，但这些在 orderObj，非 carBand）
      //     return { ...carBand, ...resetFields };
      //   });

      //   // 同步更新 dateKey，触发 input 重新渲染（避免缓存问题）
      //   this.carBandList.forEach((_, index) => {
      //     ['extendedWarrantyToShopCount', 'afterSaleExtendedWarrantyToShopCount', 'realEquityToShopCount', 'afterSaleRealEquityToShopCount']
      //       .forEach(key => {
      //         this.dateKey[`${key}_${index}`] = Date.now();
      //       });
      //   });
      // }
      this.orderObj.templateType = item.value
    },
    cancel () {
      this.isEditReport = false
      this.hideSelect()
    },
    hideSelect () {
      this.$refs?.selectComponent?.hideSelect()
    },
    async dailyReportCheck (params) {
      try {
        let { carBandList } = this
        let data = await uni.$api.boutiqueApi.dailyReportCheck(params)

        if (!data) {
          return false
        }
        // 根据车型做对应的文字处理
        let context = ''
        let showModal = false
        data.forEach(item => {
          if (!item.isCheckPass) {
            showModal = true
            carBandList.forEach(el => {
              if (el.brandType == item.brandType) {
                context += `【${el.tabName}】 店端总未触客数+门店售前触客数与当月实际交车数不符，差异值${item.differenceValue
                  }，请相关驻店销售对齐核销再次提交\t\n`
              }
            })
          }
        })
        if (showModal) {
          return new Promise(resolve => {
            this.noticeObj = {
              title: '重要提示',
              text: context,
              type: 'warning',
              buttons: [
                {
                  text: '确定',
                  type: 'primary',
                  callback: _ => {
                    resolve(true)
                    this.$refs.reportNotice.close()
                  }
                }
              ]
            }
            this.$nextTick(() => this.$refs.reportNotice.open())
          })
        } else {
          return false
        }
      } catch (error) {
        return false
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
      height: toRpx(480);
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
    .car-band-form-box-type-2 {
      height: toRpx(672);
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