<template>
  <view class="dailog-panel" v-if="show">
    <view class="dailog-box" :style="{ width: width }">
      <view class="dailog-header flex">
        <view class="sprite-icon icon-info-icon"></view>
        <view class="dailog-title">基本工资</view>
        <view class="dailog-close" @click="close"><uni-icons type="closeempty" size="20"></uni-icons></view>
      </view>
      <view class="dailog-body">
        <view class="month-box flex">
          <view class="month-fact">
            <view class="fact-label">本月实际出勤天数：</view>
            <view class="fact-num">
              <text class="mark" v-if="baseSalaryDetail.actualAttendanceDays == baseSalaryDetail.requiredAttendanceDays && baseSalaryDetail.actualAttendanceDays">满勤</text>
              <template v-else>
                {{ baseSalaryDetail.actualAttendanceDays }}
                <text class="unit">天</text>
              </template>
              <text class="tips" v-if="holidayCount">（法定节假日加班{{ holidayCount }}天）</text>
            </view>
          </view>
          <view class="month-should">本月应出勤天数：{{ baseSalaryDetail.requiredAttendanceDays }}天</view>
        </view>
        <view class="base-box flex">
          <view class="base-item" v-for="(item, index) in baseList" :key="index">
            <view class="item-label" @click="showDetail(item, item.exceptionCount && item.tips)">
              {{ item.label }}
              <text class="item-next" v-if="item.exceptionCount && item.tips"></text>
            </view>
            <view class="item-num">
              {{ item.exceptionCount || 0 }}
              <text>次</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const WORK_TH = [
  {
    title: '考勤日期',
    value: 'clockInDate'
  },
  {
    title: '类型',
    value: 'attendanceType'
  },
  {
    title: '打卡时间',
    value: 'clockInTime'
  },
  {
    title: '扣减考勤天数',
    value: 'deductionDays'
  }
]
const LACK_TH = [
  {
    title: '考勤日期',
    value: 'clockInDate'
  },
  {
    title: '类型',
    value: 'attendanceType'
  },
  {
    title: '状态',
    value: 'exceptionState'
  },
  {
    title: '扣减考勤天数',
    value: 'deductionDays'
  }
]
const CLOTHING_TH = [
  {
    title: '考勤日期',
    value: 'clockInDate'
  },
  {
    title: '类型',
    value: 'attendanceType'
  },
  {
    title: '扣减考勤天数',
    value: 'deductionDays'
  }
]
export default {
  props: {
    width: {
      type: String,
      default: '1440rpx'
    },
    baseSalaryDetail: {
      type: Object,
      default: () => {}
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      holidayCount: 0,
      baseList: [
        {
          label: '迟到',
          tips: '迟到30分钟（含30分钟）扣减0.5小时；迟到30分钟以上1小时以内，扣减1小时；按每天8小时工作进行扣减',
          th: WORK_TH,
          value: 1
        },
        {
          label: '早退',
          th: WORK_TH,
          tips: '早退每次扣减0.5天',
          value: 2
        },
        {
          label: '缺卡',
          th: LACK_TH,
          tips: '当月前两次补卡不扣减，第三次开始每次扣减0.5天',
          value: 3
        },
        {
          label: '调休/请假',
          th: CLOTHING_TH,
          tips: '按每天8小时工作进行；请假1小时=扣减0.12天',
          value: 4
        },
        {
          label: '着装异常',
          th: CLOTHING_TH,
          desc: '着装异常',
          tips: '着装异常每次扣减0.5天',
          value: 5
        },
        {
          label: '法定节假日加班',
          value: 6
        }
      ]
    }
  },
  watch: {
    baseSalaryDetail: {
      handler(val) {
        const { exceptionInfoList } = val
        const key = exceptionInfoList.findIndex(i => i.exceptionType == 6)
        this.holidayCount = exceptionInfoList[key]?.exceptionCount
        this.baseList.forEach(item => {
          const index = exceptionInfoList.findIndex(i => i.exceptionType == item.value)
          Object.assign(item, { ...exceptionInfoList[index] })
        })
        console.log(this.baseList, 99)
      },
      deep: true
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    showDetail(item, show) {
      if (!show) return
      this.$emit('showBaseDetail', item)
    }
  }
}
</script>

<style scoped lang="scss">
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    background-image: linear-gradient(179deg, #d6e9ff 12%, #ffffff 100%); /* 顶部渐变和底部白色 */
    background-size:
      100% 110rpx,
      100% calc(100% - 110rpx); /* 分别设置渐变和白色的背景大小 */
    background-repeat: no-repeat, no-repeat; /* 确保背景不重复 */
    background-position: top, bottom; /* 分别设置渐变和白色的位置 */
    border-radius: 48rpx;
    padding-bottom: 96rpx;
    .dailog-header {
      padding: 40rpx 48rpx;
      .dailog-title {
        font-size: 40rpx;
        color: #1a1a1a;
        font-weight: 600;
        margin-top: -10rpx;
        margin-left: 16rpx;
      }
      .enlarge {
        transform: scale(1.5);
        margin-right: 30rpx;
      }
      .dailog-close {
        margin-left: auto;
        text-align: right;
        .uni-icons {
          color: #808291 !important;
          font-size: 40rpx;
        }
      }
    }
    .dailog-body {
      padding: 0 144rpx;
      .month-box {
        justify-content: space-between;
        align-items: flex-start;
        .month-fact {
          .fact-label {
            color: #181a1f;
            font-size: 32rpx;
          }
          .fact-num {
            color: #181a1f;
            font-size: 48rpx;
            margin-top: 10rpx;
            .unit {
              font-size: 32rpx;
            }
            .mark {
              color: #2cca74;
              font-size: 48rpx;
            }
            .tips {
              color: #3773f8;
              font-size: 32rpx;
            }
          }
        }
      }
      .base-box {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 54rpx;
        gap: 32rpx;
        .base-item {
          border-radius: 16rpx;
          opacity: 1;
          background: #f5f7fa;
          padding: 30rpx 48rpx;
          .item-label {
            color: #181a1f;
            font-size: 32rpx;
            display: flex;
            align-items: center;
            .item-next {
              margin-left: toRpx(14);
              width: 0;
              height: 0;
              display: block;
              border-left: toRpx(10) solid #808291;
              border-bottom: toRpx(10) solid transparent;
              border-top: toRpx(10) solid transparent;
            }
          }
          .item-num {
            color: #181a1f;
            font-size: 48rpx;
            margin-top: 8rpx;
            text {
              font-size: 32rpx;
            }
          }
        }
      }
    }
    .dailog-logo {
      text-align: center;
      image {
        width: 228rpx;
        height: 228rpx;
      }
    }
  }
}
</style>
