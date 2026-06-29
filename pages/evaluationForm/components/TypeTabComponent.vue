<template>
  <view class="type-tab">
    <scroll-view class="type-box" scroll-x="true" show-scrollbar="false" scroll-with-animation @scroll="onScroll" ref="scrollView">
      <view class="type-scroll-content">
        <view class="tab-item" :class="[tabClass(index)]" v-for="(i, index) in typeList" :key="index" @click.stop="tabClick(index, i)">
          <view v-if="tabIndex == index && index == 0" class="sprite-icon tab-first-left icon-first-left"></view>
          <view v-if="tabIndex == index && index == 0" class="sprite-icon tab-first-right icon-first-right"></view>
          <view v-if="tabIndex == index && index != 0 && (index != typeList.length - 1 || (index == typeList.length - 1 && !isOverflow))" class="sprite-icon tab-second-right icon-second-right"></view>
          <view v-if="tabIndex == index && index != 0 && index == typeList.length - 1 && isOverflow" class="sprite-icon tab-end-right icon-end-right"></view>
          <view v-if="tabIndex == index && index != 0" class="sprite-icon tab-second-left icon-second-left"></view>
          <view class="text flex justify-center align-center" :class="[tabIndex == index ? `active` : '']">
            <view>{{ i[nameKey] }}</view>
            <view v-if="isShowCount" class="count ml-8" :class="i.count > 99 ? 'count-red' : ''">{{ i.count > 99 ? '99+' : i.count }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script type="text/ecmascript-6">
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
    isShowCount: {
      type: Boolean,
      default: false
    }
  },
  name: '',
  data () {
    return {
      firstClass: Object.freeze(['first-nav', 'second-nav']),
      isOverflow: false
    }
  },
  computed: {
    blockLeft () {
      let { tabIndex } = this
      return `${(tabIndex * 400) - (tabIndex == 0 ? 0 : 48)}rpx`
    },
  },
  mounted () {
    // 延迟检测，确保 DOM 完全渲染
    setTimeout(() => {
      this.checkOverflow()
    }, 300)
  },
  updated () {
    // 延迟检测，确保 DOM 完全渲染
    setTimeout(() => {
      this.checkOverflow()
    }, 300)
  },
  watch: {
    typeList: {
      handler () {
        this.$nextTick(() => {
          this.checkOverflow()
        })
      },
      deep: true
    }
  },
  methods: {
    onScroll (e) {
      // 通过滚动事件检测是否可以滚动
      // 如果能滚动（scrollLeft > 0 或可以滚动到最右边），说明内容超出
      const scrollLeft = e.detail.scrollLeft
      const scrollWidth = e.detail.scrollWidth
      // 如果 scrollLeft > 0，说明可以滚动，内容超出
      // 或者如果 scrollWidth 存在且明显大于 0，也可能说明可以滚动
      // 但为了更准确，我们还是使用 checkOverflow 方法
      // 这里可以作为一个辅助检测
      if (scrollLeft > 0 && !this.isOverflow) {
        this.isOverflow = true
      }
    },
    checkOverflow () {
      this.$nextTick(() => {
        // 增加延迟，确保 DOM 完全渲染
        setTimeout(() => {
          const query = uni.createSelectorQuery().in(this)
          query.select('.type-box').boundingClientRect()
          query.select('.type-scroll-content').boundingClientRect()
          query.exec((res) => {
            if (res && res[0] && res[1]) {
              const boxRect = res[0]
              const contentRect = res[1]
              // 如果内容宽度大于容器宽度，说明可以滚动
              // 添加一个小的容差值，避免因为像素精度问题导致判断错误
              const overflow = contentRect.width > boxRect.width + 1
              this.isOverflow = overflow
              console.log('检测溢出状态:', {
                boxWidth: boxRect.width,
                contentWidth: contentRect.width,
                isOverflow: this.isOverflow,
                typeListLength: this.typeList.length
              })
            }
          })
        }, 300)
      })
    },
    tabClass (index) {
      let className = ''
      if (this.tabIndex == index) {
        className = 'active '
        if (index == 0) className += 'first-nav'
        else className += 'second-nav'
      }
      return className
    },
    tabClick (index,i) {
      this.$emit('update:tabIndex', index)
      this.$emit('tabClick',index,i)
    }
  }
}
</script>

<style scoped lang="scss">
.type-tab {
  position: relative;
  overflow: hidden;
  .type-box {
    position: relative;
    width: 100%;
    box-sizing: border-box;

    background-color: #eef4fe;
    height: toRpx(96);
    line-height: toRpx(128);
    border-radius: toRpx(48) toRpx(48) 0 0;
    overflow: hidden;
    z-index: 0;
    .type-scroll-content {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
    }
    .tab-item {
      flex-shrink: 0;
      text-align: center;
      font-weight: 400;
      font-size: toRpx(28);
      color: #292d33;
      position: relative;
      margin-right: toRpx(16);
      .text {
        position: relative;
        text-align: center;
        height: toRpx(96);
        padding: 0 toRpx(64);
        transition: all 0.15s;
        .count {
          font-size: toRpx(24);
        }
        .count-red {
          font-size: toRpx(22);
        }
      }
      .text.active {
        position: relative;
      }
      .text.active::before {
        content: '';
        position: absolute;
        top: 0;
        left: toRpx(64);
        right: toRpx(64);
        height: 100%;
        background-color: #fff;
        z-index: -1;
      }
      .active {
        position: relative;
        font-weight: 500;
        font-size: toRpx(32);
        color: #3b73ff;
        &::after {
          content: '';
          position: absolute;
          bottom: toRpx(16);
          left: 50%;
          transform: translateX(-50%);
          width: toRpx(40);
          height: toRpx(6);
          background-color: #3b73ff;
          border-radius: toRpx(16);
        }
      }
      .sprite-icon {
        transition: left 0.15s;
      }
      .tab-first-left {
        left: 0;
        position: absolute;
      }
      .tab-first-right {
        right: toMinusRpx(64);
        position: absolute;
      }
      .tab-second-right {
        right: toMinusRpx(64);
        position: absolute;
      }
      .tab-second-left {
        left: toMinusRpx(64);
        position: absolute;
      }
      .tab-end-right {
        right: 0;
        position: absolute;
      }
    }
    .tab-first-nav {
      background: url('@/assets/spritesmith/first-nav.png') no-repeat;
      background-size: 100% 100%;
      background-position: center;
    }
    .tab-second-nav {
      background: url('@/assets/spritesmith/second-nav.png') no-repeat;
      background-size: 100% 100%;
    }
  }
}
</style>
