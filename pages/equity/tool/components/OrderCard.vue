<!--工单信息卡片-->
<template>
  <view class="order-card">
    <view class="order-card-top-box flex justify-between">
      <view class="flex item-center">
        <text class="mr-20">{{ orderCardDetail.customerName }}</text>
        <!-- 标记为已开票的 不可编辑客户信息 invoicing 2已开票 -->
        <view v-if="isOrder">
          <view v-if="orderCardDetail.orderStatus == 3 || orderCardDetail.orderStatus == 5 || orderCardDetail.orderStatus == -1" @click="jumpUpdate" :class="['updateInfo flex', orderCardDetail.orderStatus == '6' || orderCardDetail.invoicing == '2' ? 'isHide' : '']">
            <view class="sprite-icon icon-edit mr-8"></view>
            客户信息
          </view>
        </view>
      </view>
      <!-- 待上传合同协议且是已支付的订单 -->
      <view class="status text-center" :style="{ color: (status[0] && status[0].color) || '#FF9D0A', 'background-color': (status[0] && status[0].background) || '#FFF5E6' }" v-if="orderCardDetail.zyPayStatus == 1 && (orderCardDetail.orderStatus == 3 || orderCardDetail.orderStatus == 4 || orderCardDetail.orderStatus == 7)">待上传</view>
      <view v-else class="status text-center" :style="{ color: currentStatusConfig.color, 'background-color': currentStatusConfig.background }">
        {{ currentStatusConfig.text }}
      </view>
    </view>
    <view class="flex errorBox" v-if="orderCardDetail.oldOrderCode">
      <view class="order-list align-center flex-1">
        <text>原错误订单编号</text>
        <text class="priceName">{{ orderCardDetail.oldOrderCode }}</text>
      </view>
      <view class="order-list align-center flex-1">
        <text>原错误订单总价</text>
        <text class="priceName">¥{{ orderCardDetail.oldOrderFinalPrice / 100 }}</text>
      </view>
    </view>
    <view class="order-card-bottom-box">
      <view class="info-box">
        <view class="order-list align-center">
          <view class="order flex align-center">
            <view class="order-label">订单类型</view>
            <view class="order-value flex">
              {{ orderTypeText[orderCardDetail.orderType] }}
              <view class="flex align-center errorTips" v-if="orderCardDetail.abnormalFlag == true">
                <view class="sprite-icon icon-errortips"></view>
                异常
              </view>
            </view>
          </view>
        </view>
        <view class="order-list align-center">
          <view class="order flex align-center">
            <view class="order-label">审批状态</view>
            <view class="order-value flex">{{ goodsOrderApplyStatus[orderCardDetail.approveStatus] || '-' }}</view>
          </view>
        </view>
        <view class="order-list align-center" v-for="(item, sindex) in orderCardDetail.deliveryId ? pointsMultiObj : orderObj" :key="sindex" v-if="(item.key !== 'remark' || orderCardDetail.orderStatus === '-1') && (item.key !== 'payTime' || orderCardDetail.orderStatus === '3' || orderCardDetail.orderStatus === '5')">
          <view v-if="item.key == 'remark' || item.key == 'payTime' || item.key == 'createdTime'">
            <view class="order flex align-center" v-if="item.key == 'remark' && orderCardDetail.orderStatus == '-1'">
              <view class="order-label">{{ item.label }}</view>
              <view class="order-value">
                <view>{{ orderCardDetail[item.key] || '' }}</view>
              </view>
            </view>
            <view class="order flex align-center" v-if="item.key == 'payTime' && (orderCardDetail.orderStatus == '3' || orderCardDetail.orderStatus == '5')">
              <view class="order-label">{{ item.label }}</view>
              <view class="order-value">
                <view>{{ orderCardDetail[item.key] || '' }}</view>
              </view>
            </view>
            <view class="order flex align-center" v-if="item.key == 'createdTime'">
              <view class="order-label">{{ item.label }}</view>
              <view class="order-value">
                <view>{{ orderCardDetail[item.key] || '' }}</view>
              </view>
            </view>
          </view>
          <view class="order flex align-center" v-else>
            <view class="order-label">{{ item.label }}</view>
            <view class="order-value flex">
              <view v-if="item.arr" class="flex">
                <view v-if="orderCardDetail[item.arr[1]]" class="flex">
                  <view v-for="(k, arr_index) in item.arr" :key="arr_index" class="flex">
                    <view class="order-value-item text-hide flex">
                      <view v-if="arr_index == 1">
                        <text class="split">|</text>
                      </view>
                      <text class="value-text">{{ orderCardDetail[k] }}</text>
                    </view>
                  </view>
                </view>
                <view v-else class="order-value-single">
                  <text class="value-text">{{ orderCardDetail[item.key] || '' }}</text>
                </view>
              </view>
              <view v-else class="order-value-single flex">
                <text class="value-text" v-if="item.mapValue">{{ item.mapValue[orderCardDetail[item.key]] || '' }}</text>
                <text v-else class="value-text">{{ orderCardDetail[item.key] || '' }}</text>
                <view v-if="item.canCopy && orderCardDetail[item.key]" class="copy-btn" @click.stop="copyText(orderCardDetail[item.key])">
                  <view class="sprite-icon icon-icon-copy copy"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="order flex align-center" v-if="orderCardDetail.orderStatus != '-1' && orderCardDetail.finalPrice">
        <view class="order-label">支付金额</view>
        <view class="price flex">
          <text class="unit">¥</text>
          {{ orderCardDetail.finalPrice || '' }}
        </view>
        <view class="refund-box" v-if="orderCardDetail.refundAmount">
          部分退款
          <text class="refund-box-unit">¥</text>
          {{ orderCardDetail.refundAmount }}
        </view>
        <!-- 已录单未签名 -->
        <!-- <view v-if="{{(item.orderStatus == '3' && item.equityOrderStatus == '0') || (item.orderStatus == '5' && item.equityOrderStatus == '0')}}" class="orange-txt">
                  <image class="icon-info" src="/packageEquity/images/icon-info.png"></image>
                  订单已支付，未录入权益合同
                </view>
                <view v-elif="{{item.orderStatus == '3' && item.equityOrderStatus == '2'}}" class="orange-txt">
                  <image class="icon-info" src="/packageEquity/images/icon-info.png"></image>
                  订单已支付，尚未签名确认
                </view> -->
        <!-- <view v-else>创建时间：{{item.createdTime}}</view> -->
      </view>
    </view>
    <!-- 施工技师 -->
    <view class="construction-staff flex" v-if="orderCardDetail && orderCardDetail.constructionFlag == 'Y'">
      <view class="staff-label">施工技师</view>
      <view class="staff-value">{{ orderCardDetail.technicianName }}</view>
    </view>
    <view v-if="orderCardDetail.zyPayStatus != 1" class="">
      <view class="flex px-24 tips" v-if="(orderCardDetail.orderStatus == 3 && orderCardDetail.equityOrderStatus == 0 && orderCardDetail.equityGoodsFlag == 1) || (orderCardDetail.orderStatus == 5 && orderCardDetail.equityOrderStatus == 0)">
        <view class="sprite-icon icon-study-tips"></view>
        订单已支付，未录入权益合同
      </view>
      <!-- 已录单未签名 -->
      <view class="flex px-24 tips" v-else-if="orderCardDetail.orderStatus == 3 && orderCardDetail.equityOrderStatus == 2">
        <view class="sprite-icon icon-study-tips"></view>
        订单已支付，尚未签名确认
      </view>
    </view>
    <view class="item-footer">
      <view class="btn_class">
        <!-- 更多按钮 -->
        <!-- <view v-if="buttonConfig.showMoreBtn">
          <view class="order-btn default-btn padding_20" @click="handleMoreBtn">更多</view>
        </view> -->

        <!-- 接待记录按钮 -->
        <!-- <view v-if="buttonConfig.showReceptionBtn">
          <view class="order-btn default-btn padding_20" @click="jumpReception">接待记录</view>
        </view> -->

        <!-- 次要按钮 -->
        <view v-for="(btn, index) in buttonConfig.secondaryButtons" :key="index">
          <view class="order-btn default-btn" @click="() => handleClickBtn(btn.dataType)">
            {{ btn.text }}
          </view>
        </view>

        <!-- 主要按钮 -->
        <view v-if="buttonConfig.primaryButton">
          <view class="order-btn" @click="() => handleClickBtn(buttonConfig.primaryButton.dataType)">
            {{ buttonConfig.primaryButton.text }}
          </view>
        </view>
      </view>
    </view>
    <NoticePopup ref="notice" title="提示" text="是否撤销该笔客户工单，撤销后客户工单为「已撤销」状态，不再统计订单数和订单金额。" type="warning"></NoticePopup>
    <NoticePopup ref="reportNotice" :title="noticeObj.title" :text="noticeObj.text" :type="noticeObj.type || 'success'" :buttons="noticeObj.buttons"></NoticePopup>
    <ContractPopup ref="contractPopupRef" @onConfirm="onConfirm"></ContractPopup>
    <PublishPopup ref="defeatOrderPopup" popupClass="defeatOrderPopup" type="center" :showClose="true" :isMaskClick="false" title="战败原因">
      <template #content>
        <view class="defeat-order-box modatcontent">
          <textarea class="defeat-textarea" placeholder="请填写战败原因" maxlength="30" v-model="textareaValue" />
        </view>
      </template>
      <template #footer>
        <view class="footer-box flex justify-center">
          <view class="cancle-btn btn" @click.stop="cancelSelection">取消</view>
          <view class="sure-btn btn" @click.stop="confirmSelection">确认</view>
        </view>
      </template>
    </PublishPopup>
    <PublishPopup ref="errorOrderPopup" popupClass="errorOrderPopup" type="center" :showClose="true" :isMaskClick="false" title="工单标记">
      <template #content>
        <view class="error-order-box modatcontent">
          <view class="error-order-title">订单编号：{{ orderCardDetail.payId }}</view>
          <view class="error-order-content">
            若工单信息有误，确定操作可标记为
            <span style="color: #4673ff">“已失效”</span>
            ，并补录新工单以供线下核对。
          </view>
        </view>
      </template>
      <template #footer>
        <view class="footer-box flex justify-center">
          <view class="cancle-btn btn" @click.stop="cancelError">取消</view>
          <view class="sure-btn btn" @click.stop="confirmError">确认</view>
        </view>
      </template>
    </PublishPopup>
  </view>
