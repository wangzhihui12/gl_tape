<template>

    <scroll-view scroll-y class="service-list">
      <view :class="['message-index-box', type == 'out' ? 'message-out' : '']">
        <view class="message-list" v-if="getTopList.length > 0">
          <view :class="['message-item', moduleType == i.moduleType ? 'active' : '']" v-for="(i, ind) in getTopList"
            :key="ind" @click.stop="handleClick(i)">
            <view class="message-item-icon">
              <view :class="['sprite-icon', `icon-${moduleIconEnum[i.moduleType]}`]"></view>
              <view class="message-item-icon-num" v-if="i.count > 0">{{ i.count > 99 ? 99 : i.count }}</view>
            </view>
            <view class="message-item-content">
              <view class="message-item-title">{{ moduleTypeEnum[i.moduleType] }}</view>
              <view class="message-item-desc">{{ moduleContentEnum[i.moduleType] ? moduleContentEnum[i.moduleType] :
                i.title }}</view>
            </view>
            <view class="message-item-time-box">
              <view class="message-item-time">{{ formatTime(i.createdTime, 'HH:mm') }}</view>
              <view class="sprite-icon icon-stick-top"></view>
            </view>
          </view>
        </view>
        <template v-if="getList.length > 0">
          <view class="message-group" v-for="(item, index) in getList" :key="index">
            <view class="message-date">{{ item.date }}</view>
            <view class="message-list">
              <view :class="['message-item', moduleType == i.moduleType ? 'active' : '']"
                v-for="(i, ind) in item.msgList" :key="ind" @click.stop="handleClick(i)">
                <view class="message-item-icon">
                  <view :class="['sprite-icon', `icon-${moduleIconEnum[i.moduleType]}`]"></view>
                  <view class="message-item-icon-num" v-if="i.count > 0">{{ i.count > 99 ? 99 : i.count }}</view>
                </view>
                <view class="message-item-content">
                  <view class="message-item-title">{{ moduleTypeEnum[i.moduleType] }}</view>
                  <view class="message-item-desc">{{ moduleContentEnum[i.moduleType] ? moduleContentEnum[i.moduleType] :
                    i.title }}</view>
                </view>
                <view class="message-item-time">{{ formatTime(i.createdTime, 'HH:mm') }}</view>
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view class="message-empty">
            <image class="message-empty-img" src="../../../../assets//images/home/notice-nothing.webp"
              mode="scaleToFill" />
            <view class="message-empty-text">暂无消息</view>
          </view>
        </template>
      </view>
    </scroll-view>
</template>
<script>
import dayjs from 'dayjs';
import { moduleTypeEnum, moduleIconEnum, moduleContentEnum } from './contant.js';
export default {
  name: 'MessageIndex',
  props: {
    moduleType: {
      type: [Number, String, null],
      default: null
    },
    topListProp: {
      type: Array,
      default: () => []
    },
    messageList: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      moduleTypeEnum,
      moduleIconEnum,
      moduleContentEnum,
      topList: [],
      msgList: []
    }
  },
  watch: {
    messageList: {
      handler(newVal) {
        this.msgList = newVal
      },
      immediate: true
    },
    topListProp: {
      handler(newVal) {
        this.topList = newVal
      },
      immediate: true
    }
  },
  computed: {
    getTopList() {
      if (!this.topList) return [];
      // 过滤出topList中包含moduleType的对象
      const result = this.msgList.filter(item => this.topList.includes(item.moduleType));
      return result
    },
    getList() {
      // 过滤掉topList中包含moduleType的对象
      const filteredList = this.msgList.filter(item => {
        if (!this.topList) return true;
        return !this.topList.includes(item.moduleType);
      });

      // 根据date进行分组
      const groupedByDate = {};
      filteredList.forEach(item => {
        if (!groupedByDate[item.strDate]) {
          groupedByDate[item.strDate] = [];
        }
        groupedByDate[item.strDate].push(item);
      });

      // 转换为数组格式，并按date降序排列
      return Object.keys(groupedByDate)
        .sort((a, b) => b.localeCompare(a)) // 日期大的在前面
        .map(date => ({
          date,
          msgList: groupedByDate[date]
        }));
    }
  },
  created() {
    this.getTopInfo()
  },
  methods: {
    getTopInfo() {
      const { phone, shopMerchantId, sceneType } = uni.$storage.get('userInfo')
      const _topInfo = uni.$storage.get('noticeTopInfo') || {}
      const key = `${phone}-${shopMerchantId}-${sceneType}`
      this.topList = _topInfo[key] || []
    },
    formatTime(time, formatStr) {
      return dayjs(time).format(formatStr);
    },
    handleClick(item) {
      this.$emit('handleClick', item)
    }
  }
}
</script>
<style scoped lang="scss">
.service-list {
  height: 100%;
}
.message-index-box {
  margin: 0 toRpx(32);
  // height: 100%;
  &.message-out {
    padding-bottom: toRpx(40);
    box-sizing: content-box;
  }

  .message-group {
    .message-date {
      color: #999999;
      font-size: toRpx(24);
      margin-bottom: toRpx(20);
      text-align: center;
    }
  }

  .message-list {
    margin-bottom: toRpx(20);

    .message-item {
      position: relative;
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: toRpx(24);
      padding: toRpx(24);

      &.active {
        background: #4673ff1a;
      }

      &:not(:last-child) {
        margin-bottom: toRpx(20);
      }

      .message-item-icon {
        position: relative;
        margin-right: toRpx(24);

        &-num {
          position: absolute;
          top: toRpx(-6);
          right: toRpx(-6);
          height: toRpx(24);
          line-height: toRpx(24);
          padding: 0 toRpx(6);
          color: #ffffff;
          font-size: toRpx(20);
          background: #FF4D4F;
          border-radius: toRpx(50);
        }
      }

      .message-item-content {
        .message-item-title {
          color: #333333;
          font-size: toRpx(30);
        }

        .message-item-desc {
          color: #999999;
          font-size: toRpx(24);
          margin-top: toRpx(8);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          word-break: break-all;
        }
      }

      .message-item-time {
        color: #999999;
        font-size: toRpx(24);
        margin-left: auto;
      }

      .message-item-time-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: auto;

        .icon-stick-top {
          margin-top: toRpx(4);
        }
      }
    }
  }
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: toRpx(144);

  &-img {
    width: toRpx(496);
    height: toRpx(208);
  }

  &-text {
    color: #999999;
    font-size: toRpx(20);
  }
}
</style>