<template>
  <view class="evaluation-form-list">
    <view class="nav-bar">
      <view class="back" @click.stop="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">评估单管理</view>
    </view>
    <view class="detail-content">
      <searchBox ref="searchBox" @search="searchClick" @reset="reset" :searchValue.sync="searchValue" />
      <view class="box-class mt-32">
        <type-tab-component :typeList="typeList" :isShowCount="true" :tabIndex.sync="tabIndex" @tabClick="search"></type-tab-component>
        <z-paging ref="paging" :fixed="false" paging-class="paging-class" :class="tabIndex == 0 ? 'no-br' : tabIndex == typeList.length - 1 ? 'no-br1' : ''" :loading-full-fixed="false" :auto-show-system-loading="true" :show-scrollbar="false" v-model="dataList" @query="queryList" :default-page-size="10">
          <template #empty>
            <view class="mask-box flex flex-col justify-center align-center">
              <image class="noDataImg" :src="noData" />
              <view>暂无客户工单</view>
            </view>
          </template>
          <EvaluationCard @button-click="handleButtonClick" v-for="(item, index) in dataList" :key="index" :carInfo="item" @refresh="search()" :class="{ 'mb-40': index < dataList.length - 1 }"></EvaluationCard>
        </z-paging>
      </view>
    </view>
    <view class="addBtn" @click.stop="addEvaluationForm({ type: 'add' })">
      <view class="sprite-icon icon-addEvaluationFrom"></view>
    </view>
    <GeneralPopup ref="requotePopup" popupClass="requotePopup" title="重新报价" confirmText="申请重新报价" type="center" :showClose="true" :isShowCancel="false" :autoClose="false" @confirm="confirmRequote">
      <template #content>
        <view class="requote-content">
          <view class="requote-label mb-24">
            客户意向报价
            <text class="requiredLabel">*</text>
          </view>
          <view class="flex align-center intention-input-cell mb-48">
            <input class="flex-1" min="1" type="number" maxlength="6" placeholder="请输入" :value="requoteObj.customerTargetPrice" @input="handlePriceInput" />
            <text>元</text>
          </view>

          <view class="requote-label mb-24">
            客户报价反馈
            <text class="requiredLabel">*</text>
          </view>
          <textarea class="feedback-textarea" placeholder-style="color:#999999" placeholder="请输入 (200字以内)" maxlength="200" v-model="requoteObj.customerTargetPriceFeedback" />
        </view>
      </template>
    </GeneralPopup>
    <GeneralPopup ref="cancleSignPopup" popupClass="cancleSignPopup" title="取消签约" confirmText="取消签约" type="center" :showClose="true" :isShowCancel="false" @confirm="confirmCancleSign" :autoClose="false">
      <template #content>
        <view class="requote-content">
          <view class="requote-label mb-24">
            取消签约原因
            <text class="requiredLabel">*</text>
          </view>
          <textarea class="feedback-textarea" placeholder-style="color:#999999" v-model="cancelSignObj.cancelReason" placeholder="请输入 (100字以内)" maxlength="100" />
        </view>
      </template>
    </GeneralPopup>
    <GeneralPopup ref="signAgreementPopup" popupClass="signAgreementPopup" title="代保管协议" confirmText="发送" type="center" :showClose="true" :isShowCancel="false" @confirm="confirmSignAgreement" :autoClose="false">
      <template #content>
        <view class="signAgreement-content">
          <view class="signAgreement-label mb-24">
            选择车辆代保管人员签署《车辆代保管协议》
            <text class="requiredLabel">*</text>
          </view>
          <view class="flex align-center">
            <view class="flex align-center from-value" @click.stop="showsignAgreementPopup">
              <template v-if="signAgreementObj.custodianName">
                {{ signAgreementObj.custodianName + ' | ' + signAgreementObj.custodianPhone }}
              </template>
              <template v-else>
                <span class="placeholder">请选择</span>
              </template>
              <view class="sprite-icon icon-icon-select"></view>
            </view>
            <view class="btn" @click.stop="addSignAgreement">新增</view>
          </view>
        </view>
      </template>
    </GeneralPopup>
    <GeneralPopup ref="addSignAgreementPopup" popupClass="requotePopup" title="新增保管人" confirmText="新增" type="center" :showClose="true" @confirm="confirmAddSignAgreement" :autoClose="false">
      <template #content>
        <view class="requote-content">
          <view class="requote-label mb-24">
            签约保管人
            <text class="requiredLabel">*</text>
          </view>
          <input class="intention-input mb-48" placeholder="请输入" v-model="addSignAgreementObj.custodianName" maxlength="20" />
          <view class="requote-label mb-24">
            身份证号
            <text class="requiredLabel">*</text>
          </view>
          <input class="intention-input mb-48" placeholder="请输入18位身份证号" :value="addSignAgreementObj.custodianIdentityCode" maxlength="18" @input="validateIdCard" type="text" />
          <view class="requote-label mb-24">
            手机号
            <text class="requiredLabel">*</text>
          </view>
          <input class="intention-input mb-48" type="number" maxlength="11" placeholder="请输入" v-model="addSignAgreementObj.custodianPhone" />
          <view class="requote-label mb-24">
            地址
            <text class="requiredLabel">*</text>
          </view>
          <input class="intention-input mb-48" placeholder="请输入" maxlength="52" v-model="addSignAgreementObj.custodianAddress" />
        </view>
      </template>
    </GeneralPopup>
    <GeneralPopup ref="amountRequestedPopup" popupClass="amountRequested" :title="amountRequestedPopupTitle" :confirmText="payPopupObj.paymentType == 1 && payPopupObj.status != 40 ? '款项申请' : '款项申请'" type="center" :showClose="true" :isShowCancel="false" @confirm="confirmAmountRequested">
      <template #content>
        <view class="amount-requested-content">
          <view class="amount-box flex align-center">
            <text class="amount-title">{{ payPopupObj.paymentType == 2 ? '全款' : payPopupObj.paymentType == 1 && payPopupObj.status == 30 ? '定金' : '尾款' }}金额</text>
            <text class="amount-value">{{ payPopupObj.paymentType == 2 ? payPopupObj.evalPrice : payPopupObj.paymentType == 1 && payPopupObj.status == 30 ? payPopupObj.depositPrice : payPopupObj.finalPrice }}元</text>
          </view>
          <view class="flex align-center mt-28 mb-16" v-if="payPopupObj.paymentType == 1">
            <text class="popup-cell-title light-title">{{ payPopupObj.status == 30 ? '待支付尾款' : '已支付定金' }}</text>
            <text class="popup-cell-value light-value">{{ payPopupObj.status == 30 ? payPopupObj.finalPrice : payPopupObj.depositPrice }}元</text>
          </view>
          <view class="flex align-center mb-40" :class="payPopupObj.paymentType == 2 ? 'mt-28' : ''">
            <text class="popup-cell-title">评估价</text>
            <text class="popup-cell-value">{{ payPopupObj.evalPrice }}元</text>
          </view>
          <view class="flex align-center mb-16">
            <text class="popup-cell-title">收款人姓名</text>
            <text class="popup-cell-value">{{ payPopupObj.payeeName }}</text>
          </view>
          <view class="flex align-center mb-16">
            <text class="popup-cell-title">银行账号</text>
            <text class="popup-cell-value">{{ payPopupObj.bankCardNumber }}</text>
          </view>
          <view class="flex align-center mb-16">
            <text class="popup-cell-title">开户行</text>
            <text class="popup-cell-value">{{ payPopupObj.bankOfDeposit }}</text>
          </view>
          <view class="flex align-center mb-16">
            <text class="popup-cell-title">回单摘要</text>
            <text class="popup-cell-value">{{ payPopupObj.returnSummaryRemark }}</text>
          </view>
          <view class="flex align-center">
            <text class="popup-cell-title">付款方式</text>
            <radio-group class="radio-group flex align-center" @change="e => radioChange(e)">
              <label class="uni-list-cell uni-list-cell-pd align-center flex mr-16" v-for="(item, index) in paymentMethodRadioList" :key="item.value">
                <radio style="transform: scale(0.6)" :value="item.value" :checked="index === currentRadio" />
                <view class="radio-name">{{ item.name }}</view>
              </label>
            </radio-group>
          </view>
        </view>
      </template>
    </GeneralPopup>
    <GeneralPopup ref="tipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false" :noTitle="true">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">重要提示</view>
          <view class="tipsConent">
            <view>是否确定取消签约？</view>
          </view>
        </view>
      </template>
    </GeneralPopup>
    <NoticePopup ref="notice" title="重要提示" text="确定要撤回合同吗？" type="warning"></NoticePopup>
    <OrderPopup ref="orderPopup" :data="custodyAgreementObj" :isDefeatOrder="true" :externalData="[]" @onConfirm="onConfirm" :popupType="14" idKey="id" />
  </view>
