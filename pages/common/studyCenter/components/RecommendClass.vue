<!-- 学习中心首页 - 正在学习 -->
<template>
  <view class="task-box">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      class="task-list-box">
      <template v-if="taskList.length">
        <view class="task-list">
          <view class="task-item" v-for="(item, index) in taskList" :key="index" @click="handleTaskItemClick(item, index)">
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
              <!-- 评分星星 -->
              <view v-if="item.totalStar !== undefined" class="course-rating">
                <view class="star-list">
                  <image v-for="star in 5" :key="star" class="star-icon" :src="getStarIcon(item.totalStar, star)"
                    mode="aspectFit" />
                </view>
                <text class="rating-text">{{ item.totalStar }}</text>
              </view>
              <view class="task-item-text">
                <image class="task-item-student-icon" :src="require('@/assets/images/studyCenter/rs.png')" mode="aspectFit" />
                  <view class="task-item-student">{{ item.learnTotal == null ? '-' : item.learnTotal }}人已学习</view>
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
const COURSE_TYPE = {
  10: {
    name: '视频',
    image: 'short-course-default'
  },
  80: {
    name: '音频',
    image: 'course-default-bg'
  },
  20: {
    name: '混合',
    image: 'short-course-default'
  },
  30: {
    name: '文档',
    image: 'course-default-bg'
  },
  40: {
    name: 'H5',
    image: 'course-default-bg'
  },
  70: {
    name: 'URL',
    image: 'course-default-bg'
  },
  120: {
    name: '图文',
    image: 'course-default-bg'
  }
}
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
  },
  beforeDestroy() {
    // 移除事件监听，防止内存泄漏
    uni.$off && uni.$off('backStudyCenter');
  },
  methods: {
    // 获取星星图标
    getStarIcon(rating, position) {
      const roundedRating = Math.round(rating) / 2 // 四舍五入到0.5
      const diff = roundedRating - (position - 1)

      if (diff >= 1) {
        // 亮星
        return require('@/assets/images/studyCenter/liang.png')
      } else if (diff === 0.5) {
        // 半星
        return require('@/assets/images/studyCenter/zuo.png')
      } else {
        // 灰星
        return require('@/assets/images/studyCenter/hui.png')
      }
    },
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
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getRecommendCourseList(params)
		console.log("RES",res);
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
	  let businessParam = {
		  courseId:item.courseId,
		  title:item.title
	  }
	  console.log("businessParam",businessParam);
      uni.$track.add({ eventCode: 'app_studyCourse_click', businessParam: businessParam })
      uni.navigateTo({
        url: `/pages/common/studyCenter/courseDetail?apiType=getMyCourseList&index=${index}&courseList=${encodeURIComponent(JSON.stringify(this.taskList))}&pageNum=${pageNum}&pageSize=${pageSize}&total=${total}&learnStatus=1`
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.task-box {
  height: 100%;
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
  margin-top: toRpx(40);
  height: 100%;
}

.task-finish-box {
  margin-top: toRpx(24);
  height: calc(100% - #{toRpx(138)});
}

.task-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: toRpx(32);
  padding: 0 toRpx(64);

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
      left: 0;
      top: 0;
      width: toRpx(94);
      height: toRpx(48);
      border-radius: toRpx(24) 0 toRpx(24) 0;
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
      width: toRpx(530) !important;
    }

    .task-item-title {
      font-size: toRpx(30);
      color: #292D33;
      font-weight: 500;
      margin-bottom: toRpx(24);
      // width: toRpx(340);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
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

      .task-item-student-icon {
        width: toRpx(32); // 设计 16px
        height: toRpx(32); // 设计 16px
        margin-right: toRpx(8);
		margin-bottom: toRpx(4);
      }

      .task-item-student {
        color: #999EA8;
        font-size: toRpx(24);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        line-height: toRpx(36);
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

      .task-item-score {
        color: #666666;
        font-size: 14px;
        font-weight: 400;
        margin-left: toRpx(8);
        display: flex;
        align-items: center;
        line-height: 1;
      }
    }

    .task-item-text-rate {
      align-items: center;
    }

    // 评分星星
    .course-rating {
      display: flex;
      align-items: center;
      margin-top: toRpx(12);
      margin-bottom: toRpx(12);
      .star-list {
        display: flex;
        align-items: center;

        .star-icon {
          width: toRpx(40);
          height: toRpx(40);
          margin-right: toRpx(6);

          &:last-child {
            margin-right: 0;
          }
        }
      }

      .rating-text {
        width: toRpx(40);
        height: toRpx(36);
        color: #666666;
        font-size: toRpx(28);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        text-align: left;
        line-height: toRpx(36);
        margin-left: toRpx(6);
      }
    }

    .task-item-progress {
      width: toRpx(288);
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