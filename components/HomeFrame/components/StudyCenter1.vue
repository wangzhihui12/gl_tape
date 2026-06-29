<template>
  <view class="course-content" v-if="tokenUrl">
    <view class="title">
      <view>专属必学课程</view>
      <view class="course-btn" @click="openAllCourse">
        <view class="sprite-icon icon-course"></view>
        查看全部课程
      </view>
    </view>
    <view class="message-body">
      <view class="data-container">
        <view :class="['type-box']">
          <view class="tab-item" v-for="(i, index) in typeList" :key="index" @click="changeType(index)">
            <view
              :class="['sprite-icon', firstIndex == index ? `icon-${firstClass[index]} active` : '', firstLeft[index]]">
            </view>
            <view class="text" :class="[firstIndex == index ? `active` : '']">
              {{ i.tabName }}
              <template>{{ i.num() }}</template>
              <!-- <template>({{ preRecordFailList.length }})</template> -->
              <div class="dot" :style="{ right: '86rpx' }" v-if="i.dot && i.dot()"></div>
            </view>
          </view>
        </view>
        <view class="tabs-bottom"></view>
        <view class="input-box">
          <input type="text" class="input" v-model="name" maxlength="50" @blur="input($event)" @focus="focus" />
          <view class="input-tips" v-if="!isSearch">任务名称、课程名称<uni-icons type="search" class="icon" color="#999"
              size="20"></uni-icons></view>
          <uni-icons v-if="isSearch" type="closeempty" class="close" color="#999" @click="handleClear"
            size="20"></uni-icons>
        </view>
        <view class="tips" v-if="firstIndex != 2">
          <view class="sprite-icon icon-study-tips"></view>
          <view class="tips-text">带有"限时学"标签的课程：规定时间内未完成任务，禁止提单！请按时学习。</view>
        </view>
        <scroll-view scroll-y ref="scrollViewRef" :class="['message-list', getScrollHeight]" @scrolltolower="pageonReachBottom"
          :scroll-top="scrollTop">
          <template v-if="list.length">
            <view class="message-list-box">
              <view class="message-item" v-for="item in list" :key="item.id" @click="openDetail(item)">
                <view class="time-limit-tag" v-if="item.punishType == 1"></view>
                <image class="course-bg" src="../../../assets/images/common/course-default-bg.webp" mode="aspectFill" />
                <view class="course-info">
                  <view class="course-title">{{ item.taskTitle }}</view>
                  <view class="study-status">
                    <text class="label">学习进度</text>
                    <view class="value-wrapper">
                      <view class="status-dot" :class="{
                        'orange-bg': [1, 2, 3].includes(item.status),
                        'green-bg': item.status === 5,
                        'red-bg': item.status === 4
                      }"></view>
                      <text class="value" :class="{
                        'orange': [1, 2, 3].includes(item.status),
                        'green': item.status === 5,
                        'red': item.status === 4
                      }">{{ 
                        item.status === 1 ? '未学习' :
                        item.status === 2 ? '未完成' :
                        item.status === 3 ? '待考核' :
                        item.status === 4 ? '未通过' :
                        item.status === 5 ? '已完成' : ''
                      }}</text>
                    </view>
                  </view>
                  <view class="info-item">
                    <text class="label">课程名称</text>
                    <view class="value value-hidden">{{ item.courseName }}</view>
                  </view>
                  <view class="info-item">
                    <text class="label">开始时间</text>
                    <text class="value">{{ item.createdDate }}</text>
                  </view>
                  <view class="info-item">
                    <text class="label">完成时间</text>
                    <text class="value">{{ item.taskDeadline ? item.taskDeadline : '-' }}</text>
                  </view>
                  <view class="info-item">
                    <text class="label">完成标准</text>
                    <text class="value">{{ item.taskFinishCriteria === 0 ? '无' : '完成学习 (含考核)' }}</text>
                  </view>
                </view>
              </view>
            </view>
          </template>
          <template v-else>
            <view class="nothing flex">
              <image class="icon" src="../../../assets/images/home/nothing.webp" />
              暂无数据
            </view>
          </template>
          <template v-if="nothing">
            <view class="end-text">-已经到底了-</view>
          </template>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