</template>

<script>
import ButtonModule from './components/ButtonModule.vue'
import searchBox from './components/searchBox.vue'
import TypeTabComponent from './components/TypeTabComponent.vue'
import EvaluationCard from './components/evaluationCard.vue'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import GeneralPopup from './components/GeneralPopup.vue'
import OrderPopup from '@/components/OrderPopup/index.vue'
import NoticePopup from '@/components/NoticePopup.vue'
export default {
  name: 'EvaluationFormList',
  mixins: [ZPMixin],
  components: {
    ButtonModule,
    searchBox,
    TypeTabComponent,
    EvaluationCard,
    GeneralPopup,
    OrderPopup,
    NoticePopup
  },
  data() {
    return {
      bg: require('@/assets/images/boutique/tipsPopupBg.webp'),
      noData: require('@/assets/images/evaluationForm/noData.webp'),
      tabIndex: 0,
      currentPage: 1,
      amountRequestedPopupTitle: '',
      custodyAgreementList: [],
      custodyAgreementObj: {},
      requoteObj: {
        customerTargetPrice: '',
        customerTargetPriceFeedback: '',
        evalOrderNo: ''
      },
      cancelSignObj: {
        cancelReason: '',
        evalOrderNo: ''
      },
      payPopupObj: {
        depositPrice: '',
        evalOrderNo: '',
        finalPrice: '',
        evalPriceDisplay: '',
        evalPrice: '',
        paymentType: '',
        status: '',
        paymentMethod: 1,
        returnSummaryRemark: '',
      },
      signAgreementObj: {
        evalOrderNo: '',
        custodianName: '',
        custodianIdentityCode: '',
        custodianAddress: '',
        custodianPhone: ''
      },
      addSignAgreementObj: {
        custodianIdentityCode: '',
        custodianPhone: '',
        custodianAddress: '',
        custodianName: ''
      },
      searchValue: {
        previousOwnerName: '',
        previousOwnerPhone: '',
        licensePlate: '',
        evalOrderNo: ''
      },
      typeList: [
        { tabName: '全部', count: 0, keyNum: 'allNum', key: '' },
        { tabName: '评估中', count: 0, keyNum: 'evaluatingNum', key: '10' },
        { tabName: '已报价', count: 0, keyNum: 'quotedNum', key: '20' },
        { tabName: '已签约', count: 0, keyNum: 'signedNum', key: '30' },
        { tabName: '已支付-定金', count: 0, keyNum: 'depositPaidNum', key: '40' },
        { tabName: '已签署确认单', count: 0, keyNum: 'signedDeliveryConfirmNum', key: '31' },
        { tabName: '已签署协议', count: 0, keyNum: 'signedCustodyAgreementNum', key: '32' },
        { tabName: '已完成', count: 0, keyNum: 'completedNum', key: '100' },
        { tabName: '已驳回', count: 0, keyNum: 'rejectedNum', key: '-1' }
      ],
      dataList: [
        { name: '1', count: 1, previousStatus: '10', subStatus: '', paymentType: '1' },
        { name: '2', count: 1, previousStatus: '20', subStatus: '', paymentType: '1' },
        { name: '3', count: 1, previousStatus: '30', subStatus: '', paymentType: '1' },
        { name: '4', count: 1, previousStatus: '40', subStatus: '', paymentType: '1' },
        { name: '5', count: 1, previousStatus: '50', subStatus: '', paymentType: '1' },
        { name: '6', count: 1, previousStatus: '-1', subStatus: '', paymentType: '1' }
      ],
      paymentMethodRadioList: [
        { name: '银行转账', value: 1 },
        { name: '冲账', value: 2 }
      ],
      currentRadio: 0,
      signAgreementObjDetail: null
    }
  },
  mounted() {
    uni.$track.add({ eventCode: 'app_evaluation_from' })
    this.getStatByStatus()
  },
  methods: {
    jumpToDetails(type) {
      this.$emit('jump', type)
    },
    backPage() {
      uni.navigateBack()
    },
    searchClick() {
      this.tabIndex = 0
      this.search()
    },
    search() {
      console.log(this.searchValue, '32323')

      this.$refs.paging?.reload()
      // this.getStatByStatus()
    },
    onShow() {
      this.search()
    },
    reset() {
      this.searchValue = {
        previousOwnerName: '',
        previousOwnerPhone: '',
        licensePlate: '',
        evalOrderNo: ''
      }
      this.tabIndex = 0
      this.search()
    },
    async queryList(pageNo, pageSize) {
      if (pageNo == 1) {
        this.getStatByStatus()
      }
      const userInfo = uni.$storage.get('userInfo'),
        { shopMerchantId } = userInfo
      const res = await uni.$api.evaluationApi.evalOrderList({
        t: { ...this.searchValue, status: this.typeList[this.tabIndex].key, sellerMerchantId: shopMerchantId },
        currentPage: pageNo,
        pageSize: 10
      })
      if (res.data.code == 0) {
        console.log('res:', res)
        // this.dataList = res.records
        this.$refs.paging.complete(res.data.data.records)
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
        this.$refs.paging.complete(false)
        console.log(err)
      }
    },
    getStatByStatus() {
      const userInfo = uni.$storage.get('userInfo'),
        { shopMerchantId } = userInfo
      uni.$api.evaluationApi
        .evalOrderPageCount({
          conversionUserId: '',
          ...this.searchValue,
          sellerMerchantId: shopMerchantId
        })
        .then(res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            this.typeList.forEach(item => {
              item.count = res.data.data[item.keyNum] || 0
            })
            // this.$set(this.typeList, item.count, res[item.keyNum])
            console.log('this.typeList:', this.typeList)
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        })
    },
    validateIdCard(e) {
      // 从事件对象中获取输入值，处理不同环境下的兼容性
      let value = e.target ? e.target.value : e.detail ? e.detail.value : ''
      // 移除非数字和字母的字符
      value = value.replace(/[^a-zA-Z0-9]/g, '')
      // 限制长度为18位
      if (value.length > 18) {
        value = value.slice(0, 18)
      }
      // 使用this.$set确保响应式更新
      this.$set(this.addSignAgreementObj, 'custodianIdentityCode', value)
    },
    handlePriceInput(e) {
      console.log(e)
      const rawValue = e.target ? e.target.value : e.detail.value
      const numericValue = rawValue.replace(/[^0-9]/g, '')

      // 检查是否只是单个0，如果是则设为空字符串
      const value = numericValue === '0' ? '1' : numericValue
      console.log('value:', value)
      this.$set(this.requoteObj, 'customerTargetPrice', value)
    },
    addEvaluationForm(e) {
      console.log('addEvaluationForm', e.type)
      uni.navigateTo({
        url: '/pages/evaluationForm/addEvaluationFrom?type=' + e.type + '&evalOrderNo=' + e.evalOrderNo
      })
    },
    handleButtonClick(e) {
      console.log('handleButtonClick', e)
      if (e.type === 'requote') {
        this.requote(e)
      } else if (e.type === 'cancelSign') {
        this.cancelSign(e)
      } else if (e.type === 'sign') {
        this.sign(e)
      } else if (e.type === 'confirmDelivery') {
        this.confirmDelivery(e)
      } else if (e.type === 'edit') {
        this.addEvaluationForm(e)
      } else if (e.type === 'add') {
        this.addEvaluationForm(e)
      } else if (e.type === 'payDeposit') {
        this.amountRequested(e)
        this.amountRequestedPopupTitle = '申请定金支付'
      } else if (e.type === 'payFull') {
        console.log('payFull', e)
        this.amountRequested(e)
        this.amountRequestedPopupTitle = e.status == 32 && e.paymentType == 1 ? '申请尾款支付' : '申请全款支付'
      } else if (e.type === 'details') {
        this.jumpToDetails(e)
      } else if (e.type === 'reSubmit') {
        this.reSubmit(e)
      } else if (e.type === 'signAgreement') {
        this.signAgreement(e)
      } else if (e.type === 'withdrawal') {
        this.withdrawal(e)
      }
    },
    async withdrawal(e) {
      this.$refs.notice.buttonsList = [
        {
          text: '取消',
          type: 'default',
          callback: () => {
            this.$refs.notice.close()
          }
        },
        {
          text: '确定',
          type: 'primary',
          callback: async () => {
            uni.showLoading()
            const res = await uni.$api.evaluationApi.revokeSaleContract({
              saleContractNo: e.saleContractNo
            })
            console.log('res:', res)
            if (res.data.code == 0) {
              this.$refs.notice.close()
              uni.hideLoading()
              uni.showToast({
                title: '撤回合同成功',
                icon: 'none'
              })
              setTimeout(() => {
                this.currentPage = 1
                this.search()
              }, 1000)
            } else {
              this.$refs.notice.close()
              uni.hideLoading()
              uni.showToast({
                title: res.data.msg || '请求失败',
                icon: 'none'
              })
            }
          }
        }
      ]

      // 打开弹窗
      this.$refs.notice.open()
    },

    async reSubmit(e) {
      uni.showLoading()
      const res = await uni.$api.evaluationApi.evalOrderConfirmVehicleDelivery({
        evalOrderNo: e.evalOrderNo
      })
      console.log('res:', res)
      if (res.data.code == 0) {
        uni.hideLoading()
        uni.showToast({
          title: res.data.data,
          icon: 'none',
          duration: 3000
        })
        setTimeout(() => {
          this.currentPage = 1
          this.search()
        }, 1000)
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    jumpToDetails(e) {
      uni.navigateTo({
        url: '/pages/evaluationForm/evaluationFormDetails?evalOrderNo=' + e.evalOrderNo
      })
    },
    async amountRequested(e) {
      this.payPopupObj.paymentMethod = 1
      const that = this
      uni.showLoading()
      const res = await uni.$api.evaluationApi.getContractDetail({
        contractNo: e.saleContractNo
      })

      if (res.data.code == 0) {
        uni.hideLoading()
        const contractDetail = res.data.data
        console.log('res:', contractDetail)
        this.payPopupObj = { ...that.payPopupObj, ...JSON.parse(contractDetail.electronicContractField), ...e }
        that.$refs.amountRequestedPopup.open()
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    async confirmAmountRequested() {
      const that = this
      if (this.payPopupObj.type == 'payDeposit') {
        uni.showLoading()
        const res = await uni.$api.evaluationApi.payDepositApplication({
          evalOrderNo: this.payPopupObj.evalOrderNo,
          paymentMethod: this.payPopupObj.paymentMethod
        })
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: '定金已申请，请等待付款审批',
            icon: 'none'
          })
          setTimeout(() => {
            that.currentPage = 1
            that.search()
          }, 1000)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      } else {
        uni.showLoading()
        const res = await uni.$api.evaluationApi.signAgreement({
          evalOrderNo: this.payPopupObj.evalOrderNo,
          paymentMethod: this.payPopupObj.paymentMethod
        })
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: this.payPopupObj.status == 32 && this.payPopupObj.paymentType == 1 ? '尾款已申请，请等待付款审批' : '全款已申请，请等待付款审批',
            icon: 'none'
          })
          setTimeout(() => {
            that.currentPage = 1
            that.search()
          }, 1000)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      }
    },
    async confirmSignAgreement() {
      const that = this
      if (!that.signAgreementObj.custodianName) {
        uni.showToast({
          title: '请选择代保管人',
          icon: 'none'
        })
        return
      }
      uni.showLoading()
      uni.$api.evaluationApi.sendCustodyAgreement({ ...that.signAgreementObj, evalOrderNo: this.signAgreementObjDetail.evalOrderNo }).then(res => {
        console.log(res, 'res')
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: '电子签约已发送，请注意查收短信',
            icon: 'none'
          })
          // uni.showToast({
          //   title: this.payPopupObj.status == 40 && this.payPopupObj.paymentType == 1 ? '尾款款项已申请，完成代保管协议电子签约后将安排支付尾款' : '全款款项已申请，完成代保管协议电子签约后将安排支付全款',
          //   icon: 'none'
          // })
          this.$refs.signAgreementPopup.closePopup()
          setTimeout(() => {
            that.currentPage = 1
            that.search()
          }, 1000)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      })
    },
    confirmDelivery(e) {
      uni.navigateTo({
        url: '/pages/evaluationForm/confirmCar?evalOrderNo=' + e.evalOrderNo
      })
    },
    sign(e) {
      uni.navigateTo({
        url: '/pages/evaluationForm/signInfo?evalOrderNo=' + e.evalOrderNo + '&evalPrice=' + e.evalPrice
      })
    },
    requote(e) {
      const that = this
      this.requoteObj.evalOrderNo = e.evalOrderNo
      this.requoteObj.customerTargetPrice = ''
      this.requoteObj.customerTargetPriceFeedback = ''
      this.$refs.requotePopup.open()
    },
    async confirmRequote() {
      const that = this
      console.log('that.requoteObj:', that.requoteObj)
      if (that.requoteObj.customerTargetPriceFeedback.length == 0) {
        uni.showToast({
          title: '请输入客户意向报价反馈',
          icon: 'none'
        })
        return
      }
      if (!that.requoteObj.customerTargetPrice) {
        uni.showToast({
          title: '请输入客户意向报价',
          icon: 'none'
        })
        return
      }
      const res = await uni.$api.evaluationApi.evalOrderOwnerReQuote(this.requoteObj)
      console.log('res:', res)
      if (res.data.code == 0) {
        uni.showToast({
          title: '重新报价已提交，请等待报价更新',
          icon: 'none',
          duration: 3000
        })
        this.$refs.requotePopup.closePopup()
        setTimeout(() => {
          this.currentPage = 1
          this.search()
        }, 1000)
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    confirmCancleSign() {
      if (!this.cancelSignObj.cancelReason) {
        uni.showToast({
          title: '请输入取消签约原因',
          icon: 'none'
        })
        return
      }
      this.$refs.tipsPopup
        .open()
        .then(async () => {
          uni.showLoading()
          const res = await uni.$api.evaluationApi.evalOrderCancelContract(this.cancelSignObj)
          console.log('res:', res)
          if (res.data.code == 0) {
            uni.hideLoading()
            this.cancelSignObj.cancelReason = ''
            uni.showToast({
              title: '取消签约成功',
              icon: 'none'
            })
            this.$refs.cancleSignPopup.closePopup()
            setTimeout(() => {
              this.currentPage = 1
              this.search()
            }, 1000)
          } else {
            // this.cancelSignObj.cancelReason = ''
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        })
        .catch(() => {
          // this.cancelSignObj.cancelReason = ''
          // this.$refs.cancleSignPopup.closePopup()
        })
    },
    signAgreement(e) {
      this.signAgreementObjDetail = e
      const that = this
      uni.showLoading()
      uni.$api.evaluationApi
        .checkSignAgreement({
          evalOrderNo: e.evalOrderNo
        })
        .then(async res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            uni.hideLoading()
            console.log('res.data.data:', res.data.data)
            if (!res.data.data) {
              this.signAgreementObj = {
                evalOrderNo: '',
                custodianName: '',
                custodianIdentityCode: '',
                custodianAddress: '',
                custodianPhone: ''
              }
              // that.addSignAgreementObj.evalOrderNo = e.evalOrderNo
              that.$refs.signAgreementPopup.open()
            } else {
            }
          }
        })
    },
    cancelSign(e) {
      this.cancelSignObj.evalOrderNo = e.evalOrderNo
      this.$refs.cancleSignPopup.open()
    },
    async showsignAgreementPopup() {
      this.$refs.orderPopup.open()
    },
    async addSignAgreement() {
      this.addSignAgreementObj = {
        custodianIdentityCode: '',
        custodianPhone: '',
        custodianAddress: '',
        custodianName: ''
      }
      this.$refs.addSignAgreementPopup.open()
    },
    async confirmAddSignAgreement() {
      if (!this.addSignAgreementObj.custodianName) {
        uni.showToast({ title: '请输入签约保管人', icon: 'none' })
        return
      }
      if (!this.addSignAgreementObj.custodianIdentityCode) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' })
        return
      }

      if (!this.addSignAgreementObj.custodianPhone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      if (this.addSignAgreementObj.custodianPhone.length != 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (!this.addSignAgreementObj.custodianAddress) {
        uni.showToast({ title: '请输入地址', icon: 'none' })
        return
      }
      uni.showLoading()
      uni.$api.evaluationApi.addCustodyAgreement(this.addSignAgreementObj).then(async res => {
        if (res.data.code == 0) {
          uni.hideLoading()
          console.log('res:', res)
          this.$refs.addSignAgreementPopup.closePopup()
          const res = await uni.$api.evaluationApi.getCustodyAgreementList()
          if (res.data.code == 0) {
            this.signAgreementObj.custodianName = res.data.data[0].name
            this.signAgreementObj.custodianPhone = res.data.data[0].phone
            this.signAgreementObj.custodianIdentityCode = res.data.data[0].idCard
            this.signAgreementObj.custodianAddress = res.data.data[0].address
            this.custodyAgreementObj = res.data.data[0]
          }
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      })
    },
    onConfirm(e) {
      this.custodyAgreementObj = e.chooseContent
      this.signAgreementObj = { custodianName: e.chooseContent.name, custodianIdentityCode: e.chooseContent.idCard, custodianPhone: e.chooseContent.phone, custodianAddress: e.chooseContent.address }
      console.log('this.signAgreementObj:', this.signAgreementObj)
    },
    radioChange(value) {
      console.log('radioChange', value)
      this.payPopupObj.paymentMethod = Number(value.detail.value)
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .tipsPopup .uni-popup__wrapper {
  width: toRpx(848);

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
    text-align: center;

    text {
      color: #347bff;
    }
  }

  .footer-box {
    height: toRpx(154);
  }
}

.evaluation-form-list {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  padding: toRpx(160) toRpx(64) toRpx(48);
  box-sizing: border-box;

  .detail-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;

    .box-class {
      height: calc(100% - #{toRpx(110)});
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      overflow: hidden;

      .paging-class {
        background-color: #fff;
        height: calc(100% - #{toRpx(96)});
        box-sizing: border-box;
        border-radius: toRpx(32);
      }

      .no-br {
        border-radius: 0 toRpx(32) toRpx(32) toRpx(32);
      }

      .no-br1 {
        border-radius: toRpx(32) 0 toRpx(32) toRpx(32);
      }

      .mask-box {
        height: calc(100% - #{toRpx(96)});
        width: 100%;
        background: #fff;
        border-radius: toRpx(48);
        color: #808291;

        .noDataImg {
          width: toRpx(480);
          height: toRpx(240);
        }
      }
    }
  }

  .signAgreement-content {
    width: 100%;
    height: 100%;

    .signAgreement-label {
      color: #999999;
      font-size: toRpx(28);
      font-weight: 400;
      display: flex;
      align-items: flex-start;
    }

    .requiredLabel {
      color: #f24724;
      font-size: toRpx(28);
      font-weight: 400;
      margin-left: toRpx(8);
    }

    .from-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: toRpx(96);
      border-radius: toRpx(16);
      background: #f4f5f7;
      padding: toRpx(28) toRpx(24);
      flex: 1;

      .sprite-icon {
        margin-bottom: toRpx(2);
      }
    }

    .btn {
      color: #3b73ff;
      font-size: toRpx(28);
      font-weight: 400;
      margin-left: toRpx(24);
    }

    .placeholder {
      color: #999;
      font-size: toRpx(28);
      line-height: toRpx(32);
    }

    input {
      flex: 1;
      height: toRpx(40);
      font-size: toRpx(28);
      color: #333333;
      padding: 0;
      text-align: right;
    }
  }

  .requote-content {
    width: 100%;
    height: 100%;

    .requote-label {
      color: #333333;
      font-size: toRpx(32);
      font-weight: 400;
      display: flex;
      align-items: flex-start;
    }

    .requiredLabel {
      color: #f24724;
      font-size: toRpx(28);
      font-weight: 400;
      margin-left: toRpx(8);
    }

    ::v-deep .intention-input {
      height: toRpx(96);
      border-radius: toRpx(16);

      .uni-input-wrapper {
        background: #f4f5f7;
        padding: toRpx(24);
        box-sizing: border-box;

        .uni-input-placeholder {
          margin-left: toRpx(24);
        }
      }
    }

    .intention-input-cell {
      height: toRpx(96);
      border-radius: toRpx(16);
      background: #f4f5f7;
      padding: toRpx(24);
      box-sizing: border-box;
    }

    ::v-deep .feedback-textarea {
      height: toRpx(288);
      border-radius: toRpx(16);
      background: #f4f5f7;
      width: 100%;
      padding: toRpx(24);
      box-sizing: border-box;

      .uni-input-wrapper {
        background: #f4f5f7;
      }
    }
  }

  .amount-requested-content {
    .amount-box {
      width: 100%;
      height: toRpx(128);
      border-radius: toRpx(20);
      background: #f1f7fe;
      padding-left: toRpx(32);
      box-sizing: border-box;

      .amount-title {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 400;
        margin-right: toRpx(16);
        width: toRpx(168);
      }

      .amount-value {
        color: #3b73ff;
        font-size: toRpx(36);
        font-weight: 700;
      }
    }

    .popup-cell-title {
      color: #999;
      font-size: toRpx(28);
      font-weight: 400;
      margin-right: toRpx(16);
      width: toRpx(168);
    }

    .popup-cell-value {
      color: #222;
      font-size: toRpx(28);
      font-weight: 400;
    }

    .light-title {
      color: #333333;
    }

    .light-value {
      color: #4673ff;
    }
  }

  .addBtn {
    width: toRpx(128);
    height: toRpx(128);
    border-radius: toRpx(24);
    backdrop-filter: blur(toRpx(16));
    box-shadow: 0 toRpx(8) toRpx(32) 0 #8f9eb380;
    position: fixed;
    top: calc(50vh - #{toRpx(128)} / 2);
    right: toRpx(32);
  }
}
</style>
