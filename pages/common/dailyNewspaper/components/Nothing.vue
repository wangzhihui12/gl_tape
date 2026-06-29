<template>
  <view class="nothing-box">
    <image
      class="icon"
      :src="require('@//assets/images/common/noData.webp')"
    />
    <text class="text">{{ text }}</text>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'Nothing',
  props: {
    text: {
      type: String,
      default: '暂无数据'
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang='scss'>
.nothing-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .icon {
    width: 300rpx;
    height: 236rpx;
    margin-bottom: 8rpx;
  }
  .text {
    font-size: 24rpx;
    line-height: 28rpx;
    color: #999;
  }
}
</style>