const PAGE_SIZE = 10
const PAGE_NUM = 1
export default {
  name: '',
  data() {
    return {
      typeList: [
        { tabName: '全部', num: () => '' },
        { tabName: '未完成', num: () => '' },
        { tabName: '已完成', num: () => '' }
      ],
      firstIndex: 0,
      firstLeft: ['first', 'second', 'three'],
      firstClass: ['first-nav', 'second-nav', 'second-nav'],
      scrollTop: 0,
      list: [],
      messageList: [],
      earlyWarnList: [],
      name: '',
      isSearch: false,
      nothing: false,
      total: 0,
      pageNum: PAGE_NUM,
      pageSize: PAGE_SIZE,
      tokenUrl: ''
    }
  },
  computed: {
    getScrollHeight() {
      // 调用 getList 函数获取列表
      const list = this.list;
      // 如果获取的列表为空，则返回空字符串
      if (!list || list.length === 0) {
        return '';
      }
      // 根据 firstIndex 的值返回不同的类名
      switch (this.firstIndex) {
        case 2:
          return 'class-scroll';
        default:
          return 'scroll-list';
      }
    }
  //   getList() {
  //     const listMap = {
  //       0: this.systemList,
  //       1: this.messageList,
  //       2: this.earlyWarnList
  //     };
  //     if (this.firstIndex in listMap) {
  //       return listMap[this.firstIndex];
  //     }
  //     return []; // 若 firstIndex 不在 0、1、2 范围内，返回 []
  //   },
  },
  mounted() {
    console.log(uni.$storage.get('beisenToken'), 'beisenToken')
    this.tokenUrl = uni.$storage.get('beisenToken')
    if(this.tokenUrl) {
      this.getStudyCenterList()
      this.getUnreadCount()
    }
  },
  methods: {
    // tab切换
    changeType(index, tagIndex) {
      console.log(index)
      this.firstIndex = index
      this.name = ''
      this.scrollTop = 1
      this.total = 0
      this.pageNum = PAGE_NUM
      this.pageSize = PAGE_SIZE
      if (tagIndex) this.tagIndex = tagIndex
      else this.tagIndex = ''
      setTimeout(() => {
        this.scrollTop = 0
      }, 100);
      this.getStudyCenterList()
      this.getUnreadCount()
    },
    openAllCourse() {
      console.log('跳转北森')
      this.$emit("handleOperation", { type: 'openCourse' })
    },
    focus() {
      this.isSearch = true
    },
    input(e) {
      this.name = e.detail.value
      if (this.name == '')
        this.isSearch = false
      this.getStudyCenterList(this.name)
    },
    handleClear() {
      this.name = ''
      this.isSearch = false
      this.getStudyCenterList()
    },
    openDetail(item) {
      console.log(item)
      this.$emit("handleOperation", { type: 'courseDetail', data: item })
    },
    // 查询未读数
    async getUnreadCount() {
      try {
        const { undoCount } = await uni.$api.commonApi.getStudyCenterStatistics();
        this.typeList[1].num = () => undoCount === 0 ? '' : `(${undoCount})`;
      } catch (error) {
        console.error('获取未读数失败:', error);
        this.typeList[1].num = () => '';
      }
    },
    async getStudyCenterList(search) {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          pageNum,
          pageSize
        }
        if (this.firstIndex === 1) {
          params.readFlag = false
          params.statusList = [1,2,3,4]
        } else if (this.firstIndex === 2) {
          params.readFlag = true
          params.statusList = [5]
        }
        if (search) params.search = search
        const res = await uni.$api.commonApi.getStudyCenterList(params)
        if (pageNum == 1) {
          this.list = res.list
        } else {
          this.list = this.list.concat(res.list)
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
    /**
     * 页面触底时的处理函数
     * 当页面触底时，判断是否还有更多数据，如果有则加载下一页数据
     * 如果没有更多数据，则标记为没有更多数据状态
     */
     pageonReachBottom() {
      console.log('到底了');
      // 解构赋值，设置 nothing 的默认值
      let { pageNum, total, nothing = 'nothing', pageSize } = this;

      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1;
        // 根据 firstIndex 的值调用不同的方法
        switch (this.firstIndex) {
          case 1:
            try {
              this.getStudyCenterList();
            } catch (error) {
              console.error('调用 getStudyCenterList 方法时出错:', error);
            }
            break;
          case 0:
            try {
              this.getStudyCenterList();
            } catch (error) {
              console.error('调用 getStudyCenterList 方法时出错:', error);
            }
            break;
          case 2:
            try {
              this.getStudyCenterList();
            } catch (error) {
              console.error('调用 getStudyCenterList 方法时出错:', error);
            }
            break;
          default:
            break;
        }
      } else {
        this.nothing = true;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.course-content {
  padding-right: toRpx(64);
}

.title {
  display: flex;
  color: #1a1a1a;
  font-size: toRpx(44);
  align-items: center;
  justify-content: space-between;
  margin-top: toRpx(96);
}

.course-btn {
  display: flex;
  align-items: center;
  // width: toRpx(304);
  height: toRpx(72);
  border-radius: toRpx(16);
  font-size: toRpx(30);
  padding: toRpx(14) toRpx(40);
  opacity: 1;
  color: #fff;
  background: #e1e8f5;
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);

  .icon-course {
    margin-right: toRpx(17);
  }
}

.message-body {
  position: relative;
  margin: toRpx(32) 0 0;
  background-color: rgba(255, 255, 255, 0.35);
  // border: toRpx(4) solid #fff;
  border-radius: toRpx(48);
  // height: calc(100% - #{toRpx(236)});

  .data-container {
    background: #ffffff;
    border-radius: toRpx(48);
    height: calc(100vh - #{toRpx(276)});
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
      height: toRpx(176);
      line-height: toRpx(128);
      border-radius: toRpx(48) toRpx(48) 0 0;
      z-index: 0;

      .tab-item {
        width: toRpx(400);
        text-align: center;
        font-weight: 500;
        font-size: toRpx(40);
        color: #1f2133;

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
            top: toRpx(40);
            border-radius: 50%;
            right: toRpx(86);
          }
        }

        .active {
          position: absolute;
          top: 0;
          z-index: -1;
          font-weight: 700;
          font-size: toRpx(40);
          color: #2c66f7;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: toRpx(48);
            height: toRpx(8);
            background-color: #2c66f7;
            border-radius: toRpx(16);
          }
        }
      }
    }

    .tabs-bottom {
      background: #fff;
      height: toRpx(50);
      position: relative;
      border-radius: toRpx(24) toRpx(24) 0 0;
      position: absolute;
      width: 100%;
      top: toRpx(128);
    }
  }

  .input-box {
    position: relative;
    margin: toRpx(2) toRpx(64) 0;

    .input {
      padding-left: toRpx(30);
      text-align: center;
      height: toRpx(80);
      background: #ffffff;
      border: toRpx(3) solid #a8c1ff;
      border-radius: toRpx(16);
      width: 100%;
      line-height: toRpx(80);
      z-index: 1;
    }

    .input-tips {
      color: #999999;
      position: absolute;
      left: 0;
      top: 0;
      height: toRpx(80);
      width: 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;

      .icon {
        margin-left: toRpx(12);
      }
    }

    .close {
      position: absolute;
      right: 0;
      top: 0;
      width: toRpx(120);
      height: toRpx(80);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .tips {
    display: flex;
    align-items: center;
    padding: toRpx(8) toRpx(22);
    background-color: rgba(255, 243, 224, 0.8);
    border-radius: toRpx(8);
    margin: toRpx(24) toRpx(64) 0;
    font-size: toRpx(24);
    color: #FF9D0A;
    height: toRpx(48);
    &-text {
      margin-top: toRpx(4);
    }

    .icon-study-tips {
      margin-right: toRpx(8);
    }
  }

  .message-list-box {
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(48);
    padding: 0 toRpx(64) toRpx(24);
  }

  .message-list {
    position: relative;
    background-color: #fff;
    border-radius: 0 0 toRpx(48) toRpx(48);
    // height: calc(100% - #{toRpx(400)});
    margin-top: toRpx(24);
    &.scroll-list {
      height: calc(100% - #{toRpx(400)});
    }

    &.class-scroll {
      height: calc(100% - #{toRpx(336)});
    }
   
    .message-item {
      position: relative;
      width: calc((100% - #{toRpx(144)}) / 4);
      border-radius: toRpx(24);
      box-shadow: 0 toRpx(8) toRpx(32) 0 #2c66f71a;
      box-sizing: border-box;
      .time-limit-tag {
        position: absolute;
        top: 0;
        left: 0;
        width: toRpx(122);
        height: toRpx(48);
        background-image: url('../../../assets/images/common/limit-page.webp');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1;
        color: #fff;
      }

      .course-bg {
        width: 100%;
        height: toRpx(180);
        border-radius: toRpx(16) toRpx(16) 0 0;
      }

      .course-info {
        padding: toRpx(20) toRpx(32) toRpx(20);
        .course-title {
          font-size: toRpx(30);
          color: #292D33;
          font-weight: 500;
        }
        .label {
          margin-right: toRpx(24);
          font-size: toRpx(24);
          color: #999EA8;
          
        }
        .study-status {
          display: flex;
          align-items: center;
          margin-top: toRpx(20);
          margin-bottom: toRpx(24);
          padding: toRpx(16) toRpx(20);
          background-color: #F5F9FF;
          border-radius: toRpx(6);
          font-size: toRpx(24);
          .value-wrapper {
            display: flex;
            align-items: center;
            .status-dot {
              width: toRpx(12);
              height: toRpx(12);
              border-radius: 50%;
              margin-right: toRpx(8);
              &.orange-bg {
                background-color: #F59619;
              }
              &.green-bg {
                background-color: #2CCA74;
              }
              &.red-bg {
                background-color: #EB4E4E;
              }
            }
          }
          .orange {
            color: #F59619;
          }
          .green {
            color: #2CCA74;
          }
          .red {
            color: #EB4E4E;
          }
        }
        .info-item {
          display: flex;
          font-size: toRpx(24);
          margin-bottom: toRpx(12);
          .value {
            color: #666666;
            &.value-hidden {
            width: toRpx(254);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          }
        }
      }
    }
  }
}

.nothing {
  width: 100%;
  flex-direction: column;
  margin-top: toRpx(230);
  font-size: toRpx(28);
  color: #999999;

  .icon {
    width: toRpx(678);
    height: toRpx(284);
    margin-bottom: toRpx(24);
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
