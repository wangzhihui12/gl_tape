<template>
  <view class="study-center">
    <view class="study-left-box">
      <!-- 我的学习时长 -->
      <view class="study-duration-card">
        <view class="card-title">我的学习时长</view>
        <view class="duration-content">
          <!-- 左边：累计 -->
          <view class="duration-item">
            <view class="item-label">累计</view>
            <view class="item-value">
              <text class="value-number">{{ dataInfo.totalHour == null ? '-' : dataInfo.totalHour }}</text>
              <text class="value-unit">小时</text>
            </view>
          </view>
          <!-- 右边：本月 -->
          <view class="duration-item">
            <view class="item-label">本月</view>
            <view class="item-value">
              <text class="value-number">{{ dataInfo.monHour == null ? '-' : dataInfo.monHour }}</text>
              <text class="value-unit">小时</text>
            </view>
            <view class="item-compare">
              <text class="compare-text">对比上月</text>
              <text class="compare-percent" :class="{
                red: dataInfo.monHourRatio > 0,
                green: dataInfo.monHourRatio < 0,
                normal: dataInfo.monHourRatio === 0
              }">{{ dataInfo.monHourRatio == null ? '-' : Math.abs(dataInfo.monHourRatio) + '%' }}</text>
              <template v-if="dataInfo.monHourRatio != null">
                <view v-if="dataInfo.monHourRatio > 0" class="sprite-icon icon-up-arrow"></view>
                <view v-else-if="dataInfo.monHourRatio < 0" class="sprite-icon icon-green-arrow"></view>
                <view v-else class="sprite-icon icon-normal"></view>
              </template>
            </view>
          </view>
        </view>
      </view>
      <view class="my-list">
        <view class="list-item" @click="goToMyCourse">
          <image class="item-icon" :src="require('@/assets/images/studyCenter/my-courses.png')" mode="aspectFit" />
          <view class="item-text">我的课程</view>
          <view class="badge" v-if="dataInfo.unReadCount > 0"></view>
        </view>
        <view class="list-item" @click="goToMyExam">
          <image class="item-icon" :src="require('@/assets/images/studyCenter/my-exam.png')" mode="aspectFit" />
          <view class="item-text">我的考试</view>
        </view>
        <view class="list-item" @click="goToMyTask" v-if="showMyTask">
          <image class="item-icon" :src="require('@/assets/images/studyCenter/my-tasks.png')" mode="aspectFit" />
          <view class="item-text">我的任务</view>
        </view>
        <view class="list-item" @click="goToLeaderboard">
          <image class="item-icon" :src="require('@/assets/images/studyCenter/leaderboard.png')" mode="aspectFit" />
          <view class="item-text">排行榜</view>
        </view>
      </view>
    </view>
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
        <template v-if="firstIndex == 0">
          <view class="tips">
            <view class="sprite-icon icon-study-tips"></view>
            <view class="tips-text">本周学习时长{{dataInfo.weekHour == null ? '-' : dataInfo.weekHour}}小时</view>
          </view>
          <Studying ref="myTask" />
        </template>
        <template v-if="firstIndex == 1">
          <!-- 搜索框 -->
          <view class="search-container">
            <view class="search-box" @click="focusSearch">
              <view v-show="!searchKeyword" class="search-placeholder-wrapper">
                <text class="placeholder-text">搜索课程</text>
                <uni-icons type="search" size="20" color="#999ea8" class="search-icon"></uni-icons>
              </view>
              <input ref="searchInput" class="search-input" v-model="searchKeyword" placeholder="" confirm-type="search"
                @confirm="handleSearch" />
              <view class="clear-btn" @click.stop="clearSearch" v-show="searchKeyword">
                <uni-icons type="closeempty" size="16" color="#999ea8"></uni-icons>
              </view>
            </view>
          </view>
          <!-- 筛选组件区域 -->
          <view class="filter-container">
            <view class="filter-left">
              <!-- 综合排序 -->
              <view class="filter-item">                
                <select-component
                  ref="sortSelect"
                  :selectList="sortOptions"
                  :defaultValue="currentSortValue"
                  @chooseType="handleSortChange"
                />
              </view>

              <!-- 全部课程（两级） -->
              <view class="filter-item">
                <TwoLevelSelectComponent ref="categorySelect" labelKey="categoryName" :selectList="categoryOptions"
                  @chooseType="handleCategoryChange" />
              </view>

              <!-- 筛选按钮 -->
              <view class="filter-item filter-btn" @click="openFilter">
                筛选
                <view class="sprite-icon icon-filter"></view>
              </view>
            </view>
            <!-- 右侧课程数量 -->
            <view class="course-count">共{{ totalCourseCount }}门课程</view>
          </view>
          <!-- <view class="tips">
            <view class="sprite-icon icon-study-tips"></view>
            <view class="tips-text">本周学习时长X小时，超过X%的人</view>
          </view> -->
          <Course ref="allCourse" :searchParams="searchParams" />
        </template>
      </view>
    </view>

    <!-- 筛选弹窗 - 移到外层，不受父容器宽度限制 -->
    <OrderScreen ref="orderScreen" title="筛选" :configData="courseConfig" @onConfirm="handleFilterConfirm" />

  </view>
