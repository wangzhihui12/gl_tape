<!-- 学习中心首页 - 正在学习 -->
<template>
  <view class="task-box">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      class="task-list-box">
      <template v-if="taskList.length">
        <view class="task-list">
          <view class="task-item" v-for="(item, index) in taskList" :key="index" @click="handleTaskItemClick(item, index)">
            <!-- <view class="time-limit-tag"></view> -->
              <!-- 左上角：必修/选修标签 -->
            <template v-if="item.planCourseType">
              <image class="course-tag-left"
              :src="item.planCourseType == 1 ? require('@/assets/images/studyCenter/Required.png') : require('@/assets/images/studyCenter/Elective.png')"
              mode="aspectFit" />
            </template>

            <!-- 右上角：文档/视频标签 -->
            <view class="course-tag-right" v-if="item.courseFileType">
              <text class="tag-text">{{ COURSE_TYPE[item.courseFileType].name}}</text>
            </view>
            <image class="task-item-img" :src="require(`@/assets/images/common/${COURSE_TYPE[item.courseFileType].image}.webp`)" mode="aspectFill" />
            <view class="task-item-content">
              <view class="task-item-title">{{ item.title }}</view>
              
              <view class="task-item-text">
                <view class="task-item-label">课程时长</view>
                <view class="task-item-value">
                  {{ (item.totalDuration || item.totalDuration === 0) ? `${item.totalDuration}min` : '-' }}
                </view>
              </view>
              <view class="task-item-text">
                <view class="task-item-label">任务进度</view>
                <view class="task-item-progress">
                  <view class="task-item-progress-bar" :style="{ width: item.process + '%', minWidth: item.process > 0 ? '10px' : '0' }"></view>
                  <view class="task-item-progress-text">{{ item.process }}%</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="nothing flex">
          <image class="icon" src="../../../../assets/images/common/noData.webp" />
          暂无数据
        </view>
      </template>
      <template v-if="nothing">
        <view class="end-text">到底了！</view>
      </template>
    </scroll-view>
  </view>
</template>
<script>

import { COURSE_TYPE } from '../../../../pages/common/studyCenter/contant'
import dayjs from 'dayjs'
export default {
  name: 'MyTask',
  data() {
    return {
      finishIndex: 2,
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 12,
      scrollTop: 0,
      taskList: [],
      COURSE_TYPE
    }
  },
  mounted() {
    this.getCourseTaskPage(this.tabIndex)
    this.asyncfindBeiSenSSOToken()
  },
  beforeDestroy() {
    // 移除事件监听，防止内存泄漏
    uni.$off && uni.$off('backStudyCenter');
  },
  methods: {
    // 格式化时间
    formatTime(time, formatStr) {
      if (!time) return '-';
      return dayjs(time).format(formatStr);
    },
    // 获取正在学习接口, learnStatus: 1, // 学习状态 0：待学习 1: 正在学习 2：已学完
    async getCourseTaskPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          learnStatus: 1, // 学习状态 0：待学习 1: 正在学习 2：已学完
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getMyCourseList(params)
        let newList = res.list || [];
        if (pageNum == 1) {
          this.taskList = newList
        } else {
          this.taskList = this.taskList.concat(newList)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: "none",
        });
      }
    },
    pageonReachBottom() {
      console.log('到底了');
      // 解构赋值，设置 nothing 的默认值
      let { pageNum, total, pageSize, tabIndex, finishIndex } = this;
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1;
        if (tabIndex == 0) {
          this.getCourseTaskPage()
        } else {
          this.getCourseTaskPage()
        }
      } else {
        this.nothing = true;
      }
    },
    handleTaskItemClick(item, index) {
      console.log(item)
      const beisenToken = uni.$storage.get('beisenToken')
      if (!beisenToken) {
        uni.showToast({
          title: '培训账号未创建',
          icon: 'none'
        })
        return
      }
      let { pageNum, total, nothing = 'nothing', pageSize } = this;
      // uni.$track.add({ eventCode: 'app_recommend_course', businessId: item.id, pagePath: '/pages/equity/index' })
      uni.navigateTo({
        url: `/pages/common/studyCenter/courseDetail?apiType=getMyCourseList&index=${index}&courseList=${encodeURIComponent(JSON.stringify(this.taskList))}&pageNum=${pageNum}&pageSize=${pageSize}&total=${total}&learnStatus=1`
      })
    },
    async asyncfindBeiSenSSOToken() {
      const res = await uni.$api.commonApi.findBeiSenSSOToken({})
      uni.$storage.set('beisenToken', res.data)
    },
    // findBeiSenSSOToken() {
    //   return new Promise(resolve => {
    //     const url = 'https%3A%2F%2Fcloud.italent.cn%2FPageHome%2FIndex%3Fproduct%3DLearning%26keyName%3DNusion%26pageCode%3DLearningNewHomepage%26appCode%3DLearning%26_qsrcapp%3DLearning%26_qrt%3Dhtml%26quark_s%3D5102bff371c00da5b19968ee53a8c3f1499ecd2447a19f72f3e3ba2390cc9617%23%2FviewDynamic%3Fshadow_context%3D%257BappModel%253A%2522italent%2522%252Cuppid%253A%25221%2522%257D%26quark_s%3D028930f1066f8ef8d28790940d53ae64337f44bde3a44cf89a290e4a3611e3e2'
    //     uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
    //       uni.$storage.set('beisenToken', res.data)
    //       const studyUrl = res.data ? `${res.data}&return_url=${url}` : ''
    //       resolve(studyUrl)
    //     })
    //   })
    // },
  }
}
</script>
<style lang="scss" scoped>
.task-box {
  padding-top: toRpx(32);
  height: calc(100% - #{toRpx(100)});
}

.tab-list {
  display: flex;
  width: toRpx(436);
  height: toRpx(80);
  background-color: #F5F6F7;
  border-radius: toRpx(16);
  color: #666666;
  font-size: toRpx(28);

  .tab-item {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    margin: toRpx(6);

    &.active {
      background-color: #fff;
      color: #1A1A1A;
      border-radius: toRpx(10);
      font-weight: 600;
    }
  }
}

.tips {
  display: flex;
  align-items: center;
  padding: toRpx(8) toRpx(22);
  background-color: rgba(255, 243, 224, 0.8);
  border-radius: toRpx(8);
  font-size: toRpx(24);
  color: #FF9D0A;
  height: toRpx(48);
  margin: toRpx(24) toRpx(40) 0;

  &-text {
    margin-top: toRpx(4);
  }

  .icon-study-tips {
    margin-right: toRpx(8);
  }
}

.tab-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 toRpx(40);
}

