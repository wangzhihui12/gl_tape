<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view
        class="back"
        @click="backPage"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
      <view class="title">展业工具</view>
    </view>
    <view class="detail-content">
      <view class="detail-left">
        <view class="common-title">展业</view>
        <view class="content">
          <image
            class="banner"
            src="../../../assets/images/common/tool_banner.webp"
            mode="scaleToFill"
          />
          <template v-if="toolComponentName === 'DailyReport'">
            <uni-calendar
              ref="calendar"
              :clearDate="false"
              :endDate="endDate"
              :showMonth="false"
              @monthSwitch="currentMonth = `${$event.year}-${$event.month}`"
              @change="currentDate = $event.fulldate"
              backgroundColor="transparent"
              :selected="selectedDays"
              :date="currentDate"
            />
          </template>
          <template v-else-if="toolComponentName === 'WageAppeal'">
            <MonthCalendar @confirm="confirmMonth"></MonthCalendar>
          </template>
          <template v-else>
            <Entrance
              @entranceClick="entranceClick"
              :type="1"
            ></Entrance>
          </template>
        </view>
      </view>
      <view class="detail-right">
        <component
          :is="toolComponentName"
          @jump="jump"
          :transmission-of-data="transmissionOfData"
          :currentDate="currentDate"
          :currentMonth="currentMonth"
          :lastMonth="lastMonth"
          @setCalendarSelected="selectedDays = $event"
          :enterType="enterType"
        />
      </view>
    </view>
    <NoticePopup
      ref="notice"
      title="重要提示"
      text="当前页面暂未保存，是否确认退出"
      type="warning"
    ></NoticePopup>

    <!-- 学习中心权限弹窗 -->
    <StudyPopup
      :show.sync="showStudyPermissionPopup"
      title=""
      :width="848"
      :height="870"
      :topImage="require('@/assets/images/common/warning-notice.webp')"
      :topImageWidth="848"
      :topImageHeight="248"
      style="overflow: hidden"
    >
      <StudyCenterPermissionPopup
        :lockReason="lockReason"
        @confirm="handleStudyPermissionConfirm"
      />
    </StudyPopup>

    <!-- 异常订单锁单弹窗（与 HomeFrame 逻辑保持一致） -->
    <ErrorOrderPopup
      :show.sync="showErrorOrderPopup"
      title=""
      :width="848"
      :height="870"
      :topImage="require('@/assets/images/common/warning-notice.webp')"
      :topImageWidth="848"
      :topImageHeight="248"
      style="overflow: hidden"
    >
      <view>
        <view class="error-order-title">异常订单提醒</view>
        <view class="error-order-content">存在{{ abnormalOrderCount }} 条异常订单未处理，请尽快处理！</view>
      </view>
      <template #footer>
        <view class="flex justify-between error-order-footer">
          <view
            class="footer-btn sure flex-1"
            @click="showErrorOrderPopup = false"
          >
            好的
          </view>
        </view>
      </template>
    </ErrorOrderPopup>
  </view>
</template>

