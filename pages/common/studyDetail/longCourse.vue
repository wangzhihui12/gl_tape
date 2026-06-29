<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">任务详情</view>
    </view>
    <view class="course-detail-box">
      <view class="course-detail-img-box">
        <image class="course-detail-img" src="../../../assets/images/common/course-default-bg.webp"
          mode="scaleToFill" />
        <view class="time-limit-tag" v-if="completeStatus == 0 && rowData.punishType == 1"></view>
      </view>
      <view class="course-detail-content">
        <view class="course-title">{{ rowData.taskTitle || rowData.taskName }}</view>
        <view class="course-info course-progress">
          <view class="info-label">任务进度</view>
          <view v-if="completeStatus == 1" class="info-progress-text green">
            <view class="dot-value"></view>
            已完成
          </view>
          <view class="info-progress" v-else>
              <view class="info-progress-bar" :style="{ width: Math.floor(rowData.taskProgress) + '%' }"></view>
              <view class="info-progress-text">{{ Math.floor(rowData.taskProgress) }}%</view>
          </view>
        </view>
        <view class="course-info">
          <view class="info-label">课程数</view>
          <view class="info-value">
            {{ (rowData.courseTotalCount || rowData.courseTotalCount === 0) ? `${rowData.courseTotalCount}节` : '-' }}｜
            {{ (rowData.totalDuration || rowData.totalDuration === 0) ? `${rowData.totalDuration}min` : '-' }}
          </view>
        </view>
        <view class="course-info">
          <view class="info-label">完成时间</view>
          <view class="info-value">{{ completeStatus == 0 ? formatTime(rowData.taskDeadline, 'YYYY-MM-DD HH:mm') :
            formatTime(rowData.finishDate, 'YYYY-MM-DD HH:mm') }}</view>
        </view>
      </view>
      <view class="time-limit-countdown" v-if="completeStatus == 0 && rowData.punishType == 1">
        <template v-if="!isTimeout">
          <view class="countdown-label">仅剩</view>
          <view class="countdown-num">{{ countdown.days < 10 ? '0' + countdown.days : countdown.days }}</view>
              <view class="countdown-separator">天</view>
              <view class="countdown-num">{{ countdown.hours < 10 ? '0' + countdown.hours : countdown.hours }}</view>
                  <view class="countdown-separator">:</view>
                  <view class="countdown-num">{{ countdown.minutes < 10 ? '0' + countdown.minutes : countdown.minutes
                  }}</view>
                      <view class="countdown-separator">:</view>
                      <view class="countdown-num">{{ countdown.seconds < 10 ? '0' + countdown.seconds :
                        countdown.seconds }}</view>
        </template>
        <template v-else>
          <view class="countdown-label" style="color:#B87A11;">已超时</view>
        </template>
      </view>
    </view>
    <view class="course-list-box-wrapper">
      <view class="course-list-box-title">课程列表</view>
      <scroll-view class="course-list-box" scroll-y>
        <view class="course-list-item-wrapper">
          <view class="course-list-item" @click="startStudy(index, item)" v-for="(item, index) in courseList"
            :key="index">
            <image class="course-img" src="../../../assets/images/common/long-course-default.webp" mode="scaleToFill" />
            <view class="item-content">
              <view class="item-title">{{ item.courseName }}</view>
              <view class="item-info">
                <view class="item-info-label">当前状态</view>
                <view :class="['item-info-value', item.status === 5 ? 'green' : 'orange']">
                  <view class="dot-value" :class="item.status === 5 ? 'green' : 'orange'"></view>
                  {{ item.status !== 5 ? `${statusMap[item.status]}（${item.progress === 0 ? 0 : item.progress || 0}%）` : '已完成' }}
                </view>
              </view>
              <view class="item-info">
                <view class="item-info-label">考试成绩</view>
                <view class="item-info-value">
                  <template v-if="item.status !== 5 && item.totalScore == null">待考核</template>
                  <template v-else-if="item.status !== 5 && item.totalScore != null">{{ item.totalScore }}分</template>
                  <template v-else-if="item.status === 5 && item.totalScore == null">无需考核</template>
                  <template v-else-if="item.status === 5 && item.totalScore != null">{{ item.totalScore }}分</template>
                </view>
              </view>
              <view class="item-info">
                <view class="item-info-label">课程时长</view>
                <view class="item-info-value">{{ (item.learnDuration || item.learnDuration === 0) ? `${item.learnDuration}min` : '-' }}</view>
              </view>
              <template v-if="item.status === 5">
                <image class="completed-bg" src="../../../assets/images/common/completed-bg.webp" mode="scaleToFill" />
              </template>
              <template v-else>
                <view class="item-btn">
                  开始学习
                </view>
              </template>

            </view>
          </view>
        </view>
        <!-- <template>
          <view class="end-text">到底了！</view>
        </template> -->
      </scroll-view>
    </view>
  </view>
