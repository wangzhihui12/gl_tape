<template>
  <view class="sign-info">
    <view class="nav-bar">
      <view class="back" @click.stop="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">{{ title }}</view>
    </view>
    <view class="detail-content">
      <view class="box-class mt-16" v-if="!comfirmPage">
        <view class="h2-title">电子合同模版</view>
        <view class="contract-template flex align-center justify-between">
          <view class="flex">
            <view class="title-label">
              合同模版
              <text class="requiredLabel">*</text>
            </view>
            <radio-group class="radio-group flex align-center" @change="radioChange">
              <label class="uni-list-cell uni-list-cell-pd align-center flex ml-48" v-for="(item, index) in radioList" :key="item.value">
                <radio style="transform: scale(0.7)" :value="item.value" :checked="current === index" />
                <view class="radio-name">{{ item.name }}</view>
              </label>
            </radio-group>
          </view>
          <view class="template-title flex align-center" @click.stop="pdfPreview">
            <view class="sprite-icon icon-seeIcon mr-12"></view>
            <text>合同模板</text>
          </view>
        </view>
        <view class="h2-title mt-32">签约个人信息</view>
        <view class="sign-info-box" :class="{ 'no-footerBtn': !formData.paymentType }">
          <view v-if="formData.paymentType" class="fromBox">
            <FormCell :formFields="filteredFormFields" :formData="formData" @handleCell="handleCell" @inputChange="handleInputChange" @inputInvalid="handleInputInvalid" @blurChange="blurChange" @radioChange="handleRadioChange" />
            <view class="upload-container mb-24" v-if="showIdCardUpload">
              <view class="form-item flex align-start justify-between">
                <view class="from-label">
                  身份证国徽面
                  <text class="requiredLabel">*</text>
                </view>
                <template>
                  <!-- 判断是否已上传 -->
                  <view v-if="formData.idCardFrontUrl" class="uploaded-item">
                    <image :src="getImageDisplayUrl(formData.idCardFrontUrl)" mode="aspectFit"></image>

                    <view class="delete-icon" @click.stop="removeMedia('idCardFrontUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('idCardFrontUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
              <view class="form-item flex align-start justify-between">
                <view class="from-label">
                  身份证人像面
                  <text class="requiredLabel">*</text>
                </view>
                <template>
                  <view v-if="formData.idCardBackUrl" class="uploaded-item">
                    <image :src="getImageDisplayUrl(formData.idCardBackUrl)" mode="aspectFit"></image>
                    <!-- <view class="remove-icon" @click.stop="removeMedia('idCardBackUrl')"></view> -->
                    <view class="delete-icon" @click.stop="removeMedia('idCardBackUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('idCardBackUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
            </view>
            <view class="upload-container mb-24">
              <view class="form-item flex align-start justify-between" v-if="showOrgLicenseUpload">
                <view class="from-label">
                  营业执照图片
                  <text class="requiredLabel">*</text>
                </view>
                <template>
                  <view v-if="formData.orgLicenseUrl" class="uploaded-item">
                    <image :src="getImageDisplayUrl(formData.orgLicenseUrl)" mode="aspectFit"></image>
                    <!-- <view class="remove-icon" @click.stop="removeMedia('idCardBackUrl')"></view> -->
                    <view class="delete-icon" @click.stop="removeMedia('orgLicenseUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('orgLicenseUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
              <view class="form-item flex align-start justify-between">
                <view class="from-label">
                  三方/委托交易凭证
                  <text class="requiredLabel" v-if="isThirdPartyRequired">*</text>
                </view>
                <template>
                  <!-- 判断是否已上传 -->
                  <view v-if="formData.thirdPartyTransactionVoucher" class="uploaded-item">
                    <!-- 视频显示 -->
                    <view v-if="formData.thirdPartyTransactionVoucher.includes(videoProcess)" class="video-container">
                      <image :src="formData.thirdPartyTransactionVoucher" mode="aspectFit" @click.stop="previewMedia(formData.thirdPartyTransactionVoucher, 2)"></image>
                      <view class="video-play-icon">
                        <view class="sprite-icon icon-upload-play"></view>
                      </view>
                    </view>
                    <!-- 图片显示 -->
                    <image v-else :src="getImageDisplayUrl(formData.thirdPartyTransactionVoucher)" mode="aspectFit" @click.stop="previewMedia(formData.thirdPartyTransactionVoucher, 1)"></image>

                    <view class="delete-icon" @click.stop="removeMedia('thirdPartyTransactionVoucher')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleMediaUpload('thirdPartyTransactionVoucher')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片/视频</text>
                    </view>
                  </view>
                </template>
              </view>
            </view>
            <FormCell :formFields="formFields2Base" :formData="formData" @handleCell="handleCell" @blurChange="blurChange" />
            <view class="upload-container">
              <view class="form-item flex align-start justify-between">
                <view class="from-label">身份证国徽面</view>
                <template>
                  <view v-if="formData.payerIdCardFrontUrl" class="uploaded-item">
                    <image :src="formData.payerIdCardFrontUrl" mode="aspectFit"></image>
                    <view class="delete-icon" @click.stop="removeMedia('payerIdCardFrontUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('payerIdCardFrontUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
              <view class="form-item flex align-start justify-between">
                <view class="from-label">身份证人像面</view>
                <template>
                  <view v-if="formData.payerIdCardBackUrl" class="uploaded-item">
                    <image :src="formData.payerIdCardBackUrl" mode="aspectFit"></image>
                    <view class="delete-icon" @click.stop="removeMedia('payerIdCardBackUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('payerIdCardBackUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
            </view>
            <view class="upload-container">
              <view class="form-item flex align-start justify-between">
                <view class="from-label">银行卡</view>
                <template>
                  <view v-if="formData.payerBankCardUrl" class="uploaded-item">
                    <image :src="formData.payerBankCardUrl" mode="aspectFit"></image>
                    <view class="delete-icon" @click.stop="removeMedia('payerBankCardUrl')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <view v-else class="upload-item" @click.stop="handleImageUpload('payerBankCardUrl')">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">上传图片</text>
                    </view>
                  </view>
                </template>
              </view>
              <view class="form-item return-summary-item" @click.stop="">
                <view class="return-summary-header flex align-center justify-between">
                  <view class="from-label">
                    回单摘要
                    <text class="requiredLabel" v-if="Number(formData.returnSummarySwitch) === 1">*</text>
                  </view>
                  <switch :checked="Number(formData.returnSummarySwitch) === 1" color="#4673FF" @change="onReturnSummarySwitchChange" />
                </view>
                <view v-if="Number(formData.returnSummarySwitch) === 1" class="return-summary-body">
                  <input class="return-summary-input" type="text" placeholder="请输入回单摘要" v-model="formData.returnSummaryRemark" maxlength="35" @blur="onReturnSummaryBlur" />
                </view>
              </view>
            </view>

            <view class="upload-container mb-24">
              <view class="form-item flex align-center justify-between full-width">
                <view class="from-label">
                  随车材料
                  <text class="requiredLabel">*</text>
                </view>
                <template>
                  <checkbox-group @change="checkboxChange" class="checkbox-group flex align-center">
                    <label class="uni-list-cell uni-list-cell-pd align-center flex ml-48 mb-16" v-for="item in checkboxList" :key="item.value">
                      <view>
                        <checkbox class="sign-checkbox" style="transform: scale(0.7)" activeBackgroundColor="#4673FF" iconColor="#fff" :value="item.value" :checked="item.checked" :disabled="item.disabled" />
                      </view>
                      <view class="checkbox-name">{{ item.name }}</view>
                      <input class="checkbox-input" @click.stop="" v-if="item.isShowInput && item.key != 'other'" v-model="formData[item.inputValue]" placeholder="请输入" type="number" maxlength="1" :disabled="!item.checked" />
                      <input class="checkbox-input" @click.stop="" v-if="item.isShowInput && item.key == 'other'" v-model="formData[item.inputValue]" placeholder="请输入" maxlength="28" @blur="e => handleBlur(e, item)" :disabled="!item.checked" />
                    </label>
                  </checkbox-group>
                </template>
              </view>
            </view>
            <FormCell :formFields="formFields1" :formData="formData" @handleCell="handleCell" @location="location" class="mb-24" />
            <FormCell :formFields="formFields3" :formData="formData" @handleCell="handleCell" />
          </view>
          <view v-else class="flex flex-col align-center justify-center no-data">
            <image :src="noDataBg" class="no-data-bg" />
            <view>请先选择合同，签约个人信息自动带出</view>
          </view>
        </view>
        <view class="footerBtn" v-if="formData.paymentType">
          <view class="btn cancle" @click.stop="backPage">取消</view>
          <view class="btn next" @click.stop="nextPage">下一步</view>
        </view>
      </view>
      <view class="box-class1 mt-16" v-else>
        <view class="gridBox mb-32">
          <view class="flex align-center">
            <view class="title-label-see mr-16">合同模版</view>
            <view>{{ formData.paymentType == 1 ? '二手车转让协议（定金+尾款）' : '二手车转让协议（全款）' }}</view>
          </view>
        </view>
        <view class="flex align-center gridBox mb-32">
          <view class="flex align-center">
            <view class="title-label-see mr-16">
              {{ formData.paymentType == 1 ? '定金金额' : '全款金额' }}
            </view>
            <view>
              {{ formData.paymentType == 1 ? formData.depositPrice : formData.fullPrice }}
              <text>元</text>
            </view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">评估价</view>
            <view>
              {{ formData.fullPrice }}
              <text>元</text>
            </view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">签署人类型</view>
            <view>{{ formData.signerTypeName || (formData.signerType === 1 ? '企业委托' : formData.signerType === 2 ? '企业' : '个人') }}</view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">签约车主</view>
            <view>{{ formData.partAName || '-' }}</view>
          </view>

          <view class="flex align-center" v-if="formData.signerType === 2">
            <view class="title-label-see mr-16">经办人</view>
            <view>{{ formData.handler || '-' }}</view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">联系方式</view>
            <view>{{ formData.phone || '-' }}</view>
          </view>
          <view class="flex align-center" v-if="formData.signerType === 0">
            <view class="title-label-see mr-16">身份证号</view>
            <view>{{ formData.idCard || '-' }}</view>
          </view>
          <view class="flex align-center" v-if="formData.signerType === 1">
            <view class="title-label-see mr-16">身份证号</view>
            <view>{{ formData.idCard || '-' }}</view>
          </view>
          <view class="flex align-center" v-if="formData.signerType === 1">
            <view class="title-label-see mr-16">营业执照号</view>
            <view>{{ formData.orgLicenseNumber || '-' }}</view>
          </view>
          <view class="flex align-center" v-if="formData.signerType === 2">
            <view class="title-label-see mr-16">营业执照号</view>
            <view>{{ formData.orgLicenseNumber || '-' }}</view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">地址</view>
            <view class="flex-1">{{ formData.address }}</view>
          </view>
          <view class="flex align-start" v-if="(formData.signerType === 0 || formData.signerType === 1) && formData.idCardFrontUrl">
            <view class="title-label-see mr-16">身份证国徽面</view>
            <image :src="getImageDisplayUrl(formData.idCardFrontUrl)" @click.stop="previewMedia(formData.idCardFrontUrl, 1)"></image>
          </view>
          <view class="flex align-start" v-if="(formData.signerType === 0 || formData.signerType === 1) && formData.idCardBackUrl">
            <view class="title-label-see mr-16">身份证人像面</view>
            <image :src="getImageDisplayUrl(formData.idCardBackUrl)" @click.stop="previewMedia(formData.idCardBackUrl, 1)"></image>
          </view>
          <view class="flex align-start" v-if="(formData.signerType === 1 || formData.signerType === 2) && formData.orgLicenseUrl">
            <view class="title-label-see mr-16">营业执照图片</view>
            <image :src="getImageDisplayUrl(formData.orgLicenseUrl)" @click.stop="previewMedia(formData.orgLicenseUrl, 1)"></image>
          </view>
          <view class="flex align-start" v-if="formData.thirdPartyTransactionVoucher">
            <view class="title-label-see mr-16">三方/委托交易 凭证</view>
            <!-- 视频显示 -->
            <view v-if="formData.thirdPartyTransactionVoucher.includes(videoProcess)" class="video-preview" @click.stop="previewMedia(formData.thirdPartyTransactionVoucher, 2)">
              <image :src="formData.thirdPartyTransactionVoucher"></image>
              <view class="video-play-icon">
                <view class="sprite-icon icon-upload-play"></view>
              </view>
            </view>
            <!-- 图片显示 -->
            <image v-else :src="getImageDisplayUrl(formData.thirdPartyTransactionVoucher)" @click.stop="previewMedia(formData.thirdPartyTransactionVoucher, 1)"></image>
          </view>
        </view>
        <view class="flex align-center gridBox mb-32">
          <view class="flex align-center">
            <view class="title-label-see mr-16">收款人姓名</view>
            <view>{{ formData.payeeName || '-' }}</view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">银行账号</view>
            <view>{{ formData.bankCardNumber || '-' }}</view>
          </view>
          <view class="flex align-center ">
            <view class="title-label-see mr-16">开户行</view>
            <view>{{ formData.bankOfDeposit || '-' }}</view>
          </view>
          <view class="flex align-center ">
            <view class="title-label-see mr-16">回单摘要</view>
            <view>{{ formData.returnSummaryRemark || '-' }}</view>
          </view>
          <view class="flex align-start" v-if="formData.payerIdCardFrontUrl">
            <view class="title-label-see mr-16">身份证国徽面</view>
            <image :src="formData.payerIdCardFrontUrl" @click.stop="previewMedia(formData.payerIdCardFrontUrl, 1)"></image>
          </view>
          <view class="flex align-start" v-if="formData.payerIdCardBackUrl">
            <view class="title-label-see mr-16">身份证人像面</view>
            <image :src="formData.payerIdCardBackUrl" @click.stop="previewMedia(formData.payerIdCardBackUrl, 1)"></image>
          </view>
          <view class="flex align-start" v-if="formData.payerBankCardUrl">
            <view class="title-label-see mr-16">银行卡</view>
            <image :src="formData.payerBankCardUrl" @click.stop="previewMedia(formData.payerBankCardUrl, 1)"></image>
          </view>
        </view>
        <view class="flex align-center gridBox mb-32">
          <view class="flex align-center full-width">
            <view class="title-label-see mr-16">随车资料</view>
            <view>{{ selectedItemsText || '-' }}</view>
          </view>
        </view>
        <view class="flex align-center gridBox mb-32">
          <view class="flex align-center">
            <view class="title-label-see mr-16">交车时间</view>
            <view>{{ formData.handoverTime || '-' }}</view>
          </view>
          <view class="flex align-center">
            <view class="title-label-see mr-16">交车地点</view>
            <view>{{ formData.handoverAddress || '-' }}</view>
          </view>
        </view>
        <view class="flex align-center gridBox">
          <view class="flex align-center full-width">
            <view class="title-label-see mr-16">备注约定条款</view>
            <view class="flex-1">{{ formData.otherAgreedTerm || '-' }}</view>
          </view>
        </view>

        <view class="tips px-20">
          <view class="sprite-icon icon-study-tips"></view>
          请确认签约个人信息，确认后将按照以上信息生成电子合同，并发送电子签约邀请。
        </view>
        <view class="footerBtn">
          <view class="btn cancle" @click.stop="prevPage">上一步</view>
          <view class="btn next" @click.stop="comfirm">确认发送</view>
        </view>
      </view>
    </view>
    <!-- <order-popup ref="openDate" popupType="15" :defaultTime="defaultTime" @onConfirm="confirmDate" /> -->
    <NoticePopup ref="notice" title="重要提示" text="当前页面暂未保存，是否确认退出" type="warning"></NoticePopup>
    <u-datetime-picker class="sign-info-datetime-picker" :show="show" v-model="value1" mode="datetime" @confirm="confirmDate" @cancel="show = false"></u-datetime-picker>
  </view>
