<template>
  <view class="tool-box" :style="toolStyle">
    <view :class="['btn', { hideIcon: !show }]" @click="show = false">
      <view class="icon sprite-icon icon-tool-file"></view>
      文件夹
    </view>
    <view :class="['list', { showList: !show }]">
      <view class="title" @click="show = true">文件夹</view>
      <view class="list-body">
        <template v-for="(i, index) in data">
          <view :class="['item', { active: i[idKey] == id }]" :key="index" @click="jump(i)">
            <image class="icon" :src="i.shortTitleUrl" mode="scaleToFill" />
            {{ i.shortTitle }}
          </view>
        </template>
      </view>
      <template v-if="showPayBtn">
        <view class="item" @click="toPay">
          <view class="icon">
            <view class="sprite-icon icon-tool-pay"></view>
          </view>
          付款方式
        </view>
      </template>
      <template v-if="type != 'preview'">
        <view class="item" @click="finish">
          <view class="icon">
            <view class="sprite-icon icon-tool-finish"></view>
          </view>
          完成接待
        </view>
      </template>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'ToolBox',
  props: {
    type: String,
    data: Array,
    id: [String, Number],
    showPayBtn: Boolean,
    idKey: {
      type: String,
      default: 'id'
    },
    toolStyle:String
  },
  data () {
    return {
      show: true
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.show = true
      }
    },
  },
  methods: {
    hide () {
      this.show = true
    },
    jump (item) {
      this.show = true
      this.$emit('choose', item)
    },
    finish () {
      this.$emit('finish')
    },
    // 选择付款方式
    toPay () {
      this.$emit('toPay')
    },

  }
}
</script>

<style scoped lang="scss">
.tool-box {
  position: fixed;
  right: toRpx(40);
  top: calc(5% + #{toRpx(140)});
  z-index: 998;
  width: toRpx(120);
  .btn {
    width: 100%;
    height: toRpx(120);
    background-image: linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%);
    border: toRpx(2) solid #ffffff;
    box-shadow: 0 toRpx(8) toRpx(24) 0 #00000033;
    border-radius: toRpx(16);
    font-size: toRpx(24);
    color: #292d33;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .icon {
      width: toRpx(60);
      height: toRpx(60);
      margin-bottom: toRpx(8);
      transition: all 0.05s;
    }
  }
  .hideIcon {
    height: 0;
    overflow: hidden;
    opacity: 0;
    .icon {
      height: 0;
      margin-bottom: 0;
    }
  }
  .list {
    width: 100%;
    border: toRpx(2) solid #ffffff;
    box-shadow: 0 toRpx(8) toRpx(22) 0 #0000001a;
    border-radius: toRpx(16);
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    position: relative;
    background: rgba(255, 255, 255, 0.95); // 增加不透明度，提升质感
    backdrop-filter: blur(10px); // 添加毛玻璃效果，更高级
    
    // 初始状态
    max-height: 0;
    opacity: 0;
    transform: translateY(-20rpx) scale(0.95); // 稍微上移并缩小，制造弹出感
    transform-origin: top center;
    
    // 优化动画曲线：更干脆利落 (cubic-bezier)
    // 缩短时间：0.4s -> 0.3s，更跟手不拖沓
    transition: 
      max-height 0.3s cubic-bezier(0.215, 0.61, 0.355, 1),
      opacity 0.2s linear,
      transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    
    &::after {
      position: absolute;
      content: '';
      background: inherit;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      // filter: blur(toRpx(8)); // 移除原来的模糊，改用 backdrop-filter
      z-index: -1;
    }
    // ... 其他原有样式保持不变
    .title {
      width: toRpx(120);
      height: toRpx(56);
      background: #f4f4f5;
      border: toRpx(2) solid #ffffff;
      border-radius: toRpx(16) toRpx(16) 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .list-body {
      max-height: 60vh;
      overflow-y: auto;
    }
    // ... item 样式
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: toRpx(20);
      color: #666666;
      // height: toRpx(120);
      width: 100%;
      padding-top: toRpx(16);
      .icon {
        width: toRpx(60);
        height: toRpx(60);
        margin-bottom: toRpx(8);
      }
    }
    .active {
      color: #2c66f7;
    }
  }
  .showList {
    display: flex;
    // 展开状态：给予足够大的max-height
    max-height: toRpx(1000); // 预估一个足够大的值，或者使用 100vh
    opacity: 1;
    transform: translateY(0) scale(1); // 恢复原位原大小
    padding-bottom: toRpx(16);
    // 移除之前的 animation
    // animation: scale-up-top-right 0.4s;
    // visibility: visible; // 不需要 visibility，因为 height 0 已经隐藏了内容
    // height: auto; // 使用 max-height 做动画
  }
  // 移除之前的 keyframes
  // @keyframes scale-up-top-right { ... }
}
</style>