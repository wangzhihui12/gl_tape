<!--工单信息卡片-->
<template>
  <view class="order-card" @click.stop="cardClick">
    <view class="order-card-top-box flex justify-between">
      <text>{{ orderCardDetail.customer.customerName }}</text>
      <view class="status text-center" :style="{ color: orderCardDetail.statuscolor, 'background-color': orderCardDetail.statusbackground }">
        <view v-if="orderCardDetail.status == 1 || orderCardDetail.status == 3">
          <view v-if="status[orderCardDetail.status].background">
            <view class="arc y-center">
              <view class="outside box-center" :style="{ 'background-color': status[orderCardDetail.status].background }" />
              <view class="inside box-center" :style="{ 'background-color': status[orderCardDetail.status].color }" />
            </view>
          </view>
        </view>
        <!-- 优先显示已撤销的 然后是已施工的 最后是其他的 -->
        <!-- {{li.status==9?status[li.status].text: (li.constructionFlag == 'Y'?'已施工':status[li.status].text) }} -->
        {{ orderCardDetail.statusText }}
      </view>
    </view>
    <view>
      <view class="goods-list" :style="{ paddingBottom: orderCardDetail.subOrderList && orderCardDetail.subOrderList.length < 1 ? '0' : '' }" v-if="orderCardDetail.subOrderList && orderCardDetail.subOrderList.length > 0">
        <view>
          <view v-for="(i, sindex) in orderCardDetail.subOrderList" :key="sindex" class="goods flex justify-between" :class="{ 'no-margin': orderCardDetail.subOrderList.length === 1 }" v-if="orderCardDetail.showAllGoodsListFlag ? true : sindex < 2">
            <view class="goods-name text-hide flex">
              <view class="point"></view>
              {{ i.upgradeGoodsAlias || i.upgradeGoodsName || i.packageName || '' }}
            </view>
            <view class="goods-price">
              ¥
              <text>{{ i.finalPrice || 0 }}</text>
            </view>
          </view>

          <view v-if="orderCardDetail.subOrderList.length > 2" class="goods-more">
            <text @click.stop="showAllGoodsList">
              {{ orderCardDetail.showAllGoodsListFlag ? '收起' : '查看全部' }}
            </text>
            （共{{ orderCardDetail.subOrderList.length }}件）
          </view>
        </view>
      </view>
      <view class="flex errorBox" v-if="orderCardDetail.status == 11 && orderCardDetail.associatedOrderCode">
        <view class="order-list align-center flex-1">
          <text>原错误订单编号</text>
          <text class="priceName">{{ orderCardDetail.associatedOrderCode }}</text>
        </view>
        <view class="order-list align-center flex-1">
          <text>原错误订单总价</text>
          <text class="priceName">¥{{ orderCardDetail.associatedOrderCodeFinalPrice }}</text>
        </view>
      </view>
      <!-- 支付方式 -->
      <view class="order-payType flex">
        <view class="payType flex align-center">
          <view class="payType-label">订单类型</view>
          <view class="payType-value flex align-center">
            {{ orderType[orderCardDetail['djOrderType']] }}
            <view class="flex align-center errorTips" v-if="orderCardDetail.abnormalFlag == 'Y'">
              <view class="sprite-icon icon-errortips"></view>
              异常
            </view>
          </view>
        </view>


        <view class="payType flex align-center">
          <view class="payType-label">审批状态</view>
          <view class="payType-value flex align-center">
            {{ goodsOrderApplyStatus[orderCardDetail.goodsOrderApplyStatus] }}
          </view>
        </view>
      </view>
      <view class="info-box">
        <view class="order-list align-center" v-for="(item, sindex) in orderCardDetail.deliveryUserId ? pointsMultiObj : orderObj" :key="sindex">
          <view class="order flex align-center">
            <view class="order-label">{{ item.label }}</view>
            <view class="order-value flex">
              <view v-if="item.arr" class="flex">
                <view v-if="orderCardDetail[item.arr[1]]" class="flex">
                  <view v-for="(k, arr_index) in item.arr" :key="arr_index" class="flex">
                    <view class="order-value-item text-hide flex">
                      <view v-if="arr_index == 1">
                        <text class="split">|</text>
                      </view>
                      {{ orderCardDetail[k] }}
                    </view>
                  </view>
                </view>
                <view v-else>{{ orderCardDetail[item.key] || '' }}</view>
              </view>
              <view v-else>{{ orderCardDetail[item.key] || '' }}</view>
            </view>
          </view>
        </view>
      </view>
      <!-- 支付方式 -->
      <view class="order-payType flex" v-if="orderCardDetail.selectPayType !== undefined && orderCardDetail.selectPayType !== null">
        <view class="payType flex align-center">
          <view class="payType-label">支付方式</view>
          <view class="payType-value flex align-center">
            {{ payType[orderCardDetail['selectPayType']] }}
            <image v-if="orderCardDetail.selectPayType == 1" class="payType-image" :src="IMG_URL + 'miniProgram/wxPay.png'" mode="" />
            <image v-if="orderCardDetail.selectPayType == 2" class="payType-image" :src="IMG_URL + 'miniProgram/store_pay.png'" mode="" />
            <image v-if="orderCardDetail.selectPayType == 3" class="payType-image" :src="IMG_URL + 'miniProgram/posPay.png'" mode="" />
          </view>
        </view>

        <view v-if="orderCardDetail.status != 1 && orderCardDetail.selectPayType != 0 && orderCardDetail.total_price != 0" class="order-price flex align-center">
          <view class="order-price-label">实付金额</view>
          <view class="price">
            <text class="unit">¥</text>
            {{ orderCardDetail.finalPrice }}
          </view>
        </view>
      </view>
    </view>
    <!-- 施工技师 -->
    <view class="construction-staff flex" v-if="orderCardDetail && orderCardDetail.constructionFlag == 'Y'">
      <view class="staff-label">施工技师</view>
      <view class="staff-value">{{ orderCardDetail.technicianName }}</view>
    </view>
    <PublishPopup ref="recordOrderPopup" popupClass="recordOrderPopup" type="center" :showClose="true" :isMaskClick="false" title="请选择录单入口">
      <template #content>
        <view class="modatcontent">
          <view class="modalbox com" :class="selectType == 1 ? 'act' : ''" @click="changeType(1)">
            <view class="sprite-icon icon-createOrder"></view>
            新增工单
          </view>
          <view class="modalbox cancle" :class="selectType == 2 ? 'act' : ''" @click="changeType(2)">
            <view class="sprite-icon icon-defeatOrder"></view>
            战败下单
          </view>
          <view v-if="isSettingExpiredTraffic && !isScan" class="modalbox cancle" :class="selectType == 3 ? 'act' : ''" @click="changeType(3)">
            <view class="sprite-icon icon-isExpiredTrafficIcon"></view>
            失效客户
          </view>
          <view class="modalbox cancle" v-if="orderCardDetail.constructionFlag !== 'Y' && orderCardDetail.selectPayType !== 1 && orderCardDetail.selectPayType !== 3 && orderCardDetail.selectPayType !== 4 && orderCardDetail.status !== 9" :class="selectType == 4 ? 'act' : ''" @click="changeType(4)">
            <view class="sprite-icon icon-revokeOrder"></view>
            撤销工单
          </view>
        </view>
      </template>
      <template #footer>
        <view class="footer-box flex justify-center">
          <view class="cancle-btn btn" @click.stop="cancelSelection">取消</view>
          <view class="sure-btn btn" @click.stop="confirmSelection">确认</view>
        </view>
      </template>
    </PublishPopup>
    <!-- 学习中心权限弹窗 -->
    <StudyPopup :show.sync="showStudyPermissionPopup" title="" :width="848" :height="870" :topImage="require('@/assets/images/common/warning-notice.webp')" :topImageWidth="848" :topImageHeight="248" style="overflow: hidden">
      <StudyCenterPermissionPopup :lockReason="lockReason" @confirm="handleStudyPermissionConfirm" />
    </StudyPopup>
  </view>
