<template>
  <view class="order-management">
    <view class="search-box">
      <input class="search-input" placeholder-class="placeholder" v-model="keyword" confirm-type="search" @input="onKeywordInput" @confirm="search" placeholder="输入客户姓名/商品名称/订单编号/手机号搜索" />
      <view class="clear flex" @click="clear">
        <uni-icons type="closeempty" size="16" v-if="keyword"></uni-icons>
      </view>
    </view>

    <view class="tab-container flex justify-between">
      <view class="flex">
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
    <view class="px-48">
      <view class="tips" v-if="waitInputCount">
        <view class="sprite-icon icon-study-tips"></view>
        {{ tipsProps.tipsText }}
        <view @click.stop="waitinputorderClick" class="waitinputorder-btn">补录订单</view>
      </view>
    </view>

    <z-paging ref="paging" :fixed="false" paging-class="paging-class px-48" :loading-full-fixed="false" :auto-show-system-loading="true" :show-scrollbar="false" v-model="dataList" @query="queryList" :default-page-size="10">
      <OrderCard v-for="(item, index) in dataList" :key="index" :orderCardDetail="item" @toggle-goods-list="handleToggleGoodsList" @jump="jump" @refresh="search()"></OrderCard>
    </z-paging>

    <PublishPopup ref="WaitinputorderPopup" popupClass="waitinputorderPopup" :showClose="true" title="选择交易参考号">
      <template #content>
        <view class="popup-content px-48">
          <view class="waitinputorder-tab-container">
            <view class="waitinputorder-tab-buttons">
              <view v-for="(item, index) in waitinputorderTabList" :key="index" class="waitinputorder-tab-button" :class="{ active: activeIndex === index }" @click="tabChange(index)">
                <text>{{ item.name }}</text>
                <view v-if="item.showQuestion" class="question-icon" @click.self="showQuestionPopup()">
                  <uni-icons type="help" size="16" color="#999"></uni-icons>
                </view>
              </view>
            </view>
          </view>

          <scroll-view class="order_no_box" scroll-y enable-back-to-top refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh" v-show="activeIndex === 0" @scrolltolower="pageonReachBottom">
            <view v-if="normalOrderNoList.length > 0" class="order-gap">
              <view v-for="(item, index) in normalOrderNoList" :key="index" class="order_no_item" :class="{ checkActive: checkListObj[item.tradeNo] }" @click="activeClick(item)">
                <view class="message">
                  <view v-for="(subItem, idx) in itemFormObj" :key="idx" class="item flex align-center">
                    <view class="label">{{ subItem.label }}</view>

                    <view v-if="subItem.type === 'price'" class="value price_value">￥{{ priceFilter(item[subItem.prop]) }}</view>

                    <view v-else-if="subItem.type === 'select'" class="select_value" @click="selectTap(index)" :data-index="index">
                      <text class="text-hide">{{ filmOrderData[item.filmOrder] }}</text>
                      <image src="/components/images/arrow-x.png" mode="" />
                    </view>

                    <view v-else class="value flex align-center">
                      {{ subItem.type === 'time' ? formatDate(item[subItem.prop]) : item[subItem.prop] }}
                      <view v-if="subItem.type === 'copy'" class="copy-btn" @click.stop="copyText(item[subItem.prop])">
                        <view class="sprite-icon icon-icon-copy copy"></view>
                        复制
                      </view>
                    </view>
                  </view>
                </view>
                <view class="sprite-icon icon-tag-checked checked" v-if="checkListObj[item.tradeNo]"></view>
              </view>
            </view>
            <view class="nothing flex" v-else>
              <image class="icon" src="../../../../assets/images/home/nothing.webp" />
              暂无数据
            </view>
          </scroll-view>

          <scroll-view class="order_no_box" scroll-y enable-back-to-top refresher-enabled="true" :refresher-triggered="triggered1" @refresherrefresh="onRefresh1" v-show="activeIndex === 1" @scrolltolower="pageonReachBottom">
            <view v-if="abnormalOrderNoList.length > 0" class="order-gap">
              <view v-for="(item, index) in abnormalOrderNoList" :key="index" class="order_no_item" :class="{ checkActive: checkListObj[item.tradeNo] }" @click="activeClick(item)">
                <view class="message">
                  <view v-for="(subItem, idx) in itemFormObj" :key="idx" class="item flex align-center">
                    <view class="label">{{ subItem.label }}</view>

                    <view v-if="subItem.type === 'price'" class="value price_value">￥{{ priceFilter(item[subItem.prop]) }}</view>

                    <view v-else-if="subItem.type === 'select'" class="select_value" @click="selectTap(index)" :data-index="index">
                      <text class="text-hide">{{ filmOrderData[item.filmOrder] }}</text>
                      <image src="/components/images/arrow-x.png" mode="" />
                    </view>

                    <view v-else class="value flex align-center">
                      {{ subItem.type === 'time' ? formatDate(item[subItem.prop]) : item[subItem.prop] }}
                      <view v-if="subItem.type === 'copy'" class="copy-btn" @click.stop="copyText(item[subItem.prop])">
                        <view class="sprite-icon icon-icon-copy copy"></view>
                        复制
                      </view>
                    </view>
                  </view>
                </view>
                <view class="sprite-icon icon-tag-checked checked" v-if="checkListObj[item.tradeNo]"></view>
              </view>
            </view>
            <view class="nothing flex" v-else>
              <image class="icon" src="../../../../assets/images/home/nothing.webp" />
              暂无数据
            </view>
          </scroll-view>
        </view>
      </template>
      <template #footer>
        <view class="footer-box flex justify-center">
          <view class="cancle-btn btn" @click="cancelSelection">取消</view>
          <view class="sure-btn btn" @click="confirmSelection">确认</view>
        </view>
      </template>
    </PublishPopup>

    <PublishPopup ref="abnormalTipsPopup" popupClass="abnormalTipsPopup" :showClose="true" title="超分账期" @confirm="confirmTips">
      <template #content>
        <scroll-view scroll-y class="ul px-48">
          <view class="title">字段定义</view>
          <view class="li">○ 正常分账期：指客户付款后，未超过分账期 (一般指支付时间≤20日)，驻店未在系统补录或特殊情况下需运营在后台关联订单的交易流水号。</view>
          <view class="li last">○ 超分账期：指客户付款后，超过分账期 (一般指支付时间＞20日)，驻店未在系统补录或特殊情况下需运营在后台关联订单的交易流水号。</view>
          <view class="title">操作指导</view>
          <view class="li">① 补录订单：支持正常分账期或超分账期单笔或多笔流水补录1个订单</view>
          <view class="li">情况一：单笔支付直接补录创建工单</view>
          <view class="li last">情况二：客户多笔支付，补录工单时勾选多笔交易流水</view>
          <view class="li">② 特殊情况：需通知运营在后台关联工单</view>
          <view class="li">情况一：客户支付定金时间与尾款时间间隔20天以上</view>
          <view class="li">情况二：客户购买车辆2台及以上的费用，一笔支付</view>
          <view class="li last">情况三：支付费用时误操作（多付了）需部分退款</view>
          <view class="li last">操作流程：驻店在小程序点击新建工单，收款方选择嘀加收款，收款方式选择其它收款，复制交易流水号（填写时流水号末尾加逗号，多笔交易流水号中间用逗号隔开），工单录完后通知线上运营在后台关联。</view>
        </scroll-view>
      </template>
    </PublishPopup>
    <order-screen ref="openFilter" @onConfirm="openFilterConfirm" />
  </view>