<script>
import Entrance from '@/components/Entrance.vue'
import CreateOrder from './components/CreateOrder.vue'
import DailyReport from './components/DailyReport.vue'
import DefeatOrder from './components/DefeatOrder.vue'
import OrderManagement from './components/OrderManagement.vue'
import OrderDetail from './components/OrderDetail.vue'
import UploadProofOfPayment from './components/UploadProofOfPayment.vue'
import NoticePopup from '@/components/NoticePopup.vue'
import dayjs from 'dayjs'
import { interceptionMixin } from '@/mixin/index'
import UpdateOrderInfo from './components/UpdateOrderInfo.vue'
import StudyPopup from '@/components/StudyPopup.vue'
import StudyCenterPermissionPopup from '@/components/StudyCenterPermissionPopup.vue'
import EquityManagement from './components/EquityManagement.vue'
import CreateEquity from './components/CreateEquity.vue'
import SignName from './components/SignName.vue'
import PreviewList from './components/PreviewList.vue'
import WageAppeal from '../../common/wageAppeal/index.vue'
import MonthCalendar from '../../common/components/MonthCalendar.vue'
import ErrorOrderPopup from '@/components/ErrorOrderPopup.vue'
export default {
  mixins: [interceptionMixin],
  components: {
    Entrance,
    CreateOrder,
    DailyReport,
    DefeatOrder,
    OrderManagement,
    NoticePopup,
    UploadProofOfPayment,
    OrderDetail,
    UpdateOrderInfo,
    StudyPopup,
    StudyCenterPermissionPopup,
    EquityManagement,
    CreateEquity,
    SignName,
    PreviewList,
    WageAppeal,
    MonthCalendar,
    ErrorOrderPopup
  },
  data () {
    return {
      toolComponentName: '',
      transmissionOfData: null,
      endDate: dayjs().format('YYYY-MM-DD'),
      currentDate: dayjs().format('YYYY-MM-DD'),
      currentMonth: dayjs().format('YYYY-MM'),
      selectedDays: [],
      lockReason: '',
      showStudyPermissionPopup: false,
      lastMonth: dayjs().subtract(1, 'month').format('YYYY-MM'),
      // 异常订单锁单弹窗
      showErrorOrderPopup: false,
      abnormalOrderCount: 0,
      enterType: ''
    }
  },
  onLoad (options) {
    if (options.componentName) this.toolComponentName = options.componentName
    if (options.currentDate) this.setCurrentDate(options.currentDate)
    if (options.enterType) this.enterType = options.enterType
    uni.$on('jumpToDailyReport', currentDate => {
      this.toolComponentName = 'DailyReport'
      if (currentDate) this.setCurrentDate(currentDate)
    })
    // 监听异常订单锁单事件（来自 CreateOrder.vue）
    uni.$on('showErrorOrderPopup', payload => {
      try {
        const abnormalOrderNum = payload && typeof payload === 'object' ? payload.abnormalOrderNum : payload
        if (abnormalOrderNum > 0) {
          this.showErrorOrderPopup = true
          this.abnormalOrderCount = abnormalOrderNum
        }
      } catch (e) {
        console.error('showErrorOrderPopup 事件处理异常:', e)
      }
    })
  },
  onUnload () {
    uni.$off('showErrorOrderPopup')
  },
  methods: {
    setCurrentDate (currentDate) {
      this.currentDate = currentDate
      this.currentMonth = dayjs(currentDate).format('YYYY-MM')
    },
    async entranceClick (item) {
      if (this.toolComponentName == item.name) return
      const noInterceptPage = ['DailyReport']
      // if (!noInterceptPage.includes(item.name) && ((await this.checkDailyReport()) || (await this.inspectionOfProhibitionBill()))) return
      if (!noInterceptPage.includes(item.name) && (await this.checkDailyReport())) return
      // 提示去学习中心弹窗
      const res = await this.getLimitRecord()
      if (res.lockOrder) {
        this.showStudyPermissionPopup = true
        this.lockReason = res.lockReason
        return
      }
      // 提示锁单
      // const { lockOrderFlag, abnormalOrderNum } = await this.getAbnormalOrderLock()
      //     if (lockOrderFlag == "Y" && abnormalOrderNum > 0) {
      //       this.showErrorOrderPopup = true
      //       this.abnormalOrderCount = abnormalOrderNum
      //       return
      //     }
      // 保存当前选择的组件信息，但不立即切换
      const selectedItem = item
      if (this.toolComponentName === selectedItem.name && (!this.transmissionOfData || this.transmissionOfData.type !== 'supplementOrder')) return
      // 如果当前组件是OrderManagement，直接切换组件，不显示弹窗
      // 只有从CreateOrder、DefeatOrder切换其他组件时需要二次确认
      if (this.toolComponentName !== 'CreateOrder' && this.toolComponentName !== 'DefeatOrder' && this.toolComponentName !== 'UpdateOrderInfo') {
        if (selectedItem.page) {
          uni.redirectTo({
            url:  `${selectedItem.page}?componentName=${selectedItem.name}`
          })
        } else {
          this.toolComponentName = selectedItem.name
          this.transmissionOfData = null
        }

        return
      }

      // 配置弹窗按钮
      this.$refs.notice.buttonsList = [
        {
          text: '确认退出',
          type: 'default',
          callback: () => {
            // 点击确认后才切换组件
            if (selectedItem.page) {
              uni.redirectTo({
                url: `${selectedItem.page}?componentName=${selectedItem.name}`
              })
            } else {
              this.toolComponentName = selectedItem.name
              // if (selectedItem.name !== 'CreateOrder') {
              //   this.transmissionOfData = null
              // }else {
              //   console.log(111)
              //   this.transmissionOfData = null
              // }
              this.transmissionOfData = null
              this.$refs.notice.close()
            }
          }
        },
        {
          text: '继续编辑',
          type: 'primary',
          callback: () => {
            this.$refs.notice.close()
          }
        }
      ]

      // 打开弹窗
      this.$refs.notice.open()
    },
    backPage () {
      uni.navigateBack()
    },
    // name:跳转组件名，val:跳转参数
    jump (name, val) {
      this.toolComponentName = name
      if (val) {
        this.transmissionOfData = val
      }
    },
    // 跳转学习中心
    handleStudyPermissionConfirm () {
      this.showStudyPermissionPopup = false
      uni.navigateBack({
        success: () => {
          setTimeout(() => {
            uni.$emit('studyCenter')
          }, 100)
        }
      })
    },
    // 确认选择的月份
    confirmMonth (month) {
      this.lastMonth = month
    },
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
