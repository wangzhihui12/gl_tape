<template>
  <view :class="['layout', { 'byd-layout': isByd }]">
    <view class="layout-content">
      <view class="title flex">{{ title }}</view>
      <view class="form-box" :key="watchStatus">
        <view class="form">
          <template v-for="(i, index) in formObject">
            <view :class="['form-item', { active: focusIndex == index }]" :key="index">
              <view class="form-item-box" v-if="i.key == 'goodsCtegory'">
                <view :class="['select flex', { placeholderStyle: !customerInfo[i.key] }]" @click="showPopup(i.popKey, index)">
                  <view class="value text-hide" v-if="chooseContent.length > 0">
                    <text class="category-name" v-for="(item, index) in chooseContent.slice(0, 2)" :key="index">{{ item.categoryName }}</text>
                    <text class="category-name" v-if="chooseContent.length > 2">+ {{ chooseContent.length - 2 }}</text>
                  </view>
                  <view class="value text-hide" v-else>请选择</view>
                  <uni-icons class="arrow" type="right" :size="16"></uni-icons>
                </view>
              </view>
              <view class="form-item-box" v-else>
                <view :class="['select flex', { placeholderStyle: !customerInfo[i.key] }]" @click="showPopup(i.popKey, index)">
                  <view class="value text-hide">{{ customerInfo[i.key] || i.placeholder }}</view>
                  <uni-icons class="arrow" type="right" :size="16"></uni-icons>
                </view>
              </view>
            </view>
          </template>

          <view class="form-check flex" @click="showphoto = !showphoto">
            <view :class="['check-box flex', { checked: showphoto }]">
              <uni-icons type="checkmarkempty" :size="14" color="#fff"></uni-icons>
            </view>
            显示凭证
          </view>
          <view class="form-check flex" @click="merchantOrder = !merchantOrder" v-if="!subLoginUserChannelType">
            <view :class="['check-box flex', { checked: merchantOrder }]">
              <uni-icons type="checkmarkempty" :size="14" color="#fff"></uni-icons>
            </view>
            门店订单
          </view>
        </view>
      </view>
      <template v-if="list.length > 0">
        <scroll-view :class="['record-box']" scroll-y :scroll-top="scrollTop" @scrolltolower="pageonReachBottom">
          <!-- <template v-for="(i,index) in formatList">
            <view
              :key="index"
              class="card-box"
            > -->
          <!-- <view class="card-title">{{i.title}}</view> -->
          <!-- v-for="item in i.list" -->
          <view class="card-list">
            <view class="card-item" v-for="item in list" :key="item.id">
              <template v-if="showphoto">
                <image v-if="item.paymentDocUrl" class="image-box" :src="item.paymentDocUrl" />
                <image v-else class="image-box photo" src="https://img02.glsx.com.cn/weapp/resource/app-tape/media/common/pay.webp" />
                <view class="gradient-overlay"></view>
              </template>
              <template v-else>
                <!-- 1:线上微信支付,2:线下收款,3:POS机收款,4:支付宝支付,5:嘀加收款 -->
                <div :class="['payType sprite-icon', `icon-payType-${item.payType}`]"></div>
              </template>
              <view>
                <view class="name">{{ nameHide(item.customerName) }}</view>
                <!-- <view class="name">{{ item.id }}</view> -->
                <view class="goods-name">{{ item.goodsName }}</view>
                <view class="card-info">
                  <view class="label">车架号</view>
                  <view class="value">{{ item.carVin || '-' }}</view>
                </view>
                <view class="card-info">
                  <view class="label">工单号</view>
                  <view class="value">{{ item.payId }}</view>
                </view>
                <view class="card-info">
                  <view class="label">交易流水号</view>
                  <view class="value">{{ item.transactionNo }}</view>
                </view>
                <view class="card-info">
                  <view class="label">实收金额</view>
                  <view class="price">
                    <view class="flag">￥</view>
                    {{ item.equityPrice }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- </view>
          </template> -->
          <view class="end-text" v-if="list.length > 0 && isEnd">我是一个有底线的人</view>
        </scroll-view>
      </template>
      <template v-else>
        <view class="no-data">
          <glsx-image class="no-data-img" src="media/no-data.png" mode="scaleToFill" />
          <view class="no-data-text">暂无数据</view>
        </view>
      </template>
    </view>
    <car-brands ref="carBrandListVisible" @select="handleSelect($event, 'carBrandListVisible')" @close="resetFocusIndex" />
    <OrderPopup ref="goodsCtegoryVisible" :data="chooseContent" @onConfirm="onConfirm" :externalData="[]" :popupType="15" />
  </view>
</template>

<script>
import utils from '@/utils/utils'
import Record from '@/mixin/record'
import CarBrands from '@/components/CarBrands.vue'
import dayjs from 'dayjs'
import OrderPopup from '@/components/OrderPopup/index.vue'
export default {
  components: { CarBrands, OrderPopup },
  name: 'History',
  mixins: [Record],
  props: {
    title: String,
    madiaId: Number,
    show: Boolean,
    isByd: Boolean
    // views: Array
  },
  data() {
    return {
      scrollTop: 0,
      formObject: [
        {
          placeholder: '品牌车型',
          key: 'carModel',
          type: 'select',
          popKey: 'carBrandListVisible'
        },
        {
          placeholder: '商品类目',
          key: 'goodsCtegory',
          type: 'select',
          popKey: 'goodsCtegoryVisible'
        }
      ],
      customerInfo: {},
      focusIndex: -1,
      showphoto: false,
      formatList: [],
      merchantOrder: false, //门店订单
      historyOrderGoodsTypes: [],
      chooseContent: []
    }
  },
  watch: {
    show(n) {
      if (n) this.init()
      else this.scrollTop = 0
    },
    watchStatus: {
      immediate: true,
      handler(newval) {
        this.pageNum = 1
        this.scrollTop = 1000
        this.list = []
        this.customerInfo = {}
        if (this.channelType == 1) this.merchantOrder = true
        setTimeout(() => {
          this.scrollTop = 0
        }, 100)
      }
    },
    merchantOrder: {
      immediate: true,
      handler(newval) {
        this.pageNum = 1
        this.scrollTop = 1000
        this.list = []
        setTimeout(() => {
          this.scrollTop = 0
          this.getQuotationList()
        }, 100)
      }
    }
  },
  computed: {
    watchStatus() {
      return this.$store.state.user.historyStatus
    },
    watchCustomerInfo() {
      return this.$store.state.user.customerInfo
    },
    shopMerchantId() {
      return uni.$storage.get('userInfo').shopMerchantId
    },
    subLoginUserChannelType() {
      return uni.$storage.get('userInfo').subLoginUser.channelType == 9
    },
    channelType() {
      const { channelType } = uni.$storage.get('userInfo')
      return channelType
    }
  },
  mounted() {
    if (this.show) this.init()
  },
  methods: {
    init() {
      this.customerInfo = this.watchCustomerInfo
      if (this.subLoginUserChannelType) {
        this.merchantOrder = true
      }
      // if (!this.customerInfo.carModel && !this.isByd) this.$refs.carBrandListVisible.autoSelect()
      // else
      this.search()
    },
    search() {
      // if (this.list.length == 0) {
      //   this.list = uni.getStorageSync(`${this.shopMerchantId}-historyList`)
      //   this.isEnd = true
      // }
      if (this.pageNum == 1) this.getQuotationList()
    },
    getPreviousDate(days) {
      let date = new Date()
      date.setDate(date.getDate() - days)

      // 格式化日期为 YYYY-MM-DD
      let year = date.getFullYear()
      let month = String(date.getMonth() + 1).padStart(2, '0')
      let day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    },

    async getQuotationList() {
      const { shopMerchantId, pageNum, pageSize, merchantOrder } = this,
        carModel = this.customerInfo.carModel
      try {
        uni.showLoading({
          mask: true
        })
        const carBrandList = uni.$storage.get('carBrandList')
        const carChildsBrandIds = carBrandList.map(i => i.id)
        const { sceneType } = uni.$storage.get('userInfo')
        let params = {
          merchantId: shopMerchantId,
          pageNum,
          pageSize,
          carModel: carModel || '',
          orderStatus: 3,
          merchantOrder,
          sceneType: sceneType,
          historyOrderGoodsTypes: this.historyOrderGoodsTypes
        }
        if (!params.merchantOrder) {
          delete params.merchantId
          params.maxCreateTime = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
          params.minCreateTime = dayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).format('YYYY-MM-DD HH:mm:ss')
          params.carChildsBrandIds = carChildsBrandIds
        }
        let { list, total } = await uni.$api.boutiqueApi.getOrderListPage(params)
        uni.hideLoading()

        this.list = [...(pageNum == 1 ? [] : this.list), ...list]
        let previousCreatedTime = null
        let _list = []
        this.list.map(e => {
          let createdTime = dayjs(e.createdTime).format('YYYY年MM月DD日')
          if (createdTime !== previousCreatedTime) {
            _list.push({
              title: createdTime,
              list: []
            })
            previousCreatedTime = createdTime
          }
        })
        _list.map(e => {
          this.list.map(i => {
            let createdTime = dayjs(i.createdTime).format('YYYY年MM月DD日')
            if (e.title === createdTime) e.list.push(i)
          })
        })
        this.formatList = list
        this.flag = true
        this.total = total
        if (!carModel && this.pageNum == 1 && this.list.length) uni.setStorageSync(`${shopMerchantId}-historyList`, this.list)
      } catch (error) {
        uni.hideLoading()
        this.flag = true
        this.isEnd = true
        if (!carModel && this.pageNum == 1) this.list = uni.getStorageSync(`${this.shopMerchantId}-historyList`)
      }
    },
    pageonReachBottom() {
      this.isEnd = false
      let { pageNum, total, isEnd, pageSize } = this
      if (!isEnd) isEnd = false
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        this.getQuotationList()
      } else this.isEnd = true
    },
    // 脱敏
    nameHide(name) {
      return name.substring(0, 1) + '*'
    },
    accDiv(val) {
      return utils.accDiv(val || 0, 100)
    },
    handleSelect(item, popkey) {
      this.$refs[popkey].close()
      this.$refs.carBrandListVisible.close()
      this.customerInfo.carModel = item.name
      this.customerInfo.carModelId = item.id
      this.resetFocusIndex()
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
      this.list = []
      this.pageNum = 1
      this.getQuotationList()
    },
    showPopup(e, index) {
      this.focusIndex = index
      this.$refs[e].open()
    },
    closeAllPopup() {
      this.$refs.carBrandListVisible.close()
      this.resetFocusIndex()
    },
    resetFocusIndex() {
      this.focusIndex = -1
    },
    // 修改 onConfirm 方法
    onConfirm(chooseList) {
      console.log(chooseList)
      this.chooseContent = chooseList.chooseContent || []
      this.historyOrderGoodsTypes = []

      // 检查chooseList和chooseContent是否存在
      if (chooseList && chooseList.chooseContent && chooseList.chooseContent.length > 0) {
        // 按parentId分组处理level为3的数据
        const level3Map = new Map()

        // 首先处理所有数据
        chooseList.chooseContent.forEach(item => {
          if (item.level === 2) {
            // 当level为2时，添加结构为{secondaryGoodsType:item.categoryType, thirdLevelGoodsTypes:null}
            this.historyOrderGoodsTypes.push({
              secondaryGoodsType: item.categoryType,
              thirdLevelGoodsTypes: null
            })
          } else if (item.level === 3) {
            // 当level为3时，先按parentId分组
            const parentCategoryType = item.parentCategoryType
            if (level3Map.has(parentCategoryType)) {
              // 如果parentId已存在，则将当前categoryType添加到数组中
              level3Map.get(parentCategoryType).push(item.categoryType)
            } else {
              // 如果parentId不存在，则创建新数组
              level3Map.set(parentCategoryType, [item.categoryType])
            }
          }
        })

        // 然后将分组后的level3数据添加到historyOrderGoodsTypes中
        level3Map.forEach((categoryTypes, parentCategoryType) => {
          this.historyOrderGoodsTypes.push({
            secondaryGoodsType: parentCategoryType,
            thirdLevelGoodsTypes: categoryTypes
          })
        })
      }

      console.log(this.historyOrderGoodsTypes)
      this.list = []
      this.pageNum = 1
      uni.$track.add({ eventCode: 'app_goodsGategory_change', eventType: 0 })
      this.getQuotationList()
    }
  }
}
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  position: relative;
  // background-image: url('@/assets/images/media/media-bg.webp');
  background-size: 100%;
  &-content {
    height: 100%;
    position: relative;
    margin: $margin;
    .form-box {
      height: toRpx(80);
      padding: 0 toRpx(110);
      z-index: 2;
      position: absolute;
      left: toRpx(64);
      top: toRpx(168);
      padding: 0;
      .form {
        display: flex;
        gap: 0 toRpx(28);
        height: 100%;
        &-item {
          width: toRpx(742);
          height: 100%;
          position: relative;

          &-box {
            position: relative;
            width: 100%;
            height: 100%;
            background: #ffffff;
            border: toRpx(3) solid #a8c1ff;
            border-radius: toRpx(16);
            box-sizing: border-box;
            padding: 0 toRpx(24);
            z-index: 2;
            .category-name {
              width: toRpx(160);
              height: toRpx(48);
              border-radius: toRpx(8);
              background: #f5f6f7;
              color: #333333;
              font-size: toRpx(26);
              padding: toRpx(6) toRpx(16);
              margin-right: toRpx(12);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .input,
          .select {
            width: 100%;
            height: 100%;
            border: none !important;
            outline: none;
            font-size: toRpx(28);
            color: #333333;
            border-radius: toRpx(16);
            box-sizing: border-box;
            line-height: toRpx(80);
            padding: 0 !important;
            &::placeholder {
              color: #999999;
            }
          }
          .placeholderStyle {
            color: #999999;
          }
          .arrow {
            color: #999 !important;
            margin-left: auto;
            flex-shrink: 0;
          }
        }
        .active {
          &::after {
            position: absolute;
            left: toMinusRpx(2);
            top: toMinusRpx(2);
            width: calc(100% + #{toRpx(4)});
            height: calc(100% + #{toRpx(4)});
            content: '';
            background-image: linear-gradient(#2f6af7, #75bcff);
            box-shadow: 0 0 0 toRpx(8) #2c66f71a;
            border-radius: toRpx(16);
          }
        }
      }
      .check-box {
        width: toRpx(32);
        height: toRpx(32);
        background: #ffffff;
        border: toRpx(3) solid #a8c1ff;
        border-radius: toRpx(4);
        box-sizing: border-box;
        margin-right: toRpx(12);
        justify-content: center;
        overflow: hidden;
        font-weight: 700;
        transition: all 0.25s;
        flex-shrink: 0;
      }
      .checked {
        background: #2c66f7;
        border-color: #2c66f7;
      }
    }
  }
  .tabs-box {
    width: toRpx(1160);
    position: absolute;
    top: toRpx(228);
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }
  .title {
    justify-content: center;
    position: absolute;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    font-weight: 500;
    font-size: toRpx(36);
    color: #333;
    text-align: center;
    width: 100%;
    z-index: 2;
  }

  .record-box {
    height: 100%;
    padding-top: toRpx(284);
  }
  .has-tabs {
    padding-top: toRpx(360);
  }
  .card-box {
    position: relative;
    &::before {
      position: absolute;
      height: calc(100% - #{toRpx(22)});
      width: toRpx(3);
      background: #fff;
      content: '';
      top: toRpx(22);
      left: toRpx(84);
    }
    &::after {
      content: '';
      position: absolute;
      width: toRpx(18);
      height: toRpx(3);
      background: #fff;
      bottom: 0;
      left: toRpx(76);
    }
  }
  .card-title {
    font-weight: 500;
    font-size: toRpx(32);
    color: #333333;
    line-height: toRpx(44);
    margin: toRpx(24) 0 toRpx(24) toRpx(122);
    position: relative;
    &::before {
      width: toRpx(18);
      height: toRpx(18);
      background: #ffffff;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 100%;
      left: toMinusRpx(46);
      content: '';
    }
  }
  .card-list {
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(24) toRpx(48);
    padding: 0 toRpx(64) 0 toRpx(64);
    // padding: 0 toRpx(64) 0 toRpx(122);
    .card-item {
      background-color: #f7f9ff;
      border-radius: toRpx(32);
      height: toRpx(372);
      box-sizing: border-box;
      border: toRpx(4) solid hsl(0, 80%, 100%);
      position: relative;
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      z-index: 11;
      padding: toRpx(32);
      width: toRpx(706);
      flex-shrink: 0;
      .image-box {
        display: block;
        position: absolute;
        right: 0;
        top: 0;
        width: toRpx(252);
        height: toRpx(364);
        border-radius: 0 toRpx(32) toRpx(32) 0;
        z-index: -1;
      }
      .payType {
        position: absolute;
        width: toRpx(160);
        height: toRpx(160);
        right: toRpx(16);
        bottom: toRpx(16);
      }
      .name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #292d33;
        line-height: toRpx(44);
      }
      .goods-name {
        margin-top: toRpx(12);
        margin-bottom: toRpx(16);
        font-weight: 500;
        font-size: toRpx(32);
        color: #2c66f7;
        width: toRpx(644);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: toRpx(44);
      }
      .card-info {
        display: flex;
        align-items: center;
        margin-top: toRpx(12);
        line-height: toRpx(36);
        font-size: toRpx(24);
        &:last-child {
          margin-bottom: 0;
        }
        .label {
          font-size: toRpx(24);
          color: #999ea8;
          width: toRpx(136);
        }
        .value {
          font-size: toRpx(24);
          color: #666666;
          margin-left: 0;
        }
        .price {
          margin-left: 0;
          display: flex;
          align-items: baseline;
          font-weight: 500;
          font-size: toRpx(32);
          color: #22ac38;
          .flag {
            font-size: toRpx(24);
          }
        }
      }
      .gradient-overlay {
        z-index: -1;
        position: absolute;
        top: 0;
        right: 0;
        width: toRpx(252);
        height: toRpx(364);
        background: linear-gradient(to left, rgba(247, 249, 255, 0) 0%, rgba(247, 249, 255, 1) 100%);
      }
    }
  }
}
.end-text {
  width: 100%;
  color: #999;
  text-align: center;
  padding: toRpx(50) 0;
}
.no-data {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  &-img {
    width: toRpx(640);
    height: toRpx(272);
  }

  &-text {
    font-size: toRpx(32);
    color: #999999;
    text-align: center;
    margin-top: toRpx(24);
  }
}
</style>
