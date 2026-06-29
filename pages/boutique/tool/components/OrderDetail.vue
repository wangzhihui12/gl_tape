<template>
  <view class="order-detail">
    <view class="common-title">{{ orderInfo.constructionFlag == 'Y' && orderInfo.status != 10 ? '完成施工' : '工单详情' }}</view>
    <view v-if="isShow" class="px-48 scroll-y" :class="{ 'construction-flag-y': !isMake }">
      <view class="top-tips flex align-center" v-if="orderInfo.status != 10 && orderInfo.status != 9 && orderInfo.constructionFlag !== 'Y'">
        <view class="sprite-icon icon-successIcon checkbox-filled"></view>
        <view>
          <view class="fs-34 fw-5">客户已付款</view>
          <view class="fs-26 mt-12 cl-gray">技师施工完毕后可通知车主前来取车</view>
        </view>
        <view class="sprite-icon icon-topTipsRightIcon topTipsRightIcon"></view>
      </view>
      <view class="top-tips flex align-center" v-if="orderInfo.status == 10">
        <view class="fs-34 fw-7">订单关闭</view>
        <view class="fs-26 ml-12">客户支付超过24小时，系统自动关闭订单</view>
      </view>
      <view class="top-tips flex align-center" v-if="orderInfo.status == 9">
        <view class="fs-34 fw-7">订单已撤销</view>
        <!-- <view class="tips">客户支付超过24小时，系统自动关闭订单</view> -->
      </view>
      <view class="top-tips flex align-center" v-if="orderInfo.constructionFlag == 'Y'">
        <view class="sprite-icon icon-successIcon checkbox-filled"></view>
        <view>
          <view class="fs-34 fw-5">客户{{ orderInfo.customer.customerName }}</view>
          <view class="fs-26">完成施工，如客户有新的需要，可点击再次下单。</view>
        </view>
      </view>
      <view class="box-shell" v-if="orderInfo.goodsOrderApplyStatus">
        <view class="flex justify-between align-center">
          <view class="box-shell-title">审批</view>
          <view class="status-tag" :class="`status-tag-${orderInfo.goodsOrderApplyStatus}`">
            {{ goodsOrderApplyStatus && orderInfo.goodsOrderApplyStatus ? goodsOrderApplyStatus[orderInfo.goodsOrderApplyStatus] : '-' }}
          </view>
        </view>

        <view class="log-info box" v-if="orderInfo.goodsOrderApplyStatus == 1 || orderInfo.goodsOrderApplyStatus == 2">
          <view class="log-box">
            <template v-for="(i, index) in logList">
              <view class="log-item" :key="index">
                <view class="item flex">
                  <view class="label">{{ i.name }}</view>
                  <view class="value" :style="{ color: i.statusColor }">{{ i.status }}</view>
                </view>
                <view class="item-mark">
                  <view :class="['circle', { first: index == 0, 'status-approved': i.status === '审批通过', 'status-pending': i.status === '审批中', 'status-rejected': i.status === '驳回' }]"></view>
                  <view class="mark-line" v-if="index != logList.length - 1"></view>
                </view>
              </view>
            </template>
          </view>
        </view>
        <view class="flex align-start justify-between remarkBox" v-if="orderInfo.goodsOrderApplyStatus == 3">
          <view class="labelremark">审批备注</view>
          <view class="valueremark">{{ orderInfo.applyRecordRemark || '-' }}</view>
        </view>
        <view class="flex align-start justify-between remarkBox" v-if="orderInfo.goodsOrderApplyStatus == 4">
          <view class="labelremark">驳回原因</view>
          <view class="valueremark">{{ orderInfo.rejectReason || '-' }}</view>
        </view>
      </view>
      <!-- 商品信息 -->
      <view class="box-shell pt-32">
        <view class="box-shell-title">商品信息</view>

        <!-- 套餐 -->
        <view class="meal-box" v-for="(item, index) in orderInfo.packageGoodsList">
          <view class="meal-hd flex justify-between align-center">
            <view>{{ item.packageAlias || item.packageName }}</view>
            <view class="price">¥{{ item.finalPrice }}</view>
          </view>
          <view class="meal-bd">
            <view class="meal-bd-box" v-for="g in item.packageGoodsOrderList">
              <view class="meal-bd-head flex justify-between align-center">
                <view class="flex align-center">
                  <view class="name">{{ g.upgradeGoodsAlias || g.upgradeGoodsName }}</view>
                  <view class="meal-bd-bottom flex align-center">
                    {{ g.upgradeGoodsType === 1 ? g.positionStr : g.upgradeGoodsTypeName }}
                    <view class="count">x{{ g.number }}</view>
                  </view>
                </view>

                <view class="price">¥{{ g.finalPrice }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="good-list">
          <view class="good" v-for="(item, index) in orderInfo.subOrderList" :key="index">
            <view class="flex justify-between align-center mb-20">
              <text class="good-name">商品名称：{{ replaceItemText(item.upgradeGoodsName) || '' }}</text>
              <text class="good-price">¥{{ item.finalPrice }}</text>
            </view>
            <view class="flex justify-between align-center mb-12" v-if="item.upgradeGoodsAlias">
              <text class="good-alias">商品别名：{{ replaceItemText(item.upgradeGoodsAlias) || '' }}</text>
            </view>
            <view class="flex align-center">
              <text class="good-sku">{{ item.positionStr || item.upgradeGoodsTypeName }}</text>
              <text class="good-count">x{{ item.number }}</text>
            </view>
          </view>
        </view>
        <view class="flex align-center my-16">
          <view class="sprite-icon icon-coupon fs-14"></view>
          <text class="fs-14 coupon-name">{{ orderInfo.couponName || '' }}{{ orderInfo.customerCoupon.customerCouponCode || '' }}（{{ orderInfo.customerCoupon.employeeName || '' }}）</text>
        </view>
        <view class="flex justify-end align-center">
          <text class="good-total-lable">商品总金额：</text>
          <text class="good-total-value">
            <text class="unit">¥</text>
            {{ orderInfo.total_price }}
          </text>
        </view>
      </view>
      <!-- 工单信息 -->
      <view class="box-shell pt-32">
        <view class="box-shell-title">工单信息</view>
        <view class="order-info pt-16">
          <view v-for="(item, index) in orderObj" :key="index" class="flex align-center pt-16">
            <view class="label">{{ item.label }}</view>
            <view v-if="item.key == 'status'">
              <view class="value" :style="{ color: status[orderInfo.status].color || '' }">
                {{ status[orderInfo.status].text }}
              </view>
            </view>
            <view v-else>
              <view class="value">
                <view v-if="item.key == 'payType'">
                  {{ payType[orderInfo.selectPayType] || '' }}
                </view>
                <view v-else>{{ orderInfo[item.key] || '' }}</view>
              </view>
            </view>
            <view v-if="item.copy" class="copy-btn" @click="setCopyData(orderInfo[item.key])">
              <view class="sprite-icon icon-icon-copy copy"></view>
            </view>

            <!-- <view class="customize-btn" v-if="item.dateChange" @click.stop="customizeDate">自定义</view> -->
          </view>
          <view v-if="(orderInfo.selectPayType == 2 || orderInfo.selectPayType == 5 || orderInfo.selectPayType == 6 || orderInfo.selectPayType == 7) && orderInfo.payVoucherList.length">
            <view class="flex align-start pt-16">
              <view class="label">付款凭证</view>
              <view class="image-box flex">
                <view class="value" @click="previewImage" v-for="(item, index) in orderInfo.payVoucherList" :key="index">
                  <view class="image">
                    <image :src="item.payVoucher" />
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="orderInfo.status == 5 || orderInfo.status == 12">
            <view class="flex align-center pt-16">
              <view class="label">退款明细</view>
              <view class="value">{{ orderInfo.refundType == 1 ? '退全款' : '退部分款' }}¥{{ orderInfo.refundAmount }}</view>
            </view>
          </view>
          <view class="paid" v-if="orderInfo.payOrder && orderInfo.payOrder.payStatus == 2">
            <!-- <image src="../../images/paid.png" /> -->
          </view>
        </view>
      </view>
      <!-- 客户信息 -->
      <view class="box-shell">
        <view class="box-shell-title">客户信息</view>
        <view class="order-info pt-16">
          <view class="flex align-center pt-20" v-for="(item, index) in customerObj" :key="index">
            <view class="label">{{ item.label }}</view>
            <view class="flex flex-1">
              <view class="value" :style="{ color: item.color || '#333' }">
                <view v-if="item.arr">
                  <view v-if="orderInfo[item.arr[1]]" class="flex">
                    <view v-for="(i, ind) in item.arr" :key="ind">
                      <view class="value-item text-hide">
                        <text v-if="ind == 1" class="lineText">|</text>
                        {{ orderInfo[i] }}
                      </view>
                    </view>
                  </view>
                </view>
                <view v-else>
                  {{ item.enum ? item.enum[orderInfo[item.key]] : orderInfo[item.key] || '' }}
                </view>
              </view>
              <view v-if="item.copy" class="copy-btn" @click="setCopyData(orderInfo[item.key])">
                <view class="sprite-icon icon-icon-copy copy"></view>
              </view>
            </view>
          </view>
        </view>
        <view v-if="orderInfo.selectPayType == 0" class="order-info">
          <view class="flex align-center pt-16">
            <view class="label">拒升理由</view>
            <view class="value">
              {{ orderInfo.customer.refusalReason ? orderInfo.customer.refusalReason : '' }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="warrantyCardList.length || warrantyCardVisible" class="box-shell">
        <view class="box">
          <view class="box-shell-title">{{ orderInfo.selectPayType == 0 ? '客服' : '质保信息' }}</view>
          <view class="warranty-list" v-for="(item, index) in warrantyCardList" :key="index">
            <view class="warranty flex align-center justify-between pt-20">
              <view class="flex align-center">
                <view class="label">质保产品</view>
                <view class="value">{{ replaceItemText(item.goodsName) }}</view>
              </view>
              <view class="flex align-center edit-warranty" @click="warrantyEdit(item)" v-if="orderInfo.constructionFlag == 'Y'">
                <view class="sprite-icon icon-edit mr-8"></view>
                质保价格
              </view>
            </view>
            <view class="warranty flex align-center pt-20">
              <view class="label">质保期</view>
              <view class="value">{{ item.warrantyPeriod }}</view>
            </view>
            <view class="warranty flex align-start pt-20">
              <view class="label">质保编码</view>
              <view class="codeImg-box">
                <image v-if="item.barCodeUrl" :src="item.barCodeUrl" class="barCodeImg" />
                <!-- <view class="barCode">{{ item.cardCode }}</view> -->
              </view>
            </view>
          </view>

          <view class="warranty-list">
            <view class="warranty flex align-start pt-20">
              <view class="label">{{ orderInfo.selectPayType == 0 ? '客服号' : '质保查询' }}</view>
              <view class="value">
                <view class="warranty-tips" v-if="warrantyCardVisible">
                  {{ orderInfo.selectPayType == 0 ? '建议让客户扫码关注客服号领取礼包' : '建议让客户扫码关注客服查询质保' }}
                </view>
                <image v-if="warrantyCardVisible" :src="customerService" class="customerService" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="flex align-center footer-box justify-center" v-if="isMake && orderInfo.status !== 12 && orderInfo.goodsOrderApplyStatus != 1 && orderInfo.goodsOrderApplyStatus != 2">
        <view class="edit btn flex-1" @click="repeal">撤销工单</view>
      </view>
      <!-- <view class="flex align-center footer-box justify-center" v-if="orderInfo.constructionFlag == 'Y'">
        <view class="edit btn flex-1" @click="repeal">再来一单</view>
      </view> -->
      <!-- 已支付4 战败2  已评价6 三种状态才展示 并且不是通过失效客户录入的战败单 -->
      <view v-if="!userInfo.isSuper && userInfo.loginRole != 3 && userInfo.loginRole != 6 && userInfo.userType == 2 && (orderInfo.status == 4 || orderInfo.status == 2 || orderInfo.status == 6) && ((orderInfo.subOrderList && orderInfo.subOrderList.length) || (orderInfo.packageGoodsList && orderInfo.packageGoodsList.length))">
        <!-- 不需要走签名逻辑 -->
        <view v-if="signatureSwitch && orderInfo.selectPayType != 0" class="btn-box" :class="isFullSucreen ? 'isFullSucreen-btn' : ''">
          <view class="btn text-center" bindtap="navOrderSignature">客户签名确认</view>
        </view>
        <view v-else class="btn-box" :class="isFullSucreen ? 'isFullSucreen-btn' : ''">
          <!-- <tips-bottom style="width: 100%;box-sizing: border-box;" tipsProps="{{ tipsProps }}" /> -->
          <!-- <view class="btn text-center" bindtap="showAgain">继续下单</view> -->
          <view class="btn text-center" @click="confirmConstruction">确认完成施工</view>
        </view>
      </view>
    </view>
    <PublishPopup ref="calendarPopup" popupClass="calendarPopup" :showClose="false" :showTitle="false" @confirm="confirmCalendar">
      <template #content>
        <uni-calendar class="calendar" :showMonth="false" @change="calendarChange" />
      </template>
    </PublishPopup>
    <PublishPopup ref="tipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">重要提示</view>
          <view class="tipsConent">
            <view>是否确认撤销工单？</view>
          </view>
        </view>
      </template>
    </PublishPopup>
    <PublishPopup ref="IsExistTipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">重要提示</view>
          <view class="tipsConent">
            <view>订单已发起退款，禁止撤销！</view>
            <view>如需撤销请联系总部运营。</view>
          </view>
        </view>
      </template>
      <template #footer>
        <view class="isExistTips-btn-box">
          <view class="sure-btn btn flex-1" @click="closeIsExistTipsPopup">好的</view>
        </view>
      </template>
    </PublishPopup>
    <PublishPopup :key="popupKey" ref="warrantyPopup" popupClass="warrantyPopup" type="center" title="质保价格" :showClose="true" @confirm="confirmEdit">
      <template #content>
        <view class="warranty-content">
          <view class="name">产品：{{ replaceItemText(warrantyEditObj.goodsName) }}</view>
          <view class="label">质保价格</view>
          <textarea class="warranty-input" v-model="warrantyEditObj.warrantyPrice" maxlength="50" placeholder="请输入（最多50字）" />
          <view class="tips">质保价格输入的内容会在车主查询质保卡时显示</view>
        </view>
      </template>
    </PublishPopup>
  </view>
</template>
<script>
import utils from '@/utils/utils'
import order_mixins from '../../order_mixins.js'
import dayjs from 'dayjs'
import { index } from '@/env'
import PublishPopup from '@/components/PublishPopup.vue'
export default {
  name: 'OrderDetail',
  components: {
    PublishPopup
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    transmissionOfData: {
      async handler(newVal) {
        if (newVal) {
          console.log('接收到的交易数据:', newVal)
          console.log('this.orderObjData', this.transmissionOfData)
          let baseConfigData = await this.setConfigInfo(getApp().globalData)
          this.baseConfigData = baseConfigData
          this.getDetail(this.transmissionOfData.orderCode)
          const userInfo = uni.$storage.get('userInfo')
        }
      },
      immediate: true
    }
  },
  computed: {
    // 审批时间轴：1=区域经理审批中 2=区域经理通过/线上运营审批中 3=都通过(显示备注) 4=驳回
    logList() {
      const status = this.orderInfo.goodsOrderApplyStatus
      const approved = { status: '审批通过', statusColor: '#2cca74' }
      const pending = { status: '审批中', statusColor: '#ff9d0a' }
      const empty = { status: '-', statusColor: '#999' }
      const rejected = { status: '驳回', statusColor: '#f56c6c' }
      return [
        {
          name: '区域经理',
          value: '1',
          ...(status === 1 ? pending : [2, 3, 4].includes(status) ? approved : empty)
        },
        {
          name: '线上运营',
          value: '2',
          ...(status === 1 ? empty : status === 2 ? pending : status === 3 ? approved : status === 4 ? rejected : empty)
        }
      ]
    }
  },
  data() {
    return {
      ...order_mixins.data,
      orderInfo: {},
      baseConfigData: {},
      customerService: '',
      defaultCustomerService: 'https://img02.glsx.com.cn/weapp/resource/dj-car-boutique-work-wechat/kf.png',
      failCustomerService: '../images/kfrefresh.png',
      warrantyCardVisible: true,
      signatureSwitch: false, //不需要走签名逻辑 没有开启签名功能或则是战败订单
      warrantyCardList: [],
      isMake: true,
      selectDate: null,
      warrantyEditObj: {},
      isShow: false,
      bg: require('@/assets/images/boutique/tipsPopupBg.webp'),
      popupKey: 0
    }
  },
  async mounted() {},
  methods: {
    replaceItemText(item) {
      var reg = getRegExp(';~;', 'g')
      return item ? item.replace(reg, ' ') : ''
    },
    async getPositionList() {
      const res = await uni.$api.boutiqueApi.getPositionList({})
      return res
    },
    async getDetail(orderCode) {
      this.isShow = false
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
      const userInfo = uni.$storage.get('userInfo')
      const positionTypeList = (await this.getPositionList()) || []
      let _this = this
      uni.$api.boutiqueApi
        .getPackageGoodsDetail({
          orderCode
        })
        .then(async data => {
          await this.getServiceBaseInfo(data.merchantId)
          await this.getSignatureSwitch(data.merchantId)

          if (data.selectPayType != 2 && (data.status == 4 || data.status == 6 || data.status == 12)) {
            // 查询订单可展示按钮
            // commonApi.getMoreBtnAPI({ orderCode: data.orderCode }).then(res => {
            //   let { code, data } = res
            //   if (code == 0) {
            //     this.showMoreBtn = data.refundApplyButton == 'Y' || data.refundApplyDetailButton == 'Y'
            //   }
            // })
          }
          console.log('3255555666')
          // 服务商是否使用膜卷号配置
          if (!userInfo?.isSuper && userInfo.userType == 2 && data.status != 10 && data.status != 9) {
            let isUseFilmRoll = await this.getServiceFilmRollSetting(data?.sellerMerchantId)
            this.isUseFilmRoll = isUseFilmRoll
          }
          console.log('32555556669999')
          let couponName = data.customerCoupon ? data.customerCoupon.couponName : ''
          let total_price = 0
          for (var i = 0; i < data?.subOrderList?.length; i++) {
            let e = data?.subOrderList[i]
            total_price += e.finalPrice
            e.price = Number(utils.decimal(Number(e.finalPrice / e.number), 2)).toFixed(2)
            e.positionStr = positionTypeList.filter(v => v.positionValue == e.upgradeGoodsPosition)[0]?.positionName || ''
            if ((e.upgradeWarrantyPeriod || e.upgradeWarrantyPeriod > 0) && data.selectPayType != 0) {
              const warrantyItem = {
                warrantyPeriod: e.upgradeWarrantyPeriod || '',
                goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName || '',
                cardCode: e.cardCode || '',
                warrantyPrice: e.warrantyPrice || '',
                barCodeUrl: ''
              }
              Object.keys(warrantyItem).forEach(key => {
                if (typeof warrantyItem[key] === 'function') {
                  warrantyItem[key] = ''
                } else if (typeof warrantyItem[key] === 'object' && warrantyItem[key] !== null) {
                  warrantyItem[key] = JSON.stringify(warrantyItem[key])
                }
              })

              this.warrantyCardList.push(warrantyItem)
            }
            // 膜类商品 并且服务商开通了使用膜卷号配置 不走签名流程
            // if (this.baseConfigData?.membraneTypeList?.includes(e?.upgradeGoodsType) && this.isUseFilmRoll && !this.signatureSwitch) {
            //   let result = await api.getfilmRollNoByGoods({
            //     upgradeGoodsId: e.upgradeGoodsId,
            //     yqMerchantId: data?.sellerMerchantId,
            //     merchantId: data?.merchantId
            //   })
            //   e.filmNumberData = result?.data || []
            //   // 仅配置一个膜卷号 自动选中
            //   if (!e.filmRollNo && e.filmNumberData?.length == 1) e.filmRollNo = e.filmNumberData[0]
            // }
          }

          if (data.packageGoodsList) {
            data.packageGoodsList.forEach(item => {
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
              item.packageGoodsOrderList.forEach(g => {
                g.positionStr = positionTypeList.filter(v => v.positionValue == g.upgradeGoodsPosition)[0]?.positionName || ''
              })
              total_price += item.finalPrice
            })
          }

          data = {
            ...data.customer,
            ...data.payOrder,
            ...data,
            packageGoodsList: data.packageGoodsList,
            couponName,
            total_price: data.selectPayType == 0 ? 0 : Number(utils.decimal(total_price, 2)).toFixed(2)
          }
          if (data.customerCoupon) {
            data.customerCoupon.customerCouponCode = data.customerCoupon.customerCouponCode.split('-')[0]
          }
          if (data.orderTime) data.time = dayjs(data.orderTime).format('YYYY-MM-DD HH:mm:ss')
          if (data.customer && data.customer.carSeriesName) {
            data.carType = `${data.customer.carBrand || ''}-${data.customer.carChildsBrandName || ''}-${data.customer.carSeriesName || ''}`
          }
          this.isShow = true
          uni.hideLoading()
          this.orderInfo = data
          console.log(this.orderInfo, 'this.orderInfo')
          console.log(this.orderInfo.selectPayType, this.orderInfo.constructionFlag)
          this.isMake = this.orderInfo.constructionFlag !== 'Y' && this.orderInfo.selectPayType !== 1 && this.orderInfo.selectPayType !== 3 && this.orderInfo.selectPayType !== 4 && this.orderInfo.status !== 9
          this.invoiceName = data.invoiceStatus == 2 ? '查看发票' : '申请开票'
          // 去掉车主评价功能
          // this.setQrBoxHeight()
          // if (data.status == 6) return
          // this.getQrCode(data)

          this.getWorkWechatLiveQRCode()
          // 条形码
          this.warrantyCardList.length && this.getBarCode()

          // 校验是否显示二级流量方
          if (data.subShopMerchantName) {
            if (_this.customerObj.findIndex(val => val?.key && val.key == 'subShopMerchantName') < 0) {
              _this.customerObj[_this.customerObj.length - 2] = {
                label: '二级流量方',
                key: 'subShopMerchantName'
              }
            }
          }
          // 获取园区店技师配置信息
          //   uni.$api.boutiqueApi
          //     .getQYTechnicianList({
          //       yqMerchantId: uni.$storage.get('userInfo')?.merchantId
          //     })
          //     .then(respone => {
          //       if (respone?.code == 0) {
          //         if (respone?.data.length > 0) this.isArtificer(respone.data)
          //       }
          //     })
          // } else {
          //   wx.showModal({
          //     title: '温馨提示',
          //     content: message,
          //     showCancel: false,
          //     confirmText: '刷新',
          //     confirmColor: '#347BFF',
          //     success(res) {
          //       if (res.confirm) {
          //         _this.getDetail(orderCode)
          //       }
          //     }
          //   })
          // }
        })
        .catch(error => {
          console.log(error)
          uni.hideLoading()
        })
    },
    getServiceBaseInfo(merchantId) {
      uni.$api.boutiqueApi
        .getServiceBaseInfo({
          merchantId
        })
        .then(data => {
          const warrantyCardVisible = data.cardCodeFlag && data.cardCodeFlag == 1
          this.warrantyCardVisible = !warrantyCardVisible
        })
    },
    getSignatureSwitch(merchantId) {
      uni.$api.boutiqueApi
        .getSignatureSwitch({
          merchantId
        })
        .then(data => {
          // const warrantyCardVisible = data.cardCodeFlag && data.cardCodeFlag == 1
          const signatureSwitchValue = data?.signatureSwitch && data?.signatureSwitch == 1
          this.signatureSwitch = signatureSwitchValue
        })
    },
    getWorkWechatLiveQRCode() {
      this.customerService = ''
      let { failCustomerService, defaultCustomerService } = this
      let { orderCode, customerPhone: phoneNumber, selectPayType } = this.orderInfo
      // console.log(orderCode, phoneNumber, selectPayType)
      // 订单状态 1-升级订单 2-战败订单
      let orderType = selectPayType == 0 ? 2 : 1
      uni.$api.boutiqueApi
        .getWorkWechatLiveQRCode({
          orderCode,
          phoneNumber,
          orderType
        })
        .then(data => {
          if (data) {
            this.customerService = data
          } else {
            this.customerService = defaultCustomerService
          }
        })
      // }, 3000)
    },
    /** 获取服务商是否使用膜卷号 */
    getServiceFilmRollSetting(yqMerchantId) {
      console.log('getServiceFilmRollSetting')
      const app = getApp()
      return new Promise((resolve, reject) => {
        uni.$api.boutiqueApi
          .getServiceFilmRollSetting({
            merchantId: yqMerchantId
          })
          .then(data => {
            app.globalData.serviceFilmRollSetting = data
            resolve(app.globalData.serviceFilmRollSetting)
          })
          .catch(error => {
            console.log(error)
          })
      })
    },
    setConfigInfo(globalData) {
      const app = getApp()
      return new Promise((resolve, reject) => {
        // 如果有 直接返回
        // console.log(app.globalData.YQorderSetting, 'app.globalData.YQorderSetting')
        // console.log('app.globalData.YQorderSetting', app.globalData.YQorderSetting)
        let { configInfo } = globalData
        const target = ['develop', 'develop', 'test', 'production', 'beta']
        if (configInfo) {
          return resolve(configInfo)
        } else {
          uni.request({
            // url: `${domain}${path}?method=${method}`,
            url: `https://config-center-backend.glsx.com.cn/glsxAdmin/config?moduleUrl=dj-car-boutique-work-wechat-miniapp&env=${target[index]}`,
            // data,
            method: 'GET',
            // header,
            dataType: 'json',
            responseType: 'text',
            success(response) {
              app.globalData.configInfo = response.data
              resolve(response.data)
            },
            fail(error) {
              console.log(error, 'error')
            },
            complete() {
              // wx.stopPullDownRefresh()
              // wx.hideNavigationBarLoading()
            }
          })
        }
      })
    },
    getBarCode() {
      // warrantyCardList
      let that = this
      let { warrantyCardList } = this
      console.log(warrantyCardList, 'warrantyCardList')
      warrantyCardList.forEach((element, index) => {
        setTimeout(() => {
          element.cardCode &&
            uni.$api.boutiqueApi
              .createBarCode({
                content: element.cardCode
              })
              .then(data => {
                // 待优化 应该都有之后再一次性更新
                // warrantyCardList[index].barCodeUrl = 'http://qcimg01.glsx.com.cn:7060/group1/M00/02/96/wKgD3mNXkD-ALMu3AAABmn9Id4c794.png'
                this.$set(this.warrantyCardList[index], 'barCodeUrl', data)
                console.log(this.warrantyCardList, 'getBarCode')
              })
              .catch(err => {})
        }, 1000 * index)
      })
    },
    // 撤销该工单
    async repeal() {
      const that = this
      uni.$api.boutiqueApi
        .refundApplyRecordIsExist({
          orderCode: this.transmissionOfData.orderCode
        })
        .then(data => {
          console.log(data)
          if (data === 'Y') {
            that.$refs.IsExistTipsPopup.open()
          } else {
            that.$refs.tipsPopup
              .open()
              .then(() => {
                uni.$api.boutiqueApi
                  .revokeOrder({
                    orderCode: that.transmissionOfData.orderCode
                  })
                  .then(data => {
                    uni.showToast({
                      title: '操作成功',
                      icon: 'success'
                    })
                    that.getDetail(that.transmissionOfData.orderCode)
                  })
              })
              .catch(() => {
                console.log('用户点击了取消或关闭')
              })
          }
        })
    },
    closeIsExistTipsPopup() {
      this.$refs.IsExistTipsPopup.closePopup()
    },
    customizeDate() {
      console.log(this.$refs.calendarPopup, 'this.$refs.calendarPopup')
      this.$refs.calendarPopup.open()
    },
    confirmCalendar() {
      this.rangeSelect(this.selectDate)
    },
    setCopyData(e) {
      utils.setCopyData(`${e}`)
    },
    // 修改订单时间
    rangeSelect(date) {
      let { orderInfo } = this
      let params = {
        orderCode: orderInfo.orderCode,
        orderTime: date + ' 00:00:00'
      }

      uni.$api.boutiqueApi
        .updateOrderTime(params)
        .then(result => {
          if (result) {
            uni.showToast({ title: '修改日期成功' })
            this.orderInfo.time = params.orderTime
          } else {
            uni.showToast({ title: '修改日期失败' })
          }
        })
        .catch(err => {
          console.log(err)
        })
      this.$refs.calendarPopup.closePopup()
    },
    calendarChange(date) {
      this.selectDate = date.year + '-' + date.month + '-' + date.date
    },
    warrantyEdit(item) {
      console.log(item)
      // 不添加前出现Property or method "toJSON" is not defined
      //this.warrantyEditOb.warrantyPrice一直不回显
      //添加 popupKey 强制组件重新渲染
      this.popupKey++
      this.warrantyEditObj = item
      this.$nextTick(() => {
        this.$refs.warrantyPopup.open()
      })
    },
    confirmEdit() {
      uni.$api.boutiqueApi
        .modifyWarrantyPrice({ ...this.warrantyEditObj })
        .then(result => {
          uni.showToast({ title: '更新成功', icon: 'success' })
          this.$refs.warrantyPopup.closePopup()
          this.getOrderDetail(this.orderInfo.orderCode)
        })
        .catch(err => {})
    }
  }
}
</script>
<style scope lang="scss">
.order-detail {
  position: relative;
  height: 100%;
  // Popup样式
  ::v-deep .tipsPopup .uni-popup__wrapper {
    width: toRpx(848);
    height: toRpx(744);
    border-radius: toRpx(42);
    background: rgb(255, 255, 255) !important;
    .tipsPopupBg {
      border-radius: toRpx(42) toRpx(42) 0 0;
      width: 100%;
      height: toRpx(244);
    }
    .title {
      color: #333333;
      font-size: toRpx(40);
      font-weight: 500;
      text-align: center;
      margin-top: toRpx(48);
    }
    .tipsConent {
      text-align: center;
      color: #666666;
      font-size: toRpx(32);
      font-weight: 400;
      padding: toRpx(16) toRpx(64);
      line-height: toRpx(48);
      text {
        color: #347bff;
      }
    }
    .isExistTips-btn-box {
      display: flex;
      justify-content: center;
      position: absolute;
      border-radius: 0 0 toRpx(42) toRpx(42);
      bottom: toRpx(40);
      width: 100%;
      .btn {
        height: toRpx(80);
        border-radius: toRpx(48);
        opacity: 1;
        line-height: toRpx(80);
        text-align: center;
        color: rgba(26, 26, 26, 0.6);
        font-size: toRpx(32);
        font-weight: 500;
        margin: auto toRpx(64);
      }

      .sure-btn {
        color: #fff;
        background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      }
    }
  }
  ::v-deep .warrantyPopup .uni-popup__wrapper {
    width: 36%;
    height: toRpx(808);
    border-radius: toRpx(32);
    background: #fff !important;
    .popup-top-box {
      padding: toRpx(48) toRpx(64);
      border-radius: toRpx(32);
      font-size: toRpx(40);
      font-weight: 500;
      text-align: left;
      background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%) !important;
    }
    .warranty-content {
      padding: toRpx(0) toRpx(64);
      .name {
        color: #666666;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(48);
      }
      .label {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(24);
      }
      .warranty-input {
        border-radius: 12px;
        background: #f4f5f7;
        height: toRpx(216);
        width: 100%;
        margin-bottom: toRpx(24);
        padding: toRpx(32) toRpx(32) toRpx(32) toRpx(32);
        .uni-textarea-placeholder {
          color: #999999;
          font-size: toRpx(32);
          font-weight: 400;
        }
      }
      .tips {
        color: #666666;
        font-size: toRpx(28);
        font-weight: 400;
      }
    }
  }
  ::v-deep .calendarPopup .uni-popup__wrapper {
    width: 100%;
    height: 62vh;
    .calendar {
      width: 100%;
      height: calc(100% - #{toRpx(164)});
    }
  }
  .scroll-y {
    height: calc(100% - #{toRpx(248)});
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
  }
  .construction-flag-y {
    height: calc(100% - #{toRpx(182)});
  }
  .px-48 {
    padding: 0 toRpx(48);
  }
  .pt-6 {
    padding-top: toRpx(6);
  }
  .pt-8 {
    padding-top: toRpx(8);
  }
  .pt-16 {
    padding-top: toRpx(16);
  }
  .pt-20 {
    padding-top: toRpx(20);
  }
  .pt-12 {
    padding-top: toRpx(12);
  }
  .mb-12 {
    margin-bottom: toRpx(12);
  }
  .fs-14 {
    font-size: toRpx(14);
  }
  .fs-32 {
    font-size: toRpx(32);
  }
  .fs-26 {
    font-size: toRpx(26);
  }
  .fs-34 {
    font-size: toRpx(34);
  }
  .fw-5 {
    font-weight: 500;
  }
  .fw-7 {
    font-weight: 700;
  }
  .fs-13 {
    font-size: toRpx(13);
  }
  .ml-12 {
    margin-left: toRpx(12);
  }
  .mr-8 {
    margin-right: toRpx(8);
  }
  .mt-12 {
    margin-top: toRpx(12);
  }
  .mt-20 {
    margin-top: toRpx(20);
  }
  .my-16 {
    margin: toRpx(16) 0;
  }
  .py-8 {
    padding: toRpx(8) 0;
  }
  .py-16 {
    padding: toRpx(16) 0;
  }
  .pt-32 {
    padding-top: toRpx(32) !important;
  }
  .mb-20 {
    margin-bottom: toRpx(20);
  }
  .cl-gray {
    color: #666666;
  }
  .flex-1 {
    flex: 1;
  }
  .date-box {
    display: flex;
    align-items: center;
    position: relative;
  }

  .date-box-label {
    font-weight: 400;
    font-size: toRpx(28);
    color: #333333;
  }

  .date-box-value {
    font-weight: 500;
    font-size: toRpx(40);
    color: #333333;
  }

  .required {
    color: #f00;
    margin-left: toRpx(8);
  }
  .handlerBtn {
    color: #4673ff;
    font-size: toRpx(26);
    font-weight: 400;
    margin-left: toRpx(8);
  }
  .customize-btn {
    color: #4673ff;
    font-size: toRpx(26);
    font-weight: 400;
    margin-left: toRpx(16);
  }
  .copy-btn {
    display: flex;
    align-items: center;
    color: #808291;
    .copy {
      margin-right: toRpx(8);
      margin-left: toRpx(20);
    }
  }
  .top-tips {
    width: 100%;
    height: toRpx(152);
    border-radius: toRpx(16);
    background: linear-gradient(136.3deg, #fdffff 0%, #ebfff6 46%, #f4fffc 100%);
    color: #333333;
    padding: 0 toRpx(32);
    position: relative;
    .checkbox-filled {
      margin-right: toRpx(24);
    }
    .topTipsRightIcon {
      position: absolute !important;
      bottom: 0;
      right: toRpx(16);
    }
  }
  .box-shell {
    width: 100%;
    border-radius: toRpx(16);
    background: #ffffff;
    padding: toRpx(24) toRpx(32);
    margin-top: toRpx(16);
    &-title {
      font-size: toRpx(28);
      color: #333333;
      font-weight: 400;
    }
    .status-tag-3 {
      color: #2cca74;
      font-size: toRpx(24);
      font-weight: 400;
      padding: toRpx(4) toRpx(8);
      border-radius: toRpx(4);
      border: toRpx(2) solid #2cca74;
    }
    .status-tag-4 {
      color: #f24724;
      font-size: toRpx(24);
      font-weight: 400;
      padding: toRpx(4) toRpx(8);
      border-radius: toRpx(4);
      border: toRpx(2) solid #f24724;
    }
    .status-tag-2 {
      color: #faa827;
      font-size: toRpx(24);
      font-weight: 400;
      padding: toRpx(4) toRpx(8);
      border-radius: toRpx(4);
      border: toRpx(2) solid #faa827;
    }
    .status-tag-1 {
      color: #faa827;
      font-size: toRpx(24);
      font-weight: 400;
      padding: toRpx(4) toRpx(8);
      border-radius: toRpx(4);
      border: toRpx(2) solid #faa827;
    }
    .log-info {
      margin-bottom: 0;
      .log-box {
        padding-top: toRpx(32);
        .log-item {
          min-height: toRpx(84);
          position: relative;
          padding-left: toRpx(60);
          .item {
            margin-top: toRpx(16);
            .label {
              width: toRpx(168);
              color: #292d33;
            }
            .value {
              width: calc(100% - #{toRpx(168)});
              word-break: break-all;
            }
          }
          .item-mark {
            position: absolute;
            top: 0;
            left: 0;
            width: toRpx(32);
            .mark-line {
              height: toRpx(80);
              width: toRpx(2);
              background: #d6e4ff;
              position: absolute;
              top: toRpx(8);
              left: 50%;
              transform: translateX(-50%);
            }
            .circle {
              position: relative;
              width: toRpx(20);
              height: toRpx(20);
              background: #8eb2fb;
              border-radius: 100%;
              margin: toRpx(8) auto 0;
              z-index: 2;
            }
            .first {
              width: toRpx(32);
              height: toRpx(32);
              background: #d6e4ff;
              position: relative;
              &::before,
              &::after {
                content: '';
                position: absolute;
                border-radius: 100%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              &::before {
                width: toRpx(20);
                height: toRpx(20);
                background: var(--status-color, #2c66f7);
              }
              &::after {
                width: toRpx(10);
                height: toRpx(10);
                background: #fff;
              }
            }
          }
        }
        .log-title {
          color: #333333;
          font-size: toRpx(32);
          font-weight: 500;
          line-height: toRpx(44);
        }
      }
    }
    .remarkBox {
      margin-top: toRpx(32);
      .labelremark {
        color: #999999;
        font-size: toRpx(26);
        font-weight: 400;
        width: toRpx(156);
        margin-right: toRpx(16);
        flex-shrink: 0;
      }
      .valueremark {
        color: #222222;
        font-size: toRpx(26);
        flex: 1;
        word-break: break-all;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
      }
    }
    .meal-box {
      border-radius: toRpx(24);
      border: toRpx(2) solid #dce0e6;
      padding: toRpx(24) toRpx(32);
      box-sizing: border-box;
      margin-top: toRpx(16);
      .meal-hd {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(20);
        .price {
          font-weight: 500;
        }
      }
      .meal-bd {
        background: #f6f7fa;
        border-radius: toRpx(16);
        padding: 0 toRpx(32);
        box-sizing: border-box;
        .meal-bd-head {
          border-bottom: toRpx(2) solid #dce0e6;
          padding: toRpx(24) 0;
          .name {
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
          }
          .meal-bd-bottom {
            color: #999999;
            font-size: toRpx(24);
            font-weight: 400;
            margin-left: toRpx(8);
          }
          .price {
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
          }
        }
        .meal-bd-box:last-child .meal-bd-head {
          border-bottom: none;
        }
      }
    }
    .good-list {
      margin-top: toRpx(16);
      .good {
        color: #333333;
        font-size: toRpx(28);
        border-radius: toRpx(24);
        background: #f5f7fa;
        padding: toRpx(30) toRpx(24) toRpx(24) toRpx(24);
        margin-bottom: toRpx(16);
        .good-name {
          font-weight: 400;
          flex: 4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .good-price {
          font-weight: 500;
          flex: 1;
          text-align: right;
        }
        .good-alias {
          font-size: toRpx(24);
          font-weight: 400;
        }
        .good-sku {
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
        }
        .good-count {
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
        }
      }
    }
    .coupon-name {
      color: #292d33;
      font-size: toRpx(24);
      font-weight: 400;
      margin-left: toRpx(8);
    }
    .good-total-lable {
      color: #757980;
      font-size: toRpx(28);
      font-weight: 400;
    }
    .good-total-value {
      color: #4673ff;
      font-size: toRpx(40);
      font-weight: 700;
    }

    .order-info {
      .value .value-item text {
        margin: 0 toRpx(6);
      }
      .label {
        width: toRpx(156);
        color: #999999;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .value {
        color: #222222;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .image-box {
        .image {
          width: toRpx(106);
          height: toRpx(112);
          margin-right: toRpx(16);
          image {
            width: 100%;
            height: 100%;
            border-radius: toRpx(8);
          }
        }
      }
    }

    .warranty-list {
      .value .value-item text {
        margin: 0 toRpx(6);
      }
      .label {
        width: toRpx(156);
        color: #999999;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .value {
        color: #222222;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .codeImg-box {
        .barCode {
          color: #292d33;
          font-size: toRpx(28);
          font-weight: 400;
        }
        .barCodeImg {
          width: toRpx(600);
          height: toRpx(158);
        }
      }
      .edit-warranty {
        color: #347bff;
        font-size: toRpx(28);
        font-weight: 400;
      }
    }
    .warranty-tips {
      margin-bottom: toRpx(12);
    }
    .customerService {
      width: toRpx(320);
      height: toRpx(320);
    }
  }

  .footer-box {
    position: absolute;
    bottom: toRpx(24);
    width: 100%;
    left: 0;
    .btn {
      width: 80%;
      height: toRpx(80);
      border-radius: toRpx(48);
      font-size: toRpx(28);
      font-weight: 500;
      line-height: toRpx(80);
      text-align: center;
    }
    .confirm {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      margin-left: toRpx(32);
    }
    .edit {
      background: #3b73ff1a;
      color: #4673ff;
    }
  }
}
</style>
