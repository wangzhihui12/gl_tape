<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-08 10:31:49
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-04-17 16:31:35
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\Dailog.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="dailog-panel">
    <view class="dailog-box" :style="{ width: width }">
      <view class="dailog-header flex">
        <view :class="[`sprite-icon icon-${icon}`, { enlarge: icon && scale == 0 }]" v-if="icon"></view>
        <view class="sprite-icon icon-income-count" v-else></view>
        <view class="dailog-title">{{ title }}</view>
        <view class="dailog-close" @click="close"><uni-icons type="closeempty" size="20"></uni-icons></view>
      </view>
      <slot name="content" />
      <slot name="footer" />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '1040rpx'
    },
    icon: String,
    scale: {
      type: Number,
      default: 0
    },
    title: String
  },
  data() {
    return {
      show: '',
      selectItem: {
        title: '权益提成',
        content: '权益提成 = 权益产值 × 提成系数 × 提成比例',
        desc: '提成比例'
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    background-image: linear-gradient(179deg, #d1e5ff 12%, #ffffff00 100%);
    background-size:
      100% 210rpx,
      100% calc(100% - 210rpx); /* 分别设置渐变和白色的背景大小 */
    background-repeat: no-repeat, no-repeat; /* 确保背景不重复 */
    background-position: top, bottom; /* 分别设置渐变和白色的位置 */
    border-radius: 48rpx;
    padding-bottom: 64rpx;
    .dailog-header {
      padding: 40rpx 48rpx;
      .dailog-title {
        font-size: 40rpx;
        color: #1a1a1a;
        font-weight: 600;
        margin-top: -4rpx;
        margin-left: 16rpx;
      }
      .enlarge {
        transform: scale(1.5);
        margin-right: 30rpx;
      }
      .dailog-close {
        margin-left: auto;
        text-align: right;
        .uni-icons {
          color: #808291 !important;
          font-size: 40rpx;
        }
      }
    }
    .dailog-logo {
      text-align: center;
      image {
        width: 228rpx;
        height: 228rpx;
      }
    }
  }
}
</style>
