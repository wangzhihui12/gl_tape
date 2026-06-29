<template>
  <view class="material-detail">
    <view class="nav-bar">
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
      {{ title }}
    </view>
    <!-- <web-view :src="url"></web-view> -->
    <view :class="['file-box',{'has-ai':AIUrl}]">
      <lk-preview-office :url="url"></lk-preview-office>
    </view>
    <view
      class="AI-window"
      v-if="AIUrl"
    >
      <view class="AI-title flex">场景二拓</view>
      <web-view :src="AIUrl"></web-view>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import { report } from '@/mixin/index.js'
export default {
  name: '',
  mixins: [report],
  data () {
    return {
      url: '',
      viewerUrl: Object.freeze('/hybrid/html/web/viewer.html'),
      AIUrl: '',
      title: ''
    }
  },
  onLoad (options) {
    console.log(options)
    // if (options.fileUrl) this.url = `https://view.officeapps.live.com/op/view.aspx?src=${options.fileUrl}`
    if (options.fileUrl) this.url = `${options.fileUrl}`
    // if (options.fileUrl) this.url = `${this.viewerUrl}?file=${options.fileUrl}`
    else this.url = options.url
    if (options.title) this.title = options.title
    if (options.specialFlag == 1) this.getAiagent(options)
    // else this.setWv()
  },
  mounted () {
  },
  methods: {
    back () {
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    async getAiagent (options, agentCode = 'AI6') {
      const { phone } = uni.$storage.get('userInfo'),
        [data] = await uni.$api.sceneMarketApi.getAiagent({
          ownerShipType: 1,
          accountPhone: phone,
          agentCode
        })
      if (data) {
        const { sceneType, uuid, phone, channelType = 1 } = uni.$storage.get('userInfo'),
          bussinessType = sceneType == 0 ? 1 : 2,// sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
          brand = {
            1: '问界',
            2: '比亚迪',
            3: '其他'
          }[channelType]
        let title = options.directoryName
        if (options.title) title += `-${options.title}`
        let { agentUrl, domainName } = data,
          url = `${agentUrl}?no_header=1&business_type=${bussinessType}&phone=${phone}&brand=${brand}&one_id=${uuid}&platformType=1&domain=${domainName}&presuppositionProblem=${title}`
        if (options.id) url += `&enter_id=${options.id}`
        this.AIUrl = url
        this.setWebviewStyle()
      } else uni.showToast({
        title: '获取智能体失败',
        icon: 'error'
      })
    },
    setWebviewStyle () {
      const setWebviewStyleWithRetry = () => {
        const currentWebview = this.$scope.$getAppWebview()
        let [wv] = currentWebview.children(),
          wvFlag = false
        if (wv) {
          wv.setStyle({
            left: '71.9%',
            top: '17.18%',
            height: '82.82%',
            width: '28.3%'
          })
          wvFlag = true;
        }
        return wvFlag
      }
      const retrySetWebviewStyle = () => {
        if (!setWebviewStyleWithRetry()) {
          // 如果未成功，继续重试
          setTimeout(retrySetWebviewStyle, 50);
        } else {
          // 成功设置样式，结束循环
          console.log('Webview样式设置成功');
        }
      };

      setTimeout(retrySetWebviewStyle, 100);
    }
  }
}
</script>

<style scoped lang="scss">
.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 9;
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
.file-box {
  position: fixed;
  top: 5.2vh;
  height: 94.8vh;
  left: 0;
  width: 100vw;
}
.has-ai{
  width: 71.36vw;
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