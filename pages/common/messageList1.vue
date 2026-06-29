<template>
  <view class="message-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">消息中心</view>
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
        <view class="tag-box" v-if="firstIndex == 1">
          <view :class="['tag-item', i.classCode == tagIndex ? 'active' : '']" v-for="i in tagList" :key="i.className"
            @click="selectTag(i)">{{ i.className }}</view>
        </view>
        <scroll-view scroll-y ref="scrollViewRef" :class="['message-list', getScrollHeight]"
          @scrolltolower="pageonReachBottom" :scroll-top="scrollTop">
          <template v-if="getList.length">
            <view class="message-item" v-for="item in getList" :key="item.id" @click="openDetail(item)">
              <template v-if="firstIndex == 0">
                <view class="message-header">
                  <view :class="['dot', item.readFlag ? '' : 'red']"></view>
                  <view class="message-type">系统通知</view>
                  <view class="message-time">{{ item.actualSendTimeStr }}</view>
                  <view class="message-tag">{{ CONTRNT_TYPE[item.contentType] }}</view>
                </view>
                <view class="message-content"> 您有新的消息【{{ item.title }}】{{ item.subtitle ? item.subtitle.length > 40 ?
                  `[${item.subtitle.slice(0, 39)}...]` : `[${item.subtitle}]` : '' }}，请点击查看
                </view>
              </template>
              <template v-else-if="firstIndex == 1">
                <view class="message-header">
                  <view :class="['dot', item.status == 1 ? '' : 'red']"></view>
                  <view class="message-type">优秀话术-{{ item.sceneLabelName }}</view>
                  <view class="message-time">{{ item.time }}</view>
                  <view v-if="item.excellentLabelName" class="message-tag">{{ item.excellentLabelName }}</view>
                </view>
                <view class="message-content">{{ item.polishContent }}</view>
              </template>
              <template v-else-if="firstIndex == 2">
                <view class="message-header">
                  <view :class="['dot', item.status == 1 ? '' : 'red']"></view>
                  <view class="message-type">话术违规预警</view>
                  <view class="message-time">{{ item.time }}</view>
                  <view class="message-tag">{{ item.warningTag }}</view>
                </view>

                <view class="message-content warning-content">
                  <view>你有以下接待记录判定为话术违规</view>{{ item.warningContent }}
                </view>
              </template>
              <template v-else-if="firstIndex == 3">
                <view class="message-header">
                  <view :class="['dot', item.status == 1 ? '' : 'red']"></view>
                  <view class="message-type">AI导师消息</view>
                  <view class="message-time">{{ item.time }}</view>
                </view>
                <view class="message-content warning-content">
                  <view>您有新的消息【{{ item.sopTaskDetailInfoDTO ? item.sopTaskDetailInfoDTO.checkDate : ''
                    }}战败复盘报告】AI导师来帮你进行战败复盘了，请点击查看</view>
                </view>
              </template>
            </view>
          </template>
          <template v-else>
            <view class="nothing flex">
              <image class="icon" src="../../assets/images/home/nothing.webp" />
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
<script>
const PAGE_SIZE = 10
const PAGE_NUM = 1
const CONTRNT_TYPE = {
  1: '图文',
  2: '视频',
  3: 'PDF',
  5: '学习任务'
}
import dayjs from 'dayjs'
export default {
  data() {
    return {
      typeList: [
        { tabName: '系统通知', num: () => '' },
        { tabName: '优秀话术', num: () => '' },
        { tabName: '预警通知', num: () => '' },
        { tabName: 'AI导师', num: () => '' }
      ],
      CONTRNT_TYPE: CONTRNT_TYPE,
      firstIndex: 0,
      firstLeft: ['first', 'second', 'three', 'four'],
      firstClass: ['first-nav', 'second-nav', 'second-nav', 'second-nav'],
      systemList: [],
      messageList: [],
      earlyWarnList: [],
      aiTutor: [],
      nothing: false,
      total: 0,
      pageNum: PAGE_NUM,
      pageSize: PAGE_SIZE,
      tagList: [],
      tagIndex: '',
      scrollTop: 0
    }
  },
  computed: {
    getList() {
      const listMap = {
        0: this.systemList,
        1: this.messageList,
        2: this.earlyWarnList,
        3: this.aiTutor
      };
      if (this.firstIndex in listMap) {
        return listMap[this.firstIndex];
      }
      return []; // 若 firstIndex 不在 0、1、2 范围内，返回 []
    },
    getScrollHeight() {
      // 调用 getList 函数获取列表
      const list = this.getList;
      // 如果获取的列表为空，则返回空字符串
      if (!list || list.length === 0) {
        return '';
      }
      // 根据 firstIndex 的值返回不同的类名
      switch (this.firstIndex) {
        case 0:
          return 'scroll-list';
        case 1:
          return 'class-scroll';
        case 2:
          return 'scroll-list';
        default:
          return 'scroll-list';
      }
    }
  },
  created() {
    uni.$on('pageList', (data) => {
      console.log('接收到上一个页面返回的数据：', data);
      // 可以在这里添加处理数据的逻辑
      if (data) {
        const message = this.getList.find(item => item.id == data)
        if (message) message.status = 1
      }
    });
    this.init()
  },
  onLoad(options) {
    console.log(options)
    if (options && options.type == 'read') {
      this.changeType(1)
    }
  },
  methods: {
    init() {
      this.getSystemPage()
    },
    // tab切换
    changeType(index, tagIndex) {
      console.log(index)
      this.firstIndex = index
      this.total = 0
      this.pageNum = PAGE_NUM
      this.pageSize = PAGE_SIZE
      if (tagIndex) this.tagIndex = tagIndex
      else this.tagIndex = ''
      const actionMap = {
        0: () => this.getSystemPage(),
        1: () => {
          this.getMessagePage();
          this.getLabelList();
        },
        2: () => this.getWarningPage(),
        3: () => this.getAiAgentPage()
      };
      const action = actionMap[index];
      if (action) {
        action();
      }
    },
    // 跳转详情
    openDetail(row) {
      console.log(row);
      const { id } = row;
      const actionMap = {
        3: async() => {
          const { aiAgentInfoDTO, sopTaskDetailInfoDTO } = row;
          const { agentUrl, domainName, presuppositionProblem } = aiAgentInfoDTO || {};
          const { taskStatus, checkDate } = sopTaskDetailInfoDTO || {};
          if (!agentUrl) {
            return uni.showToast({
              title: '链接无效',
              icon: 'none'
            });
          }
          const url = `/pages/common/aiWebview?url=${agentUrl}&domain=${domainName}&presuppositionProblem=${presuppositionProblem}&practice_status=${taskStatus}&date=${checkDate}`;
          uni.navigateTo({ url });
          // 不刷新列表的更新消息状态
          if (row.status == 0) {
            this.getList.find(item => item.boxId == row.boxId).status = 1
            // 调用接口更新消息状态
            const res = await uni.$api.commonApi.updateMessageStatus({
              idList: [row.boxId]
            })
          }
        },
        2: () => {
          uni.navigateTo({
            url: `/pages/common/earlyWarnDetail?row=${encodeURIComponent(JSON.stringify(row))}`,
            fail: (err) => {
              console.error('页面跳转失败:', err);
            }
          });
        },
        1: () => {
          uni.navigateTo({
            url: `/pages/common/messageDetail?row=${encodeURIComponent(JSON.stringify(row))}&type=view`,
            fail: (err) => {
              console.error('页面跳转失败:', err);
            }
          });
        },
        0: () => {
          if (row.contentType == 5) {
            this.back()
            uni.$emit('studyCenter')
          } else {
            this.getDetailById(id, row.readFlag);
          }
        }
      };
      const action = actionMap[this.firstIndex];
      if (action) {
        action();
      }
    },
    back() {
      uni.$emit('pageBack')
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    // 选择标签
    selectTag(item) {
      this.tagIndex = item.classCode
      this.scrollTop = 1
      this.total = 0
      this.pageNum = PAGE_NUM
      this.pageSize = PAGE_SIZE
      this.nothing = false
      setTimeout(() => {
        this.scrollTop = 0
      }, 100);
      this.getMessagePage()
    },
    /** 接口定义 */
    // 客户标签
    async getLabelList() {
      const res = await uni.$api.commonApi.getClassConfig()
      const _all = [{
        className: '全部',
        classCode: ''
      }]
      this.tagList = _all.concat(res)
    },
    // 获取优秀话术分页列表
    async getMessagePage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { sceneType, uuid } = uni.$storage.get("userInfo")
        const { tagIndex, pageNum, pageSize } = this
        const params = {
          businessType: sceneType,
          uuid,
          classCode: tagIndex,
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getPageRecord(params)
        res.list?.length && res.list.map(e => {
          e.time = dayjs(new Date(e.pushTime)).format("YYYY-MM-DD HH:mm:ss")
        })
        if (pageNum == 1) {
          this.messageList = res.list
        } else {
          this.messageList = this.messageList.concat(res.list)
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
    async getSystemPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const res = await uni.$api.commonApi.getTaskInfo({
          pageNum, pageSize
        })
        if (pageNum == 1) {
          this.systemList = res.list
        } else {
          this.systemList = this.systemList.concat(res.list)
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
    async getWarningPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getWarningPage(params)
        res.list?.length && res.list.map(e => {
          e.time = dayjs(new Date(e.warningTime)).format("YYYY-MM-DD HH:mm:ss")
        })
        if (pageNum == 1) {
          this.earlyWarnList = res.list
          console.log(this.earlyWarnList, '===')
        } else {
          this.earlyWarnList = this.earlyWarnList.concat(res.list)
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
    // 获取AI导师消息分页列表
    async getAiAgentPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { sceneType } = uni.$storage.get("userInfo")
        const { pageNum, pageSize } = this
        const params = {
          pageNum,
          pageSize,
          businessType: sceneType
        }
        const res = await uni.$api.commonApi.getSopAiAgentMessageList(params)
        res.list?.length && res.list.map(e => {
          e.time = dayjs(new Date(e.pushTime)).format("YYYY-MM-DD HH:mm:ss")
        })
        if (pageNum == 1) {
          this.aiTutor = res.list
          console.log(this.aiTutor, '===')
        } else {
          this.aiTutor = this.aiTutor.concat(res.list)
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
    async getDetailById(id, readFlag) {
      const res = await uni.$api.commonApi.getTaskById({ id })
      // 不刷新列表的更新消息状态
      if (!readFlag) this.getList.find(item => item.id == id).readFlag = true
      const _row = encodeURIComponent(JSON.stringify(res))
      if (res.contentType == 1) {
        // this.showPage('SystemDetial', { row: res })
        uni.navigateTo({
          url: `/pages/common/systemDetail?row=${_row}`
        })
      } else if (res.contentType == 2) {
        console.log(JSON.parse(res.content))
        const _content = res.content ? JSON.parse(res.content) : []
        const url = _content[0]
        const { content, title, id } = res
        uni.navigateTo({
          // url: `/pages/common/msgwebview?url=${url}&title=${title}&id=${id}`
          url: `/pages/common/imgPreview?tabName=${title}&sourceType=2&detailUrl=${url}&row=${_row}`
        })
      } else if (res.contentType == 3) {
        const _content = res.content ? JSON.parse(res.content) : []
        const url = _content[0].image
        const { content, title, id } = res
        uni.navigateTo({
          url: `/pages/common/msgwebview?fileUrl=${url}&title=${title}&id=${id}&row=${_row}`
        })
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
              this.getMessagePage();
            } catch (error) {
              console.error('调用 getMessagePage 方法时出错:', error);
            }
            break;
          case 0:
            try {
              this.getSystemPage();
            } catch (error) {
              console.error('调用 getSystemPage 方法时出错:', error);
            }
            break;
          case 2:
            try {
              this.getWarningPage();
            } catch (error) {
              console.error('调用 getWarningPage 方法时出错:', error);
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
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
  }
}

.message-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  box-sizing: border-box;
  padding-top: toRpx(160);

  .message-body {
    position: relative;
    margin: 0 toRpx(64) toRpx(80);
    background-color: rgba(255, 255, 255, 0.35);
    // border: toRpx(4) solid #fff;
    border-radius: toRpx(48);
    // height: calc(100% - #{toRpx(236)});

    .data-container {
      background: #ffffff;
      border-radius: toRpx(48);
      height: calc(100vh - #{toRpx(244)});
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

    .message-list {
      position: relative;
      background-color: #fff;
      border-radius: 0 0 toRpx(48) toRpx(48);

      &.scroll-list {
        height: calc(100% - #{toRpx(222)});
      }

      &.class-scroll {
        height: calc(100% - #{toRpx(338)});
      }

      .message-item {
        border-radius: toRpx(16);
        // box-shadow: 0 toRpx(4) toRpx(20) 0 #0000001a;
        box-shadow: 0 4px 12px 0 #2c66f71a;
        margin: 0 toRpx(64) toRpx(40);
        padding: toRpx(24) toRpx(32);
        box-sizing: border-box;

        &:first-child {
          margin-top: toRpx(10);
        }

        .message-header {
          display: flex;
          align-items: center;

          .dot {
            width: toRpx(12);
            height: toRpx(12);
            border-radius: 50%;
            background-color: #999;
            margin-right: toRpx(24);

            &.red {
              background-color: #F24724;
            }
          }

          .message-type {
            color: #333;
            font-size: toRpx(32);
            font-weight: 500;
            line-height: toRpx(44);
            margin-right: toRpx(24);
          }

          .message-time {
            color: rgba(102, 102, 102, 0.6);
            font-size: toRpx(28);
          }

          .message-tag {
            border-radius: toRpx(4);
            background: rgba(255, 157, 10, 0.1);
            padding: toRpx(8) toRpx(24);
            color: #ff9d0a;
            font-size: toRpx(24);
            font-weight: 500;
            margin-left: toRpx(24);
          }
        }

        .message-content {
          color: #666666;
          font-size: toRpx(28);
          line-height: toRpx(48);
          margin-top: toRpx(17);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;

          &.warning-content {
            white-space: pre-line;
            -webkit-line-clamp: 4;
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

.tag-box {
  display: flex;
  margin: toRpx(2) toRpx(64) 0;

  .tag-item {
    padding: toRpx(18) toRpx(32);
    border-radius: toRpx(16);
    opacity: 1;
    background: #f2f2f2;
    margin-right: toRpx(24);
    margin-bottom: toRpx(40);

    &.active {
      color: #2D66F7;
      background: #2d66f71a;
    }
  }
}

/deep/ {
  .uni-scroll-view-content {
    height: calc(100% - #{toRpx(10)});
  }
}
</style>