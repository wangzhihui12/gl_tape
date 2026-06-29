<template>
  <view class="passed-exam">
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      :class="getScrollHeight">
      <template v-if="examList.length">
        <view class="exam-list" :class="{ 'fixed-width': cardWidth > 0 }">
          <view class="exam-item" v-for="(item, index) in examList" :key="index"
            @click="viewExam(item, index)" :style="cardWidth > 0 ? `width: ${cardWidth}rpx` : ''">
            <image class="exam-item-img"
              src="../../../../assets/images/common/course-default-bg.webp" mode="scaleToFill" />
            <view class="exam-content">
              <view class="exam-item-title">
                {{ item.title }}
              </view>
              <view class="exam-item-text">
                <text class="duration-value">考试时间</text>
                <text>{{ filterValue(item.duration, 'min') }} | {{ filterValue(item.questionCount, '题') }}</text>
              </view>

              <!-- 考试次数 -->
              <view class="exam-times">
                <text class="times-value">剩余考试次数</text>
                <template v-if="!item.examTimes">不限制</template>
                <template v-else>
                  <text>{{ filterValue(item.remainingTimes) }}/{{ filterValue(item.examTimes) }}</text>
                </template>
              </view>

              <!-- 最高得分 -->
              <view class="exam-score">
                <text class="score-label">最高得分</text>
                <text class="score-value passed">{{ filterValue(item.maxTotalScore, '分') }}｜已通过</text>
              </view>

              <!-- 重新考试按钮 -->
              <view v-if="!item.examTimes || item.remainingTimes > 0" class="retake-btn">
                <text class="retake-text">重新考试</text>
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
    <!-- 考试提交确认弹窗 -->
    <StudyPopup
      :show.sync="showExamPopup"
      title=""
      :width="848"
      :closeButton="true"
      :height="examPopInfo.isExamLoading ? 740 : 656"
      :topImage="require('@/assets/images/common/warning-notice.webp')"
      :topImageWidth="848"
      :topImageHeight="248"
    >
      <ExamSubmitPopup
        :isLoading="examPopInfo.isExamLoading"
        :showError="examPopInfo.showError"
        :confirmText="examPopInfo.confirmText"
        @cancel="handleExamCancel"
        @confirm="handleExamConfirm"
      />
    </StudyPopup>
  </view>
</template>


