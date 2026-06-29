<template>
  <view class="my-course-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back" @click="back">
          <uni-icons type="left" :size="20" color="#000000"></uni-icons>
        </view>
        <view class="title">我的课程</view>
      </view>
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

    <!-- 提示信息-->
    <view class="tips" v-if="residueInfo.remindType != 0">
      <view class="sprite-icon icon-study-tips"></view>
      <view class="tips-text" v-if="residueInfo.remindType == '1'">剩余{{ residueInfo.residueDays }}天完成必修课学习及通过课后考试，过期将锁定开单权限</view>
      <view class="tips-text" v-if="residueInfo.remindType == '2'">完成必修课学习及通过课后考试后，即可解锁开单权限</view>
    </view>

    <!-- 课程列表 -->
    <view class="course-content" :class="residueInfo.remindType != 0 ? 'with-tips' : 'no-tips'">
      <!-- 待学习 tab：使用 ToLearnCourse 组件 -->
      <ToLearnCourse v-if="currentTab === 0" ref="toLearnCourse" :cardWidth="530" />
      <!-- 正在学习 tab：使用 Studying 组件 -->
      <Studying v-else-if="currentTab === 1" ref="studying" :cardWidth="530" />
      <!-- 已学完 tab：使用 CompletedCourse 组件 -->
      <CompletedCourse v-else-if="currentTab === 2" ref="completedCourse" :cardWidth="530" />
	  <!-- 推荐学习 tab：使用 CompletedCourse 组件 -->
      <RecommendClass v-else-if="currentTab === 3" ref="completedCourse" :cardWidth="530" />
    </view>
  </view>
</template>

<script>
import ToLearnCourse from './components/ToLearnCourse.vue'
import Studying from './components/Studying.vue'
import CompletedCourse from './components/CompletedCourse.vue'
import RecommendClass from './components/RecommendClass.vue'

export default {
  name: 'MyCoursePage',
  components: {
    ToLearnCourse,
    Studying,
    CompletedCourse,
	RecommendClass
  },
  data() {
    return {
      currentTab: 0,
      tabList: [
        { label: '待学习', count: '0', key: 'unLearnCount' },
        { label: '正在学习', count: '0', key: 'learningCount' },
        { label: '已学完', count: '0', key: 'completedCount' },
        { label: '推荐学习', count: '0', key: 'recommendCount' }
      ],
      residueInfo: {
        remindType: 0
      }
    }
  },
  mounted() {
    console.log('MyCoursePage mounted')
    this.getMyCourseTabCount()
    this.getStudyCenterResidueTime()
    this.asyncfindBeiSenSSOToken() // 获取北森权限
  },
  methods: {
    back() {
      uni.navigateBack()
    },
    switchTab(index) {
      this.currentTab = index
      this.getMyCourseTabCount()
    },
    // tab 页面数量
    async getMyCourseTabCount() {
      const res = await uni.$api.commonApi.getMyCourseTabCount()
      this.tabList.forEach((tab, index) => {
        tab.count = res[tab.key] || '0'
      })
    },
    // 学习中心 - 我的课程剩余开单时间
    async getStudyCenterResidueTime() {
      const res = await uni.$api.commonApi.getStudyCenterResidueTime()
      this.residueInfo = res
    },
    async asyncfindBeiSenSSOToken() {
      const res = await uni.$api.commonApi.findBeiSenSSOToken({})
      uni.$storage.set('beisenToken', res.data)
    },
  }
}
</script>

<style lang="scss" scoped>
.my-course-container {
  width: 100%;
  height: 100vh;
  position: relative;

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

  .header {
    position: relative;
    z-index: 10;
    background: transparent;
    height: toRpx(140);

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

  .tab-container {
    display: flex;
    align-items: center;
    padding: 0 toRpx(64);
    // margin-top: toRpx(52);
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

  .tips {
    display: flex;
    align-items: center;
    padding: toRpx(8) toRpx(22);
    background-color: rgba(255, 243, 224, 0.8);
    border-radius: toRpx(8);
    font-size: toRpx(24);
    color: #FF9D0A;
    height: toRpx(48);
    margin: toRpx(28) toRpx(64);

    &-text {
      margin-top: toRpx(4);
    }

    .icon-study-tips {
      margin-right: toRpx(8);
    }
  }

  .course-content {
    width: 100%;
    // height: toRpx(1200);
    // overflow-y: auto;
    // padding: 0 toRpx(64);
    &.no-tips {
      height: calc(100vh - #{toRpx(300)});
    }
    &.with-tips {
      height: calc(100vh - #{toRpx(380)});
    }
  }
}
</style>



