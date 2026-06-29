<template>
  <view class="tabs-component flex">
    <template>
      <view
        v-for="(i, index) in list"
        :class="['tab flex',size, { active: activeIndex == index }]"
        :key="index"
        @click="changeTab(index)"
        :style="{
          width:blockWidth
        }"
      >
        {{ i[tabKey] || i }}
        <template v-if="i.dot && i.dot()">
          <view class="dot"></view>
        </template>
      </view>
    </template>
    <view
      class="active-btn"
      :style="{
          width:blockWidth,
          left:activeBlockLeft
      }"
    ></view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    list: Array,
    defaultIndex: {
      type: Number,
      default: 0
    },
    tabKey: {
      type: String,
      default: 'text'
    },
    size: {
      type: String,
      default: 'normal'
    }
  },
  name: '',
  watch: {
    defaultIndex: {
      immediate: true,
      handler (newval) {
        this.activeIndex = newval || 0
      }
    }
  },
  data () {
    return {
      activeIndex: 0
    }
  },
  computed: {
    blockWidth () {
      let { list } = this,
        width = 1 / list.length * 100
      return `calc(${width}% - 4rpx)`
    },
    activeBlockLeft () {
      let { list, activeIndex } = this,
        width = 1 / list.length * 100,
        left = activeIndex == 0 ? '4rpx' : `${activeIndex * width}%`
      return left
    }
  },
  mounted () {
  },
  methods: {
    changeTab (index) {
      this.activeIndex = index
      this.$emit('changeTab', index)
    }
  }
}
</script>

<style scoped lang='scss'>
.tabs-component {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: #f2f2f2;
  border-radius: toRpx(16);
  position: relative;
  box-sizing: border-box;
  padding: toRpx(4);
  &::after {
    position: absolute;
    z-index: -2;
    background: #ffffff;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    content: '';
  }
  .tab {
    height: calc(100% - #{toRpx(8)});
    justify-content: center;
    color: #666666;

    z-index: 10;
    position: relative;
    .dot {
      position: absolute;
      top: toRpx(4);
      right: toRpx(28);
      width: toRpx(12);
      height: toRpx(12);
      border-radius: 100%;
      background: #f24724;
    }
  }
  .normal {
    font-size: toRpx(28);
  }
  .small{
    font-size: toRpx(24);
  }
  .active {
    color: #1a1a1a;
    font-weight: 500;
  }
  .active-btn {
    position: absolute;
    height: calc(100% - #{toRpx(8)});
    background: #ffffff;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.15s;
    border-radius: toRpx(16);
  }
}
</style>