<template>
  <uni-popup
    ref="popup"
    type="bottom"
    border-radius="16px"
  >
    <view class="kf-box">
      <view
        class="close flex"
        @click="close"
      >
        <uni-icons
          type="closeempty"
          :size="18"
          color="#1A1A1A"
        ></uni-icons>
      </view>

      <view class="title flex">
        <view class="sprite-icon icon-qw"></view>
        嘀加智慧云
      </view>
      <view class="info flex">
        <view class="text">
          <view class="name flex">
            云小白 <view class="duty">产品经理</view>
          </view>
          <view class="content">嘀加智慧云｜产品中心</view>
          <view class="tool">
            <template v-for="(i,index) in tool">
              <view
                class="tool-item flex"
                :key="index"
              >
                <view :class="['sprite-icon',`icon-kf-${index}`]"></view>
                {{i}}
              </view>
            </template>
          </view>
        </view>
        <view class="qr-box flex">
          <image
            class="qr"
            :src="qr"
          />
          使用企业微信扫码
        </view>
      </view>
    </view>
  </uni-popup>

</template>

<script type='text/ecmascript-6'>
export default {
  name: '',
  data () {
    return {
      tool: ['使用反馈', '功能建议', '心得分享', '吐槽拍砖'],
      qr: require('@/assets/images/common/qr.webp')
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
.kf-box {
  position: relative;
  width: toRpx(864);
  height: toRpx(478);
  background: #ffffff;
  border-radius: toRpx(32);
  padding: 0 toRpx(48);
  box-sizing: border-box;
  .close {
    position: absolute;
    width: toRpx(120);
    height: toRpx(120);
    top: 0;
    right: 0;
    justify-content: center;
  }
  .title {
    font-weight: 500;
    font-size: toRpx(32);
    padding: toRpx(46) 0;
    .sprite-icon {
      margin-right: toRpx(16);
    }
  }
  .info {
    .name {
      position: relative;
      width: toRpx(480);
      font-weight: 600;
      font-size: toRpx(48);
      align-items: baseline;
      padding-bottom: toRpx(24);
      border-bottom: toRpx(2) solid #e6e6e6;
      .duty {
        font-weight: 400;
        font-size: toRpx(28);
        margin-left: toRpx(16);
      }
      &::after {
        position: absolute;
        left: 0;
        bottom: toMinusRpx(2);
        width: toRpx(280);
        height: toRpx(4);
        background: #2c66f7;
        content: "";
      }
    }
    .content {
      padding: toRpx(28) 0;
      font-weight: 500;
      font-size: toRpx(28);
    }
    .tool {
      display: flex;
      flex-wrap: wrap;
      &-item {
        flex: 50%;
        font-size: toRpx(28);
        color: #666666;
        margin-bottom: toRpx(20);
        .sprite-icon {
          margin-right: toRpx(8);
        }
      }
    }
  }
  .qr-box {
    margin-left: toRpx(48);
    flex-shrink: 0;

    flex-direction: column;
    font-weight: 500;
    font-size: toRpx(28);
    .qr {
      width: toRpx(240);
      height: toRpx(240);
      margin-bottom: toRpx(8);
    }
  }
}
</style>