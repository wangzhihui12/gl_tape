<template>
  <view class="order-management">
    <view class="search-box">
      <input class="search-input" placeholder-class="placeholder" v-model="customerName" confirm-type="search" @confirm="search" placeholder="输入客户姓名搜索" />
      <view class="clear flex" @click="clear">
        <uni-icons type="closeempty" size="16" v-if="customerName"></uni-icons>
      </view>
    </view>

    <view class="tab-container flex">
      <view class="flex tab-flex-box">
        <view class="tab-item" :class="{ active: tabIndex === index }" v-for="(item, index) in tabList" :key="index" @click="switchTab(index)">
          <text>{{ item.tabName }}</text>
          <text class="num">{{ item.num }}</text>
        </view>
      </view>

      <view class="flex filter-item justify-center align-center" @click="openFilter">
        筛选
        <view class="sprite-icon icon-filter"></view>
      </view>
    </view>

    <z-paging ref="paging" :fixed="false" paging-class="paging-class px-48" :loading-full-fixed="false" :auto-show-system-loading="true" :show-scrollbar="false" v-model="dataList" @query="queryList" :default-page-size="10">
      <OrderCard v-for="(item, index) in dataList" :key="index" :orderCardDetail="item" @toggle-goods-list="handleToggleGoodsList" @jump="jump" @refresh="search()" @openPay="openPay"></OrderCard>
    </z-paging>
    <OrderScreenContract ref="openFilter" @onConfirm="openFilterConfirm" />
    <!-- 支付弹框 -->
    <OrderPay ref="OrderPay" @jumpSuccess="jumpSuccess" />
  </view>
</template>

<script>
import order_mixins from '../../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import OrderCard from './OrderCard'
import PublishPopup from '@/components/PublishPopup.vue'
import dayjs from 'dayjs'
import utils from '@/utils/utils'
import OrderScreenContract from '@/components/OrderScreenContract/index.vue'
import OrderPay from './OrderPay.vue'