</template>
<script>
const statusMap = {
  1: '未学习',
  2: '未完成',
  3: '待考核',
  4: '未通过',
  5: '已完成'
}
import dayjs from 'dayjs'
export default {
  data() {
    return {
      progress: 80,
      courseList: [],
      rowData: {},
      completeStatus: null,
      punishType: null,
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      isTimeout: false,
      timer: null,
      statusMap,
    }
  },
  onLoad(options) {
    const { row } = options
    const rowData = JSON.parse(decodeURIComponent(row))
    console.log(rowData, 'rowData')
    this.rowData = rowData
    if (!this.rowData.taskDeadline) this.rowData.taskDeadline = rowData.finishTime
    this.completeStatus = options.completeStatus
    this.punishType = options.punishType
    if (options.from === 'service') {
      this.getLongCourseDetail(rowData.detailId, rowData.id)
    } else {
      this.getLongCourseDetail(rowData.id)
    }
    if (this.completeStatus == 0) {
      this.initCountdown()
    }
  },
  watch: {
    // 监听rowData变化，重新初始化倒计时
    'rowData.taskDeadline'(val) {
      this.initCountdown()
    }
  },
  methods: {
    // 格式化时间
    formatTime(time, formatStr) {
      if (!time) return '-';
      return dayjs(time).format(formatStr);
    },
    backPage() {
      uni.navigateBack();
      uni.$emit('backStudyCenter')
    },
    async getLongCourseDetail(id, boxId) {
      const params = { id }
      if (boxId) {
        params.boxId = boxId
      }
      const res = await uni.$api.commonApi.getLongCourseDetail(params)
      console.log(res, 'res')
      this.courseList = res.courseList
    },
    initCountdown() {
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
    startStudy(index, item) {
      uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
        const beisenToken = res.data
        uni.$storage.set('beisenToken', res.data)
        if (beisenToken) {
          uni.$track.add({ eventCode: 'app_long_course', businessId: item.id, pagePath: '/pages/common/studyDetail/longCourse' })
          uni.navigateTo({
            url: `/pages/common/studyDetail/detail?type=long&index=${index}&courseList=${encodeURIComponent(JSON.stringify(this.courseList))}`
          })
        } else {
          uni.showToast({
            title: '培训账号未创建',
            icon: 'none'
          })
       }
      })
    }
  }
}
</script>
<style scoped lang="scss">
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

