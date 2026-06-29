<template>
  <view class="tabs">
    <template v-for="(item,index) in list">
      <view
        :class="['tab',{active:index == tabIndex}]"
        :id="`tab-${index}`"
        :key="index"
        @click="tabClick(index)"
      >
        {{item.tabName}}
      </view>
    </template>
    <view
      class="border"
      :style="`${borderStyle}width:calc(${100 / list.length}% - 4rpx)`"
    ></view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'Tabs',
  props: {
    list: Array,
    show: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      tabIndex: 0,
      borderStyle: '',
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.tabClick(0)
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      setTimeout(() => {
        this.setBorderLeft()
      }, 500)
    },
    tabClick (index) {
      this.tabIndex = index
      this.$emit('tabclick', index)
      this.setBorderLeft()
    },
    setBorderLeft () {
      let { tabIndex, list } = this,
        blockWidth = 100 / list.length
      this.borderStyle = `left:${blockWidth * tabIndex}%;`
    }
  }
}
</script>

<style scoped lang='scss'>
.tabs {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRpx(76);
  background: #ffffff59;
  box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
  border-radius: toRpx(16);
  backdrop-filter: blur(toRpx(8));
  position: relative;
  padding: toRpx(4);
  .tab {
    flex: 1;
    height: 100%;
    background: transparent;
    font-size: toRpx(28);
    color: #1f2133;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    border-radius: toRpx(16);
  }
  .active {
    font-weight: 500;
    color: #ffffff;
  }
  .border {
    position: absolute;
    height: calc(100% - #{toRpx(8)});
    background-image: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
    box-shadow: 0 toRpx(8) toRpx(24) 0 #849dc240;
    left: 0;
    top: 50%;
    transform: translate(toRpx(4), -50%);
    border-radius: toRpx(16);
    z-index: -1;
    transition: all 0.15s;
  }
}
</style>