export default {
  name: 'OrderManagement',
  mixins: [ZPMixin, interceptionMixin],
  components: {
    OrderCard,
    PublishPopup,
    OrderScreenContract,
    OrderPay
  },
  computed: {
    orderObj() {
      return order_mixins.data.orderObj || []
    },
    payType() {
      return order_mixins.data.payType || {}
    },
    status() {
      return order_mixins.data.status || {}
    }
  },
  data() {
    return {
      itemFormObj: [
        {
          label: '交易参考号',
          prop: 'tradeNo',
          type: 'copy'
        },
        {
          label: '支付时间',
          prop: 'accountDate',
          type: 'time'
        },
        {
          label: '支付金额',
          prop: 'totalFee',
          type: 'price'
        },
        {
          label: '商户名称',
          prop: 'shopMerchantName'
        }
      ],
      tabList: [
        { tabName: '全部', num: 0, value: null },
        { tabName: '待报价', num: 0, value: 0 },
        { tabName: '待支付', num: 0, value: 2 },
        { tabName: '已支付', num: 0, value: 3 },
        { tabName: '已完成', num: 0, value: 5 },
        { tabName: '战败', num: 0, value: -1 },
        { tabName: '待上传协议', value: 7 }
      ],
      tabIndex: 0,
      waitinputorderTabList: [
        { name: '正常分账期', showQuestion: false },
        { name: '超分账期', showQuestion: true }
      ],
      activeIndex: 0,
      customerName: '',
      searchObj: {},
      dataList: [],
      triggered: false,
      triggered1: false,
      waitOrderTimer: null, // 定时器引用
      tipsProps: {
        tipsText: '该门店产生异常订单，请点击补录！',
        showTips: true,
        type: 2,
        typeText: '补录订单'
      },
      normalOrderNoList: [],
      abnormalOrderNoList: [],
      abnormalCurrentPage: 1,
      normalCurrentPage: 1,
      abnormalPages: 1,
      normalPages: 1,
      checkListObj: {},
      localUserInfo: null
    }
  },
  mounted() {
    uni.$track.add({ eventCode: 'app_order_management' })
    this.localUserInfo = uni.$storage.get('userInfo') || {}
    if (!this.localUserInfo.isSuper && this.localUserInfo.loginRole != 3 && this.localUserInfo?.loginRole != 6) {
      this.searchObj.transferIds = [this.localUserInfo.uuid]
    }
    this.search()
  },
  methods: {
    clear() {
      this.customerName = ''
      this.search()
    },
    search() {
      // 判断是不是超管 && !this.localUserInfo.isSuper
      // ,不是只能筛选当前4s店的
      if (!this.searchObj.merchantId) {
        this.searchObj.merchantId = this.localUserInfo?.shopMerchantId
      }
      this.$refs.paging.reload()
      this.getStatByStatus()
    },
    handleToggleGoodsList(data) {
      this.$set(data.item, 'showAllGoodsListFlag', data.flag)
    },
    switchTab(index) {
      this.tabIndex = index
      this.searchObj.orderStatus = this.tabList[index].value
      this.search()
    },
    openFilter() {
      this.$refs.openFilter.open(this.searchObj)
    },
    openFilterConfirm(val) {
      console.log(val)
      this.searchObj = null
      this.searchObj = val
      if (this.searchObj?.zyPayStatus == '1') this.searchObj.orderStatus = 7
      console.log(this.searchObj)

      if (!this.searchObj.orderStatus && this.searchObj.orderStatus !== 0 && this.searchObj.orderStatus !== '0') {
        this.tabIndex = 0
      } else {
        const index = this.tabList.findIndex(item => item.value == this.searchObj.orderStatus)
        console.log(index)
        this.tabIndex = index !== -1 ? index : 0
      }
      this.search()
    },
    copyText(e) {
      console.log(e)
      uni.setClipboardData({
        data: e,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success',
            duration: 2000
          })
        }
      })
    },
    tabChange(index) {
      this.activeIndex = index
      if (this.activeIndex === 0 && !this.normalOrderNoList.length) {
        this.getTransactionSerialNumber()
      }
      if (this.activeIndex === 1 && !this.abnormalOrderNoList.length) {
        this.getTransactionSerialNumber()
      }
    },
    getStatByStatus() {
      const localUserInfo = uni.$storage.get('userInfo')
      console.log(this.searchObj, 'this.searchObj')
      let params = {
        customerName: this.customerName,
        merchantIds: [localUserInfo.shopMerchantId],
        ...this.searchObj
      }
      // 兼容筛选入参：baseSceneCode 为空字符串表示“全部”，请求时不下发该字段
      if (params.baseSceneCode === '') delete params.baseSceneCode
      uni.$api.equityApi
        .orderStatistics(params)
        .then(result => {
          const labelList = ['total', 'waitQuotation', 'waitPay', 'paySuccess', 'completed', 'defeat']
          labelList.map((item, index) => {
            this.tabList[index].num = result[item] ? result[item] : 0
          })
          console.log(this.tabList)
        })
        .catch(err => {
          console.log(err)
        })
    },
    pageonReachBottom() {
      if (this.activeIndex === 0) {
        if (this.normalPages == this.normalCurrentPage) return uni.showToast({ title: '列表已到底', icon: 'none' })
        this.normalCurrentPage += 1
      } else {
        if (this.abnormalPages == this.abnormalCurrentPage) return uni.showToast({ title: '列表已到底', icon: 'none' })
        this.abnormalCurrentPage += 1
      }
      this.getTransactionSerialNumber()
    },
    onRefresh() {
      this.triggered = true
      this.normalCurrentPage = 1
      this.normalOrderNoList = []
      this.getTransactionSerialNumber()
    },
    onRefresh1() {
      this.triggered1 = true
      this.abnormalCurrentPage = 1
      this.abnormalOrderNoList = []
      this.getTransactionSerialNumber()
    },
    getTransactionSerialNumber() {
      uni.$api.boutiqueApi
        .transactionSerialNumber({ currentPage: this.activeIndex === 0 ? this.normalCurrentPage : this.abnormalCurrentPage, pageSize: 10, inputOrderType: this.activeIndex + 1, inputStatus: 0 })
        .then(result => {
          if (this.activeIndex == 0) {
            this.normalOrderNoList = [...this.normalOrderNoList, ...result.list]
            this.normalPages = result.pages
            this.triggered = false
            this.triggered1 = false
          } else {
            this.abnormalOrderNoList = [...this.abnormalOrderNoList, ...result.list]
            this.abnormalPages = result.pages
            this.triggered = false
            this.triggered1 = false
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    queryList(pageNo, pageSize) {
      const localUserInfo = uni.$storage.get('userInfo')
      console.log(this.searchObj)
      let params = {
        pageSize,
        currentPage: pageNo,
        customerName: this.customerName,
        merchantIds: [localUserInfo.shopMerchantId],
        ...this.searchObj
      }
      // 兼容筛选入参：baseSceneCode 为空字符串表示“全部”，请求时不下发该字段
      if (params.baseSceneCode === '') delete params.baseSceneCode
      if (params?.zyPayStatus == '1') params.orderStatus = 7
      // if (staffUuid) {
      //   params.transferIds = [staffUuid]
      // } else {
      //   params.merchantId = storeInfo?.merchantId
      // }
      uni.$api.equityApi
        .quotationPage(params)
        .then(result => {
          console.log(result)
          let tempList = this.dealListData(result.list || [])
          this.$refs.paging.complete(tempList)
        })
        .catch(err => {
          this.$refs.paging.complete(false)
          console.log(err)
        })
    },
    // 价格过滤器
    priceFilter(num) {
      var pow = Math.pow(10, 2)
      return (Math.round((num / 100) * pow) / pow).toFixed(2)
    },

    formatDate(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },

    // 选择点击事件
    selectTap(index) {
      this.$emit('select-tap', index)
    },

    // 复制订单号
    copyOutTradeNo(item) {
      this.$emit('copy-out-trade-no', item)
    },
    activeClick(item) {
      if (this.checkListObj[item.tradeNo]) {
        this.$delete(this.checkListObj, item.tradeNo)
      } else {
        this.$set(this.checkListObj, item.tradeNo, item)
      }
    },
    cancelSelection() {
      this.checkListObj = {}
      this.$refs.WaitinputorderPopup.closePopup()
    },
    jump(name, val) {
      console.log(name, val, 'jump')
      this.$emit('jump', name, val)
    },
    openPay(item) {
      this.$refs.OrderPay.open(item.id)
    },
    jumpSuccess(params) {
      this.$emit('jump', 'OrderDetail', params)
    },
    dealListData(arr) {
      if (!arr) {
        return arr
      }
      var attrList = ['equityPrice', 'quotedPrice', 'quotedPriceUpdate', 'refundAmount','finalPrice']
      arr.forEach(item => {
        attrList.forEach(k => {
          if (item[k]) {
            item[k] = (item[k] / 100).toFixed(2)
          }
        })
      })
      return arr
    }
  }
}
</script>

<style lang="scss" scope>
.order-management {
  height: 100%;
  .paging-class {
    height: calc(100% - #{toRpx(288)});
  }
  .px-48 {
    padding: 0 toRpx(48);
  }

  .search-box {
    padding: toRpx(40) toRpx(48) toRpx(0);
    position: relative;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      z-index: -2;
      width: 100%;
      height: 100%;
      opacity: 0.15;
      background: linear-gradient(0deg, #94c2ff00 0%, #5294ff 100%);
    }

    &::before {
      content: '';
      position: absolute;
      left: toMinusRpx(20);
      top: toMinusRpx(28);
      z-index: -1;
      width: toRpx(136);
      height: toRpx(136);
      opacity: 0.6;
      background: linear-gradient(-44.4deg, #94c2ff00 0%, #5294ff 100%);
      filter: blur(24px);
    }
    .clear {
      position: absolute;
      right: toRpx(18);
      top: toRpx(40);
      height: toRpx(72);
      padding: 0 48rpx;
    }

    .search-input {
      text-align: center;
      height: toRpx(72);
      border-radius: toRpx(40);
      opacity: 1;
      background: #f5f7fa;

      .uni-input-placeholder {
        color: #999ea8;
        font-size: toRpx(28);
      }
      .placeholder {
        height: 100%;
        color: #999ea8;
        font-family: uniicons;
        display: flex;
        align-items: center;
        justify-content: center;
        &::after {
          display: block;
          content: '\e654';
          margin-left: 8rpx;
          height: 100%;
          display: flex;
          align-items: center;
          font-size: 36rpx;
        }
      }
    }
  }

  .tab-container {
    display: flex;
    // justify-content: start;
    position: relative;
    padding-right: toRpx(48);
    .tab-flex-box {
      padding: toRpx(24) 0 toRpx(24) toRpx(48);
    }

    .flex:first-child {
      display: flex;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
      margin-right: toRpx(20);
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .filter-item {
      // width: toRpx(164);
      height: toRpx(72);
      border-radius: toRpx(16);
      background: #fff;
      border: toRpx(2) solid #ffffffcc;
      color: #333333;
      font-size: toRpx(28);
      font-weight: 400;
      padding: toRpx(0) toRpx(40);
      flex-shrink: 0;
      white-space: nowrap;
    }
  }

  .tab-item {
    // width: toRpx(164);
    height: toRpx(72);
    border-radius: toRpx(16);
    margin-right: toRpx(20);
    padding: toRpx(0) toRpx(40);
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: toRpx(28);
    color: #666666;
    font-weight: normal;
    background: #fff;
    border: toRpx(2) solid #ffffffcc;
    flex-shrink: 0;
    &.active {
      border: toRpx(2) solid #ffffff;
      background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
      box-shadow: toRpx(4) toRpx(8) toRpx(16) 0 #81a3d659;
      color: #ffffff;
      font-weight: bold;
      transform: scale(1.05);
    }
    .num {
      margin-left: toRpx(4);
      font-size: toRpx(20);
      font-weight: 500;
    }
  }

  .tips {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: toRpx(28);
    width: 100%;
    height: toRpx(76);
    border-radius: 16px;
    opacity: 1;
    background: #fef5ea;
    margin: toRpx(24) 0;
    color: #ff9d0a;
    &-text {
      margin-top: toRpx(4);
    }

    .icon-study-tips {
      margin-right: toRpx(8);
    }
    .waitinputorder-btn {
      width: toRpx(136);
      height: toRpx(50);
      border-radius: toRpx(48);
      opacity: 1;
      background: #ffffff;
      color: #4673ff;
      font-size: toRpx(24);
      font-weight: 500;
      text-align: center;
      line-height: toRpx(50);
    }
  }

  .waitinputorderPopup .popup-content {
    .waitinputorder-tab-container {
      width: toRpx(488);
      border-radius: toRpx(64);
      opacity: 1;
      background: #f5f7fa;
    }

    .waitinputorder-tab-buttons {
      display: flex;
      background-color: #f5f5f5;
      border-radius: 24rpx;
      overflow: hidden;
      margin-bottom: 20rpx;
    }

    .waitinputorder-tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: toRpx(28);
      font-weight: 500;
      color: #333;
      position: relative;
      width: toRpx(236);
      height: toRpx(56);
      border-radius: toRpx(40);

      &.active {
        background-color: #000;
        color: #fff;
      }

      .question-icon {
        margin-left: 8rpx;
        opacity: 0.6;
      }
    }
  }

  .order_no_box {
    height: calc(67vh - #{toRpx(364)});
    .order-gap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: toRpx(36);
    }
    .order_no_item {
      border-radius: toRpx(16);
      opacity: 1;
      border: toRpx(2) solid #dce0e6;
      padding: toRpx(24) toRpx(32);
      background: #f5f7fa;
      position: relative;
      .message {
        .item {
          margin-bottom: toRpx(12);
          &:last-child {
            margin-bottom: 0;
          }
        }
        .label {
          color: #999ea8;
          font-size: toRpx(24);
          font-weight: 400;
          width: toRpx(120);
          margin-right: toRpx(24);
        }
        .value {
          color: #333333;
          font-size: toRpx(24);
          font-weight: 400;
        }
      }
      .checked {
        position: absolute;
        top: 0;
        right: 0;
      }
    }
    .checkActive {
      border: toRpx(2) solid #4673ff;
      background: #4673ff1a;
    }
    .copy-btn {
      display: flex;
      align-items: center;
      margin-left: auto;
      color: #808291;

      .copy {
        margin-right: toRpx(8);
        margin-left: toRpx(20);
      }
    }
    .nothing {
      width: 100%;
      height: toRpx(228);
      flex-direction: column;
      margin-top: toRpx(76);
      font-size: toRpx(24);
      color: #999999;
      box-sizing: border-box;
      &.big-height {
        height: toRpx(234);
      }

      .icon {
        width: toRpx(288);
        height: toRpx(144);
        margin-bottom: toRpx(4);
      }
    }
  }

  .footer-box {
    width: 100%;
    height: toRpx(164);
    background-color: #fff;
    .btn {
      width: 30%;
      height: toRpx(80);
      border-radius: toRpx(48);
      opacity: 1;
      line-height: toRpx(80);
      text-align: center;
      color: #333333;
      font-size: toRpx(32);
      font-weight: 500;
    }
    .cancle-btn {
      background: #f0f1f5;
    }
    .sure-btn {
      color: #fff;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      margin-left: toRpx(32);
    }
  }
}
::v-deep .waitinputorderPopup .uni-popup__wrapper {
  border-radius: toRpx(32) toRpx(32) 0 0;
  opacity: 1;
  width: 100%;
  height: 67vh;
  background-color: #fff !important;
  .popup-top-box {
    padding: toRpx(32) toRpx(52);
  }
}
::v-deep .abnormalTipsPopup .uni-popup__wrapper {
  border-radius: toRpx(32) toRpx(32) 0 0;
  opacity: 1;
  width: 100%;
  height: 51vh;
  background-color: #fff !important;
  .ul {
    height: 100%;
    .title {
      font-weight: 600;
      font-size: toRpx(26);
      color: #282829;
      margin-bottom: toRpx(8);
    }

    .li {
      font-size: toRpx(26);
      color: #282829;
      margin-bottom: toRpx(8);
    }
    .last {
      margin-bottom: toRpx(32);
    }
  }
}
</style>
