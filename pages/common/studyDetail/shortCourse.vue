<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
      <view class="title">任务详情</view>
    </view>
    <view class="detail-content">
      <view class="left-box">
        <view class="top-box">
          <view class="top-box-name">
            {{ courseDetail.staffName || '-' }}
            <view
              class="role-tag"
              v-for="(item, index) in courseDetail.positionList"
              :key="index"
            >{{ item }}</view>
          </view>
          <view class="top-box-info">
            <view class="top-box-info-item">驻店时间：{{ courseDetail.residentTimeTag || '-' }}</view>
            <view class="top-box-info-item">
              直属上级：
              <text class="superior-text">
                {{ courseDetail.superior || '-' }}
              </text>
            </view>
          </view>
        </view>
        <view class="bottom-box">
          <view class="bottom-box-title margin-bottom">
            <view>战败复盘</view>
            <view class="date">{{ formatTime(courseDetail.checkDate, 'YYYY年MM月DD日') }}</view>
          </view>
          <RadarChart
            :labelColors="labelColors"
            :chartData="chartData"
          />
          <view class="bottom-box-summary">
            <view>总结</view>
            <view
              class="summary-btn"
              @click="handleSummary"
            >查看</view>
          </view>
          <view class="bottom-box-title">
            <view>战败明细</view>
          </view>
          <view class="bottom-box-detail">
            <scroll-view
              scroll-y
              class="bottom-box-detail-scroll"
            >
              <view
                class="bottom-box-detail-item"
                @click="handleDetail(item)"
                v-for="(item, index) in courseDetail.defeatReviewDetailList"
                :key="index"
              >
                <view class="detail-item-box">
                  <view class="name-box">
                    <view class="name-box-text">{{ item.customerName }} </view>
                    <view class="phone">{{
                    desensitizePhone(item.customerPhone) }}</view>
                  </view>
                  <view class="role-box">
                    <view class="role-tag-box">
                      <view
                        v-if="item.carBrand"
                        class="role-tag"
                      >{{ item.carBrand }}</view>
                      <view
                        v-if="item.carModel"
                        class="role-tag"
                      >{{ item.carModel }}</view>
                    </view>
                    <view class="role-tag-score">
                      <view class="role-tag-score-text">战败</view>
                      <view class="score-line"></view> {{ Math.floor(item.inspectionScore) }} <view class="score-text-unit">分</view>
                    </view>
                  </view>
                </view>
                <view class="sprite-icon icon-detail-arrow"></view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
      <view class="right-box">
        <view class="right-box-title">
          <view class="right-box-title-left">
            <view class="sprite-icon icon-short-task-title"></view>
            短课程学习明细
          </view>
          <view
            class="time-limit-countdown"
            v-if="completeStatus == 0"
          >
            <image
              class="limit-page"
              src="../../../assets/images/common/limit-page2.webp"
              mode="scaleToFill"
            />
            <template v-if="!isTimeout">
              <view class="countdown-label">仅剩</view>
              <view class="countdown-num">{{ countdown.days < 10 ? '0' + countdown.days : countdown.days }}</view>
              <view class="countdown-separator">天</view>
              <view class="countdown-num">{{ countdown.hours < 10 ? '0' + countdown.hours : countdown.hours
                      }}</view>
              <view class="countdown-separator">:</view>
              <view class="countdown-num">{{ countdown.minutes < 10 ? '0' + countdown.minutes :
                          countdown.minutes }}</view>
              <view class="countdown-separator">:</view>
              <view class="countdown-num">{{ countdown.seconds < 10 ? '0' + countdown.seconds :
                              countdown.seconds }}</view>
            </template>
            <template v-else>
              <view
                class="countdown-label"
                style="color:#B87A11;"
              >已超时</view>
            </template>
          </view>
        </view>
        <view class="table-box">
          <view
            class="table-content"
            style="border-radius: 16px; overflow: hidden;"
          >
            <view class="table-header flex">
              <template v-for="(i, index) in qualityTitle">
                <view
                  :class="['title-item flex', `row-${index + 1}`]"
                  :key="index"
                >{{ i }}</view>
              </template>
            </view>
            <scroll-view
              scroll-y
              class="table-content-scroll"
            >
              <view
                class="table-content-item"
                v-for="(item, index) in courseDetail.aiReviewReport"
                :key="index"
              >
                <view class="row-1 flex">{{ item.tagName }}</view>
                <view class="row-2">
                  <view class="table-content-text">不足：{{ item.weakness }}</view>
                  <view class="table-content-suggest">
                    <view class="suggest-title">改善建议</view> {{ item.suggestion }}
                  </view>
                </view>
                <view class="row-3 flex">
                  <template v-if="item.examStatus == 2">
                    <view class="sprite-icon icon-task-pass"></view>
                    <view class="check-result-text">考核通过</view>
                  </template>
                  <template v-else>
                    <view
                      :class="['check-result-btn', item.examStatus == 0 ? 'disabled' : '']"
                      @click="handleExam(item)"
                    >{{item.examStatus == 0 ? '无需考核' : '去考核'}}</view>
                  </template>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </view>
    <CoursePopup
      ref="coursePopupRef"
      :popType="popupType"
      :title="popupTitle"
      @cancel="handleCancel"
    >
      <template #content>
        <template v-if="popupType == 'summary'">
          <view class="summary-content">
            {{ courseDetail.summaryCopy }}
          </view>
        </template>
        <template v-if="popupType == 'detail'">
          <view class="popup-details-box">
            <view class="detail-user-info">
              <view class="user-basic-info">
                <view class="user-name">{{courseDetail.staffName || '-'}}</view>
                <view class="user-phone">{{desensitizePhone(popupDetail.customerPhone) || '-'}}</view>
              </view>
              <view class="role-tag-score">
                <view class="role-tag-score-text">战败</view>
                <view class="score-line"></view>
                <view class="score-value">{{ Math.floor(popupDetail.inspectionScore) }}</view>
                <view class="score-text-unit">分</view>
              </view>
            </view>
            <view class="role-box">
              <view
                v-if="popupDetail.carBrand"
                class="role-tag"
              >{{ popupDetail.carBrand }}</view>
              <view
                v-if="popupDetail.carModel"
                class="role-tag"
              >{{ popupDetail.carModel }}</view>
            </view>
            <view class="detail-time-list">
              <view class="detail-time-item">开始于 <view class="detail-time-value">{{ popupDetail.receptionStartTime }}</view>
              </view>
              <view class="detail-time-item">结束于 <view class="detail-time-value">{{ popupDetail.receptionEndTime }}</view>
              </view>
              <view class="detail-time-item">共计 <view class="detail-time-value">{{ popupDetail.receptionDuration }}</view>
              </view>
            </view>
            <view class="identity-list">
              <view
                class="identity-item"
                v-for="(i, index) in popupDetail.indicatorTagList"
                :key="index"
              >
                <view class="identity-title">{{ i.tagGroupName }}</view>
                <view :class="['identity-desc', i.tagValueName === '差' ? 'bad' : '']">{{ i.tagValueName }}</view>
              </view>
            </view>
          </view>
        </template>
      </template>
    </CoursePopup>
    <learn-popup
      ref="learn"
      content="您还没有完成本次短课程学习，\n是否确定退出？"
      @confirm="backPage"
    />
  </view>
