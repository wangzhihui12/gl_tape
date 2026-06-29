<template>
  <view class="page-box" :style="pageStyle">
    <view
      class="nav-bar"
      :style="{ 'z-index': backProp.zindex || 9 }"
    >
      <template v-if="backProp.show">
        <view
          class="back"
          @click="backProp.click"
        >
          <uni-icons
            :type="backProp.iconType || 'left'"
            :size="backProp.size || 20"
            :color="backProp.color || '#000'"
          ></uni-icons>
        </view>
      </template>
      {{ title }}
    </view>
    <slot></slot>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    pageStyle:{
      type: String,
      default: ''
    },
    backProp: {
      type: Object,
      default: () => {
        return {
          show: true,
          click: () => {
            uni.navigateBack({
              delta: 1,
              animationType: 'pop-out',
              animationDuration: 100
            })
          }
        }
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
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
.page-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    text-align: center;
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
    line-height: toRpx(96);
    .back {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>