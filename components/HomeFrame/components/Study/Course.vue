<!-- 学习中心首页 - 全部课程 -->
<template>
  <view class="recommend-course">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      :class="getScrollHeight">
      <template v-if="recommendCourseList.length">
        <view class="recommend-course-list" :class="{ 'fixed-width': cardWidth > 0 }">
          <view class="recommend-course-item" v-for="(item, index) in recommendCourseList" :key="index"
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

            <image class="recommend-course-item-img"
              :src="require(`@/assets/images/common/${COURSE_TYPE[item.courseFileType].image}.webp`)" mode="scaleToFill" />
            <view class="recommend-course-content">
              <view class="recommend-course-item-title">
                {{ item.title }}
              </view>
              <view class="recommend-course-item-text">
                <text class="duration-value">课程时长</text>
                <text>{{ (item.totalDuration || item.totalDuration === 0) ?
                  `${item.totalDuration}min` : '-' }}</text>
              </view>

              <!-- 评分星星 -->
              <view v-if="item.totalStar !== undefined" class="course-rating">
                <view class="star-list">
                  <image v-for="star in 5" :key="star" class="star-icon" :src="getStarIcon(item.totalStar, star)"
                    mode="aspectFit" />
                </view>
                <text class="rating-text">{{ item.totalStar }}</text>
              </view>

              <!-- 学习人数 -->
              <view class="student-count">
                <image class="student-icon" :src="require('@/assets/images/studyCenter/rs.png')" mode="aspectFit" />
                <text class="student-text">{{ item.learnTotal == null ? '-' : item.learnTotal }}人已学习</text>
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
export default {
  name: 'RecommendCourse',
  props: {
    // 卡片宽度，不传则使用默认的响应式布局
    cardWidth: {
      type: Number,
      default: 0
    },
    // 是否显示简化版（只显示背景图、标题和时间）
    simplified: {
      type: Boolean,
      default: false
    },
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      recommendCourseList: [],
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 12,
      scrollTop: 0,
      COURSE_TYPE
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
    this.getALlCourse()
    this.asyncfindBeiSenSSOToken()
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
    // 获取我的任务接口, completeStatus: 完成状态 0=待完成 1=已完成, courseType: 课程类型 1=短课程 2=长课程
    async getALlCourse() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize, searchParams } = this
        console.log(searchParams, 'searchParams')
        const params = {
          staffPhone: uni.$storage.get('userInfo').phone, // 推荐状态 0=无推荐 1=推荐课程
          pageNum,
          pageSize,
          ...searchParams
        }
        const res = await uni.$api.commonApi.getALlCourse(params)
        console.log(res, '全部课程')

        if (pageNum == 1) {
          this.recommendCourseList = res.list
        } else {
          this.recommendCourseList = this.recommendCourseList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        uni.$emit('update:totalCourseCount', res.total)
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
        this.getALlCourse()
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
      uni.navigateTo({
        url: `/pages/common/studyCenter/courseDetail?apiType=getALlCourse&index=${index}&courseList=${encodeURIComponent(JSON.stringify(this.recommendCourseList))}&pageNum=${pageNum}&pageSize=${pageSize}&total=${total}`
      })
    },
    async asyncfindBeiSenSSOToken() {
      const res = await uni.$api.commonApi.findBeiSenSSOToken({})
      uni.$storage.set('beisenToken', res.data)
    },
  }
}
</script>
<style lang="scss" scoped>
.recommend-course {
  height: calc(100% - #{toRpx(300)});
  // padding-bottom: toRpx(100);

  .scroll-view {
    margin-top: toRpx(40);
    height: calc(100% - #{toRpx(70)});

    .recommend-course-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(32);
      padding: 0 toRpx(40) toRpx(32);

      &.fixed-width {
        grid-template-columns: repeat(4, toRpx(530));
        justify-content: center;

        .recommend-course-item {
          width: toRpx(530) !important;
          max-width: toRpx(530);
          min-width: toRpx(530);
        }
      }

      .recommend-course-item {
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
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            margin-bottom: toRpx(16);
            height: calc(1 * 1.2em);
            line-height: 1.2;
          }

          .recommend-course-item-text {
            display: flex;
            align-items: center;
            font-size: toRpx(24);
            color: #666666;

            .duration-value {
              color: #999ea8;
              font-size: toRpx(24);
              font-weight: 400;
              font-family: "HarmonyOSSansSC";
              margin-right: toRpx(24);
            }
          }

          // 评分星星
          .course-rating {
            display: flex;
            align-items: center;
            margin-top: toRpx(12);

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

          // 学习人数
          .student-count {
            display: flex;
            align-items: center;
            margin-top: toRpx(12);

            .student-icon {
              width: toRpx(32);
              height: toRpx(32);
              margin-right: toRpx(8);
            }

            .student-text {
              height: toRpx(36);
              color: #999ea8;
              font-size: toRpx(24);
              font-weight: 400;
              font-family: "HarmonyOSSansSC";
              text-align: left;
              line-height: toRpx(36);
            }
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
  padding: toRpx(30) 0 toRpx(50);
  font-size: toRpx(24);
}

/deep/ {
  .uni-scroll-view-content {
    height: calc(100% - #{toRpx(20)});
  }
}
</style>