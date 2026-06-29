<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-28 18:19:19
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-04-30 13:31:51
 * @FilePath: \gl-tape\pages\common\webview.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view>
    <view
      class="header"
      @click="back"
    >
      <view class="nav-bar">
        <view class="back">
          <uni-icons
            type="left"
            :size="20"
            color="#000000"
          ></uni-icons>
        </view>
        <view class="title">{{ title }}</view>
      </view>
    </view>
    <view
      class="ai-window"
      v-if="url"
    >
      <web-view :src="url"></web-view>
    </view>
    <learn-popup
      ref="learn"
      content="您还没有完成本次对练考核，\n是否确定退出？"
      @cancel="cancel"
      @confirm="confirm"
    />
  </view>
</template>

<script type="text/ecmascript-6">
import LearnPopup from '@/components/LearnPopup.vue'
export default {
  components: {
    LearnPopup
  },
  name: '',
  data () {
    return {
      url: '',
      title: '广联AI集市',
      wv: null,
      studyId: '',
    }
  },
  computed: {
    learnRef () {
      return this.$refs.learn
    },
  },
  onLoad (options) {
    if (options.studyId) this.studyId = options.studyId
    if (options.pageTitle) this.title = options.pageTitle
    const { sceneType, uuid, phone, channelType = 1 } = uni.$storage.get('userInfo')
    const bussinessType = sceneType == 0 ? 1 : 2 // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
    const brand = {
      1: '问界',
      2: '比亚迪',
      3: '其他'
    }[channelType]
    this.url = `${options.url}?no_header=1&business_type=${bussinessType}&phone=${phone}&brand=${brand}&one_id=${uuid}&platformType=1&domain=${options.domain}&presuppositionProblem=${options.presuppositionProblem}`
    if (options.practice_status) {
      this.url += `&practice_status=${options.practice_status}`
    }
    if (options.businessType) {
      this.url += `&businessType=${options.businessType}`
    }
    if (options.brandType) {
      this.url += `&brandType=${options.brandType}`
    }
    if (options.date) {
      this.url += `&date=${options.date}`
    }
    console.log(this.url, 999)
    //  this.url='http://assistant.test.glsx.com.cn/chat/jHpvpOmuMWPxYxKo?business_type=12&brand=%E9%97%AE%E7%95%8C&one_id=266&platformType=2&no_header=1&domain=http://aiassistant.test.glsx.com.cn'
    // setTimeout(() => {
    //   const currentWebview = this.$scope.$getAppWebview()
    //   const wv = currentWebview.children()[0]
    //   if (wv) {
    //     this.wv = wv
    //     wv.setStyle({ top: '10%', height: '90%' })
    //   }
    // }, 1000)
  },
  onBackPress (options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.back()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  mounted () {
  },
  methods: {
    async back () {
      try {
        const { studyId } = this
        if (studyId) {
          uni.showLoading()
          const { aiReviewReport } = await uni.$api.commonApi.getShortCourseDetail({ id: this.studyId })
          uni.hideLoading()
          let open = false
          aiReviewReport.map(e => {
            if (e.examStatus != 2 && !open) open = true
          })
          if (open) {
            this.learnRef.open()
            this.wv.setVisible(false)
          } else this.confirm()
        } else throw false

      } catch (error) {
        uni.hideLoading()
        this.confirm()
      }
    },
    cancel () {
      this.wv.setVisible(true)
    },
    confirm () {
      uni.navigateBack()
      uni.$emit('refreshStudyList')
    }

  }
}
</script>

<style scoped lang="scss">
.header {
  // background: url('https://img02.glsx.com.cn/weapp/resource/saas/ai/ai-app-bg.jpg');
  padding-top: 30px;
  background-color: #f5f9ff;
  z-index: 9;
  background-size: 100% 100%;
  position: fixed;
  height: 10%;
  width: 100%;
  .nav-bar {
    width: 100%;
    height: 48px;
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
      color: #333333;
      flex: 1;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
    }
  }
}
.ai-window {
  background-color: #f5f9ff;
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  height: 90vh;
  z-index: 1;
}
</style>