</template>

<script>
import LearnStatistics from './Study/LearnStatistics.vue'
import WeeklyConversionRate from './Study/WeeklyConversionRate.vue'
import Studying from './Study/Studying.vue'
import Course from './Study/Course.vue'
import RadarChart from 'pages/common/studyDetail/components/RadarChart.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import TwoLevelSelectComponent from '@/components/TwoLevelSelectComponent.vue'
import OrderScreen from '@/components/OrderScreen/index.vue'
import courseConfig from '@/components/OrderScreen/courseConfig'

export default {
  name: 'StudyCenter',
  components: {
    LearnStatistics,
    WeeklyConversionRate,
    Studying,
    Course,
    RadarChart,
    SelectComponent,
    TwoLevelSelectComponent,
    OrderScreen
  },
  data() {
    return {
      chartData: {},
      dataInfo: {
        totalHour: 0,
        monHour: 0,
        weekHour: 0,
        monHourRatio: null,
        unReadCount: 0
      },
      labelColors: [],
      typeList: [
        { tabName: '正在学习', num: () => '' },
        { tabName: '全部课程', num: () => '' }
      ],
      firstIndex: 0,
      firstLeft: ['first', 'second'],
      firstClass: ['short-first-nav', 'short-second-nav'],
      isBeisen: false,  // 是否是有北森权限，true 有，false无
      showMyTask: true, // 是否显示我的任务图标

      // 筛选相关数据
      totalCourseCount: 0,
      searchKeyword: '', // 搜索关键词

      // 对比上月数据（临时模拟数据）
      monthCompare: {
        percent: '0%',
        color: '#ff9d0a',
        // icon: require('@/assets/images/studyCenter/heng.png')
      },
      courseConfig: courseConfig, // 课程筛选配置
      sortOptions: [
        // { label: '综合排序', value: 'default' },
        { label: '最多人学', value: 0 },
        { label: '最高评分', value: 1 },
        { label: '最新发布', value: 2 }
      ],
      categoryOptions: [
        {
          label: '综合排序',
          value: 'all',
          children: []
        },
        {
          label: '全部课程',
          value: 'course',
          children: [
            { label: '公司介绍', value: 'company' },
            { label: '行业名称', value: 'industry' },
            { label: '客户服务', value: 'service' }
          ]
        },
        {
          label: '呼叫哨哨',
          value: 'call',
          children: [
            { label: '机里哨哨', value: 'machine' },
            { label: '呼叫哨哨哨', value: 'call-detail' }
          ]
        }
      ],
      currentSortValue: 0,
      searchParams: {
        sortType: 0,
        sortOrder: 'desc'
      }
    }
  },
  created() {
    // 监听课程数量更新事件
    uni.$on('update:totalCourseCount', (count) => {
      console.log(count, 'totalCourseCount')
      this.totalCourseCount = count
    })
  },
  beforeDestroy() {
    // 移除事件监听
    uni.$off('update:totalCourseCount')
  },
  async mounted() {
    // const beisenToken = uni.$storage.get('beisenToken')
    // console.log(beisenToken, 'beisenToken')
    // this.isBeisen = !!beisenToken
    // if (!beisenToken) {
    //   // 没有北森权限则typeList没有推荐课程
    //   this.typeList = [
    //     { tabName: '我的任务', num: () => '' }
    //   ]
    // }
    // 检查是否显示我的任务
    this.showMyTask = await this.checkStudyCenterPermission()

    this.getMyStudyTime();
    this.getCourseCategoryTree()
  },
  methods: {
    // 我的学习时长
    async getMyStudyTime() {
      const res = await uni.$api.commonApi.getStudyCenterTimeStatistics({
        staffPhone: uni.$storage.get('userInfo').phone
      })
      console.log(res, 'getMyStudyTime')
      if (res) {
        this.dataInfo = res || {}
      }
    },
    // 新学习中心 - 课程分类树
    async getCourseCategoryTree() {
      const res = await uni.$api.commonApi.getCourseCategoryTree()
      console.log(res, 'res')
      if (res) {
        const list = Array.isArray(res) ? res : []
        const filtered = list
          .filter(item => item && item.id !== 1)
          .map(item => ({
            ...item,
            children: [
              { categoryName: '全部' },
              ...((item.children && Array.isArray(item.children)) ? item.children : [])
            ]
          }))
        this.categoryOptions = [
          { categoryName: '全部分类', children: [{ categoryName: '全部' }] },
          ...filtered
        ]
      }
    },
    // 聚焦搜索框
    focusSearch() {
      // 这里可以添加聚焦逻辑，暂时不做处理
    },
    // 处理搜索
    handleSearch() {
      console.log('搜索关键词:', this.searchKeyword)
      this.searchParams.title = this.searchKeyword
      this.$refs.allCourse.pageNum = 1
      this.$refs.allCourse.getALlCourse()
      // TODO: 调用课程列表接口，传入搜索关键词
    },
    // 清空搜索
    clearSearch() {
      this.searchKeyword = ''
      delete this.searchParams.title
      this.handleSearch()
    },
    // 打开筛选弹窗
    openFilter() {
      this.$refs.orderScreen.open()
    },
    // 处理排序变化 综合排序、最多人学、最高评分、最新发布
    handleSortChange({ item, index }) {
      console.log('排序变化:', item, index)
      this.currentSortValue = item.value
      // TODO: 调用课程列表接口，传入排序参数
      // if (item.value == 'default') {
      //   // 综合排序不用传参数
      //   delete this.searchParams.sortType
      // } else {
      this.searchParams.sortType = item.value
      // }
      this.searchParams.title = this.searchKeyword
      this.$refs.allCourse.pageNum = 1
      this.$refs.allCourse.getALlCourse()
    },
    // 处理分类变化
    handleCategoryChange({ item, level, parent }) {
      console.log('分类变化:', item, level, parent)
      this.searchParams.courseCategoryId = item.id
      this.searchParams.title = this.searchKeyword
      this.$refs.allCourse.pageNum = 1
      this.$refs.allCourse.getALlCourse()
      // TODO: 调用课程列表接口，传入分类参数
    },
    // 处理筛选确认
    handleFilterConfirm(filterData) {
      console.log('筛选条件:', filterData)
      const keys = ['planCourseType', 'courseFileType', 'totalStar']
      keys.forEach(k => {
        if (Object.prototype.hasOwnProperty.call(filterData, k)) {
          this.searchParams[k] = filterData[k]
        } else {
          delete this.searchParams[k]
        }
      })
      Object.keys(filterData).forEach(k => {
        if (!keys.includes(k)) {
          this.searchParams[k] = filterData[k]
        }
      })
      this.searchParams.title = this.searchKeyword
      this.$refs.allCourse.pageNum = 1
      this.$refs.allCourse.getALlCourse()
      // TODO: 调用课程列表接口，传入筛选条件
    },
    // 跳转到我的课程
    goToMyCourse() {
      uni.navigateTo({
        url: '/pages/common/studyCenter/myCourse'
      })
    },
    // 跳转到我的任务
    async goToMyTask() {
      // 先检查权限
      const hasPermission = await this.checkStudyCenterPermission()
      if (hasPermission) {
        uni.navigateTo({
          url: '/pages/common/studyCenter/myTask'
        })
      } else {
        uni.showToast({
          title: '暂无权限访问',
          icon: 'none'
        })
      }
    },
    // 跳转到我的考试
    goToMyExam() {
      uni.navigateTo({
        url: '/pages/common/studyCenter/myExam'
      })
    },
    // 跳转到排行榜
    goToLeaderboard() {
      uni.navigateTo({
        url: '/pages/common/studyCenter/leaderboard'
      })
    },
    // 检查学习中心权限
    async checkStudyCenterPermission() {
      try {
        const userInfo = uni.$storage.get('userInfo')

        // 如果是渠道类型为9，没有权限
        if (userInfo?.subLoginUser?.channelType == 9) {
          return false
        }

        // 获取权限信息
        let studyCenterPermission = uni.$storage.get('studyCenterPermission')

        // 如果缓存中没有，调用接口获取
        if (!studyCenterPermission) {
          const res = await uni.$api.commonApi.getStudyCenterPermission({})
          studyCenterPermission = res
          uni.$storage.set('studyCenterPermission', res)
        }

        // 判断权限：直营 或者 （鸿蒙智行 且 有延保业务）
        const { directSaleAuth, hmzxAuth, authorizedBusinessList } = studyCenterPermission
        const isYb = authorizedBusinessList && authorizedBusinessList.includes(1) // 1.延保 2.轻改 3.权益

        // 有直营权限 或者 （有鸿蒙智行权限 且 有延保业务权限）则显示
        return directSaleAuth || (hmzxAuth && isYb)
      } catch (error) {
        console.error('获取学习中心权限失败:', error)
        return true
      }
    },
    // tab切换
    changeType(index, tagIndex) {
      this.firstIndex = index
      if (index == 0) {
        // 重置搜索条件
        this.searchKeyword = ''
        this.currentSortValue = 0 
        this.$refs.orderScreen.clear()
        this.searchParams = {
          sortType: 0,
          sortOrder: 'desc'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
  margin-top: toRpx(56);
  margin-bottom: toRpx(80);

  .study-left-box {
    width: toRpx(656);
    border-radius: toRpx(48);
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    margin-right: toRpx(48);
    padding: toRpx(24) toRpx(32);

    .study-duration-card {
      width: toRpx(592);
      height: toRpx(320);
      border-radius: toRpx(24);
      background: #ffffff;
      padding: toRpx(24) toRpx(32) toRpx(28) toRpx(32);

      .card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: toRpx(24);

        .title-text {
          color: #333333;
          font-size: toRpx(28);
          font-weight: 500;
          font-family: "HarmonyOSSansSC";
          line-height: toRpx(36);
        }

        .title-compare {
          display: flex;
          align-items: center;

          .compare-label {
            width: toRpx(104);
            height: toRpx(36);
            color: #666666;
            font-size: toRpx(26);
            font-weight: 400;
            font-family: "HarmonyOSSansSC";
            line-height: toRpx(36);
          }

          .compare-value {
            width: toRpx(36);
            height: toRpx(36);
            font-size: toRpx(26);
            font-weight: 400;
            font-family: "HarmonyOSSansSC";
            line-height: toRpx(36);
            margin-left: toRpx(4);
          }

          .compare-arrow {
            width: toRpx(28);
            height: toRpx(28);
            margin-left: toRpx(4);
          }
        }
      }

      .duration-content {
        width: toRpx(528);
        height: toRpx(208);
        border-radius: toRpx(16);
        background: #4673ff0d;
        padding: toRpx(20) toRpx(0);
        display: flex;
        justify-content: space-between;
      }

      .duration-item {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding-left: toRpx(20);
      }

      .item-label {
        width: toRpx(100);
        height: toRpx(44);
        border-radius: toRpx(8);
        background: #4673ff1a;
        color: #4673ff;
        font-size: toRpx(26);
        font-weight: 500;
        font-family: "HarmonyOSSansSC";
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: toRpx(46);
      }

      .item-value {
        display: flex;
        align-items: baseline;
      }

      .value-number {
        color: #4673ff;
        font-size: toRpx(40);
        font-weight: 500;
        font-family: "HarmonyOSSansSC";
      }

      .value-unit {
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        line-height: toRpx(36);
        margin-left: toRpx(4);
      }

      .duration-item:first-child .item-label {
        margin-bottom: toRpx(46);
      }

      .duration-item:last-child .item-label {
        margin-bottom: toRpx(28);
      }

      .item-compare {
        display: flex;
        align-items: center;
        margin-top: toRpx(8);

        .compare-icon {
          width: toRpx(28);
          height: toRpx(28);
          margin-left: toRpx(4);
        }
      }

      .compare-text {
        width: toRpx(104);
        height: toRpx(36);
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        text-align: left;
        line-height: toRpx(36);
      }

      .compare-percent {
        // width: toRpx(72);
        height: toRpx(36);
        color: #666;
        font-size: toRpx(26);
        font-weight: 400;
        font-family: "HarmonyOSSansSC";
        text-align: left;
        line-height: toRpx(36);
        margin-left: toRpx(4);

        &.red {
          color: #F24724;
        }

        &.green {
          color: #35C376;
        }

        &.normal {
          color: #FF9D0A;
        }
      }
    }

    // 我的列表
    .my-list {
      margin-top: toRpx(28);
      display: flex;
      flex-wrap: wrap;
      gap: toRpx(28);
      margin-bottom: toRpx(178);

      .list-item {
        width: toRpx(168);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: toRpx(28);
        position: relative;

        .item-icon {
          width: toRpx(96);
          height: toRpx(96);
          margin-bottom: toRpx(6);
        }

        .item-text {
          width: toRpx(112);
          height: toRpx(34);
          color: #292d33;
          font-size: toRpx(28);
          font-weight: 400;
          font-family: "HarmonyOSSansSC";
          text-align: center;
        }

        .badge {
          position: absolute;
          top: toRpx(8);
          right: toRpx(48);
          width: toRpx(12);
          height: toRpx(12);
          border-radius: toRpx(732);
          background: #f24724;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: toRpx(20);
          font-weight: 400;
          font-family: "HarmonyOSSansSC";
          text-align: center;
          line-height: 1;
        }
      }
    }
  }

  // 我的学习时长卡片

  .study-left {
    width: toRpx(656);
    margin-right: toRpx(48);
    border-radius: toRpx(48);
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;

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
      height: calc(100vh - #{toRpx(136)} - #{toRpx(104)});
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
    margin-right: toRpx(48);
    position: relative;

    .data-container {
      background: #ffffff;
      border-radius: toRpx(48);
      // height: calc(100vh - #{toRpx(136)});
      height: toRpx(1392);
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

          .sprite-icon {
            &.active {
              position: absolute;
              top: 0;
              z-index: -1;
              font-weight: 500;
              font-size: toRpx(32);
              color: #3B73FF;
            }
          }

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

            &.active {
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

      // 搜索框样式
      .search-container {
        padding: 0 toRpx(40);
        margin-top: toRpx(32);
        margin-bottom: toRpx(32);

        .search-box {
          width: toRpx(1274);
          height: toRpx(80);
          border-radius: toRpx(40);
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 toRpx(32);
          position: relative;

          .search-placeholder-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;

            .search-icon {
              margin-right: toRpx(16);
            }

            .placeholder-text {
              font-size: toRpx(32);
              font-weight: 400;
              font-family: "HarmonyOSSansSC";
              color: #999ea8;
              line-height: toRpx(48);
            }
          }

          .search-input {
            width: 100%;
            height: toRpx(48);
            font-size: toRpx(32);
            font-weight: 400;
            font-family: "HarmonyOSSansSC";
            line-height: toRpx(48);
            color: #333333;
            text-align: center;
          }

          .clear-btn {
            position: absolute;
            right: toRpx(32);
            display: flex;
            align-items: center;
            justify-content: center;
            width: toRpx(48);
            height: toRpx(48);
            cursor: pointer;
          }
        }
      }

      // 筛选组件区域样式
      .filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 toRpx(40);
        margin-top: toRpx(32);

        .filter-left {
          display: flex;
          align-items: center;
          gap: toRpx(40);

          .filter-item {
            flex-shrink: 0;
          }

          .filter-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: toRpx(84);
            padding: 0 toRpx(32);
            border-radius: toRpx(16);
            background: #f2f2f2;
            font-size: toRpx(28);
            color: #333333;
            cursor: pointer;

            .sprite-icon {
              margin-left: toRpx(8);
            }
          }
        }

        .course-count {
          width: toRpx(160);
          height: toRpx(40);
          color: #999ea8;
          font-size: toRpx(28);
          font-weight: 400;
          font-family: "HarmonyOSSansSC";
          text-align: center;
          line-height: toRpx(40);
        }
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

  margin: toRpx(0) toRpx(40);
  margin-top: toRpx(32);

  &-text {
    margin-top: toRpx(4);
  }

  .icon-study-tips {
    margin-right: toRpx(8);
  }
}
</style>
