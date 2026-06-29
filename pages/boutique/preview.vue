<template>
  <view class="popup-box" v-if="popupShow">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#1a1a1a"></uni-icons>
      </view>
      <view class="title">{{ title }}</view>
    </view>
    <view :class="['popup-body', { 'has-ai': AIUrl }]">
      <video ref="videoPlayer" :src="detailUrl" controls v-if="sourceType == 2"></video>
      <view class="img-detail" v-else>
        <image @click="back" :src="imagePreviewUrl" mode="heightFix" />
      </view>
    </view>
    <view class="AI-window" v-if="AIUrl">
      <view class="AI-title flex">场景二拓</view>
      <web-view :src="AIUrl"></web-view>
    </view>
  </view>
</template>
<script type="text/ecmascript-6">
import { aiUrlMixin, report } from '@/mixin/index.js'
import { getImageDisplayUrl } from '@/utils/ossImageProcess.js'

export default {
  mixins: [report, aiUrlMixin],
  props: {
    isComponents: Boolean,
    show: Boolean,
    mediaObject: Object
  },
  data () {
    return {
      title: '',
      sourceType: '',
      detailUrl: '',

    }
  },
  watch: {
    show: {
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
    imagePreviewUrl () {
      // 仅图片回显拼接 OSS 参数展示，视频保持原始 URL
      return getImageDisplayUrl(this.detailUrl)
    }
  },
  onLoad (options) {
    this.init(options)
  },
  methods: {
    init (options) {
      const { tabName, sourceType, detailUrl, specialFlag } = options
      this.title = tabName
      this.sourceType = sourceType
      this.detailUrl = detailUrl
      options.title = tabName
      if (specialFlag == 1) this.getAiagent(options)
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
  background: #f5f9ff;
  padding: toRpx(60) 0 0;
  z-index: 999;
  .nav-bar {
    width: 100%;
    height: toRpx(96);
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
      color: #1a1a1a;
      flex: 1;
      font-size: toRpx(32);
      font-weight: 700;
      text-align: center;
    }
  }
  .popup-body {
    width: 100%;
    height: calc(100% - #{toRpx(96)});
    video {
      width: 100%;
      height: 100%;
    }
    .img-detail {
      height: 100%;
      text-align: center;
      image {
        height: calc(100vh - #{toRpx(96)});
        width: auto;
      }
    }
  }
  .has-ai {
    width: 71.36% !important;
  }
}
.AI-window {
  width: 28.3vw;
  height: 90.63vh;
  position: fixed;
  top: 9.37vh;
  right: 0;
  background: #f5f9ff;
  .AI-title {
    height: 5.73vh;
    padding-top: 2.08vh;
    font-size: toRpx(34);
    font-weight: 500;
    justify-content: center;
    color: #333333;
  }
}
</style>
