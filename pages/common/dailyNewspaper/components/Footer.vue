<template>
  <view class="footer-container">
    <slot></slot>
  </view>
</template>

<script type='text/ecmascript-6'>
  export default {
    name: '',
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
.footer-container{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 28rpx 32rpx;
}
</style>