<template>
  <view>
    <home-frame
      @preview="preview"
      @start="start"
      ref="home"
      :id="id"
      @openStep="openStep"
      @backHome="backHome"
      @changeTab="changeTab"
      :moduleList="moduleList"
      @swiperClick="toDetail"
      :loadComplete="loadComplete"
    >
      <template slot="detail">
        <detail
          :id.sync="id"
          :media="moduleList"
          :type.sync="type"
          :toolList="toolList"
          :aitoCarModelIds="aitoCarModelIds"
          @back="back"
          @done="done"
          ref="detail"
          :mediaId="mediaId"
        />
      </template>
      <template slot="content">
      </template>
    </home-frame>
  </view>
</template>
<script>
import detail from './detail/detail'
import { mapMutations } from 'vuex'
import HomeFrame from '@/components/HomeFrame/index.vue'
// import storge from "@/mixin/storge";
export default {
  // mixins: [storge],
  components: { HomeFrame, detail },
  data () {
    return {
      moduleList: [],
      toolList: [],
      id: '',
      type: '',
      chooseItem: {},
      recording: false,
      aitoCarModelIds: [],
      mediaId: '',
      loadComplete: false,
      requested: false
    }
  },
  computed: {
    channelType () {
      const { channelType } = uni.$storage.get('userInfo')
      return channelType || 1 //默认问界
    },
    shopMerchantId () {
      const { shopMerchantId } = uni.$storage.get('userInfo')
      return shopMerchantId
    },
    sceneType () {
      const { sceneType } = uni.$storage.get('userInfo')
      return sceneType
    }
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
  async onLoad () {
    uni.hideLoading()
    const mockdata = await uni.$api.systemApi.getMockData(true) //获取APP配置信息
    if (this.channelType == 1 && mockdata.boutiqueDefaultCarBrandId) {
      this.$store.state.user.boutiqueDefaultCarBrandId = mockdata.boutiqueDefaultCarBrandId //默认车辆品牌
      if (mockdata.defaultCarId) this.$store.state.user.defaultCarId = mockdata.defaultCarId //默认车系
    }
    this.get_Vehicle_Sales_Data()
    this.requested = true
    this.$refs.home.updateApp(true)
  },
  async onShow () {
    const userInfo = uni.$storage.get('userInfo')
    if (!userInfo.shopMerchantId || !userInfo.shopMerchantName) {
      uni.$storage.rm('userInfo')
      uni.$storage.rm('sessionId')
      uni.reLaunch({
        url: '/pages/common/login'
      })
      return
    }
    this.init()
  },
  methods: {
    ...mapMutations('audio', ['setReceptionStatus']),
    init () {
      this.findPayInfo()
      if (this.requested && !this.id) this.$refs.home.updateApp()
    },
    /**获取车型&销售数据 */
    get_Vehicle_Sales_Data () {
      const userInfo = uni.$storage.get('userInfo'),
        storageCarBrandList = uni.$storage.get('carBrandList'),
        storageEmployeeList = uni.$storage.get('employeeList'),
        { shopMerchantId } = userInfo
      if (storageCarBrandList) this.$store.dispatch('setCarBrandsList', storageCarBrandList)
      if (storageEmployeeList) this.$store.dispatch('setEmployeeList', storageEmployeeList)
      /**获取品牌车型 */
      uni.$api.commonApi.getMerchantCarBrandList([shopMerchantId]).then(({ data }) => {
        let list = data[0].carBrandList,
          carBrandList = [],
          brandIdList = [],
          subBrandIdList = []
        list?.map(e => {
          e.childs.map(i => {
            i.brandName = e.name
            i.brandId = e.id
            carBrandList.push(i)
            subBrandIdList.push(i.id)
          })
          brandIdList.push(e.id)
        })
        this.getSoure(brandIdList, subBrandIdList)
        this.$store.dispatch('setCarBrandsList', carBrandList)
        uni.$storage.set('carBrandList', carBrandList)
        if (carBrandList.length) {
          let index = 0
          this.getCarBrandsList(carBrandList, index)

        }
      })
      /**获取销售人员 */
      uni.$api.commonApi.getEmployeeList({
        merchantId: shopMerchantId
      }).then(res => {
        this.$store.dispatch('setEmployeeList', res || [])
        uni.$storage.set('employeeList', res || [])
      })
    },
    // 查询素材
    async getSoure (brandIdList, subBrandIdList) {
      const { shopMerchantId, sceneType } = this
      let data = uni.getStorageSync(`source_${sceneType}_${shopMerchantId}`)
      if (data) this.setViewInfo(data)
      let requestData = await uni.$api.systemApi.getSoureData(shopMerchantId, sceneType, {
        brandIdList,
        subBrandIdList
      })
      if (requestData) this.setViewInfo(requestData)
      else this.loadComplete = true
    },
    errorImg (index) {
      this.moduleList[index].showAlt = true
    },

    async start () {
      if (!this.moduleList.length) return uni.showToast({
        title: '该场景尚未配置素材，请联系总部人员',
        icon: 'none'
      })
      const isPermision = await this.$refs.home.isPermission()
      if (this.recording || !isPermision) return
      uni.showLoading({
        mask: true
      })
      this.$refs.home.startAudio()
      this.clearHistory()
      this.id = this.moduleList[0].id
      this.type = 'edit'
      this.recording = true
      setTimeout(() => {
        uni.hideLoading()
      }, 1e3)
    },
    toDetail (index) {
      let item = this.moduleList[index]
      this.chooseItem = item
      this.$refs.home.previewRef.open()
    },
    cancel () {
      this.$refs.home.previewRef.close()
    },
    preview () {
      let { id, title } = this.chooseItem
      this.type = 'preview'
      this.id = id
      uni.$logger.local.info(`预览${title}`)
      this.cancel()
    },
    // 完成接待
    done (e) {
      this.$refs.home.finishRef.close()
      if (this.recording) this.$refs.home.stopAudio()
      this.recording = false
      setTimeout(() => {
        this.id = ''
        this.type = ''
        this.setReceptionStatus(e)
        this.$store.dispatch('clearHistory')
        this.$store.dispatch('clearReceptionTrack')
      }, 1500)
    },
    back () {
      const detailRef = this.$refs.detail
      if (detailRef.showPayPage) return (detailRef.showPayPage = false)
      if (!this.id) return uni.navigateBack()
      if (this.type != 'preview') return this.$refs.home.finishRef.open()
      this.backHome()
    },
    backHome () {
      if (this.recording) this.$refs.home.stopAudio(true)
      this.$refs.home.finishRef.close()
      this.id = ''
      this.type = ''
      this.clearHistory()
      this.init()
      this.recording = false
      this.$refs.home.$refs.leftBox.getMessageInfo()
    },
    nextStep () {
      let { id } = this.moduleList[0]
      this.type = 'preview'
      this.id = id
    },
    clearHistory () {
      this.$store.dispatch('clearCustomerInfo')
      this.$store.dispatch('clearHistory')
      this.$refs.home.setBooks([])
      this.$store.dispatch('clearReceptionTrack')
    },
    openStep () {
      this.$refs.home.finishRef.close()
      this.$refs.detail.open()
    },
    // 查询门店支付配置
    async findPayInfo () {
      const { shopMerchantId } = uni.$storage.get('userInfo')
      const data = await uni.$api.commonApi.findPayInfo({
        merchantId: shopMerchantId
      })
      let paymentType = []
      data.find(item => {
        if (item.paymentType == 1)
          paymentType.push({
            name: '扫码支付',
            type: 1,
            title: '付款二维码',
            ...item
          })
        if (item.paymentType == 2)
          paymentType.push({
            name: '对公账户',
            type: 2,
            title: '付款方式',
            ...item
          })
      })
      this.$store.dispatch('setPaymentType', paymentType)
    },
    changeTab (index) {
      if (index == 0) this.init()
    },

    /**按序加载车型 */
    async getCarBrandsList (carBrandList, index) {
      const item = carBrandList[index]
      if (!item) return
      const carList = uni.getStorageSync(`${item.id}_${item.brandId}_carlist`)
      if (index < carBrandList.length - 1) {
        index += 1
        if (!carList) {
          const list = await uni.$api.commonApi.getCarBrandsList({
            brandId: item.brandId,
            childBrandId: item.id
          })
          if (list) uni.setStorageSync(`${item.id}_${item.brandId}_carlist`, list)
          this.getCarBrandsList(carBrandList, ++index)
        } else this.getCarBrandsList(carBrandList, ++index)
      }
    },
    /**素材内容 */
    setViewInfo (data) {
      let { moduleList, toolList, id } = data
      this.moduleList = moduleList
      this.toolList = toolList
      this.mediaId = id
      this.loadComplete = true
      this.$store.state.user = {
        ...this.$store.state.user,
        ...data
      }
    }
  }
}
</script>
<style scoped lang="scss">
.webview-container {
  width: toRpx(100);
  height: toRpx(100);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform: translateY(300%);
}
</style>