</template>
<script>
import FormCell from './components/FormCell.vue'
import GeneralPopup from './components/GeneralPopup.vue'
// import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import { uploadFile } from '@/utils/ossUpload.js'
import { getImageDisplayUrl } from '@/utils/ossImageProcess.js'
import OrderPopup from '@/components/OrderPopup/index.vue'
import dayjs from 'dayjs'
import NoticePopup from '@/components/NoticePopup.vue'
import { throttle } from 'lodash'
import permision from '@/js_sdk/wa-permission/permission.js'
export default {
  components: {
    FormCell,
    GeneralPopup,
    OrderPopup,
    NoticePopup
  },
  data() {
    return {
      videoProcess: '?x-oss-process=video/snapshot,t_7000,f_jpg,w_800,h_600,m_fast',
      comfirmPage: false,
      signInfo: {},
      title: '签约信息',
      selectDate: '',
      current: null,
      defaultTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      endDate: dayjs().format('YYYY-MM-DD'),
      selectedItemsText: '机动车登记本, 机动车行驶证, 交管12123截图, 交强险, 车钥匙,过户授权委托书照片',
      noDataBg: require('@/assets/images/common/sign-no-data.webp'),
      radioList: [
        {
          value: '1',
          name: '二手车转让协议（定金+尾款）'
        },
        {
          value: '2',
          name: '二手车转让协议（全款）'
        }
      ],
      checkboxList: [
        {
          key: 'motorBook',
          value: 'motorBook',
          name: '机动车登记本',
          checked: false
        },
        {
          value: 'motorRegistrationCertificate',
          name: '机动车行驶证',
          key: 'motorRegistrationCertificate',
          checked: false
        },
        {
          value: 'trafficScreenshot',
          name: '交管12123截图',
          key: 'trafficScreenshot',
          checked: false
        },
        {
          value: 'trafficInsurance',
          name: '交强险',
          key: 'trafficInsurance',
          checked: false
        },
        {
          value: 'carKey',
          name: '车钥匙',
          key: 'carKey',
          checked: false,
          isShowInput: true,
          inputValue: 'carKeyCount'
        },
        {
          value: 'purchaseReceipt',
          name: '购置税证及收据',
          key: 'purchaseReceipt',
          checked: false
        },
        {
          value: 'purchaseInvoice',
          name: '购车发票',
          key: 'purchaseInvoice',
          checked: false
        },
        {
          value: 'insuranceCard',
          name: '保险单商业保险单或卡',
          key: 'insuranceCard',
          checked: false
        },
        {
          value: 'transferPhoto',
          name: '过户授权委托书照片',
          key: 'transferPhoto',
          checked: false
        },
        {
          value: 'other',
          name: '其他',
          key: 'other',
          checked: false,
          isShowInput: true,
          inputValue: 'otherText'
        }
      ],
      formData: {
        evalOrderNo: '',
        paymentType: 0,
        depositPrice: '',
        finalPrice: 0,
        fullPrice: 0,
        signerType: 0,
        partAName: '',
        idCard: '',
        idCardFrontUrl: '',
        idCardBackUrl: '',
        contactPersonName: '',
        phone: '',
        address: '',
        payeeName: '',
        bankCardNumber: '',
        bankOfDeposit: '',
        returnSummarySwitch: 0,
        returnSummaryRemark: '',
        payerIdCardFrontUrl: '',
        payerIdCardBackUrl: '',
        payerBankCardUrl: '',
        motorBook: '1',
        motorRegistrationCertificate: '1',
        idCarFrontBack: '',
        purchaseReceipt: '0',
        purchaseInvoice: '0',
        trafficScreenshot: '1',
        carKey: '1',
        carKeyCount: '',
        trafficInsurance: '1',
        insuranceCard: '0',
        transferPhoto: '1',
        other: '0',
        otherText: '',
        handoverTime: '',
        handoverAddress: '',
        // 扩展字段用于复选框结果
        sellerName: '',
        sellerMerchantId: '',
        sellerUserId: '',
        evalPrice: 0,
        // 签署人类型相关字段
        handler: '',
        orgLicenseNumber: '',
        orgLicenseUrl: '',
        thirdPartyTransactionVoucher: ''
      },
      formFields: [],
      formFields1: [
        {
          key: 'handoverTime',
          label: '交车时间',
          required: true,
          fullWidth: false,
          targetNameKey: 'handoverTimeName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'handoverTime',
          type: 'calendar'
        },
        {
          key: 'handoverAddress',
          label: '交车地点',
          required: true,
          fullWidth: false,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'handoverAddress',
          type: 'input',
          maxlength: 43,
          isLocation: true
        }
      ],
      formFields2Base: [
        {
          key: 'payeeName',
          label: '收款人姓名',
          required: true,
          fullWidth: false,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'payeeName',
          targetObj: '',
          type: 'input',
          maxlength: 36
        },
        {
          key: 'bankCardNumber',
          label: '银行账号',
          required: true,
          fullWidth: false,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'bankCardNumber',
          targetObj: '',
          type: 'input',
          inputType: 'number',
          maxlength: 25
        },
        {
          key: 'bankOfDeposit',
          label: '开户行',
          required: true,
          fullWidth: false,
          placeholder: '如：工商银行XXX分行XXX支行',
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'bankOfDeposit',
          targetObj: '',
          type: 'input',
          maxlength: 36
        }
      ],
      formFieldsReturnSummary: [
        {
          key: 'returnSummary',
          label: '回单摘要',
          required: false,
          fullWidth: false,
          switchKey: 'returnSummarySwitch',
          remarkKey: 'returnSummaryRemark',
          targetKey: 'returnSummarySwitch',
          placeholder: '请输入回单摘要',
          type: 'switchInput',
          maxlength: 35,
          clearRemarkOnSwitchOff: false
        }
      ],
      formFields3: [
        {
          key: 'otherAgreedTerm',
          label: '备注约定条款',
          fullWidth: true,
          targetNameKey: 'otherAgreedTerm',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'otherAgreedTerm',
          type: 'textarea',
          maxlength: 200
        }
      ],
      query: null,
      show: false,
      value1: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      defaultReturnSummaryRemark: '',
      returnSummaryRemarkCustomized: false,
      savedReturnSummaryRemark: ''
    }
  },
  computed: {
    // 根据 signerType 过滤 formFields
    filteredFormFields() {
      if (!this.formFields || this.formFields.length === 0) {
        return []
      }
      // 获取 signerType 的值，确保类型一致（可能是数字或字符串）
      const signerType = Number(this.formData.signerType)
      console.log('filteredFormFields - signerType:', signerType, 'type:', typeof signerType)

      const filtered = this.formFields.filter(field => {
        // 个人(0)：显示 idCard，不显示 handler，不显示 orgLicenseNumber
        if (signerType === 0) {
          return field.key !== 'handler' && field.key !== 'orgLicenseNumber'
        }
        // 企业委托(1)：只隐藏 handler，显示 idCard 和 orgLicenseNumber
        if (signerType === 1) {
          return field.key !== 'handler'
        }
        // 企业(2)：显示 handler，显示 orgLicenseNumber，不显示 idCard
        if (signerType === 2) {
          return field.key !== 'idCard'
        }
        // 默认情况（未选择或未知类型）
        return field.key !== 'handler' && field.key !== 'orgLicenseNumber'
      })

      return filtered
    },
    // 判断是否显示身份证上传
    showIdCardUpload() {
      const signerType = Number(this.formData.signerType)
      return signerType === 0 || signerType === 1 // 个人和企业委托显示身份证上传
    },
    // 判断是否显示营业执照图片上传
    showOrgLicenseUpload() {
      const signerType = Number(this.formData.signerType)
      return signerType === 1 || signerType === 2 // 企业委托和企业显示营业执照图片
    },
    // 判断三方/委托交易凭证是否必填
    isThirdPartyRequired() {
      const signerType = Number(this.formData.signerType)
      return signerType === 1 // 只有企业委托时必填
    }
  },
  watch: {
    // 监听定金变化，自动计算尾款
    'formData.depositPrice': {
      handler(newValue) {
        console.log(newValue)
        if (newValue) {
          this.calculateFinalPrice()
        }
      },
      immediate: true
    },
    // 监听 signerType 变化，调试用
    'formData.signerType': {
      handler(newValue, oldValue) {
        console.log('signerType changed:', oldValue, '->', newValue, 'type:', typeof newValue)
      },
      immediate: true
    },
    'formData.returnSummaryRemark'(val) {
      if (Number(this.formData.returnSummarySwitch) !== 1) {
        return
      }
      this.syncReturnSummaryRemarkCustomized(val)
    }
  },
  onLoad(options) {
    this.init(options)
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.backPage()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  mounted() {
    this.formData.evalPrice = this.query.evalPrice
    this.getEvalOrderSimpleDetail()
    console.log('formData', this.formData)
  },
  methods: {
    getImageDisplayUrl,
    onReturnSummarySwitchChange(e) {
      const switchValue = e.detail.value ? 1 : 0
      this.$set(this.formData, 'returnSummarySwitch', switchValue)
      // 复用原有联动逻辑（保存/恢复默认回单摘要）
      this.handleSwitchChange(switchValue, { remarkKey: 'returnSummaryRemark' })
    },
    onReturnSummaryBlur(e) {
      const value = e?.target?._value ?? e?.target?.value ?? ''
      this.blurChange(value, { targetKey: 'returnSummaryRemark', remarkKey: 'returnSummaryRemark' })
    },
    init(options) {
      this.query = options
      this.formData.handoverTime = dayjs().format('YYYY-MM-DD HH:mm:00')
    },
    async getEvalOrderSimpleDetail() {
      uni.showLoading()
      const res = await uni.$api.evaluationApi.evalOrderSimpleDetail({
        evalOrderNo: this.query.evalOrderNo
      })
      if (res.data.code == 0) {
        uni.hideLoading()
        const data = res.data.data
        const licensePlate = data.licensePlate || (data.evalCarBase && data.evalCarBase.licensePlate) || ''
        this.defaultReturnSummaryRemark = licensePlate
        if (Number(this.formData.returnSummarySwitch) === 1 && !this.returnSummaryRemarkCustomized) {
          this.$set(this.formData, 'returnSummaryRemark', licensePlate)
        }
        this.$set(this.formData, 'partAName', data.evalCarLicense.previousOwnerName)
        this.$set(this.formData, 'payeeName', data.evalCarLicense.previousOwnerName)
        this.$set(this.formData, 'phone', data.evalCarLicense.previousOwnerPhone)
        this.$set(this.formData, 'address', data.evalCarBase.registrationProvinceName + '-' + data.evalCarBase.registrationCityName)
        // this.$set(this.formData, 'handoverAddress', res.data.data.evalCarBase.carProvinceName + '-' + res.data.data.evalCarBase.carCityName)
        // this.evalOrderSimpleDetail = res.data.data
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    calendarChange(date) {
      this.selectDate = date.year + '-' + date.month + '-' + date.date
    },
    confirmCalendar() {
      // 日历确认回调
      if (this.currentField && this.selectDate) {
        this.$set(this.formData, this.currentField.targetKey, this.selectDate)
      }
      this.$refs.calendarGeneralPopup.close()
    },
    confirmDate(date) {
      const successDate = dayjs(date.value).format('YYYY-MM-DD HH:mm:00')
      console.log(successDate)
      this.$set(this.formData, 'handoverTime', successDate)
      this.show = false
    },
    previewMedia(media, type) {
      const url = `/pages/boutique/preview?tabName=预览&sourceType=${type}&detailUrl=${media.url || media}`
      uni.navigateTo({
        url: `${url}`
      })
    },
    handleCell(field) {
      const that = this
      console.log('handleCell', field)
      this.currentField = field
      if (field.type === 'calendar') {
        // this.$refs.openDate.open()
        this.show = true
        // this.$refs.calendarGeneralPopup
        //   .open()
        //   .then(() => {
        //     console.log('that.selectDate', that.selectDate)
        //     if (that.selectDate) {
        //       that.$set(that.formData, field.targetKey, that.selectDate)
        //     }
        //   })
        //   .catch(() => {
        //     console.log('日期选择取消')
        //   })
      }
    },
    handleRadioChange(value, field) {
      console.log('handleRadioChange', value, field)
      // 确保值是数字类型
      const numValue = Number(value)
      const oldSignerType = Number(this.formData.signerType)
      // 使用 $set 确保响应式更新
      this.$set(this.formData, field.targetKey, numValue)
      console.log('signerType updated to:', this.formData.signerType)

      // 切换签署人类型时，清空不相关的字段，确保字段正确初始化
      if (oldSignerType !== numValue) {
        // 如果切换到企业(2)，清空身份证相关字段
        if (numValue === 2) {
          this.$set(this.formData, 'idCard', '')
          this.$set(this.formData, 'idCardFrontUrl', '')
          this.$set(this.formData, 'idCardBackUrl', '')
          // 确保 handler 字段存在且为空字符串
          if (!this.formData.hasOwnProperty('handler')) {
            this.$set(this.formData, 'handler', '')
          }
        }
        // 如果切换到个人(0)或企业委托(1)，清空 handler
        if (numValue === 0 || numValue === 1) {
          this.$set(this.formData, 'handler', '')
        }
        // 如果切换到个人(0)，清空营业执照相关字段
        if (numValue === 0) {
          this.$set(this.formData, 'orgLicenseNumber', '')
          this.$set(this.formData, 'orgLicenseUrl', '')
        }
      }
    },
    radioChange(e) {
      console.log('radioChange', e)
      const value = Number(e.detail.value)
      this.formData.paymentType = value

      if (value === 1) {
        this.formFields = [
          {
            key: 'depositPrice',
            label: '定金金额',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'depositPrice',
            targetObj: '',
            type: 'input',
            cell: '元',
            inputType: 'number',
            disabled: false,
            maxlength: 7,
            isCell: true,
            pattern: '^[1-9]\\d*$'
          },
          {
            key: 'finalPrice',
            label: '尾款金额',
            required: false,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'finalPrice',
            targetObj: '',
            disabled: true,
            type: 'input',
            placeholder: '自动计算',
            cell: '元',
            isCell: true,
            pattern: '^\\d*$' // 只允许数字输入
          },

          {
            key: 'evalPrice',
            label: '评估价',
            required: false,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'evalPrice',
            type: 'input',
            cell: '元',
            isCell: true,
            disabled: true
          },
          {
            key: 'signerType',
            label: '签署人类型',
            required: true,
            fullWidth: false,
            targetNameKey: 'signerTypeName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'signerType',
            type: 'radio',
            showText: 'shopMerchantName',
            radioList: [
              {
                value: 0,
                name: '个人'
              },
              {
                value: 1,
                name: '企业委托'
              },
              {
                value: 2,
                name: '企业'
              }
            ]
          },
          {
            key: 'partAName',
            label: '签约车主',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            inputType: 'text',
            targetKey: 'partAName',
            type: 'input',
            maxlength: 20,
            disabled: false
          },
          {
            key: 'handler',
            label: '经办人',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            inputType: 'text',
            targetKey: 'handler',
            type: 'input',
            maxlength: 20,
            disabled: false
          },
          {
            key: 'phone',
            label: '手机号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'phone',
            type: 'input',
            inputType: 'number',
            maxlength: 11
          },
          {
            key: 'idCard',
            label: '身份证号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'idCard',
            type: 'input',
            maxlength: 18
          },
          {
            key: 'address',
            label: '地址',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'address',
            type: 'input',
            maxlength: 52
          },
          {
            key: 'orgLicenseNumber',
            label: '营业执照号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'orgLicenseNumber',
            type: 'input',
            maxlength: 20
          }
        ]
        this.formData.finalPrice = ''
        this.formData.depositPrice = ''

        // 确保评估价已设置
        if (this.query.evalPrice && !this.formData.fullPrice) {
          this.formData.fullPrice = this.query.evalPrice
        }
      } else if (value === 2) {
        console.log('this.formData', this.formData)
        this.formFields = [
          {
            key: 'fullPrice',
            label: '全款金额',
            required: false,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'fullPrice',
            targetObj: '',
            cell: '元',
            isCell: true,
            disabled: true,
            type: 'input'
          },
          {
            key: 'evalPrice',
            label: '评估价',
            required: false,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'evalPrice',
            type: 'input',
            cell: '元',
            isCell: true,
            disabled: true
          },
          {
            key: 'signerType',
            label: '签署人类型',
            required: true,
            fullWidth: false,
            targetNameKey: 'signerTypeName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'signerType',
            type: 'radio',
            showText: 'shopMerchantName',
            radioList: [
              {
                value: 0,
                name: '个人'
              },
              {
                value: 1,
                name: '企业委托'
              },
              {
                value: 2,
                name: '企业'
              }
            ]
          },
          {
            key: 'partAName',
            label: '签约车主',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            inputType: 'text',
            targetKey: 'partAName',
            type: 'input',
            disabled: false,
            maxlength: 20
          },
          {
            key: 'handler',
            label: '经办人',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            inputType: 'text',
            targetKey: 'handler',
            type: 'input',
            maxlength: 20,
            disabled: false
          },
          {
            key: 'phone',
            label: '手机号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'phone',
            type: 'input',
            inputType: 'number',
            maxlength: 11
          },
          {
            key: 'idCard',
            label: '身份证号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'idCard',
            type: 'input',
            maxlength: 18
          },
          {
            key: 'address',
            label: '地址',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'address',
            type: 'input',
            maxlength: 50
          },
          {
            key: 'orgLicenseNumber',
            label: '营业执照号',
            required: true,
            fullWidth: false,
            targetNameKey: 'sellerName',
            sourceNameKey: 'staffName',
            sourceKey: 'uuid',
            targetKey: 'orgLicenseNumber',
            type: 'input',
            maxlength: 20
          }
        ]

        // 确保评估价已设置
        if (this.query.evalPrice && !this.formData.fullPrice) {
          this.formData.fullPrice = this.query.evalPrice
        }
      }

      // 设置当前选中的索引
      this.current = this.radioList.findIndex(item => Number(item.value) === value)
      console.log('this.current', this.current)
    },
    handleSwitchChange(switchValue, field) {
      if (field.remarkKey !== 'returnSummaryRemark') {
        return
      }
      if (switchValue === 0) {
        const current = (this.formData.returnSummaryRemark || '').trim()
        if (current) {
          const defaultRemark = (this.defaultReturnSummaryRemark || '').trim()
          this.returnSummaryRemarkCustomized = current !== defaultRemark
          if (this.returnSummaryRemarkCustomized) {
            this.savedReturnSummaryRemark = this.formData.returnSummaryRemark
          }
        }
        this.$set(this.formData, 'returnSummaryRemark', '')
        return
      }
      const remark = this.returnSummaryRemarkCustomized ? this.savedReturnSummaryRemark || '' : this.defaultReturnSummaryRemark || ''
      this.$set(this.formData, 'returnSummaryRemark', remark)
    },
    syncReturnSummaryRemarkCustomized(value) {
      const trimmed = (value || '').trim()
      const defaultRemark = (this.defaultReturnSummaryRemark || '').trim()
      if (trimmed && trimmed !== defaultRemark) {
        this.returnSummaryRemarkCustomized = true
        this.savedReturnSummaryRemark = trimmed
      } else if (!trimmed) {
        this.returnSummaryRemarkCustomized = false
        this.savedReturnSummaryRemark = ''
      }
    },
    blurChange(value, field) {
      if (field.targetKey === 'returnSummaryRemark' || field.remarkKey === 'returnSummaryRemark') {
        this.syncReturnSummaryRemarkCustomized(value)
      }
      const signerType = Number(this.formData.signerType)

      // 个人(0)和企业委托(1)：校验身份证号
      if (field.key === 'idCard' && value && (signerType === 0 || signerType === 1)) {
        const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

        if (value.length !== 18) {
          uni.showToast({
            title: '身份证号长度应为18位',
            icon: 'none'
          })
          return
        }
        if (!idCardPattern.test(value)) {
          uni.showToast({
            title: '请输入正确的身份证号码',
            icon: 'none'
          })
          return
        }
      }

      // 企业委托(1)和企业(2)：校验营业执照号
      if (field.key === 'orgLicenseNumber' && value && (signerType === 1 || signerType === 2)) {
        const businessLicensePattern = /^[A-Za-z0-9]+$/
        if (!businessLicensePattern.test(value)) {
          uni.showToast({
            title: '营业执照号只能包含数字和字母',
            icon: 'none'
          })
          return
        }
      }
    },
    checkboxChange(e) {
      console.log('checkboxChange', e.detail)
      // 创建结果对象，将选中的key设为1，未选中的设为0
      const resultObject = {}
      const resultArray = []
      this.checkboxList.forEach(item => {
        const itemKey = item.key
        const isSelected = e.detail.value.some(value => value === item.value)
        resultObject[itemKey] = isSelected ? '1' : '0'
        item.checked = isSelected

        // 如果取消勾选且该项有输入框，清空输入值
        if (!isSelected && item.isShowInput && item.inputValue) {
          this.formData[item.inputValue] = ''
        }
      })

      // 更新formData
      this.formData = { ...this.formData, ...resultObject }
      console.log('checkbox结果对象:', this.formData)

      this.selectedItemsText = this.checkboxList
        .filter(item => item.checked)
        .map(item => item.name)
        .join(', ')
    },
    handleBlur(e, item) {
      this.selectedItemsText = this.checkboxList
        .filter(item => item.checked)
        .map(item => item.name)
        .join(', ')
    },
    // 处理图片/视频上传（用于三方/委托交易凭证）
    async handleMediaUpload(field) {
      // #ifdef APP-PLUS
      const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
      const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
      const isOnline = await uni.$isNetWork()
      if (photoLibrary != 1) {
        uni.showToast({ title: '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限', icon: 'none' })
        return
      }
      if (camera != 1) {
        uni.showToast({ title: '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限', icon: 'none' })
        return
      }
      if (!isOnline) {
        uni.showToast({ title: '当前无网络连接，请连接网络后重试', icon: 'none' })
        return
      }
      // #endif
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择图片', '拍摄视频', '从相册选择视频'],
        success: res => {
          if (res.tapIndex === 0) {
            // 拍照
            this.takePhoto(field)
          } else if (res.tapIndex === 1) {
            // 从相册选择图片
            this.chooseImageFromAlbum(field)
          } else if (res.tapIndex === 2) {
            // 拍摄视频
            this.takeVideo(field)
          } else if (res.tapIndex === 3) {
            // 从相册选择视频
            this.chooseVideoFromAlbum(field)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    async handleImageUpload(field) {
      // #ifdef APP-PLUS
      const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
      const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
      const isOnline = await uni.$isNetWork()
      if (photoLibrary != 1) {
        uni.showToast({ title: '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限', icon: 'none' })
        return
      }
      if (camera != 1) {
        uni.showToast({ title: '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限', icon: 'none' })
        return
      }
      if (!isOnline) {
        uni.showToast({ title: '当前无网络连接，请连接网络后重试', icon: 'none' })
        return
      }
      // #endif
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: res => {
          if (res.tapIndex === 0) {
            // 拍照
            this.takePhoto(field)
          } else if (res.tapIndex === 1) {
            // 从相册选择图片
            this.chooseImageFromAlbum(field)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    // 拍照
    takePhoto(field) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['camera'],
        success: async res => {
          try {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePaths[0],
              success: function () {
                console.log('图片保存成功')
              }
            })

            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                uni.showToast({ title: '图片上传最大10MB', icon: 'none' })
                return
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              console.log('上传图片成功', url)
              uni.hideLoading()
              this.addMedia(field, { url, fileFormat: 'png', type: 'image', name: field.label })
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '上传图片失败', icon: 'none' })
          }
        },
        fail: err => {
          console.log('拍照失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拍照失败', icon: 'none' })
          }
        }
      })
    },
    // 从相册选择图片
    chooseImageFromAlbum(field) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album'],
        success: async res => {
          try {
            console.log('选择图片成功', res)
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                uni.showToast({ title: '图片上传最大10MB', icon: 'none' })
                return
              }
            }
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              console.log('上传图片成功', url)
              this.addMedia(field, { url, fileFormat: 'png', type: 'image', name: field.label })
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '上传图片失败', icon: 'none' })
          }
        },
        fail: err => {
          console.log('选择图片失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '选择图片失败', icon: 'none' })
          }
        }
      })
    },
    // 拍摄视频
    takeVideo(field) {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: 60,
        camera: 'back',
        compressed: false,
        success: async res => {
          console.log('拍摄视频成功', res)
          uni.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              console.log('save success')
            }
          })
          try {
            const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
            if (res.size > MAX_VIDEO_SIZE) {
              uni.showToast({ title: '视频上传最大100MB', icon: 'none' })
              return
            }
            uni.showLoading({ title: '上传中...' })
            // let uploadUrl = await uploadFile(null, res.tempFilePath)
            let uploadUrl = ''
            // #ifdef H5
            uploadUrl = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            uploadUrl = await uploadFile(null, res.tempFilePath)
            // #endif
            uploadUrl = uploadUrl + this.videoProcess
            console.log('上传视频成功', uploadUrl)
            this.$set(this.formData, field, uploadUrl)
            uni.hideLoading()
            uni.showToast({ title: '上传成功', icon: 'success' })
          } catch (error) {
            console.log('上传视频失败', error)
            uni.hideLoading()
            uni.showToast({ title: '视频上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('拍摄视频失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拍摄视频失败', icon: 'none' })
          }
        }
      })
    },
    // 从相册选择视频
    chooseVideoFromAlbum(field) {
      uni.chooseVideo({
        sourceType: ['album'],
        compressed: false,
        maxDuration: 60,
        success: async res => {
          console.log('选择视频成功', res)
          try {
            const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
            if (res.size > MAX_VIDEO_SIZE) {
              uni.showToast({ title: '视频上传最大100MB', icon: 'none' })
              return
            }
            uni.showLoading({ title: '上传中...' })
            let uploadUrl = ''
            // #ifdef H5
            uploadUrl = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            uploadUrl = await uploadFile(null, res.tempFilePath)
            // #endif

            uploadUrl = uploadUrl + this.videoProcess
            console.log('上传视频成功', uploadUrl)
            this.$set(this.formData, field, uploadUrl)
            uni.hideLoading()
            uni.showToast({ title: '上传成功', icon: 'success' })
          } catch (error) {
            console.log('上传视频失败', error)
            uni.hideLoading()
            uni.showToast({ title: '视频上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('选择视频失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '选择视频失败', icon: 'none' })
          }
        }
      })
    },
    addMedia(field, media) {
      // 上传完成后保持原始 URL；仅在回显/预览时拼接 OSS 处理参数展示
      this.$set(this.formData, field, media.url)
    },
    removeMedia(field) {
      // 显示确认对话框
      uni.showModal({
        title: '确认删除',
        content: '确定要删除此图片/视频吗？',
        success: res => {
          if (res.confirm) {
            // 用户确认删除
            this.$set(this.formData, field, '')
          }
        }
      })
    },
    backPage() {
      this.$refs.notice.buttonsList = [
        {
          text: '确认退出',
          type: 'default',
          callback: () => {
            this.$refs.notice.close()
            uni.navigateBack({
              delta: 1
            })
          }
        },
        {
          text: '继续编辑',
          type: 'primary',
          callback: () => {
            this.$refs.notice.close()
          }
        }
      ]
      this.$refs.notice.open()
    },
    prevPage() {
      console.log('this.formData:', this.current)
      this.comfirmPage = false
      this.title = '签约信息'
    },
    nextPage() {
      if (!this.formData.paymentType) {
        uni.showToast({
          title: '请选择合同类型',
          icon: 'none'
        })
        return
      }
      console.log('this.formData:', this.formData)
      if (Number(this.formData.depositPrice) >= Number(this.formData.evalPrice)) {
        uni.showToast({
          title: '定金要小于评估价',
          icon: 'none'
        })
        return
      }

      const formFieldsRequired = this.filteredFormFields.filter(field => field.required)
      for (const field of formFieldsRequired) {
        const value = this.formData[field.targetKey]
        // signerType 字段允许值为 0（个人）、1（企业委托）或 2（企业），需要特殊处理
        if (field.key === 'signerType') {
          if (value !== 0 && value !== 1 && value !== 2 && value !== '0' && value !== '1' && value !== '2') {
            uni.showToast({
              title: `请选择${field.label}`,
              icon: 'none'
            })
            return
          }
        } else {
          // 其他字段的校验逻辑：检查是否为空、0、'0'或仅包含空格
          const trimmedValue = typeof value === 'string' ? value.trim() : value
          if (!trimmedValue || trimmedValue === 0 || trimmedValue === '0') {
            uni.showToast({
              title: `请填写${field.label}`,
              icon: 'none'
            })
            return
          }
        }
      }
      const formFields1Required = this.formFields1.filter(field => field.required)
      for (const field of formFields1Required) {
        const value = this.formData[field.targetKey]
        if (!value) {
          uni.showToast({
            title: `请填写${field.label}`,
            icon: 'none'
          })
          return
        }
      }
      const formFields2Required = this.formFields2Base.filter(field => field.required)
      for (const field of formFields2Required) {
        const value = this.formData[field.targetKey]
        if (!value) {
          uni.showToast({
            title: `请填写${field.label}`,
            icon: 'none'
          })
          return
        }
      }
      const returnSummaryField = this.formFieldsReturnSummary.find(field => field.type === 'switchInput')
      if (returnSummaryField && Number(this.formData.returnSummarySwitch) === 1) {
        const remark = typeof this.formData.returnSummaryRemark === 'string' ? this.formData.returnSummaryRemark.trim() : this.formData.returnSummaryRemark
        if (!remark) {
          uni.showToast({
            title: `请填写${returnSummaryField.label}`,
            icon: 'none'
          })
          return
        }
      }
      // 根据签署人类型进行不同的校验
      const signerType = Number(this.formData.signerType)
      if (signerType === 0) {
        // 个人：执行身份证格式校验
        const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
        if (!idCardPattern.test(this.formData.idCard)) {
          uni.showToast({
            title: '请输入正确的身份证号码',
            icon: 'none'
          })
          return
        }
        // 个人：必须上传身份证照片
        if (!this.formData.idCardFrontUrl) {
          uni.showToast({
            title: '请上传身份证国徽面照片',
            icon: 'none'
          })
          return
        }
        if (!this.formData.idCardBackUrl) {
          uni.showToast({
            title: '请上传身份证人像面照片',
            icon: 'none'
          })
          return
        }
      } else if (signerType === 1) {
        // 企业委托：校验身份证号
        const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
        if (!idCardPattern.test(this.formData.idCard)) {
          uni.showToast({
            title: '请输入正确的身份证号码',
            icon: 'none'
          })
          return
        }
        // 企业委托：必须上传身份证照片
        if (!this.formData.idCardFrontUrl) {
          uni.showToast({
            title: '请上传身份证国徽面照片',
            icon: 'none'
          })
          return
        }
        if (!this.formData.idCardBackUrl) {
          uni.showToast({
            title: '请上传身份证人像面照片',
            icon: 'none'
          })
          return
        }
        // 企业委托：校验营业执照号（数字和字母）
        if (!this.formData.orgLicenseNumber) {
          uni.showToast({
            title: '请填写营业执照号',
            icon: 'none'
          })
          return
        }
        const businessLicensePattern = /^[A-Za-z0-9]+$/
        if (!businessLicensePattern.test(this.formData.orgLicenseNumber)) {
          uni.showToast({
            title: '营业执照号只能包含数字和字母',
            icon: 'none'
          })
          return
        }
        // 企业委托：必须上传营业执照图片
        if (!this.formData.orgLicenseUrl) {
          uni.showToast({
            title: '请上传营业执照图片',
            icon: 'none'
          })
          return
        }
        // 企业委托：三方/委托交易凭证必填
        if (!this.formData.thirdPartyTransactionVoucher) {
          uni.showToast({
            title: '请上传三方/委托交易凭证',
            icon: 'none'
          })
          return
        }
      } else if (signerType === 2) {
        // 企业：校验营业执照号（数字和字母）
        if (!this.formData.orgLicenseNumber) {
          uni.showToast({
            title: '请填写营业执照号',
            icon: 'none'
          })
          return
        }
        const businessLicensePattern = /^[A-Za-z0-9]+$/
        if (!businessLicensePattern.test(this.formData.orgLicenseNumber)) {
          uni.showToast({
            title: '营业执照号只能包含数字和字母',
            icon: 'none'
          })
          return
        }
        // 企业：必须上传营业执照图片
        if (!this.formData.orgLicenseUrl) {
          uni.showToast({
            title: '请上传营业执照图片',
            icon: 'none'
          })
          return
        }
      }

      // 验证随车材料：至少选择一项
      const checkedItems = this.checkboxList.filter(item => item.checked)
      if (checkedItems.length === 0) {
        uni.showToast({
          title: '请至少选择一项随车材料',
          icon: 'none'
        })
        return
      }

      // 验证车钥匙：如果勾选了车钥匙，必须输入数量
      const carKeyItem = this.checkboxList.find(item => item.key === 'carKey')
      if (carKeyItem && carKeyItem.checked && !this.formData.carKeyCount) {
        uni.showToast({
          title: '请输入车钥匙数量',
          icon: 'none'
        })
        return
      }

      // 验证其他：如果勾选了其他，必须输入内容
      const otherItem = this.checkboxList.find(item => item.key === 'other')
      if (otherItem && otherItem.checked && !this.formData.otherText) {
        uni.showToast({
          title: '请输入其他随车材料内容',
          icon: 'none'
        })
        return
      }

      // 更新 selectedItemsText
      if (this.selectedItemsText.indexOf('其他') !== -1 && this.formData.otherText) {
        this.selectedItemsText = this.selectedItemsText.replace('其他', '')
        this.selectedItemsText += this.formData.otherText
      }

      this.title = '确认签约信息'
      this.comfirmPage = true
    },
    comfirm: throttle(function (e) {
      console.log('this.formData', this.formData)
      if (this.formData.paymentType == 2) {
        delete this.formData.depositPrice
        delete this.formData.finalPrice
      }

      // 处理视频 URL，去掉 videoProcess 后缀
      const submitData = { ...this.formData }
      if (submitData.thirdPartyTransactionVoucher && submitData.thirdPartyTransactionVoucher.includes(this.videoProcess)) {
        submitData.thirdPartyTransactionVoucher = submitData.thirdPartyTransactionVoucher.replace(this.videoProcess, '')
      }

      // 只提交勾选的随车材料，未勾选的设为 '0'
      this.checkboxList.forEach(item => {
        if (item.key) {
          if (!item.checked) {
            submitData[item.key] = '0'
          }
        }
      })

      // 根据签署人类型，删除隐藏字段
      const signerType = Number(this.formData.signerType)
      if (signerType === 0) {
        // 个人：删除 handler 和 orgLicenseNumber
        delete submitData.handler
        delete submitData.orgLicenseNumber
      } else if (signerType === 1) {
        // 企业委托：删除 handler
        delete submitData.handler
      } else if (signerType === 2) {
        // 企业：删除 idCard 和身份证上传字段
        delete submitData.idCard
        delete submitData.idCardFrontUrl
        delete submitData.idCardBackUrl
      }

      if (Number(submitData.returnSummarySwitch) !== 1) {
        submitData.returnSummaryRemark = ''
      }

      uni.showLoading()
      uni.$api.evaluationApi.evalOrderSignContract({ ...submitData, evalOrderNo: this.query.evalOrderNo }).then(res => {
        console.log('res:', res)
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: '电子签约已发送，请注意查收短信',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      })
    }, 1500),
    // 计算尾款：尾款 = 评估价 - 定金
    calculateFinalPrice() {
      console.log(' 计算尾款：尾款 = 评估价 - 定金', this.formData)
      const depositPrice = parseFloat(this.formData.depositPrice) || 0
      const evalPrice = parseFloat(this.formData.evalPrice) || 0
      const finalPrice = evalPrice - depositPrice

      // 确保尾款不为负数
      if (finalPrice > 0) {
        this.formData.finalPrice = finalPrice
      } else {
      }
    },

    // 处理输入事件
    handleInputChange(e, field) {},

    // 处理无效输入
    handleInputInvalid(field, originalValue) {
      // 输入无效时，恢复原始值
      this.$set(this.formData, field.targetKey, originalValue)
      uni.showToast({
        title: field.label + '只能输入正整数',
        icon: 'none'
      })
    },
    pdfPreview() {
      const pdfUrl = 'https://jinrong-huidan-test.oss-cn-shenzhen.aliyuncs.com/testdev/8981c8ca-8b30-436e-bb17-82fb6a53a3c4%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf'
      const url = `/pages/evaluationForm/components/pdfPreView?fileUrl=${pdfUrl}&title=pdf&fileType=pdf&fileUrltype=pdf&Signature=false`
      uni.navigateTo({
        url: `${url}`
      })
    },
    location() {
      const that = this
      uni.showLoading({ title: '定位中...' })
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        success: function (res) {
          uni.hideLoading()
          that.$set(that.formData, 'handoverAddress', res.address.province + res.address.city)
        },
        fail: function (err) {
          uni.hideLoading()
          uni.showToast({ title: '定位失败', icon: 'none' })
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .sign-checkbox .uni-checkbox-input.uni-checkbox-input-disabled {
  background-color: #8cb6ff !important;
  &::before {
    color: #fff;
  }
}
.sign-info {
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
    overflow: auto;
    .box-class {
      height: 100%;
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      overflow: auto;
      padding: toRpx(32) toRpx(48) toRpx(42);
      box-sizing: border-box;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        z-index: -2;
        width: 100%;
        height: toRpx(120);
        background: linear-gradient(0deg, #94c2ff00 0%, #5294ff 100%);
        opacity: 0.15;
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
        filter: blur(toRpx(24));
      }
      .h2-title {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 500;
        margin-bottom: toRpx(16);
      }
      .contract-template {
        height: toRpx(92);
        border-radius: toRpx(16);
        background: #ffffff;
        padding: 0 toRpx(32);
        box-sizing: border-box;
        .title-label {
          color: #666;
          font-size: toRpx(26);
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
        .template-title {
          color: #4673ff;
          font-size: toRpx(28);
          font-weight: 400;
        }
      }
      .sign-info-box {
        border-radius: toRpx(16);
        box-sizing: border-box;
        width: 100%;
        height: calc(100% - #{toRpx(324)});
        overflow: hidden;
        ::v-deep .formCell .from-label {
          width: toRpx(300);
        }
        .no-data {
          background: #ffffff;
          .no-data-bg {
            width: toRpx(344);
            height: toRpx(236);
          }
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
          width: 100%;
          height: 100%;
        }
        .fromBox {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          .upload-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: toRpx(24);
            max-height: 100%;
            overflow-y: auto;
            margin-top: toRpx(24);
            .form-item {
              border-radius: toRpx(24);
              background: #ffffff;
              padding: toRpx(28) toRpx(32);
              box-sizing: border-box;
            }
            .form-item.full-width {
              grid-column: 1 / -1;
              height: auto;
            }

            .return-summary-item {
              width: 100%;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: stretch;
              gap: toRpx(16);
            }

            .return-summary-header {
              width: 100%;
              .from-label {
                width: auto;
              }
              switch {
                transform: scale(0.85);
              }
            }

            .return-summary-body {
              width: 100%;
              border-radius: toRpx(16);
              border: toRpx(2) solid #eff0f2;
              background: #f4f5f7;
              padding: toRpx(18) toRpx(24);
              box-sizing: border-box;
            }

            .return-summary-input {
              width: 100%;
              height: toRpx(44);
              font-size: toRpx(28);
              color: #333333;
              padding: 0;
              text-align: left;
              outline: none;
              border: 0;
              background: transparent;
            }

            .from-label {
              color: #333333;
              font-size: toRpx(28);
              font-weight: 400;
              display: flex;
              align-items: flex-start;
              width: toRpx(240);
            }
            .from-value {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              height: 100%;
              .sprite-icon {
                margin-bottom: toRpx(2);
              }
            }
            .placeholder {
              color: #999;
              font-size: toRpx(28);
              line-height: toRpx(32);
            }
            .upload-item {
              aspect-ratio: 1;
              border-radius: toRpx(16);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              width: toRpx(240);
              height: toRpx(240);
              border-radius: toRpx(12);
              opacity: 1;
              background: #f5f8ff;
            }

            .upload-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #999999;
            }

            .upload-text {
              margin-top: toRpx(28);
              font-size: toRpx(24);
            }
            .requiredLabel {
              color: #f24724;
              font-size: toRpx(28);
              font-weight: 400;
              margin-left: toRpx(8);
            }
            .checkbox-group {
              flex-wrap: wrap;
            }
            .checkbox-name {
              display: inline-block;
              color: #333333;
              font-size: toRpx(28);
            }
            .checkbox-input {
              width: toRpx(196);
              height: toRpx(56);
              border-radius: toRpx(8);
              background: #f4f5f7;
              padding: toRpx(8) toRpx(20);
              box-sizing: border-box;
              margin-left: toRpx(16);
              .input-placeholder {
                color: #999999;
                font-size: toRpx(28);
                font-weight: 400;
              }
            }
            // 已上传图片样式
            .uploaded-item {
              position: relative;
              width: toRpx(240);
              height: toRpx(240);
              border-radius: toRpx(12);
              overflow: hidden;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .uploaded-item image {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .video-container {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .video-play-icon {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: toRpx(64);
              height: toRpx(64);
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
            }
            .delete-icon {
              position: absolute;
              top: toRpx(8);
              right: toRpx(8);

              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
      .no-footerBtn {
        height: calc(100% - #{toRpx(234)});
      }
      .footerBtn {
        position: absolute;
        bottom: toRpx(24);
        left: toRpx(0);
        right: toRpx(0);
        display: flex;
        justify-content: center;
        align-items: center;
        .btn {
          width: toRpx(724);
          height: toRpx(80);
          border-radius: toRpx(48);
          background: #3b73ff1a;
          text-align: center;
          line-height: toRpx(80);
        }
        .cancle {
          color: #3b73ff;
          font-size: toRpx(28);
          font-weight: 500;
        }
        .next {
          color: #ffffff;
          font-size: toRpx(28);
          font-weight: 500;
          background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
          margin-left: toRpx(32);
        }
      }
    }
    .box-class1 {
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      padding: toRpx(32) toRpx(48) toRpx(42);
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        z-index: -2;
        width: 100%;
        height: toRpx(120);
        background: linear-gradient(0deg, #94c2ff00 0%, #5294ff 100%);
        opacity: 0.15;
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
        filter: blur(toRpx(24));
      }

      //确认签约信息样式
      .gridBox {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: toRpx(24);
        border-radius: toRpx(16);
        background: #ffffff;
        padding: toRpx(28) toRpx(32);
        box-sizing: border-box;
        .title-label-see {
          width: toRpx(168);
          color: #999999;
          font-size: toRpx(28);
          font-weight: 400;
        }
        image {
          width: toRpx(240);
          height: toRpx(240);
          border-radius: toRpx(12);
          background: #f4f5f7;
        }
        .video-preview {
          position: relative;
          width: toRpx(240);
          height: toRpx(240);
          border-radius: toRpx(12);
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;

          image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .video-play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: toRpx(64);
            height: toRpx(64);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }
        }
        .full-width {
          grid-column: 1 / -1;
        }
      }
      .tips {
        display: flex;
        align-items: center;
        font-size: toRpx(28);
        width: 100%;
        height: toRpx(56);
        border-radius: toRpx(16);
        opacity: 1;
        background: #fef5ea;
        margin-top: toRpx(16);
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
      .footerBtn {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: toRpx(24);
        .btn {
          width: toRpx(724);
          height: toRpx(80);
          border-radius: toRpx(48);
          background: #3b73ff1a;
          text-align: center;
          line-height: toRpx(80);
        }
        .cancle {
          color: #3b73ff;
          font-size: toRpx(28);
          font-weight: 500;
        }
        .next {
          color: #ffffff;
          font-size: toRpx(28);
          font-weight: 500;
          background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
          margin-left: toRpx(32);
        }
      }
    }
  }
  ::v-deep .sign-info-datetime-picker {
    .u-transition {
      border-radius: toRpx(32) toRpx(32) 0 0;
      overflow: hidden;
    }
    .u-picker__view {
      height: 62vh !important;
    }
  }
}
</style>
