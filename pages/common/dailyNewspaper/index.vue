<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">展业工具</view>
    </view>
    <view class="detail-content">
      <view class="detail-left">
        <view class="common-title">
          <div :class="['sprite-icon', `icon-${assignIcon || titleIcon}-mini`]"></div>
          {{ assignTitle || title }}
        </view>
        <view class="content">
          <image class="banner" src="https://img02.glsx.com.cn/weapp/resource/app-tape/common/daily-banner.webp"
            mode="scaleToFill" />
          <view class="calendar">
            <uni-calendar ref="calendar" :clearDate="false" :endDate="endDate" :showMonth="false"
              @monthSwitch="changeMonth" backgroundColor="transparent" :selected="selectedDays" :date="currentDate"
              :calendarItemStyle="{ width: '84rpx', height: '90rpx' }" openBeforeChange @beforeChange="changeDate" />
          </view>
        </view>
      </view>
      <view class="detail-right">
        <component :ref="`ref-${componentName}`" :is="componentName" :templateData="templateData"
          :currentDate="currentDate" @changeComponent="changeComponent" @submitReport="submitReport"
          @saveReportStatus="saveReportStatus" :ReportStatus="reportStatus" />
      </view>
    </view>
    <NoticePopup ref="notice" :title="noticeObj.title" :text="noticeObj.text" :type="noticeObj.type || 'success'"
      :buttons="noticeObj.buttons"></NoticePopup>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import NoticePopup from '@/components/NoticePopup.vue'
import StaffDailyReport from './StaffDailyReport/index.vue'
import StoreDailyReport from './StoreDailyReport/index.vue'
import NegotiationDetail from './NegotiationDetail/index.vue'
import EditNegotiationDetail from './NegotiationDetail/edit.vue'
import utils from '@/utils/utils'