</template>
<script>
import dayjs from 'dayjs'
import CoursePopup from 'pages/common/studyDetail/components/CoursePopup.vue'
import RadarChart from 'pages/common/studyDetail/components/RadarChart.vue'
import LearnPopup from '@/components/LearnPopup.vue'
export default {
  components: {
    RadarChart,
    CoursePopup,
    LearnPopup
  },
  data () {
    return {
      chartData: {},
      labelColors: [],
      qualityTitle: Object.freeze(['课程标签', '不足/改善建议', '对练考核']),
      courseDetail: {},
      rowData: {},
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      isTimeout: false,
      timer: null,
      coursePopupVisible: false,
      popupTitle: '',
      popupType: '',
      popupDetail: {},
      aiAgentData: {},
      completeStatus: null,
      studyId: '',
      options: {}
    }
  },
  onLoad (options) {
    console.log(options, 'options')
    this.options = options
    const { row } = options
    const rowData = JSON.parse(decodeURIComponent(row))
    console.log(rowData, 'rowData')
    this.rowData = rowData
    this.completeStatus = options.completeStatus
    if (!this.rowData.taskDeadline) this.rowData.taskDeadline = rowData.finishTime
    this.refreshStudyList()
    if (this.completeStatus == 0) {
      this.initCountdown()
    }
    this.getAiAgentList()
    uni.$on('refreshStudyList', () => {
      this.refreshStudyList()
    })
  },

  onUnload () {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  watch: {
    // 监听rowData变化，重新初始化倒计时
    'rowData.taskDeadline' (val) {
      this.initCountdown()
    }
  },
  computed: {
    learnRef () {
      return this.$refs.learn
    },
  },

  onBackPress (options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.back()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  methods: {
    refreshStudyList () {
      const { options, rowData } = this
      if (options.from === 'service') {
        this.studyId = rowData.detailId
        this.getShortCourseDetail(rowData.detailId, rowData.id)
      } else {
        this.studyId = rowData.id
        this.getShortCourseDetail(rowData.id)
      }
    },
    desensitizePhone (phone) {
      if (!phone || typeof phone !== 'string') return phone;
      // 只处理11位手机号
      if (phone.length === 11) {
        return phone.substr(0, 3) + '****' + phone.substr(7, 4);
      }
      // 其他长度不处理
      return phone;
    },
    formatTime (time, formatStr) {
      return dayjs(time).format(formatStr);
    },
    backPage () {
      if (!this.coursePopupVisible) { // 防止弹窗遮罩点击后返回
        uni.$emit("backStudyCenter")
        uni.navigateBack();
      }
    },
    async getShortCourseDetail (id, boxId) {
      uni.showLoading()
      const params = { id }
      if (boxId) {
        params.boxId = boxId
      }
      const res = await uni.$api.commonApi.getShortCourseDetail(params)
      uni.hideLoading()
      // const res = {
      //   staffName: '许小奇',
      //   position: '驻店销售,带教导师',
      //   residentTimeTag: '',
      //   superior: '',
      //   defeatReviewTag: ["身份介绍", "逼单能力", "攻防能力", "案例展示", "场景塑造", "专业知识", "需求分析", "话题介入", "服务意识"],
      //   defeatReviewScore: [1, 2, 3, 1, 2, 2, 3, 3, 3]
      // }
      const _chartData = {
        categories: res.defeatReviewTag,
        series: [
          {
            data: res.defeatReviewValue
          }
        ]
      }
      this.chartData = _chartData
      if (_chartData.series && _chartData.series[0] && Array.isArray(_chartData.series[0].data)) {
        const dataArr = _chartData.series[0].data;
        let _labelColors = [];
        if (dataArr.every(val => val === 0)) {
          _labelColors = [];
        } else {
          _labelColors = dataArr.map(val => val === 1 ? '#EB4E4E' : '#666666');
        }
        console.log(_labelColors, '_labelColors')
        this.labelColors = _labelColors;
        console.log(this.labelColors, 'this.labelColors')
      }
      console.log(res, 'res')
      res.positionList = res.position.split(',')
      this.courseDetail = res
    },
    // 获取智能体
    async getAiAgentList () {
      const { phone } = uni.$storage.get("userInfo")
      const res = await uni.$api.commonApi.getAiAgentList({
        accountPhone: phone,
        ownerShipType: 1, // 1-驻店 0-总部
        agentCode: 'AI8'
      })
      this.aiAgentData = res[0]
    },
    initCountdown () {
      // 清除旧定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      // 兼容rowData未加载时
      if (!this.rowData || !this.rowData.taskDeadline) {
        this.isTimeout = false
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 }
        return
      }
      const updateCountdown = () => {
        const now = dayjs()
        const deadline = dayjs(this.rowData.taskDeadline)
        const diff = deadline.diff(now, 'second')
        if (diff <= 0) {
          this.isTimeout = true
          this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 }
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        } else {
          this.isTimeout = false
          let seconds = diff
          const days = Math.floor(seconds / (24 * 3600))
          seconds = seconds % (24 * 3600)
          const hours = Math.floor(seconds / 3600)
          seconds = seconds % 3600
          const minutes = Math.floor(seconds / 60)
          seconds = seconds % 60
          this.countdown = {
            days,
            hours,
            minutes,
            seconds
          }
        }
      }
      updateCountdown()
      this.timer = setInterval(updateCountdown, 1000)
    },
    async handleExam (item) {
      console.log(item, '===')
      if (item.examStatus == 0) {
        return
      }
      // const { checkDate } = this.rowData
      const { businessType, brandType, checkDate } = this.courseDetail
      console.log(checkDate, 'checkDate')
      let { agentUrl, domainName, taskStatus, agentCode } = this.aiAgentData
      // if (agentCode == 'AI8') {
      //   const isPermision = await this.isPermissionFunction('请打开麦克风权限')
      //   if (!isPermision) return
      // }
      if (!agentUrl) {
        return uni.showToast({
          title: '待开放',
          icon: 'none'
        })
      }
      let url = `/pages/common/aiWebview?url=${agentUrl}&domain=${domainName}&presuppositionProblem=${item.tagName}&businessType=${businessType}&brandType=${brandType}&studyId=${this.studyId}&pageTitle=AI导师`
      url += `&date=${this.formatTime(checkDate, 'YYYY-MM-DD')}`
      uni.navigateTo({ url })
    },
    handleSummary () {
      console.log(1211, '===')
      this.popupTitle = '战败总结'
      this.popupType = 'summary'
      this.coursePopupVisible = true
      this.$refs.coursePopupRef.open()
    },
    handleDetail (item) {
      this.popupTitle = '战败详情'
      this.popupType = 'detail'
      this.popupDetail = item
      this.coursePopupVisible = true
      this.$refs.coursePopupRef.open()
    },
    handleCancel () {
      this.coursePopupVisible = false
    },


    back () {
      try {
        const { aiReviewReport } = this.courseDetail
        aiReviewReport.map(e => {
          if (e.examStatus != 2) throw 1
        })
        this.backPage()
      } catch (error) {
        if (error == 1) this.learnRef.open()
        else this.backPage()
      }

    }
  }
}
</script>
<style lang="scss" scoped>
.detail-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  box-sizing: border-box;
  padding: toRpx(160) toRpx(64) 0;
}

