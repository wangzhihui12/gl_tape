<template>
  <view :class="[
    'study-box2',
    !isBeisen && (!isHmzx || !isYb) ? 'all-height' : '',
    isBeisen && (!isHmzx || !isYb) ? 'big-height' : ''
  ]">
    <view class="tab-list">
      <view @click="handleTabClick(index)" :class="['tab-item', tabIndex === index ? 'active' : '']"
        v-for="(item, index) in tabList" :key="index">
        <view class="tab-item-title">{{ item.title }}</view>
      </view>
    </view>
    <view class="rank-title">
      <view class="rank-title-text">周转化率排名</view>
      <view class="rank-value">
        <view class="rank-number">{{ currentConversionData.top || '-' }}</view>名
      </view>
    </view>

    <view class="bar-box">
      <view class="bar-item" v-for="(item, index) in barList" :key="index">
        <view class="bar-label">{{ item.label }}</view>
        <view class="bar-container">
          <view
            class="bar"
            :class="item.class"
            :style="{
              width: `${Math.min(100, Math.max(2, Number(currentConversionData[item.key]) || 0))}%`
            }"
          ></view>
          <view
            class="bar-text"
            :style="{ left: `calc(${Number(currentConversionData[item.key]) > 100 ? 100 : currentConversionData[item.key]}%)` }"
          >{{ (Number(currentConversionData[item.key]) || 0).toFixed(1) }}%</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'WeeklyConversionRate',
  props: {
    isFlag: {
      type: Boolean,
      default: false
    },
    dataInfo: {
      type: Object,
      default: () => {}
    },
    isHmzx: {
      type: Boolean,
      default: false
    },
    isYb: {
      type: Boolean,
      default: false
    },
    isBeisen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      barValue: 56,
      barList: [
        {
          label: '我的',
          value: '74.3',
          key: 'myConversionRatio',
          class: 'my'
        },
        {
          label: 'Top1',
          value: '94.5',
          key: 'topOneConversionRatio',
          class: 'top1'
        }
      ],
      tabIndex: 0,
    }
  },
  computed: {
    tabList() {
      const weekConversionRatio = this.dataInfo && this.dataInfo.weekConversionRatio
      if (!weekConversionRatio) return []
      // 按顺序轻改、权益、延保生成tabList
      const order = [0, 1, 2]
      const tabArr = order
        .filter(key => weekConversionRatio.hasOwnProperty(key))
        .map(key => {
          let title = '';
          if (key == 0) title = '轻改';
          else if (key == 1) title = '权益';
          else if (key == 2) title = '延保';
          else title = `类型${key}`;
          return {
            title,
            value: key
          }
        });
      // 有延保默认展示延保，没有延保默认展示第一个
      this.$nextTick(() => {
        if (tabArr.length > 0) {
          const yanbaoIndex = tabArr.findIndex(item => item.value == 2);
          if (yanbaoIndex !== -1) {
            if (this.tabIndex !== yanbaoIndex) this.tabIndex = yanbaoIndex;
          } else {
            if (this.tabIndex !== 0) this.tabIndex = 0;
          }
        }
      });
      return tabArr;
    },
    currentConversionData() {
      // 返回当前tabIndex对应的weekConversionRatio数据
      const weekConversionRatio = this.dataInfo && this.dataInfo.weekConversionRatio
      // const weekConversionRatio = {
      //   0: {
      //     top: 1,
      //     myConversionRatio: '0',
      //     topOneConversionRatio: '94.5'
      //   },
      //   1: {
      //     top: 2,
      //     myConversionRatio: '74.3',
      //     topOneConversionRatio: '94.5'
      //   },
      //   2: {  
      //     top: 3,
      //     myConversionRatio: '55.7',
      //     topOneConversionRatio: '84.5'
      //   },
      // }
      if (!weekConversionRatio) return {}
      const key = this.tabList[this.tabIndex] && this.tabList[this.tabIndex].value
      return weekConversionRatio[key] || {}
    }
  },
  
  methods: {
    handleTabClick(index) {
      this.tabIndex = index
    }
  }
}
</script>
<style lang="scss" scoped>
.study-box2 {
  width: calc(100% - #{toRpx(64)});
  border-radius: toRpx(24);
  background: #ffffff;
  padding: toRpx(24);
  margin: 0 toRpx(32) toRpx(16);
  &.big-height {
    height: toRpx(704);
  }
  &.all-height {
    height: calc(100% - #{toRpx(32)});
  }

  .tab-list {
    display: flex;
    width: 100%;
    height: toRpx(64);
    background-color: #F5F6F7;
    border-radius: toRpx(12);
    color: #666666;
    font-size: toRpx(24);

    .tab-item {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      margin: toRpx(4);

      &.active {
        background-color: #fff;
        color: #1A1A1A;
        border-radius: toRpx(10);
      }
    }
  }

  .rank-title {
    font-size: toRpx(28);
    color: #1A1A1A;
    margin-top: toRpx(32);
    margin-left: toRpx(8);
    display: flex;
    align-items: center;
    .rank-title-text {
      font-size: toRpx(28);
      color: #1A1A1A;
      margin-right: toRpx(8);
    }

    .rank-value {
      display: flex;
      align-items: baseline;
      color: #3B73FF;
      font-size: toRpx(22);
      font-weight: 500;s
      .rank-number {
        font-size: toRpx(40);
        font-weight: 700;
        margin-right: toRpx(4);
      }
    }
  
  }

  /* 进度条整体项样式 */
  .bar-box {
    margin-top: toRpx(28);
  }

  .bar-item {
    display: flex;
    align-items: center;
    margin-bottom: toRpx(20);
    padding-right: toRpx(120);

    &:last-child {
      margin-bottom: toRpx(22);
    }

    .bar-label {
      display: inline-block;
      width: toRpx(60);
      text-align: right;
      margin-right: toRpx(10);
      font-size: toRpx(22);
    }
  }

  /* 进度条容器样式 */
  .bar-container {
    position: relative;
    flex: 1;
    // width: toRpx(380);
    height: toRpx(12);
    // overflow: hidden; 
  }

  /* 进度条填充样式 */
  .bar {
    height: 100%;
    border-radius: 0 4px 4px 0;

    &.top1 {
      background: linear-gradient(90deg, #708dff 0%, #6858f5 100%);
    }

    &.my {
      background: linear-gradient(90deg, #389fff 0%, #2c66f7 100%);
    }
  }

  /* 进度百分比文字样式 */
  .bar-text {
    margin-left: toRpx(20);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
  }
}
</style>