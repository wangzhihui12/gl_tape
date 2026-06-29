<!--工单信息卡片-->
<template>
  <view class="order-card">
    <view class="order-card-top-box-line flex justify-between">
      <view class="flex item-center">
        <text class="mr-20">{{ orderCardDetail.customerName }} | {{ orderCardDetail.customerPhone }}</text>
      </view>
    </view>
    <view class="order-card-top-box flex justify-between">
      <view class="flex item-center order-value-single flex-shrink0 flex-1">
        <text class="mr-20 order-value-single">{{ orderCardDetail.goodName }}</text>
      </view>
      <view class="status text-center min-width0" :style="{ color: status[orderCardDetail.orderStatus].color, 'background-color': status[orderCardDetail.orderStatus].background }">
        {{ status[orderCardDetail.orderStatus].text }}
      </view>
    </view>
    <view class="order-card-bottom-box">
      <view class="item-content">
        <!-- <image class="status-icon" src="/packageEquity/images/equity-{{ item.orderStatus }}.png" /> -->
        <view class="order-list align-center" v-for="(item, sindex) in orderObj" :key="sindex">
          <view class="flex" :class="['order', orderObj.length == sindex + 1 ? '' : 'm-b-16']">
            <view class="order-label order-value-single">{{ item.label }}</view>
            <view class="order-value">
              <view v-if="item.key == 'ywly'">车损升级</view>
              <view v-else class="order-value-single">{{ orderCardDetail[item.key] || '' }}{{ item.suffix || '' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="item-footer">
      <!-- <view>{{item.createdDate}}</view> -->
      <!-- 超管isSuper/商户类型 userType 1账号不可操作 -->
      <view v-if="((!userInfo.isSuper && userInfo.userType == 2 && orderCardDetail.orderStatus != 4) || orderCardDetail.orderStatus == 2) && isOrder">
        <view class="btn_box_class">
          <view class="order-btn default-btn" @click="handleSignature">{{ orderCardDetail.customerNameUrl ? '修改客户签名' : '补录客户签名' }}</view>
          <view v-if="orderCardDetail.orderStatus == '2'" class="order-btn default-btn" @click.stop="handlePreviewContract('download')">下载合同</view>
          <view v-if="orderCardDetail.orderStatus == '2'" class="order-btn" @click.stop="handlePreviewContract()">{{ btnTxt[orderCardDetail.orderStatus] }}</view>
          <view v-else class="order-btn" @click.stop="handleRecordOrder">{{ btnTxt[orderCardDetail.orderStatus] }}</view>
        </view>
      </view>
    </view>
    <NoticePopup ref="notice" title="提示" text="是否撤销该笔客户工单，撤销后客户工单为「已撤销」状态，不再统计订单数和订单金额。" type="warning"></NoticePopup>
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
  </view>
</template>
<script>
import order_mixins from '../../order_mixins.js'
import { interceptionMixin } from '@/mixin/index'
import PublishPopup from '@/components/PublishPopup.vue'
import NoticePopup from '@/components/NoticePopup.vue'
export default {
  mixins: [interceptionMixin],
  name: 'EquityCard',
  props: {
    orderCardDetail: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    PublishPopup,
    NoticePopup
  },
  computed: {
    payType() {
      return order_mixins.data.payType || {}
    },
    status() {
      return order_mixins.data.equityStatus || {}
    }
  },
  data() {
    return {
      IMG_URL: 'https://img02.glsx.com.cn/weapp/resource/dj-car-boutique-work-wechat/',
      isSettingExpiredTraffic: false, // 是否启用流量失效
      selectType: 1,
      orderObj: [
        {
          label: '车架号',
          key: 'vin'
        },
        {
          label: '业务来源',
          key: 'ywly'
        },
        {
          label: '商品名称',
          key: 'goodName'
        },
        {
          label: '服务期限',
          key: 'serviceExpire',
          suffix: '年'
        },
        {
          label: '商品内容',
          key: 'goodServiceName'
        }
      ],
      localUserInfo: null,
      isOrder: null,
      btnTxt: {
        0: '去录单',
        2: '查看合同',
        3: '重新录单'
      },
      textareaValue: ''
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
    // 录单/重新录单
    async handleRecordOrder(e) {
      // 校验是否填写昨日日报
      if (await this.checkDailyReport()) return
      this.$emit('jump', 'CreateEquity', { contractNo: this.orderCardDetail.contractNo, type: 'CreateEquity' })
    },

    //去处理
    createorder() {
      this.$emit('jump', 'CreateOrder', { paramsData: this.orderCardDetail, type: 'CreateOrder' })
    },
    // 补录客户签名
    handleSignature() {
      this.$emit('jump', 'SignName', { paramsData: this.orderCardDetail, type: 'SignName' })
    },
    // 预览文件
    handlePreviewContract(type) {
      let params = {
        contractNo: this.orderCardDetail.contractNo
        // contractNo: 'car679883190869172224' //开发测试用
      }
      console.log(this.orderCardDetail)
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
      uni.$api.equityApi
        .equityOrderList({ orderId: this.orderCardDetail.orderId })
        .then(res => {
          if (res.length == 1) {
            uni.$api.equityApi
              .printContract(params)
              .then(res => {
                console.log(res)
                uni.hideLoading()
                const url = res.url || res
                if (type == 'download') {
                  this.handleDownload(url)
                } else {
                  const fileName = this.getFileNameFromUrl(res.url || res)
                  const type = 3
                  console.log(url, fileName, type)
                  // 跳转到预览页面
                  uni.navigateTo({
                    url: `/pages/common/filePreview?fileUrl=${encodeURIComponent(url)}&fileType=${type}&fileName=${encodeURIComponent(fileName)}`
                  })
                }
              })
              .catch(err => {
                uni.hideLoading()
              })
          } else {
            uni.hideLoading()
            this.$emit('jump', 'PreviewList', { paramsData: res, type: 'PreviewList' })
          }
        })
        .catch(err => {
          uni.hideLoading()
        })
    },
    showRefundAlert(type) {
      const text = type == 'error' ? '订单已发起退款，禁止标记为错误工单！如需标记错误请联系总部运营。' : '订单已发起退款，禁止撤销！如需撤销请联系总部运营。'
      uni.showModal({
        title: '提示',
        content: text,
        showCancel: false,
        confirmText: '好的'
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
    // 从URL获取文件名
    getFileNameFromUrl(url) {
      return url.split('/').pop().split('?')[0] || '未知文件'
    },
    getFileTypeFromUrl(url) {
      const ext = url.split('.').pop().toLowerCase()
      return ext === 'pdf' ? 'pdf' : 'image'
    },
    handleDownload(url) {
      if (!url) {
        uni.showToast({ title: '没有合同', icon: 'none' })
        return
      }
      uni.downloadFile({
        url: url,
        success: res => {
          if (res.statusCode === 200) {
            uni.showToast({ title: '保存成功', icon: 'none' })
            var filePath = res.tempFilePath
            uni.openDocument({
              filePath: filePath,
              showMenu: true,
              success: function (res) {
                console.log('打开文档成功')
              }
            })
          }
        }
      })
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
.order-card {
  padding: 0 toRpx(32);
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
  justify-content: flex-end;
  align-items: center;
  font-size: toRpx(24);
  color: #9b9b9e;
  border-top: toRpx(1) solid #ededed;
  padding: toRpx(20) 0;
}
.btn_box_class {
  display: flex;
  align-items: center;
}
.order-btn {
  box-sizing: border-box;
  height: toRpx(56);
  /* line-height: var(--fontSize56); */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: toRpx(28);
  color: #ffffff;
  background: #347bff;
  border-radius: toRpx(32);
  padding: 0 toRpx(24);
  margin-right: toRpx(16);
}
.order-btn:last-child {
  margin-right: 0;
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

.order-list {
  margin-bottom: toRpx(12);
}

.order-content {
  margin-top: var(--fontSize24);
  display: flex;
}

.order-list .good-name {
  box-sizing: border-box;
  font-weight: 500;
  font-size: var(--fontSize30);
  color: #333333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
}

.order-list .pro-bg {
  width: var(--fontSize160);
  /* height: auto; */
  height: var(--fontSize210);
  flex-shrink: 0;
  margin-right: var(--fontSize24);
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
  margin-bottom: toRpx(20);
  color: #292d33;
  font-size: toRpx(30);
  font-weight: 500;
}
.order-card-top-box-line {
  margin-bottom: toRpx(24);
  color: #666666;
  font-size: toRpx(24);
  border-bottom: toRpx(2) solid #f7f7f6;
  padding: toRpx(16) 0;
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
.flex-shrink0 {
  flex-shrink: 0;
}
.min-width0 {
  min-width: 0;
}
.order-value-single,
.order-value-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
