<template>
  <view class="type-tab">
    <view class="type-box">
      <view
        class="tab-item"
        v-for="(i, index) in typeList"
        :key="index"
        @click="tabClick(index)"
      >
        <view
          :class="['sprite-icon',tabClass(index)]"
          :style="{
          left:blockLeft
        }"
        ></view>
        <view
          class="text flex"
          :class="[tabIndex == index ? `active` : '']"
        >
          {{ i[nameKey] }}
          <template v-if="hasNum">
            <view class="num"> {{formatNum(i[numKey] || 0)}}</view>
          </template>
        </view>
      </view>
    </view>
    <view
      class="mask-box"
      :style="[{height:maskHeight}]"
    ></view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    typeList: Array,
    tabIndex: {
      type: Number,
      default: 0
    },
    nameKey: {
      type: String,
      default: 'tabName'
    },
    maskHeight: {
      type: String,
      default: '100vh'
    },
    hasNum: {
      type: Boolean,
      default: false
    },
    numKey: {
      type: String,
      default: 'tabNum'
    }
  },
  name: '',
  data () {
    return {
      firstClass: Object.freeze(['first-nav', 'second-nav']),
    }
  },
  computed: {
    blockLeft () {
      let { tabIndex } = this
      return `${(tabIndex * 248) - (tabIndex == 0 ? 0 : 36)}rpx`
    }
  },
  mounted () {
  },
  methods: {
    tabClass (index) {
      let className = ''
      if (this.tabIndex == index) {
        className = 'active icon-'
        if (index == 0) className += 'first-nav'
        else className += 'second-nav'
      }
      return className
    },
    tabClick (index) {
      this.$emit('update:tabIndex', index)
      this.$emit('tabClick', index)
    },
    formatNum(num){
      if(num > 99) return '99+'
      else return num
    }
  }
}
</script>

<style scoped lang='scss'>
.type-tab {
  position: relative;
  height: 96rpx;
  overflow: hidden;
  .type-box {
    position: relative;
    display: flex;
    width: 100%;
    background-color: #eef4fe;
    height: toRpx(120);
    line-height: toRpx(96);
    border-radius: toRpx(48) toRpx(48) 0 0;
    overflow: hidden;
    z-index: 0;
    .tab-item {
      width: toRpx(248);
      text-align: center;
      font-weight: 500;
      font-size: toRpx(32);
      color: #1f2133;
      .text {
        position: relative;
        justify-content: center;
        width: toRpx(248);
        .num {
          font-size: 24rpx;
          margin-left: 8rpx;
        }
      }
      .active {
        position: absolute;
        top: 0;
        z-index: -1;
        font-weight: 700;
        font-size: toRpx(32);
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
      .sprite-icon {
        transform: scale(.65, .73);
        transform-origin: 0 0;
        transition: left 0.15s;
      }
    }
  }
  .mask-box {
    position: absolute;
    width: 100%;
    background: #fff;
    left: 0;
    top: toRpx(96);
    border-radius: toRpx(48);
    overflow: hidden;
  }
}
</style>