.course-detail-box {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: toRpx(32);
  background: #ffffff59;
  box-shadow: inset 0 0 16px 0 #ffffff;
  padding: toRpx(32) toRpx(48);

  .course-detail-img-box {
    position: relative;
    margin-right: toRpx(40);

    .course-detail-img {
      width: toRpx(472);
      height: toRpx(279);
      border-radius: toRpx(24);
    }

    .time-limit-tag {
      position: absolute;
      top: 0;
      left: 0;
      width: toRpx(122);
      height: toRpx(48);
      background-image: url('../../../assets/images/common/limit-page.webp');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1;
      color: #fff;
    }
  }

  .course-detail-content {
    .course-title {
      font-size: toRpx(34);
      color: #292D33;
      margin-bottom: toRpx(28);
      font-weight: 500;
    }

    .course-info {
      position: relative;
      display: flex;
      align-items: center;
      font-size: toRpx(28);

      &:not(:last-child) {
        margin-bottom: toRpx(28);
      }

      .info-label {
        width: toRpx(112);
        color: #999EA8;
        margin-right: toRpx(24);
      }

      .info-value {
        color: #666666;
      }
      .green {
        display: flex;
        align-items: center;
        color: #2CCA74;
        .dot-value {
          width: toRpx(12);
          height: toRpx(12);
          border-radius: 50%;
          background: #2CCA74;
          margin-right: toRpx(8);
        }
      }
      .info-progress {
        width: toRpx(410);
        height: toRpx(16);
        background: linear-gradient(128.8deg, rgba(117, 188, 255, .35) 0%, rgba(44, 102, 247, .35) 100%);
        border-radius: toRpx(8);

        .info-progress-text {
          color: #3B73FF;
          font-size: toRpx(24);
          position: absolute;
          top: 50%;
          right: toRpx(-72);
          transform: translateY(-50%);
        }
        

        .info-progress-bar {
          height: 100%;
          background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);
          border-radius: toRpx(8);
        }
      }
    }
  }

  .time-limit-countdown {
    position: absolute;
    right: toRpx(48);
    top: toRpx(40);
    line-height: toRpx(48);
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
      flex-basis: 0;
      // justify-content: center;
      color: #B87A11;
      width: toRpx(48);
      height: toRpx(48);
      line-height: toRpx(48);
      border-radius: toRpx(6);
      background: #b87a1126;
      margin: 0 toRpx(8);
      line-height:normal;
      padding: toRpx(10) toRpx(8) toRpx(6);
    }

    .countdown-separator {
      color: #B87A11;
    }

    .countdown-label,
    .countdown-unit {
      line-height: toRpx(48);
      color: #B87A11;
      margin: 0 toRpx(4);
    }
  }
}

.course-list-box-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - #{toRpx(610)});
  background-color: #fff;
  border-radius: toRpx(40);
  // padding: toRpx(32) toRpx(48);
  margin-top: toRpx(32);

  .course-list-box-title {
    font-size: toRpx(34);
    color: #292D33;
    font-weight: 500;
    padding: toRpx(32) toRpx(48);
  }

  .course-list-box {
    height: calc(100% - #{toRpx(110)});
    padding-bottom: toRpx(32);
  }

  .course-list-item-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: toRpx(40);
    padding: 0 toRpx(48) toRpx(32);

    .course-list-item {
      position: relative;
      height: toRpx(504);
      border-radius: toRpx(24);
      background: #ffffff;
      font-size: 0;
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
      overflow: hidden;

      .course-img {
        width: 100%;
        height: toRpx(180);
        border-radius: toRpx(24) toRpx(24) 0 0;
      }

      .item-content {
        padding: toRpx(24) toRpx(32);
      }

      .item-title {
        font-size: toRpx(30);
        color: #292D33;
        font-weight: 500;
        margin-top: toRpx(8);
        margin-bottom: toRpx(28);
        overflow: hidden; /* 超出部分隐藏 */
        white-space: nowrap; /* 文本不换行 */
        text-overflow: ellipsis; /* 超出部分显示省略号 */
      }

      .item-info {
        display: flex;
        margin-bottom: toRpx(16);
        font-size: toRpx(24);

        .item-info-label {
          color: #999EA8;
          margin-right: toRpx(24);
        }

        .item-info-value {
          color: #666666;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          &.green {
            color: #2CCA74;
          }
          &.orange {
            color: #F59619;
          }

          .dot-value {
            width: toRpx(12);
            height: toRpx(12);
            border-radius: 50%;
          
            // background: #F59619;
            margin-right: toRpx(8);
            &.green {
              background: #2CCA74;
            }
            &.orange {
              background: #F59619;
            }
          }
        }
      }

      .item-btn {
        margin-top: toRpx(32);
        width: toRpx(430.5);
        height: toRpx(56);
        border-radius: toRpx(24);
        background: #F1F7FE;
        font-size: toRpx(26);
        color: #3B73FF;
        text-align: center;
        line-height: toRpx(56);
      }

      .completed-bg {
        width: toRpx(144);
        height: toRpx(144);
        position: absolute;
        bottom: toRpx(56);
        right: toRpx(-26);
      }
    }
  }
}

.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(30) 0;
  font-size: toRpx(24);
}
</style>