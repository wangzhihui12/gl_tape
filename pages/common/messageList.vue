<template>
  <view class="message-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">优秀话术</view>
    </view>
    <view class="message-body">
      <view class="data-container">
        <view class="tag-box">
          <view :class="['tag-item', i.classCode == tagIndex ? 'active' : '']" v-for="i in tagList" :key="i.className"
            @click="selectTag(i)">{{ i.className }}</view>
        </view>
        <scroll-view scroll-y ref="scrollViewRef" :class="['message-list', getScrollHeight]"
          @scrolltolower="pageonReachBottom" :scroll-top="scrollTop">
          <template v-if="messageList.length">
            <view class="message-item" v-for="item in messageList" :key="item.id" @click="openDetail(item)">

              <view class="message-header">
                <view :class="['dot', item.status == 1 ? '' : 'red']"></view>
                <view class="message-type">优秀话术-{{ item.sceneLabelName }}</view>
                <view class="message-time">{{ item.time }}</view>
                <view v-if="item.excellentLabelName" class="message-tag">{{ item.excellentLabelName }}</view>
              </view>
              <view class="message-content">{{ item.polishContent }}</view>
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
import dayjs from 'dayjs'
export default {
  data() {
    return {
      messageList: [],
      nothing: false,
      total: 0,
      pageNum: PAGE_NUM,
      pageSize: PAGE_SIZE,
      tagList: [],
      tagIndex: '',
      scrollTop: 0,
      type: ''
    }
  },
  computed: {
    getScrollHeight() {
      return this.messageList.length > 0 ? 'scroll-list' : ''
    }
  },
  created() {
    // uni.$on('pageList', (data) => {
    //   console.log('接收到上一个页面返回的数据：', data);
    //   // 可以在这里添加处理数据的逻辑
    //   if (data) {
    //     const message = this.getList.find(item => item.id == data)
    //     if (message) message.status = 1
    //   }
    // });
    this.init()
  },
  onLoad(options) {
    console.log(options)
    if (options.type) this.type = options.type
    // this.init()
  },
  methods: {
    init() {
    this.getMessagePage();
    this.getLabelList();
    },
    // 跳转详情
    openDetail(row) {
      uni.navigateTo({
        url: `/pages/common/messageDetail?row=${encodeURIComponent(JSON.stringify(row))}&type=view`,
        fail: (err) => {
          console.error('页面跳转失败:', err);
        }
      });
    },
    back() {
      let pageNum = 2
      if (this.type == 'read') {
        pageNum = 1
      }
      uni.$emit('pageBack')
      uni.navigateBack({
        delta: pageNum,
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
        let businessTypeList = []
        if (sceneType == 0) {
          businessTypeList = [0, 2]
        } else if (sceneType == 1) {
          businessTypeList = [1]
        }
        const params = {
          // businessType: sceneType,
          businessTypeList,
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
        this.getMessagePage();
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
    border-radius: toRpx(48);

    .data-container {
      background: #ffffff;
      border-radius: toRpx(48);
      height: calc(100vh - #{toRpx(244)});
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border: toRpx(2) solid #fff;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      padding: toRpx(24) 0;
    }

    .message-list {
      position: relative;
      background-color: #fff;
      border-radius: 0 0 toRpx(48) toRpx(48);
      &.scroll-list {
        height: calc(100% - #{toRpx(120)});
      }

      .message-item {
        border-radius: toRpx(16);
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
  margin-top: toRpx(250);
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