<script>
import utils from '@/utils/utils'
import StudyPopup from '../../../StudyPopup.vue'
import ExamSubmitPopup from '../../../ExamSubmitPopup.vue'
export default {
  name: 'PassedExam',
  props: {
    cardWidth: {
      type: Number,
      default: 0
    }
  },
  components: {
    StudyPopup,
    ExamSubmitPopup
  },
  data() {
    return {
      examList: [],
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 12,
      scrollTop: 0,
      showExamPopup: false,
      examPopInfo: {
        isExamLoading: false,
        showError: false,
        confirmText: '确认已提交'
      },
      currentExam: {}
    }
  },
  computed: {
    getScrollHeight() {
      const list = this.examList;
      if (!list || list.length === 0) {
        return '';
      }
      return 'scroll-view'
    }
  },
  mounted() {
    this.getExamList()
  },
  methods: {
    // val：判断的值，unit单位
    filterValue(val, unit) {
      return utils.filterValue(val, unit)
    },
    // 获取考试列表
    async getExamList() {
      console.log(11)
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          examResult: 1, // 1已通过
          pageNum,
          pageSize,
          staffPhone: uni.$storage.get('userInfo').phone
        }
        // TODO: 替换为实际的考试列表接口
        const res = await uni.$api.commonApi.getExamPage(params)
        console.log(res)
        if (pageNum == 1) {
          this.examList = res.list
        } else {
          this.examList = this.examList.concat(res.list)
        }
        this.total = res.total
        this.nothing = this.examList.length >= this.total && this.pageNum > 1
        uni.hideLoading()
      } catch (err) {
        console.log(err)
        uni.hideLoading()
      }
    },
    // 到底了
    pageonReachBottom() {
      if (this.nothing) return
      if (this.examList.length >= this.total && this.pageNum > 1) {
        this.nothing = true
        return
      }
      this.pageNum++
      this.getExamList()
    },
    // 跳转北森考试详情页
    async viewExam(item) {
      console.log('查看考试', item)
      if (item.examTimes && item.remainingTimes <= 0) return
      // TODO: 跳转到考试详情页
      this.showStudyPopup = false
      this.currentExam = item
      try {
        // 获取北森 token
        uni.showLoading({ title: '加载中...' })
        const token = await this.findBeiSenSSOToken()
        // const token = uni.$storage.get('beisenToken')
        console.log('🔑 获取到的 token:', token)
        uni.hideLoading()
        if (token) {
          // const COURSE_ID = 'c6d20419-fae9-4d35-a1d1-bd2b35c0c619';
          const baseUrl = 'https://cloud.italent.cn/PageHome/Index';
          const params = {
            product: 'Learning',
            keyName: 'Nusion',
            pageCode: 'LearningExamTraineePage',
            appCode: 'Learning',
            examId: item.examination
          };
          const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
          const tokenUrl = this.tokenUrl || uni.$storage.get('beisenToken')
          // this.setWebviewStyle()
          const url = encodeURIComponent(`${baseUrl}?${queryString}#/viewDynamic?1=1`);
          this.jumpUrl = `${tokenUrl}&return_url=${url}`;
          uni.navigateTo({
            url: `/pages/common/studyWebview?url=${encodeURIComponent(this.jumpUrl)}&pageTitle=学习测评&type=1`
          })
        } else {
          throw new Error('获取 token 失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 获取 token 失败:', error)
        uni.showToast({
          title: '培训账号未创建',
          icon: 'none'
        })
      }
    },
    // 获取北森 SSO Token（参考 detail.vue 的方法）
    findBeiSenSSOToken() {
      return new Promise((resolve, reject) => {
        uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
          uni.$storage.set('beisenToken', res.data)
          resolve(res.data || '')
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 处理考试确认（用户选择已提交）
    async handleExamConfirm() {
      console.log('确认提交考试:', this.currentExam)
      this.examPopInfo.isExamLoading = true
      this.examPopInfo.showError = false
      const { examination } = this.currentExam
      try {
        const params = {
          examId: examination,
          invokeType: 1  // 0：等级考试 1：课后考试
        }
        // TODO: 这里后续调用后端查询接口
        const result = await uni.$api.commonApi.getExamResult(params)
        console.log('查询到的考试结果:', result)
        // 查询完成后关闭弹窗
        this.examPopInfo.isExamLoading = false
        console.log('查询完成，关闭弹窗')
        this.showExamPopup = false
        if (result) {
          // 查询成功刷新考试列表
          this.pageNum = 1
          this.getExamList()
        }
      } catch (error) {
        uni.showToast({
          title: '未查询到考试结果',
          icon: 'none'
        })
      }
    },
    handleExamCancel() {
      this.showExamPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
.passed-exam {
  width: 100%;
  // max-height: toRpx(1200);

  .scroll-view {
    max-height: toRpx(1225);
  }

  .exam-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: toRpx(32);
    // padding: 0 toRpx(40) toRpx(32);
    font-size: 0;

    &.fixed-width {
      grid-template-columns: repeat(4, toRpx(530));
      justify-content: center;
      
      .exam-item {
        width: toRpx(530) !important;
        max-width: toRpx(530);
        min-width: toRpx(530);
      }
    }

    .exam-item {
      width: 100%;
      min-height: toRpx(376);
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
      border-radius: toRpx(24);
      overflow: hidden;
      cursor: pointer;
      background: #ffffff;
      position: relative;

      .exam-item-img {
        width: 100%;
        height: toRpx(180);
      }

      .exam-content {
        padding: toRpx(32);

        .exam-item-title {
          width: 100%;
          height: toRpx(36);
          color: #292d33;
          font-size: toRpx(30);
          font-weight: 500;
          line-height: toRpx(36);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: toRpx(20);
        }

        .exam-item-text {
          display: flex;
          align-items: center;
          margin-bottom: toRpx(12);
          height: toRpx(36);
          color: #666;
          font-size: toRpx(24);
          font-weight: 400;
          line-height: toRpx(36);

          .duration-value {
            margin-right: toRpx(24);
            color: #999ea8;
          }
        }

        // 考试次数
        .exam-times {
          display: flex;
          align-items: center;
          margin-bottom: toRpx(12);
          height: toRpx(36);
          color: #666;
          font-size: toRpx(24);
          font-weight: 400;
          line-height: toRpx(36);

          .times-value {
            margin-right: toRpx(24);
            color: #999ea8;
          }
        }

        // 最高得分
        .exam-score {
          display: flex;
          align-items: center;
          margin-bottom: toRpx(20);
          font-size: toRpx(24);
          font-weight: 400;

          .score-label {
            // width: toRpx(96);
            height: toRpx(36);
            color: #999ea8;
            text-align: left;
            line-height: toRpx(36);
            margin-right: toRpx(24);
          }

          .score-value {
            // width: toRpx(346.5);
            height: toRpx(36);
            text-align: left;
            line-height: toRpx(36);

            &.passed {
              color: #2cca74;
            }
          }
        }

        // 重新考试按钮
        .retake-btn {
          width: toRpx(466.5);
          height: toRpx(56);
          border-radius: toRpx(24);
          opacity: 1;
          background: #f1f7fe;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          .retake-text {
            // width: toRpx(104);
            height: toRpx(32);
            opacity: 1;
            color: #3b73ff;
            font-size: toRpx(26);
            font-weight: 400;
            text-align: center;
            line-height: toRpx(32);
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
    text-align: center;
    color: #999999;
    font-size: toRpx(24);
    padding: toRpx(40) 0;
  }
}
</style>

