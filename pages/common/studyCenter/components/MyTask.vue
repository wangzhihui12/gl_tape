<template>
  <view class="task-box">
    <view class="tab-box">
      <view class="tab-list">
        <view @click="handleTabClick(index)" :class="['tab-item', tabIndex === index ? 'active' : '']"
          v-for="(item, index) in tabList" :key="index">
          <view class="tab-item-title">{{ item }}</view>
        </view>
      </view>
      <view class="finish-tab" v-if="tabIndex === 1">
        <view class="finish-tab-item" @click="handleFinishTabClick(2)" :class="{ 'finish-active': finishIndex === 2 }">
          长课程
        </view>
        <view class="finish-tab-item" @click="handleFinishTabClick(1)" :class="{ 'finish-active': finishIndex === 1 }">
          短课程
        </view>
      </view>
    </view>
    <view class="tips" v-if="tabIndex === 0">
      <view class="sprite-icon icon-study-tips"></view>
      <view class="tips-text">带有"限时学"标签的课程：规定时间内未完成任务，禁止提单！请按时学习。</view>
    </view>
    <scroll-view scroll-y ref="scrollViewRef" :scroll-top="scrollTop" @scrolltolower="pageonReachBottom"
      :class="[getScrollHeight]">
      <template v-if="taskList.length">
        <view class="task-list">
          <view class="task-item" v-for="(item, index) in taskList" :key="index" @click="handleTaskItemClick(item)">
            <view class="time-limit-tag" v-if="tabIndex === 0 && item.punishType == 1"></view>
            <view v-if="tabIndex === 0 && item.punishType == 1" class="time-limit-countdown ">
              <template v-if="item._timeout">
                <view class="countdown-label timeout-label">已超时</view>
              </template>
              <template v-else-if="item._showCountdown">
                <view class="countdown-label">剩</view>
                <view class="countdown-num">{{ item._countdownHour }}</view>
                <view class="countdown-separator">:</view>
                <view class="countdown-num">{{ item._countdownMinute }}</view>
                <view class="countdown-separator">:</view>
                <view class="countdown-num">{{ item._countdownSecond }}</view>
              </template>
              <template v-else-if="item._showDays">
                <view class="countdown-label">剩</view>
                <view class="countdown-num">{{ item._leftDays }}</view>
                <view class="countdown-label">天</view>
              </template>
              <template v-else>
                <view class="countdown-label">剩</view>
                <view class="countdown-num">--</view>
                <view class="countdown-separator">:</view>
                <view class="countdown-num">--</view>
                <view class="countdown-separator">:</view>
                <view class="countdown-num">--</view>
              </template>
            </view>
            <image
              class="task-item-img"
              :src="item.courseType === 1
                ? require('../../../../assets/images/common/short-course-default.webp')
                : require('../../../../assets/images/common/course-default-bg.webp')"
              mode="aspectFill"
            />
            <view class="task-item-content">
              <view class="task-item-title">{{ item.taskTitle }}</view>
              <view class="task-item-text">
                <view class="task-item-label">任务进度</view>
                <view class="task-item-progress" v-if="item.completeStatus == 0">
                  <view class="task-item-progress-bar" :style="{ width: Math.floor(item.taskProgress) + '%', minWidth: item.taskProgress > 0 ? '10px' : '0' }"></view>
                  <view class="task-item-progress-text">{{ Math.floor(item.taskProgress) }}%</view>
                </view>
                <view class="task-item-value" v-else><view class="dot-value"></view><view class="green">已完成</view></view>
              </view>
              <view class="task-item-text" v-if="item.courseType === 2">
                <view class="task-item-label">课程数</view>
                <view class="task-item-value">
                  {{ item.courseTotalCount }}节 | 
                  {{ (item.totalDuration || item.totalDuration === 0) ? `${item.totalDuration}min` : '-' }}
                </view>
              </view>
              <view class="task-item-text">
                <view class="task-item-label">完成时间</view>
                <view class="task-item-value">{{ tabIndex === 0 ? formatTime(item.taskDeadline, 'YYYY-MM-DD HH:mm') : formatTime(item.finishDate, 'YYYY-MM-DD HH:mm') }}</view>
              </view>
              <view class="task-item-status">{{ item.status }}</view>
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
import dayjs from 'dayjs'
export default {
  name: 'MyTask',
  data() {
    return {
      tabList: ['待完成', '已完成'],
      tabIndex: 0,
      finishIndex: 2,
      nothing: false,
      total: 0,
      pageNum: 1,
      pageSize: 12,
      scrollTop: 0,
      taskList: [],
      timer: null // 只需要一个定时器
    }
  },
  computed: {
    getScrollHeight() {
      const list = this.taskList;
      if (!list || list.length === 0) {
        return '';
      }
      switch (this.tabIndex) {
        case 0:
          return 'task-list-box';
        case 1:
          return 'task-finish-box';
        default:
          return '';
      }
    }
  },
  mounted() {
    this.getCourseTaskPage(this.tabIndex)
  },
  beforeDestroy() {
    this.clearCountdownTimer();
    // 移除事件监听，防止内存泄漏
    uni.$off && uni.$off('backStudyCenter');
  },
  methods: {
    // 清除倒计时定时器
    clearCountdownTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    // 启动倒计时定时器
    startCountdownForAll() {
      this.clearCountdownTimer();
      this.updateAllCountdowns(); // 立即更新一次
      this.timer = setInterval(() => {
        this.updateAllCountdowns();
      }, 1000);
    },
    // 更新所有需要倒计时的任务
    updateAllCountdowns() {
      const now = new Date();
      let hasCountdown = false;
      this.taskList.forEach(item => {
        if (
          this.tabIndex === 0 &&
          item.punishType == 1 &&
          item.taskDeadline
        ) {
          const deadline = new Date(item.taskDeadline);
          const diff = deadline - now;
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (diff > 0 && diff < oneDayMs) {
            // 小于1天，展示24小时倒计时
            hasCountdown = true;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            this.$set(item, '_countdownHour', hours.toString().padStart(2, '0'));
            this.$set(item, '_countdownMinute', minutes.toString().padStart(2, '0'));
            this.$set(item, '_countdownSecond', seconds.toString().padStart(2, '0'));
            this.$set(item, '_showCountdown', true);
            this.$set(item, '_showDays', false);
            this.$set(item, '_leftDays', null);
            this.$set(item, '_timeout', false);
          } else if (diff >= oneDayMs) {
            // 超过等于1天，显示剩余天数（不足x天则展示x-1天）
            this.$set(item, '_showCountdown', false);
            this.$set(item, '_showDays', true);
            // days = Math.ceil(diff / oneDayMs) - 1, 最小为1天
            let days = Math.ceil(diff / oneDayMs) - 1;
            if (days < 1) days = 1;
            this.$set(item, '_leftDays', days);
            this.$set(item, '_countdownHour', null);
            this.$set(item, '_countdownMinute', null);
            this.$set(item, '_countdownSecond', null);
            this.$set(item, '_timeout', false);
          } else if (diff <= 0) {
            // 已超时
            this.$set(item, '_timeout', true);
            this.$set(item, '_showCountdown', false);
            this.$set(item, '_showDays', false);
            this.$set(item, '_leftDays', null);
            this.$set(item, '_countdownHour', null);
            this.$set(item, '_countdownMinute', null);
            this.$set(item, '_countdownSecond', null);
          }
        } else {
          this.$set(item, '_showCountdown', false);
          this.$set(item, '_showDays', false);
          this.$set(item, '_leftDays', null);
          this.$set(item, '_timeout', false);
        }
      });
      // 如果没有任何需要倒计时的，清除定时器
      if (!hasCountdown) {
        this.clearCountdownTimer();
      }
    },
    // 格式化时间
    formatTime(time, formatStr) {
      if (!time) return '-';
      return dayjs(time).format(formatStr);
    },
    // 初始化倒计时字段（用于新获取的数据）
    initCountdownFieldsForList(list) {
      const now = new Date();
      list.forEach(item => {
        if (this.tabIndex === 0 && item.punishType == 1 && item.taskDeadline) {
          const deadline = new Date(item.taskDeadline);
          const diff = deadline - now;
          if (diff > 0 && diff <= 24 * 60 * 60 * 1000) {
            // 需要倒计时
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            this.$set(item, '_countdownHour', hours.toString().padStart(2, '0'));
            this.$set(item, '_countdownMinute', minutes.toString().padStart(2, '0'));
            this.$set(item, '_countdownSecond', seconds.toString().padStart(2, '0'));
            this.$set(item, '_showCountdown', true);
            this.$set(item, '_showDays', false);
            this.$set(item, '_leftDays', null);
            this.$set(item, '_timeout', false);
          } else if (diff > 24 * 60 * 60 * 1000) {
            // 超过24小时，显示剩余天数
            const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
            this.$set(item, '_showCountdown', false);
            this.$set(item, '_showDays', true);
            this.$set(item, '_leftDays', days);
            this.$set(item, '_countdownHour', null);
            this.$set(item, '_countdownMinute', null);
            this.$set(item, '_countdownSecond', null);
            this.$set(item, '_timeout', false);
          } else if (diff <= 0) {
            // 已超时
            this.$set(item, '_timeout', true);
            this.$set(item, '_showCountdown', false);
            this.$set(item, '_showDays', false);
            this.$set(item, '_leftDays', null);
            this.$set(item, '_countdownHour', null);
            this.$set(item, '_countdownMinute', null);
            this.$set(item, '_countdownSecond', null);
          }
        } else {
          this.$set(item, '_showCountdown', false);
          this.$set(item, '_showDays', false);
          this.$set(item, '_leftDays', null);
          this.$set(item, '_timeout', false);
        }
      });
    },
    // 获取我的任务接口, completeStatus: 完成状态 0=待完成 1=已完成, courseType: 课程类型 1=短课程 2=长课程
    async getCourseTaskPage(completeStatus, courseType) {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          completeStatus, // 完成状态 0=待完成 1=已完成
          recommendStatus: 0, // 推荐状态 0=无推荐 1=推荐课程
          pageNum,
          pageSize
        }
        if (courseType) {
          params.courseType = courseType
        }
        const res = await uni.$api.commonApi.getCourseTaskPage(params)
        // 处理倒计时相关字段
        let newList = res.list || [];
        // 对新获取的数据初始化倒计时字段
        if (completeStatus === 0) {
          this.initCountdownFieldsForList(newList);
        }
        if (pageNum == 1) {
          this.taskList = newList
        } else {
          // 合并新数据到已有数据
          this.taskList = this.taskList.concat(newList)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
        // 只在tabIndex为0时处理倒计时
        if (completeStatus === 0) {
          // 启动定时器（不管是第一页还是翻页都要）
          this.startCountdownForAll();
        } else {
          // 非待完成tab，清除定时器
          this.clearCountdownTimer();
        }
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
          this.getCourseTaskPage(tabIndex)
        } else {
          this.getCourseTaskPage(tabIndex, finishIndex)
        }
      } else {
        this.nothing = true;
      }
    },
    handleTabClick(index) {
      this.tabIndex = index
      this.pageNum = 1
      this.nothing = false
      this.taskList = []
      this.clearCountdownTimer();
      if (index == 1) {
        this.finishIndex = 2
        this.getCourseTaskPage(index, this.finishIndex) // 已完成，默认查长课程
      } else {
        this.getCourseTaskPage(index)
      }
      this.scrollTop = 1
      setTimeout(() => {
        this.scrollTop = 0
      }, 100);
    },
    handleFinishTabClick(index) {
      this.finishIndex = index
      this.pageNum = 1
      this.nothing = false
      this.taskList = []
      this.clearCountdownTimer();
      this.getCourseTaskPage(this.tabIndex, index)
    },
    handleTaskItemClick(item) {
      // console.log(item)
      const {courseType, id} = item
      if (courseType == 1) {
        uni.$track.add({eventCode: 'app_short_course', businessId: id, pagePath: '/pages/equity/index'})
      }
      uni.navigateTo({
        url: `/pages/common/studyDetail/${courseType == 1 ? 'shortCourse' : 'longCourse'}?row=${encodeURIComponent(JSON.stringify(item))}&completeStatus=${this.tabIndex}`,
        fail: (err) => {
          console.error('页面跳转失败:', err);
        },
        // 页面跳转后，监听返回事件
        success: () => {
          // 兼容H5/小程序/APP，返回时触发自定义事件
          // 这里不需要处理，onShow和backStudyCenter事件已处理倒计时恢复
        }
      });
    },
    findBeiSenSSOToken () {
      return new Promise(resolve => {
        const url = 'https%3A%2F%2Fcloud.italent.cn%2FPageHome%2FIndex%3Fproduct%3DLearning%26keyName%3DNusion%26pageCode%3DLearningNewHomepage%26appCode%3DLearning%26_qsrcapp%3DLearning%26_qrt%3Dhtml%26quark_s%3D5102bff371c00da5b19968ee53a8c3f1499ecd2447a19f72f3e3ba2390cc9617%23%2FviewDynamic%3Fshadow_context%3D%257BappModel%253A%2522italent%2522%252Cuppid%253A%25221%2522%257D%26quark_s%3D028930f1066f8ef8d28790940d53ae64337f44bde3a44cf89a290e4a3611e3e2'
        uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
          uni.$storage.set('beisenToken', res.data)
          const studyUrl = res.data ? `${res.data}&return_url=${url}` : ''
          resolve(studyUrl)
        })
      })
    },
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
  margin-top: toRpx(24);
  height: calc(100% - #{toRpx(210)});
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
    height: toRpx(432);
    background-color: #fff;
    border-radius: toRpx(24);
    font-size: 0;
    box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
    .time-limit-tag {
      position: absolute;
      top: 0;
      left: 0;
      width: toRpx(122);
      height: toRpx(48);
      background-image: url('../../../../assets/images/common/limit-page.webp');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1;
      color: #fff;
    }
    .time-limit-countdown {
      position: absolute;
      right: toRpx(18);
      top: toRpx(16);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: toRpx(24);
      z-index: 1;
      .countdown-num {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        width: toRpx(40);
        height: toRpx(40);
        border-radius: toRpx(4);
        background: #00000059;
        margin: 0 toRpx(4);
      }
      .countdown-separator {
        color: #fff;
      }
      .countdown-label,
      .countdown-unit {
        color: #00000066;
        margin: 0 toRpx(4);
      }
      .timeout-label {
        height: toRpx(40);
        line-height: toRpx(44);
        border-radius: toRpx(4);
        background: #00000059;
        color: #fff;
        padding: toRpx(4) toRpx(8);
        padding: 0 toRpx(12);
        font-size: toRpx(24);
      }
    }
    .task-item-img {
      width: 100%;
      height: toRpx(180);
      border-radius: toRpx(16) toRpx(16) 0 0;
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
      width: toRpx(214);
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
  padding: toRpx(30) 0;
  font-size: toRpx(24);
}
/deep/ {
  .uni-scroll-view-content {
    height: calc(100% - #{toRpx(20)});
  }
}
</style>