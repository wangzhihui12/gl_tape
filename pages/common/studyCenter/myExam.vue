<template>
  <view class="my-exam-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000000"></uni-icons>
      </view>
      <view class="title">我的考试</view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-container">
      <view 
        v-for="(tab, index) in tabList" 
        :key="index"
        :class="['tab-item', { 'active': currentTab === index }]"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.label }}{{ tab.count }}</text>
      </view>
    </view>

    <!-- 考试列表 -->
    <view class="exam-content">
      <!-- 已通过 tab：使用 PassedExam 组件 -->
      <PassedExam v-if="currentTab === 0" ref="passedExam" :cardWidth="530" />
      <!-- 未通过 tab：使用 FailedExam 组件 -->
      <FailedExam v-else-if="currentTab === 1" ref="failedExam" :cardWidth="530" />
    </view>
  </view>
</template>

<script>
import PassedExam from '@/components/HomeFrame/components/Study/PassedExam.vue'
import FailedExam from '@/components/HomeFrame/components/Study/FailedExam.vue'

export default {
  name: 'MyExamPage',
  components: {
    PassedExam,
    FailedExam
  },
  data() {
    return {
      currentTab: 0,
      tabList: [
        { label: '已通过', count: '0' },
        { label: '未通过', count: '0' }
      ]
    }
  },
  created() {
    // 在组件创建时就开始监听，确保事件能被捕获
    uni.$on('afterStudyPopup', () => {
      console.log('接收到考试提交弹窗事件')
      if (this.currentTab === 1) {
        this.$refs.failedExam.showExamPopup = true
      } else if (this.currentTab === 0) {
        this.$refs.passedExam.showExamPopup = true
      }
    })
  },
  beforeDestroy() {
    // 组件销毁前移除监听
    uni.$off('afterStudyPopup')
  },
  mounted() {
    this.getExamStatistics()
  },
  methods: {
    back() {
      uni.navigateBack()
    },
    switchTab(index) {
      this.currentTab = index
      this.getExamStatistics()
    },
    async getExamStatistics() {
      const res = await uni.$api.commonApi.getExamStatistics({
        staffPhone: uni.$storage.get('userInfo').phone
      })
      console.log(res)
      this.tabList[0].count = res.passCount || '0'
      this.tabList[1].count = res.failCount || '0'
    }
  }
}
</script>

<style lang="scss" scoped>
.my-exam-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  box-sizing: border-box;
  padding-top: toRpx(156);
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
    font-weight: 500;
    font-size: toRpx(32);
    color: #1a1a1a;
  }
}

  .tab-container {
    display: flex;
    align-items: center;
    // margin-top: toRpx(44);
    margin-bottom: toRpx(28);
    padding: 0 toRpx(64);
    .tab-item {
      width: toRpx(208);
      height: toRpx(72);
      border-radius: toRpx(16);
      border: toRpx(2) solid #ffffffcc;
      background: #ffffff;
      backdrop-filter: blur(toRpx(12));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: toRpx(16);
      cursor: pointer;
      transition: all 0.3s ease;

      .tab-text {
        font-size: toRpx(28);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        color: #666666;
        text-align: center;
        line-height: toRpx(36);
      }

      &:last-child {
        margin-right: 0;
      }

      &.active {
        border: toRpx(2) solid #ffffff;
        background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
        box-shadow: toRpx(4) toRpx(8) toRpx(16) 0 #81a3d659;

        .tab-text {
          color: #ffffff;
          font-weight: 500;
        }
      }
    }
  }

  .exam-content {
    width: 100%;
    // overflow-y: auto;
  }
</style>


