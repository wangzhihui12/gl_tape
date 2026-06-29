<template>
  <home-frame
    @preview="preview"
    @start="$refs.customerTypeRef.open()"
    ref="home"
    :id="id"
    @openStep="openStep"
    @backHome="backHome"
    finishDoneText="下一步"
    finishContene="当前操作是为强制退出接待，若完成客户接待请点击「下一步」。"
    class="container"
    :moduleList="packageList"
    :loadComplete="loadComplete"
    @changeTab="changeTab"
    swiperCustom
  >
    <template slot="swiperCustom">
      <swiper-component
        :moduleList="packageList"
        @click="toDetail"
        imgKey="bannerImg"
        :loadComplete="loadComplete"
        :noDataObject="swiperNoDataObject"
        :autoplay="false"
        custom
        :swiperType="2"
      >
        <template v-slot:swiper="{content}">
          <view :class="['swiper-custom-content',{'swiper-zoom':content.class != 'block-center'}]">
            <image
              class="bg"
              :src="packageList[content.isIndex].bannerImg"
            />
            <view class="name">{{ packageList[content.isIndex].name }}</view>
            <view class="swiper-content-box">
              <view class="price price-1">
                市场价
                <view class="num flex">
                  <view class="unit">¥</view>
                  {{packageList[content.isIndex].marketPrice}}
                </view>
              </view>
              <view class="price price-2 flex">{{packageList[content.isIndex].discountPrice || ''}}</view>
              <view class="price price-3">
                套餐价
                <view class="num flex">
                  <view class="unit">¥</view>
                  {{packageList[content.isIndex].packagePrice || ''}}
                </view>
              </view>
              <view class="briefIntroduction">
                {{packageList[content.isIndex].briefIntroduction || ''}}
              </view>
            </view>
            <view class="swiper-btn">查看详情</view>
          </view>
        </template>
      </swiper-component>
    </template>
    <template slot="detail">
      <detail
        :id.sync="id"
        :media="moduleList"
        :type.sync="type"
        :toolList="toolList"
        @back="back"
        @done="done"
        ref="detail"
        :customerType.sync="customerType"
        @reception="reception"
        :tabId.sync="tabId"
        :currentCarId="currentCarId"
      />
    </template>
    <template slot="content">
      <center-popup
        :list="typeList"
        ref="customerTypeRef"
        @choose="chooseCustomerType"
        title="请选择当前洽谈的客户类型"
      />
      <package-detail-popup
        ref="packageRef"
        @close="close"
      >
        <view class="package-detail-box">
          <view class="package-box">
            <view class="package-name">套餐内容</view>
            <view class="package-content">
              <rich-text :nodes="chooseItem.content"></rich-text>
            </view>
          </view>
          <view class="package-box package-detail">
            <view class="package-name">套餐介绍</view>
            <view class="package-content">
              <rich-text :nodes="chooseItem.scriptIntroduction"></rich-text>
            </view>
          </view>
        </view>
      </package-detail-popup>
    </template>
  </home-frame>
</template>

