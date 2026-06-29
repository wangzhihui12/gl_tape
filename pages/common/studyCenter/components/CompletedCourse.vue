 <template>
  <view class="completed-course">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      :class="getScrollHeight">
      <template v-if="completedCourseList.length">
        <view class="completed-course-list" :class="{ 'fixed-width': cardWidth > 0 }">
          <view class="completed-course-item" v-for="(item, index) in completedCourseList" :key="index"
            @click="startStudy(item, index)" :style="cardWidth > 0 ? `width: ${cardWidth}rpx` : ''">
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

            <image class="completed-course-item-img"
              :src="require(`@/assets/images/common/${COURSE_TYPE[item.courseFileType].image}.webp`)" mode="scaleToFill" />
            <view class="completed-course-content">
              <view class="completed-course-item-title">
                {{ item.title }}
              </view>

              <!-- 成功图片 -->
              <image class="success-icon" :src="require('@/assets/images/studyCenter/success.png')" mode="aspectFit" />
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
import { COURSE_TYPE } from '../contant.js'
export default {
  name: 'CompletedCourse',
  props: {
    // 卡片宽度，不传则使用默认的响应式布局
    cardWidth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      completedCourseList: [],
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 16,
      scrollTop: 0,
      COURSE_TYPE
    }
  },
  computed: {
    getScrollHeight() {
      const list = this.completedCourseList;
      if (!list || list.length === 0) {
        return '';
      }
      return 'scroll-view'
    }
  },
  mounted() {
    this.getCourseTaskPage()
  },
  methods: {
    // 获取已完成课程接口
    async getCourseTaskPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          learnStatus: 2, // 学习状态 0：待学习 1: 正在学习 2：已学完
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getMyCourseList(params)
		console.log("已完成课程",res);
        if (pageNum == 1) {
          this.completedCourseList = res.list
        } else {
          this.completedCourseList = this.completedCourseList.concat(res.list)
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
      let { pageNum, total, nothing = 'nothing', pageSize } = this;
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1;
        this.getCourseTaskPage()
      } else {
        this.nothing = true;
      }
    },
    startStudy(item, index) {
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
	  let businessParam = {
	  		  courseId:item.courseId,
	  		  title:item.title
	  }
	  console.log("businessParamC",businessParam);
	  uni.$track.add({ eventCode: 'app_studyCourse_click', businessParam: businessParam })
      uni.navigateTo({
        url: `/pages/common/studyCenter/courseDetail?apiType=getMyCourseList&index=${index}&courseList=${encodeURIComponent(JSON.stringify(this.completedCourseList))}&pageNum=${pageNum}&pageSize=${pageSize}&total=${total}&learnStatus=2`
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.completed-course {
  // height: calc(100% - #{toRpx(100)});
  height: 100%;

  .scroll-view {
    margin-top: toRpx(40);
    // height: calc(100% - #{toRpx(50)});
    height: 100%;

    .completed-course-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(32);
      padding: 0 toRpx(40) toRpx(32);

      &.fixed-width {
        grid-template-columns: repeat(4, toRpx(530));
        justify-content: center;
        
        .completed-course-item {
          width: toRpx(530) !important;
          max-width: toRpx(530);
          min-width: toRpx(530);
          font-size: 0;
        }
      }

      .completed-course-item {
        width: 100%;
        min-height: toRpx(376);
        box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
        border-radius: toRpx(24);
        position: relative;

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

        .completed-course-item-img {
          width: 100%;
          height: toRpx(180);
          border-radius: toRpx(16) toRpx(16) 0 0;
        }

        .completed-course-content {
          padding: toRpx(32);
          position: relative;
          min-height: toRpx(196);
          background-color: #fff;
          border-radius: 0 0 toRpx(16) toRpx(16);

          .completed-course-item-title {
            font-size: toRpx(30);
            color: #292D33;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            line-height: 1.2;
            max-height: calc(2 * 1.2em);
          }

          // 成功图片 - 右下角定位
          .success-icon {
            position: absolute;
            bottom: toRpx(32);
            right: toRpx(33);
            width: toRpx(144);
            height: toRpx(144);
          }
        }
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
  padding: toRpx(30) 0;
  font-size: toRpx(24);
}

/deep/ {
  .uni-scroll-view-content {
    height: calc(100% - #{toRpx(20)});
  }
}
</style>

