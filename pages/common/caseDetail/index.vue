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
        <image class="course-detail-img" src="../../../assets/images/common/case-default-bg.webp"
          mode="scaleToFill" />
      </view>
      <view class="course-detail-content">
        <view class="course-title">{{ rowData.taskTitle || rowData.taskName }}</view>
        <view class="course-info course-progress">
          <view class="info-label">任务进度</view>
          <view v-if="rowData.completeStatus == 1" class="info-progress-text green">
            <view class="dot-value"></view>
            已完成
          </view>
          <view class="info-progress" v-else>
              <view class="info-progress-bar" :style="{ width: Math.floor(rowData.taskProgress) + '%' }"></view>
              <view class="info-progress-text">{{ Math.floor(rowData.taskProgress) }}%</view>
          </view>
        </view>
        <view class="course-info">
          <view class="info-label">案例数</view>
          <view class="info-value">
            {{ (rowData.courseTotalCount || rowData.courseTotalCount === 0) ? `${rowData.courseTotalCount}节` : '-' }}｜
            {{ (rowData.totalDuration || rowData.totalDuration === 0) ? `${rowData.totalDuration}min` : '-' }}
          </view>
        </view>
        <view class="course-info">
          <view class="info-label">完成时间</view>
          <view class="info-value">{{ rowData.completeStatus == 0 ? formatTime(rowData.taskDeadline, 'YYYY-MM-DD HH:mm') :
            formatTime(rowData.finishDate, 'YYYY-MM-DD HH:mm') }}</view>
        </view>
      </view>
    </view>
    <view class="course-list-box-wrapper">
      <view class="course-list-box-title">案例列表</view>
      <scroll-view class="course-list-box" scroll-y>
        <view class="course-list-item-wrapper">
          <view class="course-list-item" v-for="(item, index) in rowData.courseList" @click="jumpDetail(item)" :key="index">
            <view class="item-header">
              <text class="customer-name">{{ item.customerName }}</text>
              <view class="status-tag" :class="item.receptionStatus === 1 ? 'success' : 'fail'">
                {{ item.receptionStatus === 1 ? '成交' : '战败' }}
              </view>
            </view>
            <view class="car-model">{{ item.carModel }}</view>
            <view class="info-row">
              <text class="label">客户电话</text>
              <text class="value">{{ item.phoneNumber }}</text>
            </view>
            <view class="info-row">
              <text class="label">销售姓名</text>
              <text class="value">{{ item.employeeName }}</text>
            </view>
            <view class="info-row">
              <text class="label">接待时长</text>
              <text class="value">{{ item.duration }}</text>
            </view>
            <view class="info-row">
              <text class="label">开始接待</text>
              <text class="value">{{ formatTime(item.startTime, 'YYYY.MM.DD HH:mm:ss') }}</text>
            </view>
            <view class="info-row">
              <text class="label">结束接待</text>
              <text class="value">{{ formatTime(item.endTime, 'YYYY.MM.DD HH:mm:ss') }}</text>
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
      id: ''
    }
  },
  onLoad(options) {
    const { id } = options
    console.log(id, 'id')
    this.id = id
    this.getBoxDetail(id)
  },
  methods: {
    // 格式化时间
    formatTime(time, formatStr) {
      if (!time) return '-';
      return dayjs(time).format(formatStr);
    },
    backPage() {
      uni.navigateBack();
      uni.$emit('pageBack')
    },
    async getBoxDetail(id) {
      // 10451
      const res = await uni.$api.commonApi.getBoxDetail({ id })
      console.log(res, 'res')
      if (!res.msgDetail) return
      res.msgDetail.courseList.forEach(item => {
        item.recordingUrl = item.fileUrl
        item.receptionStartTime = dayjs(item.startTime).valueOf()
        item.receptionEndTime = dayjs(item.endTime).valueOf()
        item.batchId = item.id
      })
      this.rowData = res.msgDetail
    },
    jumpDetail(item) {
      const {uuid} = uni.$storage.get('userInfo')
      uni.navigateTo({
        url: `/pages/common/receptionDetail/index`,
        success:async function(res) {
          res.eventChannel.emit('getData', item)
          await uni.$api.commonApi.insertLearningRecord({
            recordingId: item.id,
            userUuid: uuid,
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
    grid-template-columns: repeat(3, 1fr);
    gap: toRpx(24);
    padding: 0 toRpx(48) toRpx(32);

    .course-list-item {
      position: relative;
      padding: toRpx(32);
      border-radius: toRpx(16);
      background: #ffffff;
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
      
      .item-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: toRpx(8);
         
         .customer-name {
            font-size: toRpx(32);
            font-weight: 500;
            color: #292D33;
         }
         
         .status-tag {
            padding: toRpx(6) toRpx(22);
            font-size: toRpx(24);
            font-weight: 500;
            border-radius: toRpx(4);
            &.success {
               color: #35C376;
               background: rgba(53, 195, 118, 0.1);
            }
            &.fail {
               color: #f24724;
               background: #f247241a;
            }
         }
      }
      
      .car-model {
         font-size: toRpx(32);
         color: #4673FF;
         font-weight: 500;
         margin-bottom: toRpx(8);
      }
      
      .info-row {
         display: flex;
         justify-content: space-between;
         margin-bottom: toRpx(8);
         font-size: toRpx(24);
         line-height: 1.5;
         
         &:last-child {
            margin-bottom: 0;
         }
         
         .label {
            color: #999EA8;
         }
         
         .value {
            color: #666666;
         }
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