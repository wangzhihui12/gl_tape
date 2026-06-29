<template>
  <view class="recommend-course">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      :class="getScrollHeight">
      <template v-if="recommendCourseList.length">
        <view class="recommend-course-list">
          <view class="recommend-course-item" v-for="(item, index) in recommendCourseList" :key="index" @click="startStudy(item, index)">
            <image
              class="recommend-course-item-img"
              src="../../../../assets/images/common/recommend-course-default.webp"
              mode="scaleToFill"
            />
            <view class="recommend-course-content">
              <view class="recommend-course-item-title">
                {{ item.courseName }}
              </view>
              <view class="recommend-course-item-text">{{ (item.totalDuration || item.totalDuration === 0) ? `${item.totalDuration}min` : '-' }}</view>
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
export default {
  name: 'RecommendCourse',
  data() {
    return {
      recommendCourseList: [],
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 12,
      scrollTop: 0,
    }
  },
  computed: {
    getScrollHeight() {
      const list = this.recommendCourseList;
      if (!list || list.length === 0) {
        return '';
      }
      return 'scroll-view'
    }
  },
  mounted() {
    this.getCourseTaskPage()
    this.asyncfindBeiSenSSOToken()
  },
  methods: {
    // 获取我的任务接口, completeStatus: 完成状态 0=待完成 1=已完成, courseType: 课程类型 1=短课程 2=长课程
    async getCourseTaskPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          recommendStatus: 1, // 推荐状态 0=无推荐 1=推荐课程
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getCourseTaskPage(params)
        if (pageNum == 1) {
          this.recommendCourseList = res.list
        } else {
          this.recommendCourseList = this.recommendCourseList.concat(res.list)
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
      let { pageNum, total, nothing = 'nothing', pageSize } = this;
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1;
        this.getCourseTaskPage()
      } else {
        this.nothing = true;
      }
    },
    startStudy(item, index) {
      let { pageNum, total, nothing = 'nothing', pageSize } = this;
      uni.$track.add({eventCode: 'app_recommend_course', businessId: item.id, pagePath: '/pages/equity/index'})
      uni.navigateTo({
        url: `/pages/common/studyDetail/detail?type=recommendation&index=${index}&recommendCourseList=${encodeURIComponent(JSON.stringify(this.recommendCourseList))}&pageNum=${pageNum}&pageSize=${pageSize}&total=${total}`
      })
    },
    async asyncfindBeiSenSSOToken () {
      const res = await uni.$api.commonApi.findBeiSenSSOToken({})
      uni.$storage.set('beisenToken', res.data)
    },
  }
}
</script>
<style lang="scss" scoped>
.recommend-course {
  height: calc(100% - #{toRpx(100)});
  .scroll-view {
    margin-top: toRpx(40);
    height: calc(100% - #{toRpx(70)});
    .recommend-course-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(32);
      padding: 0 toRpx(40) toRpx(32);
      .recommend-course-item {
        width: 100%;
        height: toRpx(376);
        box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
        border-radius: toRpx(24);
        .recommend-course-item-img {
          width: 100%;
          height: toRpx(180);
          border-radius: toRpx(24) toRpx(24) 0 0;
        }
        .recommend-course-content {
          padding: toRpx(32);
          .recommend-course-item-title {
            font-size: toRpx(30);
            color: #292D33;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            margin-bottom: toRpx(16);
            height: calc(2 * 1.2em); // 固定两行高度，1.4为行高倍数，可根据实际调整
            line-height: 1.2;
          }
          .recommend-course-item-text {
            font-size: toRpx(24);
            color: #999EA8;
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