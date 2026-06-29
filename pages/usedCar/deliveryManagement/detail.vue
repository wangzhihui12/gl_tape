<template>
  <page-component
    title="交付详情"
    :backProp="{
    show: true,
    click: this.backPage
  }"
  >
    <view class="content flex">
      <view class="left">
        <detail-info :detail="detail" ref="infoRef"></detail-info>
      </view>
      <view class="right">
        <delivery-steps
          :detail="detail"
          @openError="openError"
          @refresh="refresh"
          @refreshLog="$refs.infoRef.getDeliveryOrderOpLog()"
        ></delivery-steps>
      </view>
      <NoticePopup
        ref="errNotice"
        title="提示"
        :text="errorMessage"
        type="warning"
        :buttons="errButtons"
      ></NoticePopup>
      <NoticePopup
        ref="backNotice"
        title="提示"
        text="当前交付未完成，退出将不保留当前信息。"
        type="warning"
        :buttons="backButtons"
      ></NoticePopup>
    </view>
  </page-component>
</template>

<script type='text/ecmascript-6'>
import DetailInfo from './components/DetailInfo.vue'
import deliverySteps from './components/DeliverySteps/index.vue'
import NoticePopup from '@/components/NoticePopup.vue'
export default {
  components: {
    DetailInfo,
    deliverySteps,
    NoticePopup
  },
  name: '',
  data () {
    return {
      detail: {},
      errorMessage: '',
      errButtons: Object.freeze([
        {
          text: '知道了',
          type: 'primary'
        }
      ]),
      backButtons: Object.freeze([
        {
          text: '关闭',
          type: 'default'
        },
        {
          text: '确定退出',
          type: 'primary',
          callback: _ => {
            uni.navigateBack()
          }
        }
      ])
    }
  },
  onLoad (options) {
    this.getDeliveryOrderDetail(options.id)
    uni.$track.add({
      eventCode: 'app_delivery_detail'
    })
  },
  onBackPress (options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.backPage()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  methods: {
    async getDeliveryOrderDetail (id) {
      try {
        uni.showLoading({
          title: '加载中',
          mask: true
        })
        const data = await uni.$api.usedCarApi.getDeliveryOrderDetail({
          id: Number(id)
        })
        uni.hideLoading()
        if (data.orderStatus == 2) {
          if (data.remark) data.remark = data.remark.replace(/<\/?br\s*\/?>|\n/g, '<br>')
          if (data.confirmImages) data.imgList = data.confirmImages.split(',')
        }
        this.detail = data
      } catch (error) {
        uni.hideLoading()
        this.openError(error || '请求失败')
      }
    },
    openError (message) {
      this.errorMessage = message
      this.$refs.errNotice.open()
    },
    backPage () {
      if (this.detail.orderStatus != 2) this.$refs.backNotice.open()
      else uni.navigateBack()
    },
    refresh(id){
      this.getDeliveryOrderDetail(id)
    }
  }
}
</script>

<style scoped lang='scss'>
.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: toRpx(160) toRpx(64) toRpx(64);
  box-sizing: border-box;
  .left,
  .right {
    height: 100%;
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(48);
    overflow-y: auto;
  }
  .left {
    width: 34.1vw;
  }
  .right {
    width: 59.08vw;
    margin-left: auto;
  }
}
</style>