</template>
<script>
import order_mixins from '../../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import PublishPopup from '@/components/PublishPopup.vue'
import NoticePopup from '@/components/NoticePopup.vue'
import ContractPopup from './ContractPopup.vue'
export default {
  mixins: [interceptionMixin],
  name: 'OrderCard',
  props: {
    orderCardDetail: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    PublishPopup,
    NoticePopup,
    ContractPopup
  },
  computed: {
    payType() {
      return order_mixins.data.payType || {}
    },
    status() {
      return order_mixins.data.orderStatusObj || {}
    },
    goodsOrderApplyStatus() {
      return order_mixins.data.goodsOrderApplyStatus || {}
    },
    orderTypeText() {
      return order_mixins.data.orderType || {}
    },
    // 安全获取当前订单状态配置，如果状态不存在则返回默认配置
    currentStatusConfig() {
      const statusKey = this.orderCardDetail.orderStatus
      const statusObj = this.status[statusKey]
      if (statusObj && statusObj.color && statusObj.background) {
        return statusObj
      }
      // 返回默认状态配置
      return {
        text: '未知状态',
        color: '#8F959E',
        background: '#F3F4F5'
      }
    },
    buttonConfig() {
      const config = {
        showMoreBtn: false,
        showReceptionBtn: false,
        primaryButton: null,
        secondaryButtons: []
      }

      const order = this.orderCardDetail
      const localUser = this.localUserInfo

      // 如果是审批中状态（approveStatus === 0），不显示任何操作按钮
      if (order.approveStatus === 0 || order.approveStatus === '0') {
        return config
      }

      // 超管或商户类型1不可操作
      if (localUser?.isSuper || localUser?.userType !== 2) {
        config.showMoreBtn = order.showInvoiceEntrance || ((order.orderStatus == 3 || order.orderStatus == 5 || (order.orderStatus == 6 && order.refundAmount)) && this.isOrder)
        return config
      }

      // 待上传合同协议且是已支付的订单 (zyPayStatus == 1 且 orderStatus 为 3/4/7)
      if (order.zyPayStatus == 1 && (order.orderStatus == 3 || order.orderStatus == 4 || order.orderStatus == 7)) {
        config.showMoreBtn = order.showInvoiceEntrance || order.invoicing == 2
        config.showReceptionBtn = order.orderStatus != '0'
        config.primaryButton = { text: '上传协议', type: 'primary', dataType: 'upload' }

        if (order.equityOrderStatus == 0 && order.equityGoodsFlag == 1) {
          config.secondaryButtons.push({ text: '去处理', type: 'secondary', dataType: 'handle' })
        }

        // 待上传协议状态也支持撤销
        if (order.payType == 1) {
          // 线上支付显示"错误工单"
          // config.secondaryButtons.push({ text: '错误工单', type: 'secondary', dataType: 'error' })
        } else {
          // 非线上支付显示"撤销工单"
          config.secondaryButtons.push({ text: '撤销工单', type: 'secondary', dataType: 'revoke' })
        }

        return config
      }

      // 其他情况 - 订单状态不是4,11,9
      if (order.orderStatus != '4' && order.orderStatus != 11 && order.orderStatus != 9) {
        config.showMoreBtn = order.showInvoiceEntrance || ((order.orderStatus == 3 || order.orderStatus == 5 || order.orderStatus == 6) && this.isOrder)
        config.showReceptionBtn = order.orderStatus != '0'

        // 修改协议按钮
        if (order.canUpdateZyPayUrl == 1 && order.zyPayStatus == 2) {
          config.secondaryButtons.push({ text: '修改协议', type: 'secondary', dataType: 'upload' })
        }

        if (this.isOrder) {
          // 待跟进或待支付状态
          if (order.orderStatus == '-1' || order.orderStatus == '0') {
            config.primaryButton = {
              text: this.btnTxt[order.orderStatus] || (order.orderStatus == '-1' ? '去报价' : '去报价'),
              type: 'primary',
              dataType: 'price'
            }
          }
          // 非已完成状态
          else if (order.orderStatus != 6) {
            // 战败状态
            if (order.orderStatus == '2') {
              config.secondaryButtons.push({ text: '战败', type: 'secondary', dataType: 'defeat' })
              config.primaryButton = {
                text: this.btnTxt[order.orderStatus] || '去支付',
                type: 'primary',
                dataType: 'pay'
              }
            }
            // 已支付状态
            else if (order.orderStatus == '3') {
              if (order.equityGoodsFlag == '1') {
                // config.secondaryButtons.push({ text: '客户签名', type: 'secondary', dataType: 'signature' })
              }

              // 已支付未录单
              if (order.equityOrderStatus == '0' && order.equityGoodsFlag == '1') {
                config.primaryButton = {
                  text: this.btnTxt[order.orderStatus] || '去处理',
                  type: 'primary',
                  dataType: 'handle'
                }
              }
            }
            // 已完成状态
            else if (order.orderStatus == '5') {
              // 已完成未录单
              if (order.equityOrderStatus == '0' && order.equityGoodsFlag == '1') {
                config.primaryButton = {
                  text: this.btnTxt[order.orderStatus] || '去处理',
                  type: 'primary',
                  dataType: 'handle'
                }
              }
            }
            // 其他状态
            else {
              config.primaryButton = {
                text: this.btnTxt[order.orderStatus] || '处理',
                type: 'primary',
                dataType: 'default'
              }
            }
          }
          // 战败（-1）、已退款（6）不支持撤销
          if (order.orderStatus != -1 && order.orderStatus != '-1' && order.orderStatus != 6) {
            // 待报价（0）、待支付（2），支持撤销
            if (order.orderStatus == 0 || order.orderStatus == 2) {
              config.secondaryButtons.push({ text: '撤销工单', type: 'secondary', dataType: 'revoke' })
            }
            // 已支付（3）、已完成（5），除了线上支付外都能撤销
            else if (order.orderStatus == 3 || order.orderStatus == 5) {
              if (order.payType == 1) {
                // 线上支付显示"错误工单"
                // config.secondaryButtons.push({ text: '错误工单', type: 'secondary', dataType: 'error' })
              } else {
                // 非线上支付显示"撤销工单"
                config.secondaryButtons.push({ text: '撤销工单', type: 'secondary', dataType: 'revoke' })
              }
            }
            // 其他状态，支持撤销
            else {
              if (order.payType == 1) {
                // config.secondaryButtons.push({ text: '错误工单', type: 'secondary', dataType: 'error' })
              } else {
                config.secondaryButtons.push({ text: '撤销工单', type: 'secondary', dataType: 'revoke' })
              }
            }
          }
        }
      } else {
        // 订单状态为4,11,9的情况
        config.showMoreBtn = order.showInvoiceEntrance || ((order.orderStatus == 3 || order.orderStatus == 5 || order.orderStatus == 6) && this.isOrder)
      }

      return config
    }
  },
  data() {
    return {
      IMG_URL: 'https://img02.glsx.com.cn/weapp/resource/dj-car-boutique-work-wechat/',
      isSettingExpiredTraffic: false, // 是否启用流量失效
      selectType: 1,
      pointsMultiObj: [
        {
          label: '场景名称',
          key: 'baseSceneName'
        },
        {
          label: '销售顾问 /录单员',
          arr: ['merchantName', 'referrerName']
        },
        {
          label: '交付人员',
          arr: ['merchantName', 'deliveryName']
        },
        {
          label: '转化人员',
          arr: ['parkMerchantName', 'transferName']
        },
        {
          label: '车架号',
          key: 'carVin'
        },
        {
          label: '购买商品',
          key: 'goodsNameAlias',
          otherKey: 'goodsName'
        },
        {
          label: '工单编号',
          key: 'payId',
          canCopy: true
        },
        {
          label: '交易流水号',
          key: 'tradeNo',
          canCopy: true
        },
        {
          label: '拒升原因',
          key: 'remark'
        },
        {
          label: '支付时间',
          key: 'payTime'
        },
        {
          label: '创建时间',
          key: 'createdTime'
        },
        {
          label: '支付方式',
          key: 'payType',
          mapValue: {
            1: '线上支付',
            2: '门店收款',
            5: '嘀加收款',
            6: '对公转账',
            7: '其它收款'
          }
        }
      ],
      orderObj: [
        {
          label: '场景名称',
          key: 'baseSceneName'
        },
        {
          label: '销售顾问',
          arr: ['merchantName', 'referrerName']
        },
        {
          label: '转化人员',
          arr: ['parkMerchantName', 'transferName']
        },
        {
          label: '车架号',
          key: 'carVin'
        },
        {
          label: '购买商品',
          key: 'goodsNameAlias',
          otherKey: 'goodsName'
        },
        {
          label: '工单编号',
          key: 'payId',
          canCopy: true
        },
        {
          label: '交易流水号',
          key: 'tradeNo',
          // key: "transactionNo",
          canCopy: true
        },
        {
          label: '拒升原因',
          key: 'remark'
        },
        {
          label: '支付时间',
          key: 'payTime'
        },
        {
          label: '创建时间',
          key: 'createdTime'
        },
        {
          label: '支付方式',
          key: 'payType',
          mapValue: {
            1: '线上支付',
            2: '门店收款',
            5: '嘀加收款',
            6: '对公转账',
            7: '其它收款'
          }
        }
      ],
      localUserInfo: null,
      isOrder: null,
      btnTxt: {
        0: '去报价',
        1: '确认方案',
        2: '去支付',
        3: '去处理',
        '-1': '去报价',
        5: '去处理'
      },
      textareaValue: '',
      noticeObj: {}
    }
  },
  mounted() {
    this.localUserInfo = uni.$storage.get('userInfo')
    this.isOrder = !(this.localUserInfo?.isSuper || this.localUserInfo?.loginRole == 3 || this.localUserInfo.loginRole == 5 || this.localUserInfo?.loginRole == 6)
  },
  _methods: {
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
    handleClickBtn(type) {
      switch (type) {
        case 'upload':
          // 处理上传协议
          this.uploadContract()
          break
        case 'handle':
          // 处理去处理
          this.createorder()
          break
        case 'price':
          // 处理去报价
          this.$emit('jump', 'CreateOrder', { paramsData: this.orderCardDetail, type: 'CreateOrder' })
          break
        case 'pay':
          this.$emit('openPay', this.orderCardDetail)
          // 处理去支付
          break
        case 'defeat':
          // 处理战败
          this.defeatOrder()
          break
        case 'revoke':
          // 处理撤销
          this.revokeOrder()
          break
        case 'error':
          // 处理错误订单
          this.isErrorOrder()
          break
        case 'default':
          // 处理默认情况
          break
        default:
          // 其他情况
          break
      }
    },
    // 撤销工单方法
    revokeOrder() {
      const that = this
      // 配置弹窗按钮
      that.$refs.notice.buttonsList = [
        {
          text: '取消',
          type: 'default',
          callback: () => {
            that.transmissionOfData = null
            that.$refs.notice.close()
          }
        },
        {
          text: '撤销',
          type: 'primary',
          callback: async () => {
            console.log(that.orderCardDetail)
            if (that.orderCardDetail.payId) {
              // 校验订单是否可撤销（在退款流程中无法撤销）
              let refundStep = await uni.$api.equityApi.getOrderRefundStep({ orderCode: that.orderCardDetail.payId })
              console.log(refundStep, 'refundStep')
              if (refundStep == 'Y') return that.showRefundAlert()
              that.repeal(that.orderCardDetail.id)
            } else {
              that.repeal(that.orderCardDetail.id)
            }
          }
        }
      ]
      // 打开弹窗
      that.$refs.notice.open()
    },
    //修改客户信息
    jumpUpdate() {
      this.$emit('jump', 'UpdateOrderInfo', { paramsData: this.orderCardDetail, type: 'UpdateOrderInfo' })
    },
    //去处理
    createorder() {
      this.$emit('jump', 'CreateEquity', {
        orderId: this.orderCardDetail.orderId
      })
    },
    //上传协议
    uploadContract() {
      this.$refs.contractPopupRef.open(this.orderCardDetail)
    },
    //战败
    defeatOrder() {
      this.$refs.defeatOrderPopup.open(this.orderCardDetail)
    },
    async isErrorOrder() {
      // 校验订单是否可标记为错误订单（在退款流程中无法流转）
      let refundStep = await uni.$api.equityApi.getOrderRefundStep({
        orderCode: this.orderCardDetail.payId
      })
      console.log(refundStep, 'refundStep')
      if (refundStep == 'Y') return this.showRefundAlert('error')
      this.$refs.errorOrderPopup.open(this.orderCardDetail)
    },
    showRefundAlert(type) {
      const text = type == 'error' ? '订单已发起退款，禁止标记为错误工单！如需标记错误请联系总部运营。' : '订单已发起退款，禁止撤销！如需撤销请联系总部运营。'
      console.log(text, 'text')
      let title = '提示',
        btnText = '好的',
        callbackFun = () => {
          this.$refs.notice.close()
          this.$refs.reportNotice.close()
        }
      this.noticeObj = {
        title,
        text: text,
        type: 'warning',
        buttons: [
          {
            text: btnText,
            type: 'primary',
            callback: callbackFun
          }
        ]
      }
      console.log(this.$refs.reportNotice)
      this.$nextTick(() => this.$refs.reportNotice.open())
      // uni.showModal({
      //   title: '提示',
      //   content: text,
      //   showCancel: false,
      //   confirmText: '好的'
      // })
    },
    openNotice(message, params) {
      uni.hideLoading()
    },
    repeal(id, revokeReason) {
      uni.showLoading({
        mask: true
      })
      let _this = this
      let params = {
        id
      }
      if (revokeReason) {
        params.revokeReason = revokeReason
      }
      uni.$api.equityApi.cancelOrderById(params).then(_res_ => {
        if (_res_) {
          uni.hideLoading()
          uni.showToast({
            title: '操作成功',
            icon: 'success'
          })
          this.transmissionOfData = null
          this.$refs.notice.close()
          setTimeout(() => {
            this.$emit('refresh')
            // _this.getList();
          }, 500)
        } else {
          uni.hideLoading()
        }
      })
    },
    confirmSelection() {
      if (this.textareaValue) {
        uni.$api.equityApi
          .updateOrderStatus({
            id: this.orderCardDetail.id,
            orderStatus: -1,
            remark: this.textareaValue
          })
          .then(res => {
            uni.showToast({
              title: '提交成功',
              icon: 'none'
            })
            setTimeout(() => {
              this.$emit('refresh')
              // _this.getList();
            }, 500)
          })
      } else {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        })
      }
    },
    cancelSelection() {
      this.$refs.defeatOrderPopup.closePopup()
    },
    confirmError() {
      const that = this
      uni.showLoading({
        mask: true
      })
      uni.$api.equityApi
        .errorOrderById({
          oldQuotationId: that.orderCardDetail.id,
          needCreateNewOrder: false
        })
        .then(res => {
          console.log(res, 'res')
          if (res) {
            that.$refs.errorOrderPopup.closePopup()
            uni.hideLoading()
            uni.showToast({
              title: '提交成功',
              icon: 'none'
            })
            setTimeout(() => {
              that.$emit('refresh')
              // _this.getList();
            }, 500)
          }
        })
    },
    cancelError() {
      this.$refs.errorOrderPopup.closePopup()
    },
    onConfirm(val) {
      console.log(val)
      let urls = []
      if (val && val.contractFiles && Array.isArray(val.contractFiles)) {
        urls = val.contractFiles.map(file => file.url).filter(url => url)
      }
      console.log(urls)
      const that = this
      if (this.orderCardDetail.zyPayStatus == 2 && this.orderCardDetail.canUpdateZyPayUrl == 1) {
        uni.showModal({
          title: '修改确认',
          content: '本次操作将永久替换原图或协议（仅限1次修改权限），请确认是否更新？',
          confirmText: '确定',
          confirmColor: '#347BFF',
          success(res) {
            if (res.confirm) {
              uni.showLoading({
                mask: true
              })
              console.log(that.orderCardDetail)
              uni.$api.equityApi.updateZyInfo({ id: that.orderCardDetail?.id, zyPayUrl: urls.join(',') }).then(res => {
                uni.hideLoading()
                uni.showToast({
                  title: '提交成功',
                  icon: 'none'
                })
                setTimeout(() => {
                  that.$emit('refresh')
                  // _this.getList();
                }, 500)
              })
            }
          }
        })
      } else {
        uni.$api.equityApi
          .getQuotationInfoById({
            id: this.orderCardDetail?.id
          })
          .then(res => {
            console.log(res, 'res')
            let orderInfo = {}
            let { default4SStoreInfo } = this.userInfo
            orderInfo.check = true
            orderInfo.id = res.id
            orderInfo.orderId = res.orderId
            orderInfo.merchantId4s = default4SStoreInfo?.merchantId
            orderInfo.merchantName4s = default4SStoreInfo?.merchantName
            orderInfo.referrer = res.referrer
            orderInfo.referrerId = res.referrerId
            console.log(orderInfo, 'orderInfo')
            uni.showLoading({
              mask: true
            })
            uni.$api.equityApi
              .updateCustomerInfo({
                ...orderInfo,
                zyPayUrl: urls.join(',')
              })
              .then(result => {
                console.log(result, 'resultresult')
                this.$refs.contractPopupRef.close()
                uni.hideLoading()
                uni.showToast({
                  title: '提交成功',
                  icon: 'none'
                })
                setTimeout(() => {
                  this.$emit('refresh')
                  // _this.getList();
                }, 500)
              })
              .catch(err => {
                console.log(err)
                uni.hideLoading()
              })
          })
          .catch(err => {
            uni.hideLoading()
          })
      }
    }
  },
  get methods() {
    return this._methods
  },
  set methods(value) {
    this._methods = value
  }
}
</script>
<style lang="scss" scoped>
// Popup样式
::v-deep .defeatOrderPopup .uni-popup__wrapper {
  position: relative;
  border-radius: toRpx(32);
  opacity: 1;
  width: toRpx(848);
  height: toRpx(968);
  background-color: #fff !important;

  .popup-top-box {
    text-align: left;
    padding: toRpx(48) toRpx(64);
    border-radius: toRpx(32) toRpx(32) 0 0;
    background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
    &-title {
      color: #1a1a1a;
      font-size: toRpx(40);
      font-weight: 500;
    }
    .icon-close {
      font-size: toRpx(40) !important;
      color: rgba(26, 26, 26, 0.6) !important;
    }
  }

  .modatcontent {
    box-sizing: border-box;
    padding: 0 toRpx(64);
    .modalbox {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border-radius: toRpx(16);
      background: #f7f8fa;
      height: toRpx(136);
      border-radius: toRpx(8);
      margin: 0 auto;
      color: #292d33;
      font-size: toRpx(28);
      font-weight: 500;
      & + .modalbox {
        margin-top: toRpx(16);
      }
      .sprite-icon {
        margin: 0 toRpx(24) 0 toRpx(32);
      }
    }

    .act {
      border: toRpx(2) solid #347bff;
      background: #347bff1a;
    }
  }
  .footer-box {
    width: 100%;
    height: toRpx(164);
    background-color: #fff;
    position: absolute;
    bottom: 0;
    border-radius: 0 0 toRpx(32) toRpx(32);
    .btn {
      width: 40%;
      height: toRpx(80);
      border-radius: toRpx(48);
      opacity: 1;
      line-height: toRpx(80);
      text-align: center;
      color: rgba(26, 26, 26, 0.6);
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
  .defeat-textarea {
    height: toRpx(568);
    border-radius: toRpx(16);
    background: #f5f7fa;
    width: 100%;
    padding: toRpx(24);
    box-sizing: border-box;
    .uni-input-wrapper {
      background: #f5f7fa;
    }
  }
}
::v-deep .errorOrderPopup .uni-popup__wrapper {
  position: relative;
  border-radius: toRpx(32);
  opacity: 1;
  width: toRpx(848);
  height: toRpx(512);
  background-color: #fff !important;
  .popup-top-box {
    text-align: left;
    padding: toRpx(48) toRpx(64);
    border-radius: toRpx(32) toRpx(32) 0 0;
    background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
    &-title {
      color: #1a1a1a;
      font-size: toRpx(40);
      font-weight: 500;
    }
    .icon-close {
      font-size: toRpx(40) !important;
      color: rgba(26, 26, 26, 0.6) !important;
    }
  }

  .modatcontent {
    box-sizing: border-box;
    padding: 0 toRpx(64);
    .modalbox {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border-radius: toRpx(16);
      background: #f7f8fa;
      height: toRpx(136);
      border-radius: toRpx(8);
      margin: 0 auto;
      color: #292d33;
      font-size: toRpx(28);
      font-weight: 500;
      & + .modalbox {
        margin-top: toRpx(16);
      }
      .sprite-icon {
        margin: 0 toRpx(24) 0 toRpx(32);
      }
    }

    .act {
      border: toRpx(2) solid #347bff;
      background: #347bff1a;
    }
    .error-order-title {
      color: #666666;
      font-size: toRpx(32);
      font-weight: 400;
    }
    .error-order-content {
      margin-top: toRpx(16);
      color: #666666;
      font-size: toRpx(32);
      font-weight: 400;
    }
  }
  .footer-box {
    width: 100%;
    height: toRpx(164);
    background-color: #fff;
    position: absolute;
    bottom: 0;
    border-radius: 0 0 toRpx(32) toRpx(32);
    .btn {
      width: 40%;
      height: toRpx(80);
      border-radius: toRpx(48);
      opacity: 1;
      line-height: toRpx(80);
      text-align: center;
      color: rgba(26, 26, 26, 0.6);
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
.order-card {
  padding: toRpx(36) toRpx(32);
  border-radius: toRpx(24);
  opacity: 1;
  background: #ffffff;
  box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
  margin-bottom: toRpx(24);
}
.status {
  padding: toRpx(8);
  font-size: toRpx(24);
  font-weight: 500;
  border-radius: toRpx(4);
  border: toRpx(1) solid transparent;
}
.errorBox {
  background: #f7f8fa;
  border-radius: toRpx(16);
  padding: toRpx(16) toRpx(24);
  color: #999ea8;
  font-size: toRpx(24);
  margin-bottom: toRpx(20);
}
.priceName {
  color: #5a5e66;
  font-size: toRpx(24);
  font-weight: 400;
  margin-left: toRpx(30);
}
.info-box {
  display: flex;
  flex-wrap: wrap;

  .order-list,
  .order-payType {
    width: 50%;
    padding: toRpx(10) toRpx(20) toRpx(10) 0;
    box-sizing: border-box;

    &:nth-child(2n) {
      padding-right: 0;
      padding-left: toRpx(20);
    }
  }
}

.order {
  .order-label {
    width: toRpx(120);
    margin-right: toRpx(24);
    font-size: toRpx(24);
    color: #999ea8;
    font-weight: 400;
    flex-shrink: 0;
  }

  .order-value {
    font-size: toRpx(24);
    color: #666666;
    font-weight: 400;
    min-width: 0;
  }

  .order-value-single,
  .order-value-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .value-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .split {
    margin: 0 toRpx(6);
    flex-shrink: 0;
  }
}

.unit {
  margin-right: toRpx(4);
  color: #347bff;
  font-size: toRpx(26);
  font-weight: 700;
}
.price {
  color: #347bff;
  font-size: toRpx(32);
  font-weight: 700;
}

.construction-staff {
  width: 50%;
  padding: toRpx(10) toRpx(20) toRpx(10) 0;
  box-sizing: border-box;
  .staff-label {
    width: toRpx(120);
    margin-right: toRpx(24);
    font-size: toRpx(24);
    font-weight: 400;
    color: #999ea8;
  }
  .staff-value {
    font-size: toRpx(24);
    color: #666666;
    font-weight: 400;
  }
}

.goods-list {
  width: 100%;
  border-radius: toRpx(16);
  opacity: 1;
  border-bottom: toRpx(2) solid #f7f7f6;
  background: #f5f7fa;
  margin: toRpx(20) 0;
  padding: toRpx(20) toRpx(32);
  .goods {
    color: #333333;
    font-size: toRpx(28);
    font-weight: 400;
    margin-bottom: toRpx(16);
    &.no-margin {
      margin-bottom: 0;
    }
    .goods-name {
      .point {
        width: toRpx(12);
        height: toRpx(12);
        opacity: 1;
        border: toRpx(2) solid #4673ff;
        border-radius: 50%;
        background: #4673ff;
        margin-right: toRpx(16);
      }
    }
  }
  .goods-more {
    color: #4673ff;
    font-size: toRpx(24);
    font-weight: 400;
    text-align: right;
    margin-top: toRpx(12);
  }
}
.item-footer {
  display: flex;
  justify-content: end;
  align-items: center;
  font-size: toRpx(24);
  color: #9b9b9e;
  border-top: 1 solid #ededed;
  padding: toRpx(32) toRpx(32) 0;
}
.btn_class {
  display: flex;
  gap: toRpx(16);
  margin-left: auto;
}

.order-btn {
  box-sizing: border-box;
  height: toRpx(56);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: toRpx(28);
  color: #ffffff;
  background: #347bff;
  border-radius: toRpx(32);
  padding: toRpx(8) toRpx(20);
  flex-shrink: 0;
}

.order-btn.default-btn {
  background: #ffffff;
  border: toRpx(2) solid #347bff;
  border-radius: toRpx(32);
  color: #347bff;
}

.padding_20 {
  padding: 0 toRpx(14);
}

.list .item .order {
  font-size: toRpx(24);
  color: #333333;
  margin-bottom: toRpx(20);
  display: flex;
  align-items: center;
}

.list .item .order:last-of-type {
  margin-bottom: 0;
}

.list .item .order .order-label {
  width: toRpx(36);
  color: #9b9b9e;
}

.list .item .order .order-value {
  width: calc(100% - toRpx(136));
  display: flex;
  align-items: center;
}

.list .item .order .order-value .order-value-item:first-of-type {
  max-width: 70%;
}

.list .item .order .order-value .order-value-item .split {
  margin: 0 toRpx(6);
}

.list .item .order-price {
  display: flex;
  justify-content: flex-end;
  /* align-items: center; */
  align-items: flex-end;
  font-size: toRpx(24);
  color: #666666;
  /* padding-top: var(--fontSize8); */
}

.list .item .order-price .price {
  box-sizing: border-box;
  color: #f24724;
  font-size: toRpx(40);
  margin-left: toRpx(20);
  margin-bottom: calc(-1 * toRpx(8));
  /* margin-top: var(--fontSize8); */
}

.list .item.gray .order-price .price {
  color: #666 !important;
}

.list .item .order-price .price .unit {
  font-size: toRpx(28);
}

.list .item .order-payType {
  font-size: toRpx(24);
  color: #333333;
  /* margin-top: var(--fontSize50); */
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.list .item .btn {
  border: toRpx(2) solid #666666;
  border-radius: toRpx(12);
  box-sizing: border-box;
  font-size: toRpx(28);
  color: #666666;
  position: absolute;
  right: toRpx(40);
  bottom: toRpx(30);
  width: toRpx(192);
  height: toRpx(64);
}
.tips {
  display: flex;
  align-items: center;
  font-size: toRpx(24);
  width: 100%;
  height: toRpx(56);
  border-radius: toRpx(8);
  opacity: 1;
  background: #fef5ea;
  margin: toRpx(16) 0;
  color: #ff9d0a;
  &-text {
    margin-top: toRpx(4);
  }

  .icon-study-tips {
    margin-right: toRpx(8);
  }
}
.copy-btn {
  display: flex;
  align-items: center;
  margin-left: auto;
  color: #808291;

  .copy {
    margin-right: toRpx(8);
    margin-left: toRpx(16);
  }
}
.order-card-top-box {
  margin-bottom: toRpx(6);
}
.order-card-bottom-box {
  border-bottom: toRpx(2) solid #f7f7f6;
  padding-bottom: toRpx(20);
}
.updateInfo {
  color: #347bff;
  font-size: toRpx(24);
  margin-left: toRpx(16);
  font-weight: normal;
  margin-right: auto;
}

.updateInfo.isHide {
  display: none;
}
.errorTips {
  color: #eb4e4e;
  font-size: toRpx(24);
  font-weight: 400;
  margin-left: toRpx(16);
}
.refund-box {
  margin-left: toRpx(16);
  background: #fff2e0;
  padding: toRpx(4) toRpx(8);
  color: #f7a431;
  font-size: toRpx(24);
  font-weight: 500;
  font-family: 'numberBold';
  border-radius: toRpx(4);
}

.refund-box .refund-box-unit {
  font-size: toRpx(24);
}
</style>
