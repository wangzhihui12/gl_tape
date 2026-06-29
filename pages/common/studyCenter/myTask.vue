<template>
    <view class="my-task-container">
      <!-- 导航栏 -->
      <view class="header" @click="back">
        <view class="nav-bar">
          <view class="back">
            <uni-icons type="left" :size="20" color="#000000"></uni-icons>
          </view>
          <view class="title">我的任务</view>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="study-center">
        <!-- 左侧：学习看板 -->
        <view class="study-left">
        <view class="title">学习看板</view>
        <view class="study-board-box"> 
          <template v-if="isBeisen || (isHmzx && isYb)">
            <LearnStatistics :dataInfo="dataInfo" :isBeisen="isBeisen" :isHmzx="isHmzx" :isYb="isYb" />
          </template>
          <WeeklyConversionRate :dataInfo="dataInfo" :isBeisen="isBeisen" :isHmzx="isHmzx" :isYb="isYb" />
          <template v-if="isHmzx && isYb">
            <view :class="['study-box3', isBeisen ? '' : 'big-height']">
              <view :class="['study-box3-title', isBeisen ? '' : 'big-margin']">能力分析</view>
              <RadarChart :labelColors="labelColors" :heightClass="isBeisen ? '' : 'big-height'" :chartData="chartData" />
            </view>
          </template>
        </view>
      </view>
      <!-- 右侧：任务和课程列表 -->
      <view class="study-right">
        <view class="data-container">
          <view :class="['type-box']">
            <view class="tab-item" v-for="(i, index) in typeList" :key="index" @click="changeType(index)">
              <view
                :class="['sprite-icon', firstIndex == index ? `icon-${firstClass[index]} active` : '', firstLeft[index]]">
              </view>
              <view class="text" :class="[firstIndex == index ? `active` : '']">
                {{ i.tabName }}
                <template>{{ i.num() }}</template>
                <div class="dot" :style="{ right: '86rpx' }" v-if="i.dot && i.dot()"></div>
              </view>
            </view>
          </view>
          <!-- 我的任务 tab：使用 MyTask 组件 -->
          <template v-if="firstIndex == 0">
            <MyTask ref="myTask" />
          </template>
          <!-- 更多课程 tab：使用 RecommendCourse 组件（简化模式） -->
          <template v-if="firstIndex == 1">
            <RecommendCourse :simplified="true" />
          </template>
        </view>
      </view>
      </view>
    </view>
  </template>
  
  <script>
  import LearnStatistics from '@/components/HomeFrame/components/Study/LearnStatistics.vue'
  import WeeklyConversionRate from '@/components/HomeFrame/components/Study/WeeklyConversionRate.vue'
  import MyTask from './components/MyTask.vue'
  import RecommendCourse from './components/RecommendCourse.vue'
  import RadarChart from '@/pages/common/studyDetail/components/RadarChart.vue'
  
  export default {
    name: 'StudyCenter',
    components: {
      LearnStatistics,
      WeeklyConversionRate,
      MyTask,
      RecommendCourse,
      RadarChart
    },
    data() {
      return {
        chartData: {},
        dataInfo: {},
        labelColors: [],
        typeList: [
          { tabName: '我的任务', num: () => '' },
          { tabName: '更多课程', num: () => '' }
        ],
        firstIndex: 0,
        firstLeft: ['first', 'second'],
        firstClass: ['short-first-nav', 'short-second-nav'],
        isBeisen: false,
        isFlag: true,
        isHmzx: false,
        isYb: false,
      }
    },
    created () {
      uni.$on('backStudyCenter', () => {
        console.log('backStudyCenter', this.$refs.myTask)
        const { tabIndex, finishIndex } = this.$refs.myTask
        if (tabIndex === 0) {
          this.$refs.myTask.getCourseTaskPage(tabIndex)
        } else {
          this.$refs.myTask.getCourseTaskPage(tabIndex, finishIndex)
        }
        this.getStudyBoard()
      })
    },
    beforeDestroy() {
      uni.$off('backStudyCenter')
    },
    mounted() {
      const beisenToken = uni.$storage.get('beisenToken')
      const studyCenterPermission = uni.$storage.get('studyCenterPermission')
      console.log(beisenToken, 'beisenToken')
      this.isBeisen = !!beisenToken
      if (!beisenToken) {
        this.typeList = [
          { tabName: '我的任务', num: () => '' }
        ]
      }
      this.isHmzx = studyCenterPermission.hmzxAuth
      this.isYb = studyCenterPermission.authorizedBusinessList && studyCenterPermission.authorizedBusinessList.includes(1)
      console.log(this.isBeisen,this.isHmzx, this.isYb, 'this.isYb')
      this.getStudyBoard();
    },
    methods: {
      back() {
        uni.navigateBack()
      },
      goToMyTask() {
        uni.navigateTo({
          url: '/pages/common/studyCenter/myTask'
        })
      },
      changeType(index, tagIndex) {
        this.firstIndex = index
      },
      async getStudyBoard() {
        const res = await uni.$api.commonApi.getStudyBoard({})
        console.log(111111, 'res', res)
        this.dataInfo = res
        const boostRatio = (val) => {
          const numVal = Number(val)
          if (isNaN(numVal)) return val
          if (numVal < 60) {
            return String(numVal + 30)
          } else if (numVal >= 60 && numVal < 90) {
            return '90'
          } else {
            return String(numVal)
          }
        }
        if (this.dataInfo) {
          if (this.dataInfo.shortCourseCompletedLearnRatio !== undefined && this.dataInfo.shortCourseCompletedLearnRatio !== null) {
            this.dataInfo.shortCourseCompletedLearnRatio = boostRatio(this.dataInfo.shortCourseCompletedLearnRatio)
          }
          if (this.dataInfo.longCourseCompletedLearnRatio !== undefined && this.dataInfo.longCourseCompletedLearnRatio !== null) {
            this.dataInfo.longCourseCompletedLearnRatio = boostRatio(this.dataInfo.longCourseCompletedLearnRatio)
          }
        }
        const _chartData = {
          categories: res.abilityAnalysisTag,
          series: [
            {
              data: res.abilityAnalysisScore
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
          this.labelColors = _labelColors;
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .my-task-container {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      background-image: url('@/assets/images/common/home-bg-1.webp');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }

  .header{
    position: relative;

    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      height: toRpx(88);
      position: relative;

      .back {
        position: absolute;
        left: toRpx(32);
        display: flex;
        align-items: center;
        justify-content: center;
        width: toRpx(48);
        height: toRpx(48);
        cursor: pointer;
      }

      .title {
        font-size: toRpx(32);
        font-weight: 500;
        color: #000000;
        text-align: center;
      }
    }
  }
  }

  .simple-popup-content {
    width: 720rpx;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .simple-text {
    font-size: 28rpx;
    font-weight: 400;
    color: rgba(108, 111, 117, 1);
    text-align: center;
    line-height: 40rpx;
  }
  
  .study-center {
    display: flex;
    flex: 1;
    padding: toRpx(56) toRpx(48) toRpx(80);
    overflow: hidden;
    
    .study-left {
      width: toRpx(656);
      margin-right: toRpx(48);
      border-radius: toRpx(48);

      .title {
        height: toRpx(104);
        border-radius: toRpx(32) toRpx(32) 0 0;
        background: url('@/assets/images/common/study-title.webp') no-repeat center;
        background-size: toRpx(656) toRpx(104);
        line-height: toRpx(104);
        padding-left: toRpx(48);
        font-size: toRpx(34);
        color: #333;
        font-weight: 500;
      }
  
      .study-board-box {
        width: 100%;
        border: toRpx(4) solid #fff;
        border-top: none;
        background: #eff4ff;
        border-radius: 0 0 toRpx(48) toRpx(48);
      }
    }
  
    .study-box3 {
      width: calc(100% - #{toRpx(64)});
      border-radius: toRpx(24);
      background: #ffffff;
      padding: toRpx(28) toRpx(24) toRpx(24);
      margin: 0 toRpx(32) toRpx(16);
  
      &.big-height {
        height: toRpx(448);
      }
  
      &-title {
        margin-bottom: toRpx(10);
  
        &.big-margin {
          margin-bottom: toRpx(40);
        }
      }
    }
  
    .study-right {
      flex: 1;
      background-color: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(16px);
      box-shadow: inset 0 0 16px 0 #ffffff;
      border-radius: toRpx(48);
      position: relative;
  
      .data-container {
        background: #ffffff;
        border-radius: toRpx(48);
        height:  toRpx(1326);
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        border: toRpx(2) solid #fff;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
  
        .type-box {
          position: relative;
          display: flex;
          width: 100%;
          background-color: #eef4fe;
          height: toRpx(104);
          line-height: toRpx(104);
          border-radius: toRpx(48) toRpx(48) 0 0;
          z-index: 0;
  
          .tab-item {
            width: toRpx(388);
            text-align: center;
            font-weight: 500;
            font-size: toRpx(34);
            color: #292D33;
  
            .first {
              left: 0;
            }
  
            .second {
              left: toRpx(352);
            }
  
            .three {
              left: toRpx(756);
            }
  
            .four {
              left: toRpx(1162);
            }
  
            .text {
              position: relative;
              text-align: center;
              width: toRpx(400);
  
              .dot {
                width: toRpx(16);
                height: toRpx(16);
                background: #999;
                position: absolute;
                top: toRpx(32);
                border-radius: 50%;
                right: toRpx(86);
              }
            }
  
            .active {
              position: absolute;
              top: 0;
              z-index: -1;
              font-weight: 500;
              font-size: toRpx(32);
              color: #3B73FF;
  
              &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: toRpx(48);
                height: toRpx(8);
                background-color: #3B73FF;
                border-radius: toRpx(16);
              }
            }
          }
        }
      }
    }
  }
  </style>
