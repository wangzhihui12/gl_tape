<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">展业工具</view>
    </view>
    <view class="detail-content">
      <view class="detail-left">
        <view class="common-title">展业</view>
        <view class="content">
          <image class="banner" src="../../../assets/images/common/tool_banner.webp" mode="scaleToFill" />
          <template v-if="toolComponentName !== 'DailyReport'">
            <Entrance @entranceClick="entranceClick"></Entrance>
          </template>
          <template v-else>
            <uni-calendar ref="calendar" :clearDate="false" :endDate="endDate" :showMonth="false" @monthSwitch="currentMonth = `${$event.year}-${$event.month}`" openBeforeChange @beforeChange="changeDate" @change="currentDate = $event.fulldate" backgroundColor="transparent" :selected="selectedDays" :date="currentDate" />
          </template>
        </view>
      </view>
      <view class="detail-right">
        <component :ref="`detail-${toolComponentName}-Ref`" :is="toolComponentName" @jump="jump" :transmission-of-data="transmissionOfData" :currentDate="currentDate" :currentMonth="currentMonth" @setCalendarSelected="selectedDays = $event" />
      </view>
    </view>
    <NoticePopup ref="notice" title="重要提示" text="内容尚未提交，是否退出编辑？" type="warning"></NoticePopup>
  </view>
</template>

<script>
import Entrance from '@/components/Entrance.vue'
import DailyReport from './components/DailyReport.vue'
import NoticePopup from '@/components/NoticePopup.vue'
import dayjs from 'dayjs'
import { interceptionMixin } from '@/mixin/index'

export default {
  mixins: [interceptionMixin],
  components: {
    Entrance,
    DailyReport,
    NoticePopup
  },
  data() {
    return {
      toolComponentName: '',
      transmissionOfData: null,
      endDate: dayjs().format('YYYY-MM-DD'),
      currentDate: dayjs().format('YYYY-MM-DD'),
      currentMonth: dayjs().format('YYYY-MM'),
      selectedDays: []
    }
  },
  onLoad(options) {
    if (options.componentName) this.toolComponentName = options.componentName
    if (options.currentDate) this.setCurrentDate(options.currentDate)
    uni.$on('jumpToDailyReport', currentDate => {
      this.toolComponentName = 'DailyReport'
      if (currentDate) this.setCurrentDate(currentDate)
    })
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.backPage()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  methods: {
    setCurrentDate(currentDate) {
      this.currentDate = currentDate
      this.currentMonth = dayjs(currentDate).format('YYYY-MM')
    },
    async entranceClick(item) {
      // 带 page 字段的入口直接跳转到对应页面
      if (item.page) {
        uni.navigateTo({ url: item.page })
        return
      }
      if (this.toolComponentName == item.name) return
      const noInterceptPage = ['DailyReport']
      if (!noInterceptPage.includes(item.name) && (await this.checkDailyReport())) return
      // 保存当前选择的组件信息，但不立即切换
      const selectedItem = item
      if (this.toolComponentName === selectedItem.name && (!this.transmissionOfData || this.transmissionOfData.type !== 'supplementOrder')) return
      // 如果当前组件是OrderManagement，直接切换组件，不显示弹窗
      // 只有从CreateOrder、DefeatOrder切换其他组件时需要二次确认
      if (this.toolComponentName !== 'CreateOrder' && this.toolComponentName !== 'DefeatOrder') {
        this.toolComponentName = selectedItem.name
        this.transmissionOfData = null
        return
      }

      this.openNotice(selectedItem)
    },
    openNotice(selectedItem, back = true, callBack) {
      // 配置弹窗按钮
      this.$refs.notice.buttonsList = [
        {
          text: '取消',
          type: 'default',
          callback: () => {
            this.$refs.notice.close()
          }
        },
        {
          text: '确定',
          type: 'primary',
          callback: () => {
            if (selectedItem) {
              // 点击确认后才切换组件
              this.toolComponentName = selectedItem.name
              this.transmissionOfData = null
            }
            this.$refs.notice.close()
            if (back) uni.navigateBack()
            if (callBack && typeof callBack === 'function') callBack()
          }
        }
      ]

      // 打开弹窗
      this.$refs.notice.open()
    },
    async backPage() {
      const openNotice = await this.checkReport()
      if (openNotice) this.openNotice()
      else uni.navigateBack()
    },
    // name:跳转组件名，val:跳转参数
    jump(name, val) {
      this.toolComponentName = name
      if (val) {
        this.transmissionOfData = val
      }
    },
    async checkReport() {
      let dailyReportRef = this.$refs['detail-DailyReport-Ref']
      if (dailyReportRef) {
        let { isDateWithin7Days, isFilled } = dailyReportRef
        if (!isDateWithin7Days || isFilled) return false
      }
      return true
    },
    async changeDate(e) {
      if (e.fullDate == this.currentDate) return
      const openNotice = await this.checkReport()
      if (!openNotice) return this.$refs.calendar.manualChangeDate(e)
      this.openNotice(null, false, _ => {
        this.$refs.calendar.manualChangeDate(e)
      })
    }
  }
}
</script>
<style scoped lang="scss">
.detail-content {
  display: flex;
  height: calc(100vh - #{toRpx(212)});

  .detail-left {
    width: toRpx(800);
    height: 100%;
    border-radius: toRpx(48);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    margin-right: toRpx(32);
    z-index: 1;
    overflow: hidden;
    .content {
      padding: 0 toRpx(48);
      .banner {
        width: toRpx(704);
        height: toRpx(296);
        margin-top: toRpx(10);
        margin-bottom: toRpx(64);
      }
    }
  }
  .detail-right {
    width: calc(100% - #{toRpx(832)});
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
    font-size: toRpx(34);
  }
}
</style>