</template>

<script>
import order_mixins from '../../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import OrderCard from '../../components/OrderCard'
import PublishPopup from '@/components/PublishPopup.vue'
import dayjs from 'dayjs'
import utils from '@/utils/utils'
import OrderScreen from '@/components/OrderScreen/index.vue'
export default {
  name: 'OrderManagement',
  mixins: [ZPMixin, interceptionMixin],
  components: {
    OrderCard,
    PublishPopup,
    OrderScreen
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
        { tabName: '全部', num: 0 },
        { tabName: '待跟进', num: 0 },
        { tabName: '已升级', num: 0 },
        { tabName: '战败', num: 0 }
      ],
      tabIndex: 0,
      waitinputorderTabList: [
        { name: '正常分账期', showQuestion: false },
        { name: '超分账期', showQuestion: true }
      ],
      activeIndex: 0,
      keyword: '',
      searchObj: {},
      dataList: [],
      triggered: false,
      triggered1: false,
      waitInputCount: 0, // 添加待补录计数
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
    this.search()
    this.startWaitOrderPolling()
  },
  beforeDestroy() {
    this.clearWaitOrderPolling()
  },
  methods: {
    onKeywordInput(e) {
      const filtered = (e.detail.value || '').replace(
        /(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|(\ud83e[\udd00-\uddff])|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uFE0F]/gi,
        ''
      )
      this.$nextTick(() => {
        this.keyword = filtered
      })
    },
    clear() {
      this.keyword = ''
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
    async waitinputorderClick() {
      if (await this.inspectionOfProhibitionBill()) return
      if (!this.normalOrderNoList.length && !this.abnormalOrderNoList.length) {
        this.getTransactionSerialNumber()
      }
      this.$refs.WaitinputorderPopup.open()
    },
    handleToggleGoodsList(data) {
      this.$set(data.item, 'showAllGoodsListFlag', data.flag)
    },
    switchTab(index) {
      this.tabIndex = index
      delete this.searchObj.statusList
      this.search()
    },
    openFilter() {
      this.$refs.openFilter.open()
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
      if ((this.searchObj.statusList && this.searchObj.statusList[0] == 'Y') || (this.searchObj.statusList && this.searchObj.statusList[0] == 'N')) {
        this.searchObj.constructionFlag = this.searchObj.statusList[0]
        delete this.searchObj.statusList
      }
      uni.$api.boutiqueApi
        .statByStatus({
          ...this.searchObj,
          keyword: this.keyword,
          sceneType: 1
        })
        .then(result => {
          const labelList = ['totalCount', 'waitUpgradeCount', 'upgradedCount', 'notUpgradeCount']
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
      console.log(this.searchObj)
      let obj = {
        keyword: this.keyword,
        pageSize,
        pageNum: pageNo,
        sceneType: 1,
        ...this.searchObj
      }
      // 待跟进状态需要特殊处理避免带出已关闭
      if ([2, 3].includes(this.tabIndex)) {
        let target = {
          1: 'R',
          2: 'Y',
          3: 'N'
        }
        obj.upgradeFinishFlag = target[this.tabIndex]
      } else if (this.tabIndex == 1) {
        obj.statusList = [1]
      }
      console.log(this.searchObj.statusList)
      console.log(this.searchObj.statusList && this.searchObj.statusList[0])
      if ((this.searchObj.statusList && this.searchObj.statusList[0] == 'Y') || (this.searchObj.statusList && this.searchObj.statusList[0] == 'N')) {
        this.searchObj.constructionFlag = this.searchObj.statusList[0]
        delete obj.statusList
      }

      uni.$api.boutiqueApi
        .getWorkPackageGoodsList(obj)
        .then(result => {
          const { list, total } = result
          // 这个是用来判断哪些用户可以撤销的
          let userType = (!this.localUserInfo.isSuper && this.localUserInfo.merchantType) || (this.localUserInfo.loginRole !== 3 && this.localUserInfo?.loginRole !== 6)
          // let userType = true

          list.map(e => {
            if (e.orderTime) e.orderTime = dayjs(new Date(e.orderTime)).format('YYYY-MM-DD HH:mm:ss')
            e.subOrderList.map(i => {
              i.totalPrice = Number(utils.decimal(i.totalPrice, 2)).toFixed(2)
            })
            e.total_price = e.totalPrice
            e.totalPrice = Number(utils.decimal(e.totalPrice, 2)).toFixed(2)
            // 开票按钮
            e.invoiceName = e.invoiceStatus == 2 ? '查看发票' : '申请开票'
            // && e.status != 1 待跟进现在也能撤销
            let orderType = (this.localUserInfo.userType == 1 || this.localUserInfo.userType == 2) && e.status != 9 && ![1, 3, 4].includes(e.selectPayType)
            // let orderType = this.localUserInfo.userType !== 1 && e.status != 9 && e.status != 1 && e.selectPayType != 3 && e.selectPayType != 1
            // console.log(userType);
            // console.log(orderType);
            e.repeal = userType && orderType
            // 处理subOrderList 商品为空的情况
            e.subOrderList = e.subOrderList.filter(item => item.merchantGoodsId)

            e.packageGoodsList?.forEach(item => {
              item.packageGoodsOrderList.forEach(g => {
                g.price = g.finalPrice ? Number(g.finalPrice) / Number(g.number) : g.upgradePrice
              })
              item.goodsList = item.packageGoodsOrderList
              item.price = item.goodsList.reduce((prev, cur) => {
                return prev + Number(cur.finalPrice) / Number(cur.number)
              }, 0)
              item.count = item.goodsList.length ? item.goodsList[0].number : 1
              let total = item.price * item.count
              item.finalPrice = utils.decimal(total, 2)
            })
            if (e.packageGoodsList && e.packageGoodsList.length) {
              e.subOrderList = e.subOrderList.concat(e.packageGoodsList)
            }

            // e.subOrderList = e.subOrderList.filter(item => item.id)

            // 处理显示订单右上角文字
            // 安全检查：如果状态不存在，使用默认值
            const statusConfig = this.status[e.status] || {
              text: '未知状态',
              color: '#8F959E',
              background: '#F3F4F5'
            }
            let text = statusConfig.text
            let color = statusConfig.color
            let background = statusConfig.background
            // 不是订单失效状态优先显示已施工
            if (![9, 11, 12, 14].includes(e.status) && e.constructionFlag == 'Y') {
              text = '已施工'
              color = '#347BFF'
              background = '#F3F7FC'
            }
            e.statusText = text
            e.statuscolor = color
            e.statusbackground = background
            // 商品是否包含太阳膜
            e.isFilmOrder = e.subOrderList?.findIndex(subE => subE?.upgradeGoodsType == 1) > -1
          })
          console.log(list)
          this.$refs.paging.complete(list)
        })
        .catch(err => {
          this.$refs.paging.complete(false)
          console.log(err)
        })
    },
    // 10s轮询一次待补录
    getWaitOrder() {
      uni.$api.boutiqueApi
        .waitinputorder()
        .then(result => {
          let { waitInputCount } = result
          this.waitInputCount = waitInputCount
        })
        .catch(err => {})
    },
    // 启动轮询
    startWaitOrderPolling() {
      // 立即执行一次
      this.getWaitOrder()
      // 设置定时器，每10秒执行一次
      this.waitOrderTimer = setInterval(() => {
        this.getWaitOrder()
      }, 10000)
    },
    // 清除轮询定时器
    clearWaitOrderPolling() {
      if (this.waitOrderTimer) {
        clearInterval(this.waitOrderTimer)
        this.waitOrderTimer = null
      }
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
    showQuestionPopup() {
      this.$refs.abnormalTipsPopup.open()
    },
    confirmTips() {
      this.$refs.abnormalTipsPopup.closePopup()
    },
    activeClick(item) {
      if (this.checkListObj[item.tradeNo]) {
        this.$delete(this.checkListObj, item.tradeNo)
      } else {
        this.$set(this.checkListObj, item.tradeNo, item)
      }
    },
    confirmSelection() {
      const selectedItems = Object.values(this.checkListObj)
      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请选择交易参考号',
          icon: 'none'
        })
        return
      }
      this.$refs.WaitinputorderPopup.closePopup()
      this.$emit('jump', 'CreateOrder', {
        selectedItems: selectedItems,
        type: 'supplementOrder'
      })
    },
    cancelSelection() {
      this.checkListObj = {}
      this.$refs.WaitinputorderPopup.closePopup()
    },
    jump(name, val) {
      console.log(name, val, 'jump')
      this.$emit('jump', name, val)
    }
  }
}
</script>

<style lang="scss" scope>
.order-management {
  height: 100%;
  .paging-class {
    height: calc(100% - #{toRpx(336)});
  }
  .px-48 {
    padding: 0 toRpx(48);
  }

  .search-box {
    padding: toRpx(40) toRpx(48) toRpx(0);
    margin-bottom: toRpx(24);
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
    padding: toRpx(0) toRpx(48);
    margin-bottom: toRpx(24);
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
