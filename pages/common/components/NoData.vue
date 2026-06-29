<template>
  <view class="list-not">
    <image
      src="@/assets/images/login/nothing.webp"
      class="list-not-img"
    />
    暂无内容
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'NoData',
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
.list-not {
  font-size: toRpx(28);
  color: #999999;
  margin: auto;
  text-align: center;
  &-img {
    width: toRpx(676);
    height: toRpx(284);
    margin: toRpx(192) auto toRpx(24);
    display: block;
  }
}
</style>