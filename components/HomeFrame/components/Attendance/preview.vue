<template>
  <view
    class="popup-box"
    v-if="popupShow"
  >
    <view class="nav-bar">
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#fff"
        ></uni-icons>
      </view>
      <view class="title">{{ title }}</view>
    </view>
    <view class="popup-body">
      <video
        ref="videoPlayer"
        :src="detailUrl"
        controls
        v-if="sourceType == 2"
      ></video>
      <view
        class="img-detail"
        v-else
      >
        <image
          class="image"
          @click="back"
          :src="detailUrl"
          :style="{ width: width + 'px' }"
        />
      </view>
    </view>
  </view>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    isComponents: Boolean,
    show: Boolean,
    mediaObject: Object
  },
  data () {
    return {
      width: 0,
      title: '',
      sourceType: '',
      detailUrl: ''
    }
  },
  watch:{
    show:{
      immediate: true,
      handler (n) {
        if (n) {
          console.log(this.mediaObject)
          this.init(this.mediaObject)
        }
      }
    }
  },
  computed: {
    popupShow () {
      let status = true
      if (this.isComponents) status = this.show
      return status
    },
  },
  onLoad (options) {
    this.init(options)
  },
  methods: {
    init (options) {
      const { tabName, sourceType, detailUrl } = options
      this.title = tabName
      this.sourceType = sourceType
      this.detailUrl = detailUrl
      const _this = this
      uni.getImageInfo({
        src: detailUrl, // 替换为你的图片路径
        success (img) {
          uni.createSelectorQuery().select('.img-detail').boundingClientRect(function (rect) {
            _this.width = rect.height * img.height / img.width
          }).exec();

        },
        fail: function (error) {
          console.error('获取图片信息失败：', error);
        }
      });
    },
    back () {
      if (this.isComponents) this.$emit('previewBack')
      else uni.navigateBack()
    },
  }
}
</script>
<style scoped lang="scss">
.popup-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  padding: toRpx(60) 0;
  z-index: 999;
  .nav-bar {
    width: 100%;
    height: toRpx(96);
    margin-bottom: toRpx(50);
    display: flex;
    align-items: center;
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      color: #fff;
      flex: 1;
      font-size: toRpx(32);
      font-weight: 700;
      text-align: center;
    }
  }
  .popup-body {
    width: 100%;
    height: calc(100% - #{toRpx(200)});
    video {
      width: 100%;
      height: 100%;
    }
    .img-detail {
      // height: tpRpx(200);
      height: 100%;
      text-align: center;
      .image {
        width: toRpx(984) !important;
        // height: toRpx(1312);
        height: 100%;
      }
    }
  }
}
</style>