.finish-tab {
  display: flex;

  &-item {
    width: toRpx(148);
    height: toRpx(64);
    border-radius: toRpx(48);
    background: #f2f2f2;
    color: #666666;
    font-size: toRpx(28);
    line-height: toRpx(68);
    text-align: center;
    margin-right: toRpx(16);

    &:last-child {
      margin-right: 0;
    }

    &.finish-active {
      background: #2d66f71a;
      font-weight: 500;
      color: #2D66F7;
    }
  }
}

.task-list-box {
  // margin-top: toRpx(24);
  height: calc(100% - #{toRpx(106)});
}

.task-finish-box {
  margin-top: toRpx(24);
  height: calc(100% - #{toRpx(138)});
}

.task-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRpx(32);
  padding: 0 toRpx(40) toRpx(32);

  .task-item {
    position: relative;
    width: 100%;
    // height: toRpx(432);
    background-color: #fff;
    border-radius: toRpx(24);
    font-size: 0;
    box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;

    // 左上角标签
    .course-tag-left {
      position: absolute;
      left: toRpx(-2);
      top: 0;
      width: toRpx(94);
      height: toRpx(48);
      border-radius: toRpx(24) 0 toRpx(20) 0;
      z-index: 2;
    }

    // 右上角标签
    .course-tag-right {
      position: absolute;
      right: toRpx(16);
      top: toRpx(16);
      width: toRpx(72);
      height: toRpx(40);
      border-radius: toRpx(4);
      background: rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      .tag-text {
        width: toRpx(48);
        height: toRpx(36);
        color: #ffffff;
        font-size: toRpx(24);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        text-align: center;
        line-height: toRpx(36);
      }
    }

    .task-item-img {
      width: 100%;
      height: toRpx(180);
      border-radius: toRpx(24) toRpx(24) 0 0;
    }

    .task-item-content {
      padding: toRpx(32);
    }

    .task-item-title {
      font-size: toRpx(30);
      color: #292D33;
      font-weight: 500;
      margin-bottom: toRpx(24);
      width: toRpx(340);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .task-item-text {
      position: relative;
      display: flex;
      align-items: center;
      font-size: toRpx(24);
      margin-bottom: toRpx(24);
      &:last-child {
        margin-bottom: 0;
      }

      .task-item-label {
        width: toRpx(96);
        color: #999EA8;
        margin-right: toRpx(24);
      }

      .task-item-value {
        color: #666666;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        .dot-value {
          width: toRpx(12);
          height: toRpx(12);
          border-radius: 50%;
          background: #2CCA74;
          margin-right: toRpx(8);
        }

        .green {
          color: #2CCA74;
        }
      }
    }

    .task-item-progress {
      width: toRpx(151);
      height: toRpx(16);
      background: linear-gradient(128.8deg, rgba(117, 188, 255, .35) 0%, rgba(44, 102, 247, .35) 100%);
      border-radius: toRpx(8);

      .task-item-progress-text {
        color: #3B73FF;
        font-size: toRpx(24);
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }

      .task-item-progress-bar {
        height: 100%;
        background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);
        border-radius: toRpx(8);
        min-width: toRpx(20);
      }
    }
  }
}

 .nothing {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: toRpx(1000);
    color: #999999;
    font-size: toRpx(24);

    .icon {
      width: toRpx(344);
      height: toRpx(208);
    }
  }

.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(30) 0 toRpx(50);
  font-size: toRpx(24);
}

/deep/ {
  .uni-scroll-view-content {
    height: calc(100% - #{toRpx(20)});
  }
}
</style>