</template>
<script>
import order_mixins from '../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import utils from '@/utils/utils'
import { checkDailyReport, showNextModal } from '@/utils/modalUtils'
import PublishPopup from '@/components/PublishPopup.vue'
import StudyPopup from '@/components/StudyPopup.vue'
import StudyCenterPermissionPopup from '@/components/StudyCenterPermissionPopup.vue'
import { debounce } from 'lodash'
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
    StudyPopup,
    StudyCenterPermissionPopup
  },
  computed: {
    payType() {
      return order_mixins.data.payType || {}
    },
    status() {
      return order_mixins.data.status || {}
    },
    goodsOrderApplyStatus() {
      return order_mixins.data.goodsOrderApplyStatus || {}
    },
    orderType() {
      return order_mixins.data.orderType || {}
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
          arr: ['merchantName', 'employeeName']
        },
        {
          label: '交付人员',
          arr: ['merchantName', 'deliveryEmployeeName']
        },
        {
          label: '转化人员',
          arr: ['sellerMerchantName', 'sellerName']
        },
        {
          label: '工单编号',
          key: 'orderCode'
        },
        {
          label: '工单时间',
          key: 'orderTime'
        }
      ],
      orderObj: [
        {
          label: '场景名称',
          key: 'baseSceneName'
        },
        {
          label: '销售顾问',
          arr: ['merchantName', 'employeeName']
        },
        {
          label: '转化人员',
          arr: ['sellerMerchantName', 'sellerName']
        },
        {
          label: '工单编号',
          key: 'orderCode'
        },
        {
          label: '工单时间',
          key: 'orderTime'
        }
      ],
      localUserInfo: null,
      showStudyPermissionPopup: false,
      lockReason: ''
    }
  },
  mounted() {
    this.localUserInfo = uni.$storage.get('userInfo')
  },
  methods: {
    // 查看全部商品
    showAllGoodsList: debounce(function (e) {
      this.$emit('toggle-goods-list', {
        item: this.orderCardDetail,
        flag: !this.orderCardDetail.showAllGoodsListFlag
      })
    }, 300),
    async jumpClick(name, item) {
      // 订单状态 1 待跟进， 2 不升级， 3 待支付，4 已支付，6 已评价 ，9 已撤销 , 10 已关闭 , 11 已失效
      // constructionFlag 施工标识(Y：已施工；N||null：未施工)
      // failureFlag 订单失效状态(Y:已失效,N:未失效)
      // console.log(e.currentTarget.dataset)
      // return

      if (this.localUserInfo.merchantAccountList && this.localUserInfo.merchantAccountList.length) {
        try {
          this.localUserInfo.merchantAccountList.map(e => {
            if (e == 6 || e == 8) throw true
          })
        } catch (error) {
          this.localUserInfo.merchantType = error
        }
      }
      this.localUserInfo.isMake = !(this.localUserInfo?.isSuper || this.localUserInfo?.loginRole == 3 || this.localUserInfo?.loginRole == 5 || this.localUserInfo?.loginRole == 6 || this.localUserInfo?.loginRole == 7)
      let { userType, isSuper, merchantType, isMake } = this.localUserInfo
      console.log(item)
      if (name == 'CreateOrder' || name == 'PremiumUpgrade') {
        if (merchantType && !isSuper && isMake) {
          // 校验是否填写昨日日报
          let staffCheck = await checkDailyReport()
          if (staffCheck) return false
          // if (name == 'CreateOrder' && (await this.inspectionOfProhibitionBill())) return /**禁止提单 */
          if (name == 'CreateOrder') {
            // 提示去学习中心弹窗
            const res = await this.getLimitRecord()
            if (res.lockOrder) {
              this.showStudyPermissionPopup = true
              this.lockReason = res.lockReason
              return
            }
          }
          // 是微信支付直接跳转确认页面
          if (userType == 2 && item?.selectPayType == 1) {
            this.$emit('jump', 'ConfirmOrder', this.orderCardDetail)
          } else if (userType == 2) {
            item
              ? this.showSelectType({
                  item
                })
              : this.$emit('jump', name, { paramsData: this.orderCardDetail, type: 'createWithPay' })
          } else {
            utils.showNoAccess()
          }
        } else {
          utils.showNoAccess()
        }
        // 已支付加已施工
      } else if (item.constructionFlag == 'Y' && item.status != 10) {
        this.$emit('jump', name, this.orderCardDetail)
      } else {
        this.$emit('jump', name, this.orderCardDetail)
      }
    },
    // 确定是否要显示
    showSelectType({ scene = '', item = {} }, scan = false) {
      this.isScan = scan
      // 当切换门店后，不支持录入失效客户工单，将selectType置为1录入工单
      if ((!this.isSettingExpiredTraffic || scan) && this.selectType == 3) {
        this.selectType = 1
      }
      this.getCreateOrderSetting()
      this.$nextTick(() => {
        if (this.$refs.recordOrderPopup) {
          this.$refs.recordOrderPopup.open()
        } else {
          console.error('recordOrderPopup ref is not available')
        }
      })
    },

    // 获取轻改录单配置是否启用流量失效
    getCreateOrderSetting() {
      let merchantType = this.localUserInfo?.merchantAccountList.includes('6') || this.localUserInfo?.merchantAccountList.includes('8')
      if (merchantType && !this.localUserInfo?.isSuper && this.localUserInfo?.loginRole != 3 && this.localUserInfo?.userType == 2 && this.localUserInfo?.shopMerchantId) {
        uni.$api.boutiqueApi.getServiceBaseInfo({ merchantId: this.localUserInfo?.shopMerchantId }).then(res => {
          this.isSettingExpiredTraffic = res?.trafficExpireFlag == 'Y'
        })
      }
    },
    changeType: debounce(function (type) {
      this.selectType = type
    }, 300),
    confirmSelection: debounce(async function () {
      this.$refs.recordOrderPopup.closePopup()
      console.log('this.selectType', this.selectType)
      if (this.selectType == 1) {
        // if (await this.inspectionOfProhibitionBill()) return
        // 提示去学习中心弹窗
        const res = await this.getLimitRecord()
        if (res.lockOrder) {
          this.showStudyPermissionPopup = true
          this.lockReason = res.lockReason
          return
        }
        this.$emit('jump', 'CreateOrder', { paramsData: this.orderCardDetail, type: 'createWithPay' })
      } else if (this.selectType == 2 || this.selectType == 3) {
        this.$emit('jump', 'DefeatOrder', { paramsData: this.orderCardDetail, type: 'createWithPay', isExpiredTraffic: this.selectType == 3 })
      } else if (this.selectType == 4) {
        let _this = this
        uni.$api.boutiqueApi
          .revokeOrder({
            orderCode: this.orderCardDetail.orderCode
          })
          .then(data => {
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            })
            this.$emit('refresh')
          })
      }
    }, 300),
    cancelSelection() {
      this.$refs.recordOrderPopup.closePopup()
    },
    cardClick: debounce(function () {
      this.jumpClick(this.orderCardDetail.status == 3 ? 'ConfirmOrder' : this.orderCardDetail.status == 1 ? 'CreateOrder' : 'OrderDetail', this.orderCardDetail)
    }, 300),
    // 跳转学习中心
    handleStudyPermissionConfirm() {
      this.showStudyPermissionPopup = false
      if (this.lockReason == '2') {
        uni.navigateTo({ url: '/pages/common/serviceDetail/index?moduleType=9' })
        return
      }
      uni.navigateBack({
        success: () => {
          setTimeout(() => {
            uni.$emit('studyCenter')
          }, 100)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
// Popup样式
::v-deep .recordOrderPopup .uni-popup__wrapper {
  position: relative;
  border-radius: toRpx(32);
  opacity: 1;
  width: toRpx(848);
  height: toRpx(968);
  background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
  .popup-top-box {
    text-align: left;
    padding: toRpx(48) toRpx(64);
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
.errorTips {
  color: #eb4e4e;
  font-size: toRpx(24);
  font-weight: 400;
  margin-left: toRpx(16);
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
      // padding-left: toRpx(20);
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
  }

  .order-value {
    font-size: toRpx(24);
    color: #666666;
    font-weight: 400;
    .split {
      margin: 0 toRpx(6);
    }
  }
}

/* 支付方式相关样式 */
.payType {
  width: 50%;
  padding: toRpx(10) toRpx(20) toRpx(10) 0;
  box-sizing: border-box;
  .payType-label {
    width: toRpx(120);
    margin-right: toRpx(24);
    font-size: toRpx(24);
    color: #999ea8;
    font-weight: 400;
  }

  .payType-value {
    font-size: toRpx(24);
    color: #666666;
    font-weight: 400;
  }
}

.order-price {
  padding: toRpx(10) toRpx(20) toRpx(10) 0;
  box-sizing: border-box;
  padding-right: 0;
  padding-left: toRpx(20);
  .order-price-label {
    width: toRpx(120);
    margin-right: toRpx(24);
    font-size: toRpx(24);
    font-weight: 400;
    color: #999ea8;
  }

  .price {
    display: flex;
    align-items: center;
    color: #4673ff;
    font-size: toRpx(36);
    font-weight: 700;
  }
}

.payType-image {
  width: toRpx(32);
  height: toRpx(32);
  margin-left: toRpx(10);
}

.unit {
  margin-right: toRpx(8);
  font-size: toRpx(28);
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
</style>