.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 999;
  pointer-events: none;

  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
  }
}

.detail-content {
  display: flex;
  gap: toRpx(32);
  height: calc(100% - #{toRpx(80)});

  .left-box {
    width: toRpx(656);
    height: 100%;

    .top-box {
      width: 100%;
      height: toRpx(160);
      border-radius: toRpx(24);
      background: linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      padding: toRpx(32);

      &-name {
        display: flex;
        align-items: center;
        color: #333333;
        font-size: toRpx(36);
        font-weight: 500;

        .role-tag {
          height: toRpx(36);
          border-radius: toRpx(4);
          border: toRpx(2) solid #e8ecf0;
          padding: toRpx(4) toRpx(16);
          font-size: toRpx(24);
          color: #79859e;
          margin-left: toRpx(12);
          font-weight: 400;

          &:first-child {
            margin-left: toRpx(16);
          }
        }
      }

      &-info {
        display: flex;
        justify-content: space-between;
        margin-top: toRpx(24);

        &-item {
          color: #79859e;
          font-size: toRpx(24);
          font-weight: 400;
          .superior-text {
            max-width: toRpx(200);
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
          }
        }
      }
    }

    .bottom-box {
      width: 100%;
      height: calc(100% - #{toRpx(184)});
      border-radius: toRpx(24);
      background: linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      padding: toRpx(24) toRpx(32);
      margin-top: toRpx(24);

      .bottom-box-title {
        display: flex;
        justify-content: space-between;
        color: #1a1a1a;
        font-size: toRpx(28);
        font-weight: 400;
        &.margin-bottom {
          margin-bottom: toRpx(12);
        }

        .date {
          font-size: toRpx(24);
          color: #79859e;
        }
      }

      .bottom-box-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        background-color: #fff;
        border-radius: toRpx(16);
        padding: toRpx(18) toRpx(24);
        font-size: toRpx(24);
        color: #000000;
        margin-top: toRpx(24);
        margin-bottom: toRpx(32);

        .summary-btn {
          color: #3b73ff;
        }
      }

      .bottom-box-detail {
        border-radius: toRpx(24);
        margin-top: toRpx(16);
        height: calc(100% - #{toRpx(496)});
        overflow: hidden;

        .bottom-box-detail-scroll {
          height: 100%;
          border-radius: toRpx(24);
        }

        &-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: toRpx(24);
          background-color: #fff;

          &:first-child {
            border-radius: toRpx(24) toRpx(24) 0 0;
          }

          &:last-child {
            border-radius: 0 0 toRpx(24) toRpx(24);
          }

          .detail-item-box {
            width: 100%;
          }

          .name-box {
            display: flex;
            align-items: center;
            margin-bottom: toRpx(12);
            &-text {
              max-width: toRpx(312);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .phone {
              font-size: toRpx(24);
              color: #79859e;
              margin-left: toRpx(16);
            }
          }

          .role-box {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .role-tag-box {
              display: flex;
              align-items: center;
            }

            .role-tag {
              max-width: toRpx(134);
              margin-right: toRpx(8);
              font-size: toRpx(22);
              color: #79859e;
              border-radius: toRpx(4);
              border: toRpx(2) solid #e8ecf0;
              padding: toRpx(4) toRpx(8);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .role-tag-score {
              display: flex;
              align-items: center;
              font-size: toRpx(28);
              color: #292d33;
              margin-right: toRpx(26);

              .score-line {
                display: block;
                width: toRpx(2);
                height: toRpx(14);
                background-color: #d1dbe7;
                margin-left: toRpx(12);
                margin-right: toRpx(12);
              }

              .role-tag-score-text {
                font-size: toRpx(28);
                color: #eb4e4e;
              }

              .score-text-unit {
                margin-left: toRpx(4);
              }
            }
          }
        }
      }
    }
  }

  .right-box {
    flex: 1;
    background-color: #fff;
    border-radius: toRpx(32);
    height: 100%;
    padding: toRpx(32) toRpx(40);

    &-title {
      position: relative;
      display: flex;
      align-items: center;

      &-left {
        display: flex;
        align-items: center;
        font-size: toRpx(32);
        color: #333333;
        font-weight: 500;

        .icon-short-task-title {
          margin-right: toRpx(16);
        }
      }
    }

    .time-limit-countdown {
      position: absolute;
      right: 0;
      top: toRpx(8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: toRpx(28);
      z-index: 1;

      .limit-page {
        width: toRpx(122);
        height: toRpx(48);
        margin-right: toRpx(16);
      }

      .countdown-num {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #b87a11;
        width: toRpx(48);
        height: toRpx(48);
        border-radius: toRpx(4);
        background: #b87a111a;
        margin: 0 toRpx(8);
      }

      .countdown-separator {
        color: #b87a11;
      }

      .countdown-label,
      .countdown-unit {
        color: #b87a11;
        margin: 0 toRpx(4);
      }
    }

    .table-box {
      width: 100%;
      height: calc(100% - #{toRpx(104)});
      margin-top: toRpx(32);

      .table-content {
        width: 100%;
        height: 100%;

        .table-header {
          background-color: #edf3ff;
          border-radius: toRpx(16) toRpx(16) 0 0;
          height: toRpx(88);
          color: #000;
          font-size: toRpx(26);
          line-height: toRpx(40);

          .title-item {
            height: toRpx(88);
            justify-content: center;
            box-sizing: border-box;
            flex-shrink: 0;
            color: #000;
          }
        }

        .row-1 {
          width: toRpx(192);
        }

        .row-2 {
          width: toRpx(1042);
          border-right: toRpx(4) solid #fff;
          border-left: toRpx(4) solid #fff;
        }

        .row-3 {
          width: calc(100% - #{toRpx(1042 + 192)});
        }

        .table-content-scroll {
          height: calc(100% - #{toRpx(88)});

          .table-content-item {
            display: flex;
            font-size: toRpx(26);
            background-color: #fafcff;
            box-sizing: border-box;
            border-top: toRpx(4) solid #fff;

            .row-1 {
              text-align: center;
              color: #333;
              align-items: center;
            }

            .row-1,
            .row-2,
            .row-3 {
              padding: toRpx(24) toRpx(40);
              vertical-align: middle;
            }

            .row-3 {
              align-items: center;

              .check-result-text {
                color: #2cca74;
                font-size: toRpx(24);
                margin-left: toRpx(6);
              }

              .check-result-btn {
                width: toRpx(120);
                height: toRpx(56);
                text-align: center;
                line-height: toRpx(56);
                color: #fff;
                font-size: toRpx(24);
                border-radius: toRpx(40);
                background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
                &.disabled {
                  background: #d3dae6;
                  width: toRpx(140);
                }
              }
            }
          }
        }

        .table-content-text {
          color: #71747a;
          line-height: toRpx(40);
        }

        .table-content-suggest {
          line-height: toRpx(40);
          .suggest-title {
            display: inline-block;
            color: #3b73ff;
            font-size: toRpx(24);
            padding: toRpx(4) toRpx(12);
            border-radius: toRpx(8);
            background: #eaf3fe;
            margin-top: toRpx(20);
            margin-right: toRpx(16);
          }
        }
      }
    }
  }
}
// 战败详情
.popup-details-box {
  .detail-user-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .user-basic-info {
      display: flex;
      align-items: baseline;
      .user-name {
        font-size: toRpx(48);
        color: #333;
        font-weight: 500;
        margin-right: toRpx(20);
      }
      .user-phone {
        font-size: toRpx(32);
        color: #79859e;
      }
    }
    .role-tag-score {
      display: flex;
      align-items: center;
      .role-tag-score-text {
        font-size: toRpx(32);
        color: #eb4e4e;
      }
      .score-line {
        display: block;
        width: toRpx(2);
        height: toRpx(24);
        background-color: #d1dbe7;
        margin-left: toRpx(12);
        margin-right: toRpx(12);
      }
      .score-value {
        font-size: toRpx(32);
        color: #292d33;
      }
      .score-text-unit {
        font-size: toRpx(32);
        color: #292d33;
        margin-left: toRpx(4);
      }
    }
  }
  .role-box {
    display: flex;
    align-items: center;
    margin-top: toRpx(16);

    .role-tag {
      height: toRpx(44);
      line-height: toRpx(44);
      margin-right: toRpx(12);
      font-size: toRpx(22);
      color: #79859e;
      border-radius: toRpx(4);
      border: toRpx(2) solid #e8ecf0;
      padding: 0 toRpx(8);
    }
  }
  .detail-time-list {
    display: flex;
    justify-content: space-between;
    margin-top: toRpx(32);
    font-size: toRpx(32);
    .detail-time-item {
      display: flex;
      color: #999ea8;
    }
    .detail-time-value {
      color: #666;
      margin-left: toRpx(16);
    }
  }
  .identity-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: toRpx(32);
    margin-top: toRpx(48);
    .identity-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: toRpx(170);
      border-radius: toRpx(16);
      background-color: #f5f7fa;
      // margin-right: toRpx(32);
      &:nth-child(5n) {
        margin-right: 0;
      }
      .identity-title {
        font-size: toRpx(32);
        color: #383838;
      }
      .identity-desc {
        font-size: toRpx(40);
        color: #181a1f;
        margin-top: toRpx(16);
        &.bad {
          color: #eb4e4e;
        }
      }
    }
  }
}
.summary-content {
  line-height: toRpx(40);
}
</style>