export default {
  components: {
    NoticePopup,
    StaffDailyReport,
    StoreDailyReport,
    NegotiationDetail,
    EditNegotiationDetail
  },
  provide() {
    return {
      sceneType: this.SCENE_TYPE,
      userInfo: this.userInfo,
      templateType: () => this.templateType,
      dailyReportRecordId: () => this.dailyReportRecordId,
      reportStatus: () => this.reportStatus
    }
  },
  data() {
    return {
      noticeObj: {},
      options: {},
      transmissionOfData: null,
      endDate: dayjs().format('YYYY-MM-DD'), // 日历结束日期
      currentDate: dayjs().format('YYYY-MM-DD'), // 当前选中日期
      currentMonth: dayjs().format('YYYY-MM'), // 当前月份
      selectedDays: [], // 填写日报日期
      lastMonth: dayjs().subtract(1, 'month').format('YYYY-MM'), // 上个月份
      enterType: '',
      templateData: [],
      assignTitle: '',
      assignIcon: '',
      dailyReportRecordId: '',
      reportStatus: ''
    }
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.back()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  computed: {
    userInfo() {
      return uni.$storage.get('userInfo')
    },
    SCENE_TYPE() {
      const { sceneType } = uni.$storage.get('userInfo')
      return Number(sceneType)
    },
    CAR_BRAND_ID() {
      const carBrandList = uni.$storage.get('carBrandList'),
        carBrandId = carBrandList.map(item => item.id)
      return carBrandId
    },
    BASE_SCENE_CODE() {
      const baseSceneCode = uni.$storage.get('baseSceneCode')
      return baseSceneCode
    },
    STORE_BASE_SCENE_CODE() {
      const storeBaseSceneCode = uni.$storage.get('storeBaseSceneCode')
      return storeBaseSceneCode
    },
    title() {
      return {
        staffdailyreport: '驻店日报',
        storedailyreport: '门店日报',
        negotiationdetail: '洽谈明细'
      }[this.componentName.toLowerCase()]
    },
    titleIcon() {
      return {
        staffdailyreport: 'daily-report',
        storedailyreport: 'store-daily-report',
        negotiationdetail: 'negotiation-detail'
      }[this.componentName.toLowerCase()]
    },
    componentName() {
      let { options } = this,
        componentName = options.componentName || ''
      return componentName
    },
    templateType() {
      return {
        staffdailyreport: 1,
        storedailyreport: 2,
        negotiationdetail: 3
      }[this.componentName.toLowerCase()]
    },
    dayList() {
      let currentMonth = dayjs(this.currentMonth).format('YYYY-MM'),
        mouthNumber = dayjs(currentMonth).daysInMonth(),
        nowYear = dayjs(currentMonth).format('YYYY'),
        nowMonth = dayjs(currentMonth).format('MM'),
        maxDay = dayjs().format('D'),
        maxMonth = dayjs().format('YYYY-MM'),
        dayNum = currentMonth != maxMonth ? mouthNumber : maxDay,
        dayList = []
      for (let i = 1; i <= dayNum; i++) {
        let date = dayjs(`${nowYear}-${nowMonth}-${i}`).format('YYYY-MM-DD')
        dayList.push(date)
      }
      return dayList
    }
  },
  onLoad(options) {
    this.options = options
    if (options.currentDate) this.setCurrentDate(options.currentDate)
    this.getReportList()
    this.getReportDetail()
  },
  onUnload() { },
  methods: {
    exitInterception(callBack) {
      this.openNotice(
        {
          text: '内容尚未保存，是否退出编辑？',
          buttons: {
            cancelText: '继续编辑',
            confirmText: '确定退出'
          }
        },
        false,
        _ => {
          if (callBack) callBack()
          else this.backPage()
        }
      )
    },
    async back() {
      const openNotice = await this.checkReport()
      if (openNotice) this.exitInterception()
      else this.backPage()
    },
    async getReportList() {
      const { uuid, shopMerchantId } = this.userInfo,
        { templateType, dayList, SCENE_TYPE: sceneType } = this
      const data = await uni.$api.dailyTemplateApi.getReportList({
        merchantId: shopMerchantId,
        staffUuid: uuid,
        templateType,
        reportStartDate: dayList[0],
        reportEndDate: dayList[dayList.length - 1],
        sceneType
      })
      let selectedDay = []
      dayList.map(e => {
        if (!data.includes(e))
          selectedDay.push({
            date: e
          })
      })
      this.selectedDays = selectedDay
    },
    async getDailyTemplate() {
      const hasCommonElement = (arrA, arrB) => {
        return arrA.some(item => arrB.includes(item))
      }
      const isSubset = (arrA, arrB) => {
        // 检查arrB的每个元素是否都在arrA中
        const setA = new Set(arrA)
        return arrB.every(item => setA.has(item))
      }
      const { templateType, CAR_BRAND_ID, BASE_SCENE_CODE ,STORE_BASE_SCENE_CODE } = this,
        data = await uni.$api.dailyTemplateApi.getDailyTemplate(templateType),
        baseCode = templateType == 2 ? STORE_BASE_SCENE_CODE : BASE_SCENE_CODE
      let templateData = Object.values(data)
        // .filter(item => {
        //   // 场景类型过滤
        //   return item.sceneType.length ? item.sceneType.includes(SCENE_TYPE) : true
        // })
        .filter(item => {
          // 品牌过滤
          if (item.filterBrandId && item.filterBrandId.length) {
            return !isSubset(item.filterBrandId, CAR_BRAND_ID)
          } else {
            return item.brandId.length ? hasCommonElement(item.brandId, CAR_BRAND_ID) : true
          }
        })
        .filter(item => {
          if (item.type == 'subform' && item.children.length) {
            item.children[0] = item.children[0].filter(child => {
              return child.brandId?.length ? hasCommonElement(child.brandId, CAR_BRAND_ID) : true
            }).filter(child => {
              return child.baseSceneCode?.length ? hasCommonElement(child.baseSceneCode, baseCode) : true
            })
          }
          if (item.type == 'group' && item.children.length) {
            item.children = item.children.filter(child => {
              // 品牌过滤
              if (child.filterBrandId && child.filterBrandId.length) {
                return !isSubset(child.filterBrandId, CAR_BRAND_ID)
              } else {
                return child.brandId?.length ? hasCommonElement(child.brandId, CAR_BRAND_ID) : true
              }
            }).filter(child => {
              // 基础场景代码过滤
              return child.baseSceneCode.length ? hasCommonElement(child.baseSceneCode, baseCode) : true
            })
          }
          // 基础场景代码过滤
          if (item.type == 'divider') {
            if (!item.qgCode) {
              let hasQY = hasCommonElement(item.qyCode, baseCode),
                hasYB = hasCommonElement(item.ybCode, baseCode)
              if (item.isQY || item.isYB) {
                if (item.isQY) return hasQY && !hasYB
                if (item.isYB) return hasYB && !hasQY
              } else return hasQY && hasYB
            } else {
              return hasCommonElement(item.qgCode, baseCode)
            }
          } else return item.baseSceneCode?.length ? hasCommonElement(item.baseSceneCode, baseCode) : true
        })
      templateData.map(e => {
        if (e.children && e.type == 'subform') {
          e.origin_children = utils.deepClone(e.children[0])
          e.children = []
        }
      })
      uni.hideLoading()
      this.templateData = templateData
    },
    setCurrentDate(currentDate) {
      this.currentDate = currentDate
      this.currentMonth = dayjs(currentDate).format('YYYY-MM')
    },
    changeCurrentDate(e) {
      this.templateData = []
      this.currentDate = e.fullDate
      this.getReportDetail()
    },
    async checkReport() {
      let componentRef = this.$refs[`ref-${this.componentName}`],
        { templateData, templateType, currentDate } = this
      if (templateType != 1) {
        if (!componentRef.isToday) return false
      } else {
        let lastDay = dayjs().subtract(7, 'day')
        if (!lastDay.isBefore(dayjs(currentDate), 'day')) return false
      }
      return templateData.length ? componentRef.saveBtnStatus : false

    },
    async changeDate(e) {
      if (e.fullDate == this.currentDate) return
      const openNotice = await this.checkReport()
      if (!openNotice) {
        this.$refs.calendar.manualChangeDate(e)
        this.changeCurrentDate(e)
        return
      }
      this.exitInterception(_ => {
        this.$refs.calendar.manualChangeDate(e)
        this.changeCurrentDate(e)
      })
    },
    openNotice({ title, text, type, buttons }, back = true, callBack) {
      this.noticeObj = {
        title: title || '重要提示',
        text: text || '确认提交后将不可再编辑，确认继续？',
        type: type || 'warning',
        buttons: [
          {
            text: buttons.cancelText || '取消',
            type: 'default',
            callback: _ => {
              this.$refs.notice.close()
            }
          },
          {
            text: buttons.confirmText || '确定提交',
            type: 'primary',
            callback: _ => {
              this.$refs.notice.close()
              if (back) uni.navigateBack()
              if (callBack && typeof callBack === 'function') callBack()
            }
          }
        ]
      }
      this.$refs.notice.open()
    },
    async getReportDetail() {
      this.reportStatus = ''
      this.dailyReportRecordId = ''
      uni.showLoading({ title: '加载中...', mask: true })
      try {
        const { uuid, shopMerchantId } = this.userInfo,
          nowDate = dayjs().format('YYYY-MM-DD'),
          { templateType, currentDate, SCENE_TYPE: sceneType } = this,
          data = await uni.$api.dailyTemplateApi.getReportDetail({
            merchantId: shopMerchantId,
            staffUuid: uuid,
            templateType,
            reportDate: currentDate,
            sceneType
          })

        if (data) {
          uni.hideLoading()
          this.dailyReportRecordId = data.id
          this.reportStatus = data.reportStatus
          let templateData = JSON.parse(data.jsonContent || '[]')
          templateData.forEach(e => {
            if (e.childrenValue && e.childrenValue.length > 0) {
              const children = e.childrenValue.map(c => {
                // 每次循环创建新的深拷贝，避免引用共享问题
                const originChildren = utils.deepClone(e.origin_children)
                originChildren.forEach(item => {
                  const key = item.key
                  const val = c[e.key]?.[key]

                  if (['string', 'number'].includes(typeof val)) {
                    item.value = val
                  } else if (val) {
                    item.value = val.text
                    item[key] = val.value
                  }
                })
                return originChildren
              })
              e.children = children
            } else {
              if (!e.children) e.children = []
            }
          })
          this.templateData = templateData
        } else {
          if (this.templateType == 1) {
            let lastDay = dayjs().subtract(7, 'day')
            if (lastDay.isBefore(dayjs(currentDate), 'day')) this.getDailyTemplate()
            else uni.hideLoading()
          } else {
            if (nowDate == currentDate) this.getDailyTemplate()
            else uni.hideLoading()
          }

        }
      } catch (error) {
        uni.showToast({ title: error, icon: 'none', mask: true })
      }
    },
    changeMonth(e) {
      this.currentMonth = `${e.year}-${e.month}`
      this.getReportList()
    },
    backPage() {
      uni.navigateBack()
    },
    // name:跳转组件名，val:跳转参数
    jump(name, val) {
      this.componentName = name
      if (val) {
        this.transmissionOfData = val
      }
    },
    changeComponent(val) {
      this.assignTitle = val.title
      this.assignIcon = val.icon
    },
    async submitReport(reportParams, skip) {
      if (this.templateType == 2 && !skip) {
        uni.hideLoading()
        this.noticeObj = {
          title: '重要提示',
          text: '确认提交后将不可再编辑，确认继续？',
          type: 'warning',
          buttons: [
            {
              text: '取消',
              type: 'default',
              callback: _ => {
                this.$refs.notice.close()
              }
            },
            {
              text: '确定提交',
              type: 'primary',
              callback: _ => {
                this.submitReport(reportParams, true)
              }
            }
          ]
        }
        this.$refs.notice.open()
        return
      }
      this.$refs.notice.close()
      uni.showLoading({ title: '提交中...', mask: true })
      const data = await uni.$api.dailyTemplateApi.submitReport(reportParams)
      uni.hideLoading()
      if (data) {
        uni.showToast({ title: '操作成功', icon: 'success', mask: true })
        this.saveReportStatus(data)
      } else uni.showToast({ title: '操作失败', icon: 'none', mask: true })
    },
    saveReportStatus(data) {
      if (data)
        setTimeout(() => {
          this.getReportList()
          this.getReportDetail()
        }, 1.5e3)
    }
  }
}
</script>
<style scoped lang="scss">
.nav-bar {
  z-index: 1;
}

.detail-content {
  display: flex;
  height: calc(100vh - #{toRpx(212)});

  .detail-left {
    width: toRpx(656);
    height: 100%;
    border-radius: toRpx(48);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    margin-right: toRpx(32);
    z-index: 1;
    overflow: hidden;

    .content {
      padding: 0 toRpx(32);
      height: calc(100% - #{toRpx(144)});

      .banner {
        width: 100%;
        height: toRpx(256);
      }

      .calendar {
        height: calc(100% - #{toRpx(304)});
        background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.5) 100%);
        margin-top: toRpx(48);
        width: calc(100% + #{toRpx(64)});
        margin-left: toMinusRpx(32);
        padding: toRpx(72) toRpx(32) 0;
        border-radius: toRpx(32) toRpx(32) 0 0;
      }
    }
  }

  .detail-right {
    width: calc(100% - #{toRpx(684)});
    height: 100%;
    border-radius: toRpx(48);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    z-index: 1;
    overflow: hidden;
  }

  .common-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: toRpx(32);
    height: toRpx(144);
    justify-content: start;
    padding-left: toRpx(32);
    transition: all 0.5s ease-in-out;

    .sprite-icon {
      margin-right: toRpx(24);
    }

    &::before,
    &::after {
      display: none;
    }
  }
}

.error-order-title {
  text-align: center;
  color: #333333;
  font-size: toRpx(40);
  font-weight: 500;
}

.error-order-content {
  text-align: center;
  color: #666666;
  font-size: toRpx(32);
  font-weight: 400;
  margin-top: toRpx(16);
}

.error-order-footer {
  margin-top: toRpx(64);
  margin-bottom: toRpx(48);
  width: 100%;

  .cancel {
    height: toRpx(88);
    border-radius: toRpx(64);
    opacity: 1;
    line-height: toRpx(88);
    background: #f0f1f5;
    width: toRpx(344);
    text-align: center;
    color: #1a1a1a;
    font-size: toRpx(32);
    font-weight: 400;
  }

  .sure {
    height: toRpx(88);
    border-radius: toRpx(64);
    opacity: 1;
    line-height: toRpx(88);
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    color: #fff;
    font-size: toRpx(32);
    font-weight: 500;
    width: 100%;
    text-align: center;
    margin-left: toRpx(32);
    margin-right: toRpx(32);
  }
}
</style>
