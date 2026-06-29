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

      <!-- <view class="flex filter-item justify-center align-center" @click="openFilter">
        筛选
        <view class="sprite-icon icon-filter"></view>
      </view> -->
    </view>
    <view class="px-48">
      <view class="flex tips align-center justify-between" v-if="showTips">
        <view class="flex align-center">
          <view class="sprite-icon icon-equityTip"></view>
          为保障客户权益，请尽快处理！
        </view>
        <view class="sprite-icon icon-equityClose" @click="showTips = false"></view>
      </view>
    </view>

    <z-paging ref="paging" :fixed="false" paging-class="paging-class px-48" :loading-full-fixed="false" :auto-show-system-loading="true" :show-scrollbar="false" v-model="dataList" @query="queryList" :default-page-size="10">
      <EquityCard v-for="(item, index) in dataList" :key="index" :orderCardDetail="item" @toggle-goods-list="handleToggleGoodsList" @jump="jump" @refresh="search()" @openPay="openPay"></EquityCard>
    </z-paging>
    <!-- <OrderScreenContract ref="openFilter" @onConfirm="openFilterConfirm" /> -->
    <!-- 支付弹框 -->
    <OrderPay ref="OrderPay" @jumpSuccess="jumpSuccess" />
  </view>
</template>

<script>
import order_mixins from '../../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import EquityCard from './EquityCard'
import PublishPopup from '@/components/PublishPopup.vue'
import dayjs from 'dayjs'
import utils from '@/utils/utils'
// import OrderScreenContract from '@/components/OrderScreenContract/index.vue'
import OrderPay from './OrderPay.vue'

export default {
  name: 'OrderManagement',
  mixins: [ZPMixin, interceptionMixin],
  components: {
    EquityCard,
    PublishPopup,
    // OrderScreenContract,
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
        { tabName: '待补录', num: 0, value: 0 },
        { tabName: '提单失败', num: 0, value: 3 },
        { tabName: '已完成', num: 0, value: 2 }
      ],
      tabIndex: 0,
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
      localUserInfo: null,
      showTips: true
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
      console.log(this.searchObj)
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
        merchantId: localUserInfo.shopMerchantId
      }
      uni.$api.equityApi
        .equityStatistics(params)
        .then(result => {
          const labelList = ['totalOder', 'ladingOder', 'failed', 'success']
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
        pageNum: pageNo,
        customerName: this.customerName,
        merchantId: localUserInfo.shopMerchantId,
        orderStatus: this.searchObj.orderStatus
      }

      uni.$api.equityApi
        .equityPage(params)
        .then(result => {
          console.log(result)
          this.$refs.paging.complete(result.data)
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
    }
  }
}
</script>

<style lang="scss" scope>
.order-management {
  height: 100%;
  .paging-class {
    height: calc(100% - #{toRpx(380)});
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
  .tips {
    height: toRpx(72);
    border-radius: toRpx(16);
    background: #e0e8ff;
    color: #2c66f7;
    font-size: toRpx(28);
    font-weight: 400;
    padding: toRpx(0) toRpx(34);
    margin-bottom: toRpx(24);
    .icon-equityTip {
      margin-right: toRpx(14);
    }
  }
}
</style>
