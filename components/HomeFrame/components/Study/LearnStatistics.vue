<!-- 累计学习 -->
<template>
  <view :class="['learn-statistics', isBeisen ? 'big-height' : 'small-height']">
    <!-- 北森帐号显示累计时长 -->
    <view class="learn-statistics-title" v-if="isBeisen">累计学习</view>
    <view class="statistics-content" v-if="isBeisen">
      <view class="statistics-item ">
        <view class="statistics-number blue-number">{{ dataInfo.learnDurationTotal || 0 }}</view>
        <view class="statistics-unit blue-number">小时</view>
      </view>
      <view class="statistics-item">
        <view class="text">排名</view>
        <view class="statistics-rank">{{ dataInfo.learnDurationRank || '-' }}</view>
        <view class="statistics-unit">名</view>
      </view>
    </view>
    <view :class="['progress-box', progressList.filter(item => !item.hidden).length === 1 ? 'only-one' : '']">
      <template v-for="(item, index) in progressList">
        <view :class="['progress-item', isBeisen ? 'bg' : '']" :key="index" v-if="!item.hidden">
          <view :class="['progress-item-title', isBeisen ? '' : 'title']">{{ item.title }}</view>
          <view class="progress-item-value">
            <view :class="['number', isBeisen ? '' : 'blue-number']">{{ dataInfo[item.key] || dataInfo[item.key] == 0 ?
              dataInfo[item.key] : '-' }}</view>
            <view :class="['unit', isBeisen ? '' : 'blue-unit']">{{
              item.unit }}</view>
          </view>
          <view class="progress-bar-box" v-if="dataInfo[item.key] || dataInfo[item.key] == 0">
            <view :class="['progress-bar', isBeisen ? '' : 'big-margin']"></view>
            <view :class="['progress-bar-value', isBeisen ? '' : 'big-top']"
              :style="{ width: dataInfo[item.key] ? `${dataInfo[item.key]}%` : '0' }"></view>
          </view>
          <view v-else :class="['progress-bar-box2', isBeisen ? '' : 'big-height']"></view>
          <view :class="['progress-item-finish', isBeisen ? '' : 'big-margin']">
            <template v-if="dataInfo[item.key] || dataInfo[item.key] == 0">
              <view>本周已有</view>
              <view class="progress-text">
                <view class="number">{{ dataInfo[item.ratio] || dataInfo[item.ratio] == 0 ? dataInfo[item.ratio] : '-'
                  }}%</view>学员完成学习
              </view>
            </template>
            <template v-else>
              <template v-if="item.type == 3">
                <view>你的表现很好</view>
                <view class="progress-text">暂无需短课程学习</view>
              </template>
              <template v-else-if="item.type == 4">
                <view class="no-finish-text">暂无长课程学习安排</view>
              </template>
            </template>
          </view>
        </view>
      </template>

    </view>
  </view>
</template>

<script>
export default {
  name: 'LearnStatistics',
  props: {
    isBeisen: {
      type: Boolean,
      default: false
    },
    dataInfo: {
      type: Object,
      default: () => { }
    },
    isHmzx: {
      type: Boolean,
      default: false
    },
    isYb: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      progressList: [
        {
          type: 3,
          title: '短课程进度',
          unit: '%',
          key: 'shortCourseProgress',
          ratio: 'shortCourseCompletedLearnRatio',
          hidden: false
        },
        {
          type: 4,
          title: '长课程进度',
          unit: '%',
          key: 'longCourseProgress',
          ratio: 'longCourseCompletedLearnRatio',
          hidden: false
        }
      ],
    }
  },
  watch: {
    isHmzx: {
      handler(newVal) {
        console.log(newVal, this.isYb, 'newVal, isYb')
        if (!newVal || !this.isYb) {
          this.progressList[0].hidden = true
        } else {
          this.progressList[0].hidden = false
        }
      },
      immediate: true
    },
    isBeisen: {
      handler(newVal) {
        if (!newVal) {
          this.progressList[1].hidden = true
        } else {
          this.progressList[1].hidden = false
        }
      },
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.learn-statistics {
  width: calc(100% - #{toRpx(64)});
  border-radius: toRpx(24);
  background: #ffffff;
  padding: toRpx(28) toRpx(24) toRpx(24);
  margin: 0 toRpx(32) toRpx(20);

  &.small-height {
    height: toRpx(396);
  }

  &.big-height {
    height: toRpx(480);
  }

  &-title {
    font-size: toRpx(28);
    color: #1A1A1A;
  }

  .statistics-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    margin-top: toRpx(12);
    margin-bottom: toRpx(20);

    .statistics-item {
      display: flex;
      align-items: baseline;

      .blue-number {
        color: #3B73FF;
      }

      .statistics-number {
        color: #3B73FF;
        font-size: toRpx(40);
        font-weight: 700;
      }

      .statistics-unit {
        font-size: toRpx(22);
        font-weight: 500;
        margin-left: toRpx(4);
      }

      .text {
        color: #808080;
        font-size: toRpx(24);
        margin-right: toRpx(8);
      }

      .statistics-rank {
        color: #000000;
        font-size: toRpx(32);
        font-weight: 500;
      }
    }
  }

  .progress-box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: toRpx(24);

    &.only-one {
      grid-template-columns: repeat(1, 1fr);
    }

    .progress-item {
      display: flex;
      // justify-content: space-between;
      flex-direction: column;
      border-radius: toRpx(12);

      &.bg {
        background-color: #F5F9FF;
        padding: toRpx(24) toRpx(20);
      }

      &-title {
        font-size: toRpx(32);
        color: #808080;
        font-size: toRpx(24);

        &.title {
          color: #1A1A1A;
          font-size: toRpx(28);
        }
      }

      &-value {
        display: flex;
        align-items: baseline;
        margin-top: toRpx(16);

        .number {
          color: #000;
          font-size: toRpx(32);
          font-weight: 500;

          &.blue-number {
            font-size: toRpx(40);
            font-weight: 700;
            color: #3B73FF;
          }
        }

        .unit {
          font-size: toRpx(20);
          color: #000;
          margin-left: toRpx(4);

          &.blue-unit {
            font-size: toRpx(22);
            font-weight: 500;
            color: #3B73FF;
          }
        }
      }

      .progress-bar-box {
        position: relative;
        width: calc(100% - #{toRpx(68)});
      }

      .progress-bar-box2 {
        width: calc(100% - #{toRpx(68)});
        height: toRpx(48);

        &.big-height {
          height: toRpx(80);
        }
      }

      .progress-bar {
        width: 100%;
        height: toRpx(12);
        border-radius: toRpx(8);
        opacity: 0.35;
        background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);
        margin-top: toRpx(36);

        &.big-margin {
          margin-top: toRpx(72);
        }

        &-value {
          position: absolute;
          left: 0;
          top: toRpx(36);
          height: toRpx(12);
          border-radius: toRpx(8);
          opacity: 1;
          background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);

          &.big-top {
            top: toRpx(72);
          }
        }
      }

      .progress-item-finish {
        height: toRpx(72);
        margin-top: toRpx(46);
        font-size: toRpx(22);
        color: #808080;
        line-height: toRpx(36);

        &.big-margin {
          margin-top: toRpx(84);
        }

        .progress-text {
          display: flex;
        }

        .number {
          color: #3B73FF;
        }

        .no-finish-text {
          margin-top: toRpx(30);
        }
      }
    }
  }
}
</style>