<template>
  <view class="order-confirm">
    <view class="common-title">工单确认</view>
    <view class="px-48 scroll-y" v-if="orderInfo">
      <view class="top-tips flex align-center" v-if="orderInfo.selectPayType == 3 || orderInfo.selectPayType == 1">
        <text class="fs-32 fw-7">等待客户付款</text>
        <text class="fs-26 ml-12">点击下一步，锁定并生成工单码。</text>
      </view>
      <view class="top-tips flex align-center" v-if="orderInfo.selectPayType == 2 || orderInfo.selectPayType == 5 || orderInfo.selectPayType == 6 || orderInfo.selectPayType == 7">
        <view class="fs-32 fw-7">请上传付款凭证结束工单</view>
        <view class="fs-26 ml-12">点击确认工单，提交付款凭证。</view>
      </view>
      <view class="top-tips flex align-center" v-if="orderInfo.selectPayType == 0 || orderInfo.selectPayType == null">
        <view class="fs-32 fw-7">请提交客户拒绝升级原因</view>
        <view class="fs-26 ml-12">点击确认工单，根据操作结束工单。</view>
      </view>
      <view v-if="!isErrorOrder && (orderInfo.selectPayType == 2 || orderInfo.selectPayType == 5 || orderInfo.selectPayType == 6 || orderInfo.selectPayType == 7)" class="box date-box box-shell flex justify-between align-center">
        <view class="date-box-label">
          收款时间
          <text class="required">*</text>
        </view>
        <view class="flex justify-between align-center">
          <view class="date-box-value">{{ successDate }}</view>
          <view class="handlerBtn" @click.stop="openDate">编辑</view>
        </view>
      </view>
      <!-- 商品信息 -->
      <view class="box-shell">
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

                <view class="price">¥{{ g.price }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="good-list">
          <view class="good mt-16" v-for="(item, index) in orderInfo.subOrderList">
            <view class="flex justify-between align-center">
              <text class="good-name">商品名称：{{ replaceItemText(item.upgradeGoodsName) || '' }}</text>
              <text class="good-price">¥{{ item.price }}</text>
            </view>
            <view class="flex justify-between align-center pt-12">
              <text class="good-alias">商品别名：{{ replaceItemText(item.upgradeGoodsAlias) || '' }}</text>
            </view>
            <view class="flex align-center pt-24">
              <text class="good-sku">{{ item.positionStr || item.upgradeGoodsTypeName }}</text>
              <text class="good-count">x{{ item.number }}</text>
            </view>
          </view>
        </view>
        <view class="flex align-center py-16 coupon" v-if="orderInfo">
          <view class="sprite-icon icon-coupon"></view>
          <text class="fs-28 coupon-name">{{ orderInfo.couponName || '' }}{{ orderInfo.customerCoupon.customerCouponCode || '' }}（{{ orderInfo.customerCoupon.employeeName || '' }}）</text>
        </view>
        <view class="flex justify-end align-center mt-24" v-if="orderInfo">
          <text class="good-total-lable">商品总金额：</text>
          <text class="good-total-value">
            <text class="unit">¥</text>
            {{ orderInfo.total_price }}
          </text>
        </view>
      </view>
      <!-- 工单信息 -->
      <view class="box-shell">
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

            <view class="customize-btn" v-if="item.dateChange" @click.stop="customizeDate">自定义</view>
          </view>
          <view v-if="(orderInfo.selectPayType == 2 || orderInfo.selectPayType == 5 || orderInfo.selectPayType == 6 || orderInfo.selectPayType == 7) && orderInfo.payVoucherList.length">
            <view class="flex align-center pt-8">
              <view class="label">付款凭证</view>
              <view class="image-box">
                <view class="value" @click.stop="previewImage" v-for="(item, index) in orderInfo.payVoucherList" :key="index">
                  <view class="image">
                    <!-- <image src="{{item.payVoucher}}" /> -->
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="orderInfo.status == 5 || orderInfo.status == 12">
            <view class="flex align-center pt-8">
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
          <view class="flex align-center pt-16" v-for="(item, index) in customerObj" :key="index">
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
        <view v-if="orderInfo.selectPayType == 0">
          <view class="flex align-center pt-8">
            <view class="label">拒升理由</view>
            <view class="value">
              {{ orderInfo.customer.refusalReason ? orderInfo.customer.refusalReason : '' }}
            </view>
          </view>
        </view>
      </view>

      <view class="flex align-center footer-box justify-center">
        <view class="edit btn" @click.stop="edit">修改</view>
        <view class="confirm btn" @click.stop="confirm">确认</view>
      </view>
    </view>
    <PublishPopup ref="tipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false" @confirm="confirmTips">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="popupBg" />
          <view class="title">重要提示</view>
          <view class="tipsConent">
            <view>请检查店内是否配备POS机，确认信息后该工单将无法撤销或修改！</view>
            <view>若4S店已向车主收款，请返回修改支付方式为</view>
            <text>"门店收款"</text>
          </view>
        </view>
      </template>
    </PublishPopup>
    <PublishPopup ref="calendarPopup" popupClass="calendarPopup" :showClose="false" :showTitle="false" @confirm="confirmCalendar">
      <template #content>
        <uni-calendar class="calendar" :showMonth="false" :endDate="endDate" @change="calendarChange" />
      </template>
    </PublishPopup>
    <order-popup ref="openDate" popupType="13" @onConfirm="confirmDate" />
    <PublishPopup ref="payPopup" popupClass="payPopup" type="center" :isShowFooter="false">
      <template #header>
        <view class="popup-top">
          <view class="popup-top-box flex align-center">
            <text class="popup-top-box-title">工单确认码</text>
            <view @click.stop="closePopup">
              <uni-icons @click.stop="closePopup" class="icon-close" type="closeempty"></uni-icons>
            </view>
          </view>
        </view>
      </template>
      <template #content>
        <view class="pos-popup" v-if="orderInfo">
          <view class="price">¥{{ orderInfo.total_price }}</view>
          <image class="qrcode" :src="orderInfo.selectPayType == 1 ? wxqrcode : posQrCode"></image>
          <view class="level-1-tips">{{ orderInfo.selectPayType == 1 ? '请让客户打开微信扫描上方付款码进行支付' : '请使用POS机扫描此码，再向客户收款' }}</view>
          <view class="level-2-tips">超过24小时未支付将关闭此订单</view>
        </view>
      </template>
    </PublishPopup>
  </view>
</template>
<script>
import utils from '@/utils/utils'
import qrcode from '@/utils/qrcode'
import order_mixins from '../../order_mixins.js'
import dayjs from 'dayjs'
import PublishPopup from '@/components/PublishPopup.vue'
import OrderPopup from '@/components/OrderPopup/index.vue'
import { debounce } from 'lodash'
export default {
  name: 'OrderConfirm',
  props: {
    transmissionOfData: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    PublishPopup,
    OrderPopup
  },
  watch: {
    transmissionOfData: {
      handler(newVal) {
        if (newVal) {
          console.log('接收到的交易数据:', newVal)
          this.getPositionList()
          // "this.transmissionOfData.orderCode"
          this.getDetail(this.transmissionOfData.orderCode)
          this.successDate = dayjs().format('YYYY-MM-DD HH:mm:00')
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      ...order_mixins.data,
      popupBg: require('@/assets/images/boutique/tipsPopupBg.webp'),
      positionTypeList: [],
      isErrorOrder: false,
      orderInfo: null,
      successDate: null,
      selectDate: null,
      time: null,
      wxqrcode: '',
      posQrCode: '',
      endDate: dayjs().format('YYYY-MM-DD')
    }
  },
  mounted() {
    // this.getPositionList()
    // // "this.transmissionOfData.orderCode"
    // this.getDetail('250826172036851')
    // this.successDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
  },
  methods: {
    replaceItemText(item) {
      var reg = getRegExp(';~;', 'g')
      return item ? item.replace(reg, ' ') : ''
    },
    async getDetail(orderCode) {
      console.log(orderCode)
      let _this = this
      uni.$api.boutiqueApi
        .getPackageGoodsDetail({
          orderCode
        })
        .then(data => {
          if (data.payOrder && data.payOrder.payStatus == 2) {
            if (this.time) clearInterval(this.time)
            this.$emit('jump', 'OrderDetail', data)
            return
          }
          let couponName = data.customerCoupon ? data.customerCoupon.couponName : ''
          let total_price = 0
          let warrantyCardList = []
          for (var i = 0; i < data?.subOrderList?.length; i++) {
            let e = data?.subOrderList[i]
            total_price += Number(e.finalPrice) || 0
            // 根据订单类型决定使用哪个价格：
            // - 正常订单(1)和冲量活动(4)：使用 totalPrice（原价）
            // - 打折策略(2)、买赠策略(3)、组合付款(5)：使用 finalPrice（优惠后价格）
            const orderType = e.djOrderType || data.djOrderType
            if (orderType === 1 || orderType === 4) {
              // 正常订单或冲量活动，使用原价（向上取整保留2位小数）
              if (e.totalPrice !== undefined && e.totalPrice !== null) {
                e.price = utils.ceilDecimal(Number(e.totalPrice) / Number(e.number || 1)).toFixed(2)
              } else if (e.finalPrice !== undefined && e.finalPrice !== null) {
                e.price = utils.ceilDecimal(Number(e.finalPrice) / Number(e.number || 1)).toFixed(2)
              } else {
                // 当总价/单价为 0 或缺失时，显式展示为 0.00，避免前端显示为空
                e.price = '0.00'
              }
            } else {
              // 优惠类型订单，使用优惠后价格（向上取整保留2位小数）
              if (e.finalPrice !== undefined && e.finalPrice !== null) {
                e.price = utils.ceilDecimal(Number(e.finalPrice) / Number(e.number || 1)).toFixed(2)
              } else if (e.totalPrice !== undefined && e.totalPrice !== null) {
                e.price = utils.ceilDecimal(Number(e.totalPrice) / Number(e.number || 1)).toFixed(2)
              } else {
                // 当总价/单价为 0 或缺失时，显式展示为 0.00，避免前端显示为空
                e.price = '0.00'
              }
            }
            e.positionStr = this.positionTypeList.filter(v => v.positionValue == e.upgradeGoodsPosition)[0]?.positionName || ''
            if (e.upgradeWarrantyPeriod || e.upgradeWarrantyPeriod > 0) {
              warrantyCardList.push({
                warrantyPeriod: e.upgradeWarrantyPeriod,
                goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName
              })
            }
          }
          data.packageGoodsList?.forEach(item => {
            // 获取订单类型（优先使用套餐内商品的订单类型，否则使用订单级别的）
            const orderType = item.packageGoodsOrderList?.[0]?.djOrderType || data.djOrderType
            item.packageGoodsOrderList.forEach(g => {
              // 根据订单类型决定使用哪个价格，并对商品单价向上取整保留两位小数
              if (orderType === 1 || orderType === 4) {
                // 正常订单或冲量活动，使用原价
                if (g.totalPrice !== undefined && g.totalPrice !== null) {
                  g.price = utils.ceilDecimal(Number(g.totalPrice) / Number(g.number || 1)).toFixed(2)
                } else if (g.finalPrice !== undefined && g.finalPrice !== null) {
                  g.price = utils.ceilDecimal(Number(g.finalPrice) / Number(g.number || 1)).toFixed(2)
                } else {
                  g.price = utils.ceilDecimal(g.upgradePrice || 0).toFixed(2)
                }
              } else {
                // 优惠类型订单，使用优惠后价格
                if (g.finalPrice !== undefined && g.finalPrice !== null) {
                  g.price = utils.ceilDecimal(Number(g.finalPrice) / Number(g.number || 1)).toFixed(2)
                } else if (g.totalPrice !== undefined && g.totalPrice !== null) {
                  g.price = utils.ceilDecimal(Number(g.totalPrice) / Number(g.number || 1)).toFixed(2)
                } else {
                  g.price = utils.ceilDecimal(g.upgradePrice || 0).toFixed(2)
                }
              }
            })
            item.goodsList = item.packageGoodsOrderList
            // 套餐价格根据订单类型计算（按单价先保留两位小数再汇总，避免浮点误差）
            item.price = item.goodsList.reduce((prev, cur) => {
              // 根据订单类型决定使用哪个价格
              const unitPriceRaw =
                orderType === 1 || orderType === 4
                  ? cur.totalPrice !== undefined && cur.totalPrice !== null
                    ? Number(cur.totalPrice) / Number(cur.number || 1)
                    : cur.finalPrice !== undefined && cur.finalPrice !== null
                      ? Number(cur.finalPrice) / Number(cur.number || 1)
                      : cur.price || 0
                  : cur.finalPrice !== undefined && cur.finalPrice !== null
                    ? Number(cur.finalPrice) / Number(cur.number || 1)
                    : cur.totalPrice !== undefined && cur.totalPrice !== null
                      ? Number(cur.totalPrice) / Number(cur.number || 1)
                      : cur.price || 0
              const unitPrice = utils.decimal(unitPriceRaw, 2)
              return prev + unitPrice
            }, 0)
            // 套餐单价本身也保留两位
            item.price = Number(utils.decimal(item.price, 2)).toFixed(2)
            item.count = item.goodsList.length ? item.goodsList[0].number : 1
            const total = Number(item.price) * Number(item.count || 1)
            // 套餐总价 / 最终价格统一保留两位小数
            item.finalPrice = Number(utils.decimal(total, 2)).toFixed(2)
            item.packageGoodsOrderList.forEach(g => {
              g.positionStr = this.positionTypeList.filter(v => v.positionValue == g.upgradeGoodsPosition)[0]?.positionName || ''
            })
            total_price += Number(item.finalPrice) || 0
          })

          data = {
            ...data.customer,
            ...data.payOrder,
            ...data,
            packageGoodsList: data.packageGoodsList,
            couponName,
            total_price: Number(utils.decimal(total_price, 2)).toFixed(2)
          }

          if (data.orderTime) data.time = dayjs(new Date(data.orderTime)).format('YYYY-MM-DD HH:mm:ss')
          if (data.customerCoupon) {
            data.customerCoupon.customerCouponCode = data.customerCoupon.customerCouponCode.split('-')[0]
          }
          if (data.customer.carSeriesName) {
            data.carType = `${data.customer.carBrand || ''}-${data.customer.carChildsBrandName || ''}-${data.customer.carSeriesName || ''}`
          }
          _this.orderInfo = data
          console.log('data', _this.orderInfo)
          _this.flag = true
          _this.warrantyCardList = warrantyCardList
          // 校验是否显示二级流量方
          if (data.subShopMerchantName) {
            if (_this.customerObj.findIndex(val => val?.key && val.key == 'subShopMerchantName') < 0) {
              _this.customerObj[_this.customerObj.length - 2] = {
                label: '二级流量方',
                key: 'subShopMerchantName'
              }
            }
          }
          // 是2:门店收款 5:嘀加收款 6:对公转账 7:其它收款并且不是错误订单 自动打开门店收款弹窗
          // if (!_this.isErrorOrder && [2, 5, 6, 7].includes(Number(data.selectPayType))) {
          //   _this.toshowDateModal()
          // }
          // 获取园区店技师配置信息
          uni.$api.boutiqueApi
            .getQYTechnicianList({
              yqMerchantId: uni.$storage.get('userInfo')?.merchantId
            })
            .then(respone => {
              if (respone?.code == 0) {
                if (respone?.data.length > 0) this.isArtificer(respone.data)
              }
            })
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
    },
    async getPositionList() {
      const res = await uni.$api.boutiqueApi.getPositionList({})
      this.positionTypeList = res
    },
    setCopyData(e) {
      utils.setCopyData(`${e}`)
    },
    confirm() {
      this.checkPayType()
    },
    edit() {
      const data = { ...this.orderInfo }
      // 处理subOrderList 商品为空的情况
      console.log(this.orderInfo, '跳转')
      data.subOrderList = data.subOrderList.filter(item => item.merchantGoodsId)
      if (data.packageGoodsList && data.packageGoodsList.length) {
        data.subOrderList = data.subOrderList.concat(data.packageGoodsList)
      }
      // 商品是否包含太阳膜
      data.isFilmOrder = data.subOrderList?.findIndex(subE => subE?.upgradeGoodsType == 1) > -1
      this.$emit('jump', 'CreateOrder', { paramsData: data, type: 'createWithPay' })
    },
    confirmDate(date) {
      const { chooseContent } = date
      this.successDate = dayjs(chooseContent).format('YYYY-MM-DD HH:mm:00')
      console.log(this.successDate)
    },
    calendarChange(date) {
      console.log(date)
      this.selectDate = date.year + '-' + date.month + '-' + date.date
    },
    confirmCalendar() {
      this.rangeSelect(this.selectDate)
    },

    // 生成小程序码
    createWxQrcode() {
      let _this = this
      let oParams = {}
      let { sessionId } = uni.$storage.get()
      oParams.appId = this.orderInfo.paymentChannel.wechatAppId
      oParams.qrcodeType = 'QR_WXA_UNLIMIT'
      oParams.path = 'packagesPayment/pages/payment/index'
      // oParams.path = 'packagesPayment/pages/QRPayment/QRPayment'
      // oParams.scene = `merchantId=111`
      oParams.scene = `orderCode=${this.orderInfo.orderCode}&workWxSessionId=${sessionId}`
      oParams.channelType = 1
      // B端小程序调用接口生成领券码时，传参userId用uuid,类型由int变string
      uni.$api.boutiqueApi.createQrcodeImage(oParams).then(data => {
        _this.wxqrcode = data
      })
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
    closePopup() {
      console.log('关闭')
      this.$refs.payPopup.closePopup()
    },

    async checkPayType() {
      console.log(this.orderInfo.selectPayType, 'this.orderInfo.selectPayType')
      let _this = this
      // 微信支付
      if (this.orderInfo.selectPayType == 1) {
        await this.createWxQrcode()
        this.$refs.payPopup.open()
        _this.getDetail(this.orderInfo.orderCode)
        if (!this.time) {
          this.time = setInterval(() => {
            _this.getDetail(_this.orderInfo.orderCode)
          }, 5 * 1000)
        }
        return false
      }

      // pos机支付
      if (this.orderInfo.selectPayType == 3) {
        if (this.orderInfo.status == 1) {
          this.$refs.tipsPopup.open()
        } else {
          _this.createPayOrder()
        }
      } else {
        if (!this.successDate && !this.isErrorOrder && this.orderInfo.selectPayType != 0) return uni.showToast({ title: this.orderInfo.selectPayType == 2 ? '请选择4S店收款时间' : '请选择嘀加收款时间' })
        this.$emit('jump', 'UploadProofOfPayment', { orderCode: this.orderInfo.orderCode, payType: this.orderInfo.selectPayType, payeeType: this.orderInfo.payeeType, successDate: this.successDate })
      }
    },
    confirmTips() {
      this.createPayOrder()
    },
    openDate() {
      this.$refs.openDate.open()
    },
    customizeDate() {
      console.log(this.$refs.calendarPopup, 'this.$refs.calendarPopup')
      this.$refs.calendarPopup.open()
    },
    createPayOrder() {
      let {
        orderInfo: { selectPayType, orderCode, payeeType },
        outTradeNo,
        payVoucherList,
        successDate,
        isErrorOrder
      } = this
      let obj = {
        orderCode,
        payType: selectPayType,
        payeeType: payeeType
      }
      // 支付方式 2:门店收款 5:嘀加收款 6:对公转账 7:其它收款
      if ([2, 5, 6, 7].includes(Number(selectPayType)) && !isErrorOrder) {
        obj.successDate = successDate
      }
      if (payVoucherList?.length && outTradeNo) {
        obj.payVoucherList = payVoucherList.map(v => {
          return v?.url
        })
        obj.outTradeNo = outTradeNo
      }
      console.log(obj)
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      // 状态更新 需刷新工单列表和预约管理列表
      utils.refreshPageData()
      uni.$api.boutiqueApi.createPayOrder(obj).then(data => {
        if (data) {
          console.log(`类型为：${selectPayType}`)
          console.log(this.orderInfo)
          console.log(data, 'data')
          if (selectPayType == 3 || selectPayType == 1) {
            // 确保 orderInfo 和 payOrder 对象存在，避免空指针错误
            if (!this.orderInfo) {
              this.orderInfo = {}
            }
            if (!this.orderInfo.payOrder) {
              this.$set(this.orderInfo, 'payOrder', {})
            }
            this.$set(this.orderInfo.payOrder, 'outTradeNo', data.outTradeNo)
            let size = 0
            try {
              const info = uni.getSystemInfoSync()
              let scale = info.windowWidth / 750 //不同屏幕下QRcode的适配比例；设计稿是750宽
              let width = 300 * scale
              size = width
            } catch (e) {
              size = 150
            }
            this.posQrCode = qrcode.createQrCodeImg(data.outTradeNo, {
              size: parseInt(size)
            })
            uni.hideLoading()
            console.log(this.posQrCode)
            this.$refs.payPopup.open()
            this.getDetail(orderCode)
            if (!this.time) {
              this.time = setInterval(() => {
                // console.log('6666666666')
                this.getDetail(orderCode)
              }, 5 * 1000)
            }
          } else {
            this.$emit('jump', 'OrderDetail', data)
          }
        } else {
          uni.showToast({ title: '未获取到支付结果，请重试', icon: 'none' })
        }
      })
    }
  },
  beforeDestroy() {
    if (this.time) {
      clearInterval(this.time)
      this.time = null
    }
  }
}
</script>
<style scoped lang="scss">
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
    color: #666666;
    font-size: toRpx(32);
    font-weight: 400;
    padding: toRpx(16) toRpx(64);
    line-height: toRpx(48);
    text {
      color: #347bff;
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
::v-deep .payPopup .uni-popup__wrapper {
  width: 60%;
  border-radius: toRpx(48);
  background: #ffffff !important;
  .popup-top {
    border-radius: toRpx(48) toRpx(48) 0 0;
    background: url('@/assets/images/boutique/payTipsBc.webp') no-repeat;
    background-size: 100% 100%;
    margin-bottom: toRpx(16);
    .popup-top-box {
      color: #333333;
      font-size: toRpx(36);
      font-weight: 500;
      text-align: center;
      padding: toRpx(32);
      .popup-top-box-title {
        flex: 1;
      }
      .icon-close {
        text-align: end;
      }
    }
  }
  .pos-popup {
    text-align: center;
    box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
    width: 90%;
    border-radius: toRpx(48);
    background: #ffffff;
    margin: 0 auto toRpx(63) auto;
    padding: toRpx(63) 0;
    .qrcode {
      width: toRpx(320);
      height: toRpx(320);
      margin-bottom: toRpx(32);
    }
    .price {
      color: #4673ff;
      font-size: toRpx(56);
      font-weight: 700;
      margin-bottom: toRpx(32);
    }
    .level-1-tips {
      color: #1a1a1a;
      font-size: toRpx(40);
      font-weight: 500;
      margin-bottom: toRpx(16);
    }
    .level-2-tips {
      color: #808291;
      font-size: toRpx(32);
      font-weight: 400;
    }
  }
}
.order-confirm {
  position: relative;
  height: 100%;

  .scroll-y {
    border-radius: toRpx(16);
    height: calc(100% - #{toRpx(296)});
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
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
  .pt-12 {
    padding-top: toRpx(12);
  }
  .pt-24 {
    padding-top: toRpx(24);
  }
  .fs-14 {
    font-size: toRpx(14);
  }
  .fs-32 {
    font-size: toRpx(32);
  }
  .fs-28 {
    font-size: toRpx(28);
  }
  .fs-26 {
    font-size: toRpx(26);
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
  .mt-16 {
    margin-top: toRpx(16);
  }
  .mt-24 {
    margin-top: toRpx(24);
  }
  .py-16 {
    padding: toRpx(16) 0;
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
    height: toRpx(86);
    border-radius: toRpx(16);
    background: linear-gradient(-90deg, #61c0ff 0%, #2c66f7 100%);
    box-shadow: inset 0 0 toRpx(20) 0 #ffffff99;
    color: #fff;
    padding: toRpx(48) toRpx(32);
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
        padding: toRpx(24);
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
          margin-right: toRpx(24);
        }
        .good-count {
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
        }
      }
    }
    .coupon {
      border-bottom: 1px solid #f7f7f6;
      .coupon-name {
        color: #292d33;
        font-size: toRpx(28);
        font-weight: 400;
        margin-left: toRpx(8);
      }
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
        white-space: wrap;
      }
    }
  }

  .footer-box {
    position: absolute;
    bottom: toRpx(24);
    width: 100%;
    left: 0;
    .btn {
      width: 42%;
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
