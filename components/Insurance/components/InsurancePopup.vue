<template>
  <uni-popup
    ref="popup"
    type="bottom"
    
  >
  <!-- :mask-click="false" -->
    <view class="detail-box">
      <view
        class="close-box flex"
        @click="close"
      >
        <uni-icons
          type="clear"
          :size="28"
          color="#76787f"
        ></uni-icons>
      </view>
      <view class="sprite-icon icon-bao"></view>
      <view class="title text-hide">
        {{item.itemName}}
      </view>
      <view class="type">{{item.main}}</view>
      <view class="content">
        <rich-text :nodes="item.itemDesc"></rich-text>
      </view>
    </view>
  </uni-popup>

</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    item: Object
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.popup.open("center");
    },
    close () {
      this.$refs.popup.close()
    }
  }
}
</script>

<style scoped lang='scss'>
.detail-box {
  position: relative;
  width: toRpx(720);
  max-height: toRpx(640);
  border-radius: toRpx(40);
  padding: toRpx(48) toRpx(64) toRpx(88);
  box-sizing: border-box;
  overflow: hidden;
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: toRpx(240);
    background-image: linear-gradient(180deg, #e5edfe 0%, #ffffff 100%);
    content: '';
    z-index: -1;
  }
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    content: '';
    background-color: #fff;
    z-index: -2;
  }
  .icon-bao {
    position: absolute;
    top: toRpx(48);
    right: toRpx(68);
  }
  .close-box {
    position: absolute;
    width: toRpx(136);
    height: toRpx(136);
    top: 0;
    right: 0;
    justify-content: center;
    z-index: 2;
  }
  .title {
    font-weight: 500;
    font-size: toRpx(40);
    color: #292d33;
    line-height: toRpx(64);
    padding: toRpx(48) 0 toRpx(24);
  }
  .type {
    background: #f2f2f2;
    border-radius: toRpx(6);
    padding: toRpx(2) toRpx(16);
    font-size: toRpx(26);
    color: #666666;
    line-height: toRpx(40);
    width: fit-content;
  }
  .content {
    margin-top: toRpx(48);
    max-height: toRpx(276);
    font-size: toRpx(30);
    color: #292d33;
    line-height: toRpx(48);
    overflow-y: auto;
    word-break: break-all;
  }
}
</style>