<script type="text/ecmascript-6">
import HomeFrame from '@/components/HomeFrame/index.vue'
import detail from './detail.vue'
import CenterPopup from '@/components/CenterPopup.vue'
import PackageDetailPopup from './components/PackageDetailPopup.vue'
import { mapMutations } from "vuex";
import SwiperComponent from '@/components/SwiperComponent.vue'
const packageType = {
  1: require('@/assets/images/boutique/package-1.webp'),
  2: require('@/assets/images/boutique/package-2.webp')
}
const defaultConfig = [
  {
    name: '套餐火爆热卖',
    tabName: '套餐包',
    icon: 'boutique-config-0',
    class: 'config-0',
    tabId: 1
  },
  {
    name: '膜类专区',
    tabName: '膜类专区',
    icon: 'boutique-config-1',
    class: 'config-1',
    tabId: 2
  },
  {
    name: '精品系列',
    tabName: '精品专区',
    icon: 'boutique-config-2',
    class: 'config-2',
    tabId: 3
  }
]
export default {
  components: { HomeFrame, detail, CenterPopup, PackageDetailPopup, SwiperComponent },
  name: 'boutique',
  data () {
    return {
      swiperNoDataObject: Object.freeze({
        icon: require('@/assets/images/common/developing.webp'),
        text: '敬请期待'
      }),
      packageList: [],
      moduleList: [],
      toolList: [],
      chooseItem: {},
      id: '',
      type: '',
      customerType: -1,
      tabId: 1,
      recording: false,
      carBannerList: [],
      currentCarId: '',
      currentIndex: 0,
      bannerAutoplay: true,
      previewOff: false,
      mediaConfigList: [],
      bannerTabId: 'car-banner-0',
      defaultCarId: '',
      typeList: Object.freeze([
        {
          title: '回店客户',
          describe: '客户已领精品券且已上牌完成\n交付安排客户当日回店提车',
          icon: 'icon-customer-1'
        }, {
          title: '现场客户',
          describe: '客户未领取精品券\n首次到店',
          icon: 'icon-customer-2'
        }
      ]),
      loadComplete: false,
      requested: false
    }
  },
  onBackPress (options) {
    if (options.from === "backbutton") {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.back();
      return true;
    }
    // 其他情况允许正常返回
    return false;
  },
  async onLoad () {
    uni.hideLoading()
    await uni.$api.systemApi.getMockData(true) //获取APP配置信息
    this.init();
    this.requested = true
    this.$refs.home.updateApp(true)
    this.getMerchantCarBrand()
  },
  async onShow () {
    const userInfo = uni.$storage.get("userInfo")
    if (!userInfo.shopMerchantId || !userInfo.shopMerchantName) {
      uni.$storage.rm("userInfo");
      uni.$storage.rm("sessionId");
      uni.reLaunch({
        url: "/pages/common/login",
      });
      return;
    }
    if (this.requested && !this.id) this.$refs.home.updateApp()
    this.getBoutiquePackageList() //套餐列表
  },
  computed: {
  },
  methods: {
    getMerchantCarBrand () {
      const userInfo = uni.$storage.get('userInfo'),
        { shopMerchantId } = userInfo
      /**获取门店主营品牌车型 */
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
        this.$store.dispatch('setCarBrandsList', carBrandList)
        uni.$storage.set('carBrandList', carBrandList)
      })
    },
    ...mapMutations("audio", ["setReceptionStatus"]),
    init () {
      const userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo;
      this.customerType = -1
      this.getSoure(shopMerchantId)
      /**获取交付人员 */
      uni.$api.commonApi
        .getEmployeeList({
          merchantId: shopMerchantId,
          sceneList: [1],
          appQGFlag: 1
        })
        .then((res) => {
          this.$store.dispatch("setEmployeeList", res);
        });
      uni.showLoading({
        mask: true
      })
      /**获取车型素材配置 */
      uni.$api.boutiqueApi.getBoutiqueMaterialConfig({
        merchantId: shopMerchantId
      }).then(({ materials, hidePackage }) => {
        uni.hideLoading()
        let boutiqueMediaConfig = {},
          carBannerList = [],
          boutiqueCarList = []
        materials.map(e => {
          if (e && e.carModelName && e.carModelId) {
            const configItems = [
              { key: 'films', configIndex: 1 },
              { key: 'products', configIndex: 2 }
            ]
            let retrofitting = []
            carBannerList.push({
              title: e.seriesName || e.brandName || '',
              url: e.modelDisplayPicurl || '',
              name: e.carModelName,
              carModelId: e.carModelId,
              seriesId: e.seriesId,
            })
            boutiqueMediaConfig[e.carModelId] = {}
            boutiqueCarList.push({
              carModelName: e.carModelName,
              carModelId: e.carModelId,
              brandId: e.brandId,
              brandName: e.brandName,
              name: e.seriesName,
              id: e.seriesId,
            })
            if (!hidePackage) configItems.unshift({ key: 'packages', configIndex: 0 })
            configItems.map(item => {
              retrofitting.push({
                ...defaultConfig[item.configIndex],
                list: e[item.key],
              })
              boutiqueMediaConfig[e.carModelId].retrofitting = retrofitting

            })
            e.optionals?.map(item => {
              item.checked = false
              item.warranty = item.warranty?.replace(/<\/?br\s*\/?>|\n/g, '<br>')
            })
            boutiqueMediaConfig[e.carModelId].optionals = e.optionals
          }
        })
        this.carBannerList = carBannerList.map(e => {
          let configList = []
          if (boutiqueMediaConfig[e.carModelId]) configList = boutiqueMediaConfig[e.carModelId].retrofitting
          e.configList = configList
          return e
        })
        this.$store.state.user.boutiqueMediaConfig = boutiqueMediaConfig
        this.$store.state.user.boutiqueCarList = boutiqueCarList
      }).catch(error => {
        uni.hideLoading()
        uni.showToast({
          title: error,
          icon: 'none',
        });
      })

    },
    // 查询素材
    async getSoure () {
      let baseConfigData = await uni.$api.systemApi.getBoutiqueMockData(true),
        { moduleList, toolList, defaultCarId } = baseConfigData
      this.$store.state.boutique.baseConfigData = baseConfigData
      this.moduleList = moduleList
      this.toolList = toolList
      this.defaultCarId = defaultCarId
    },
    toDetail (index) {
      let item = this.packageList[index]
      this.chooseItem = item
      this.$refs.packageRef.open()
    },
    close () {
      this.chooseItem = {}
    },
    preview () {
      let { id, tabId } = this.chooseItem;
      this.type = "preview";
      this.id = id;
      this.tabId = tabId
      this.currentCarId = this.carBannerList[this.currentIndex].carModelId
    },
    back () {
      if (!this.id) return uni.navigateBack();
      else {
        if (this.id == 1 || this.id == 4) {
          let isPictureView = this.$refs.detail.hidePicture()
          if (isPictureView) return
        }
        if (this.type != "preview") return this.$refs.home.finishRef.open();
        this.backHome();
      }

    },
    backHome () {
      if (this.recording) this.$refs.home.stopAudio(true);
      this.$refs.home.finishRef.close();
      this.$refs.detail.clearCustomerReceivedTimer()
      this.id = "";
      this.type = "";
      this.currentCarId = ''
      this.bannerAutoplay = true
      this.customerType = -1
      this.clearHistory();
      this.recording = false
      this.setReceptionStatus(-1);
      this.$refs.home.$refs.leftBox.getMessageInfo()
      if (this.requested) this.$refs.home.updateApp()
      this.getBoutiquePackageList() //套餐列表
    },
    async start (before = true) {
      const isPermision = await this.$refs.home.isPermission()
      if (!isPermision) return false
      uni.$logger.local.info('〖接待管理Recorder〗 == 开始接待 ')
      if (before) this.clearHistory();
      this.$refs.home.startAudio(false)
      this.recording = true
      return true
    },
    jumpPage (id) {
      let { carBannerList } = this,
        carIndex = carBannerList.findIndex(e => e.carModelId == this.defaultCarId)
      if (carBannerList.length == 1 || carIndex < 0) carIndex = 0 //只有一个车型或者默认车型没有时
      this.id = id ? id : this.moduleList[0].id
      this.tabId = 1
      this.currentCarId = carBannerList[carIndex].carModelId
      this.type = "edit"
    },
    clearHistory () {
      this.$store.dispatch("clearCustomerInfo");
      this.$store.dispatch("clearHistory");
      this.$store.dispatch('clearReceptionTrack')
    },
    openStep () {
      this.$refs.home.finishRef.close();
      this.$refs.detail.open();
    },
    async chooseCustomerType (index) {
      const { moduleList } = this,
        flag = await this.start()
      if (!flag) return
      this.customerType = index
      if (index == 0) {
        const { id } = moduleList[2]
        this.jumpPage(id)
      }
      else this.jumpPage()
      setTimeout(() => {
        this.setReceptionStatus(1);
      }, 1000);
    },
    async done (e) {
      this.$refs.home.finishRef.close();
      if (this.recording) await this.$refs.home.stopAudio();
      this.recording = false
      setTimeout(() => {
        this.id = "";
        this.type = "";
        this.currentCarId = ''
        this.bannerAutoplay = true
        this.customerType = -1
        this.$store.dispatch("clearHistory")
        this.$store.dispatch('clearReceptionTrack')
        this.getBoutiquePackageList() //套餐列表
        this.setReceptionStatus(-1);
      }, 1500);
    },
    /**客户邀约接待 */
    reception (customer) {
      this.currentCarId = ''
      this.$nextTick(async () => {
        let { customerType } = this
        if (customerType == -1) {
          const flag = await this.start(false)
          if (!flag) return
        } //开始接待
        this.customerType = 0
        this.jumpPage()
        uni.$logger.local.info('index-reception:回店客户〗 == ' + JSON.stringify(customer))
        this.$refs.home.updateCustomerInfo(customer)
        this.$nextTick(() => this.$store.dispatch('setCustomerInfo', customer))
        let { carBannerList } = this,
          currentCarId = '',
          carIndex = carBannerList.findIndex(e => e.carModelId == this.defaultCarId)
        /**优先判断客户车型是否在banner中，没有则取默认车型 */
        if (carBannerList.findIndex(e => e.carModelId == customer.carSeriesId) != -1) currentCarId = customer.carSeriesId
        else {
          if (carBannerList.length == 1 || carIndex < 0) carIndex = 0 //只有一个车型或者默认M7没有时
          currentCarId = carBannerList[carIndex].carModelId
        }
        this.currentCarId = currentCarId
      })
    },
    swiperChange (e) {
      this.currentIndex = e.detail.current
      this.bannerTabId = `car-banner-${e.detail.current}`
    },
    carClass (index) {
      let { carBannerList, currentIndex } = this,
        len = carBannerList.length
      let className = currentIndex == index ? 'current-item' : ''
      if (currentIndex == 0 && index == len - 1) {
        className += ' current-item-left'
      }
      else if (currentIndex == len - 1) {
        if (index != 0) className += ' current-item-left'
      }
      else {
        if (index < currentIndex) className += ' current-item-left'
        else className += ' current-item-right'
      }
      return className
    },
    changeIndex (index) {
      this.currentIndex = index
      this.bannerAutoplay = false
      setTimeout(() => {
        this.bannerAutoplay = true
      }, 3e3)
    },
    clickCar (item, index) {
      this.changeIndex(index)
      this.toDetail({ id: 1, tabId: item.configList[0].tabId })
    },
    showCarBrand (item, index) {
      let result = true,
        { carBannerList } = this
      if (index != 0 && item.seriesId == carBannerList[index - 1].seriesId) result = false
      return result
    },
    changeTab (index) {
      if (index == 0) this.getBoutiquePackageList()
    },
    async getBoutiquePackageList () {
      this.loadComplete = false
      this.packageList = []
      const { shopMerchantId: merchantId } = uni.$storage.get("userInfo"),
        data = await uni.$api.boutiqueApi.getBoutiquePackageList({
          merchantId
        })
      let packageList = []
      if (data) data.map(e => {
        e.scriptIntroduction = e.scriptIntroduction.replace(/<\/?br\s*\/?>|\\n|\n/g, '<br>')
        e.content = e.content.replace(/<\/?br\s*\/?>|\\n|\n/g, '<br>')
        e.bannerImg = packageType[e.type || 2]
        if (e.marketPrice) e.marketPrice = Number(e.marketPrice).toLocaleString()
        if (e.packagePrice) e.packagePrice = Number(e.packagePrice).toLocaleString()
        packageList.push(e)
      })
      this.packageList = packageList
      this.loadComplete = true
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  &::after {
    background-image: url('@/assets/images/common/home-bg-1.webp');
  }
  .swiper-custom-content {
    width: 100%;
    height: 100%;
    position: relative;
    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: -1;
    }
    .name {
      padding-top: toRpx(35);
      text-indent: toRpx(134);
      color: #333333;
      font-size: toRpx(32);
      font-weight: 500;
    }
    .swiper-content-box {
      margin: toRpx(24) toRpx(32) 0;
      height: toRpx(264);
      position: relative;
      .price,
      .briefIntroduction {
        position: absolute;
      }
      .price-1 {
        color: #999999;
        font-size: toRpx(20);
        left: toRpx(32);
        top: toRpx(63);
        width: toRpx(194);
        text-align: center;
        .num {
          color: #333333;
          font-size: toRpx(32);
          font-weight: 700;
          justify-content: center;
          .unit {
            margin-right: toRpx(4);
          }
        }
      }
      .price-2 {
        left: toRpx(258);
        top: toRpx(96);
        width: toRpx(188);
        color: #ff4747;
        font-size: toRpx(36);
        font-weight: 700;
        justify-content: center;
      }
      .price-3 {
        top: toRpx(54);
        left: toRpx(456);
        color: #999999;
        font-size: toRpx(28);
        width: toRpx(296);
        text-align: center;
        .num {
          color: #ff4747;
          font-size: toRpx(44);
          font-weight: 700;
          justify-content: center;
          .unit {
            margin-right: toRpx(8);
          }
        }
      }
      .briefIntroduction {
        left: 0;
        top: toRpx(212);
        color: #666666;
        font-size: toRpx(24);
        width: 100%;
        text-align: center;
      }
    }
    .swiper-btn {
      color: #4673ff;
      font-size: toRpx(26);
      text-align: center;
      margin-top: toRpx(16);
    }
  }
  .swiper-zoom {
    zoom: 0.71;
  }
  .package-detail-box {
    padding-bottom: toRpx(100);
    margin: 0 toRpx(64);
    .package-box {
      border-radius: toRpx(40);
      background: #ffffff;
      box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
      margin-bottom: toRpx(32);
      box-sizing: border-box;
      padding: toRpx(32);
      .package-name {
        color: #333333;
        font-size: toRpx(40);
        font-weight: 500;
        line-height: toRpx(56);
        margin-bottom: toRpx(16);
      }
      .package-content {
        line-height: toRpx(44);
        color: #333333;
        font-size: toRpx(28);
      }
    }
    .package-detail {
      border: toRpx(2) solid #4673ff80;
      background: #4673ff1a;
      box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
      .package-name {
        color: #4673ff;
      }
    }
  }
}
</style>
