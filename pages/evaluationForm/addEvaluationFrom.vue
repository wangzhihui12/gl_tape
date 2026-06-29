<template>
  <view class="add-evaluation-from">
    <view class="nav-bar">
      <view class="back" @click.stop="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">{{ title }}</view>
    </view>
    <view class="detail-content">
      <view class="flex align-center">
        <view class="stepper-container flex flex-1">
          <view class="flex items-center">
            <view class="step-number-circle" :class="{ active: currentStep >= 1 }">
              <view class="step-number">1</view>
            </view>
            <view class="step-name" :class="{ active: currentStep >= 1 }">车辆信息</view>
          </view>
          <view class="dash-line" :class="{ active: currentStep >= 2 }"></view>
          <view class="flex items-center">
            <view class="step-number-circle" :class="{ active: currentStep >= 2 }">
              <view class="step-number">2</view>
            </view>
            <view class="step-name" :class="{ active: currentStep >= 2 }">牌证信息</view>
          </view>
          <view class="dash-line" :class="{ active: currentStep >= 3 }"></view>
          <view class="flex items-center">
            <view class="step-number-circle" :class="{ active: currentStep >= 3 }">
              <view class="step-number">3</view>
            </view>
            <view class="step-name" :class="{ active: currentStep >= 3 }">图像信息</view>
          </view>
        </view>
        <view v-if="currentStep === 1" class="flex align-center scanBtn justify-center" @click.stop="scan('carLicenseOcr')">
          <view class="sprite-icon icon-scanIcon"></view>
          行驶证
        </view>
      </view>

      <view class="fromBox">
        <!-- 车辆信息表单 -->

        <FormCell v-if="currentStep === 1" :formFields="formFields" :formData="formData" @handleCell="handleCell" @pickerChange="pickerChange" @radioChange="radioChange" @blurChange="blurChange" @scan="scan" />

        <!-- 牌证信息表单 -->
        <FormCell v-else-if="currentStep === 2" :formFields="licenseFormFields" :formData="formData" @handleCell="handleCell" />

        <!-- 图像信息表单 -->
        <view v-else-if="currentStep === 3" class="form-container-upload">
          <view class="upload-section">
            <view class="section-title">车辆图片</view>
            <UploadMedia :upload-fields="uploadFields" :mediaData.sync="formImagesData" :grid-columns="3" />
          </view>
          <view class="upload-section">
            <view class="section-title">证件资料</view>
            <UploadMedia :upload-fields="uploadCertificateFields" :mediaData.sync="certificateImagesData" :grid-columns="3" />
          </view>
          <view class="upload-section">
            <view class="section-title">车辆视频</view>
            <UploadMedia :upload-fields="uploadVideoFields" :mediaData.sync="carVideoData" :grid-columns="3" />
          </view>
          <view class="upload-section">
            <view class="section-title">车辆检测报告</view>
            <UploadMedia :upload-fields="uploadReportFields" :mediaData.sync="reportImageData" :grid-columns="3" />
          </view>
          <view class="upload-section">
            <view class="section-title">其他图片</view>
            <UploadMedia :upload-fields="uploadOtherFields" :mediaData.sync="otherImagesData" :grid-columns="1" class="other-upload" />
          </view>
        </view>
      </view>

      <view class="button-module flex justify-center align-center">
        <view class="button-container flex justify-between">
          <view class="cancel-btn" @click.stop="currentStep > 1 ? prevStep() : backPage()">
            {{ currentStep > 1 ? '上一步' : '取消' }}
          </view>
          <view class="next-btn" @click.stop="currentStep < 3 ? nextStep() : submitForm()">
            {{ currentStep < 3 ? '下一步' : '提交' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 弹窗 -->
    <OrderPopup ref="orderPopup" :data="displayData" :isDefeatOrder="true" :externalData="[]" @onConfirm="onConfirm" :popupType="0" />
    <SelectCar ref="selectCar" title="选择车型" :car-brand-data="carBrandData" @car-selected="handleCarSelected" :on-load-year-data="loadYearDataForModel" :car-tips="carTips" />
    <SelectCity
      ref="selectCity"
      title="选择城市"
      @city-selected="handleCitySelected"
      :defaultProvince="{
        code: formData.carBaseReqDTO.registrationProvinceId,
        name: formData.carBaseReqDTO.registrationProvinceName
      }"
      :defaultCity="{
        code: formData.carBaseReqDTO.registrationCityId,
        name: formData.carBaseReqDTO.registrationCityName
      }"
    />
    <SelectCity
      ref="selectCarCity"
      title="选择城市"
      @city-selected="handleCarCitySelected"
      :defaultProvince="{
        code: formData.carBaseReqDTO.carProvinceId,
        name: formData.carBaseReqDTO.carProvinceName
      }"
      :defaultCity="{
        code: formData.carBaseReqDTO.carCityId,
        name: formData.carBaseReqDTO.carCityName
      }"
    />
    <GeneralPopup ref="calendarGeneralPopup" popupClass="calendarGeneralPopup" :showClose="false" :showTitle="false" @confirm="confirmCalendar">
      <template #content>
        <uni-calendar class="calendar" :showMonth="false" :date="defaultDate" :startDate="startDate" :endDate="endDate" @change="calendarChange" />
      </template>
    </GeneralPopup>
    <GeneralPopup ref="tipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false" :noTitle="true">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">提示</view>
          <view class="tipsConent">
            <view>{{ isExistSamePlate ? '已存在相同车牌号的评估单，是否进入编辑流程？' : '已存在一个30天内有效评估，是否进入详情查看？' }}</view>
          </view>
        </view>
      </template>
    </GeneralPopup>
    <NoticePopup ref="notice" title="重要提示" text="当前页面暂未保存，是否确认退出" type="warning"></NoticePopup>
    <GeneralPopup ref="editTipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false" :noTitle="true">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">提示</view>
          <view class="tipsConent">
            <view>您未对表单内容进行任何修改， 请修改后重新提交。</view>
          </view>
        </view>
      </template>
    </GeneralPopup>
  </view>
</template>
<script>
import GeneralPopup from './components/GeneralPopup.vue'
import { popupTypeEnum } from '../boutique/tool/contant'
import OrderPopup from '@/components/OrderPopup/index.vue'
import SelectCar from './components/SelectCar.vue'
import FormCell from './components/FormCell.vue'
import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import SelectCity from './components/SelectCity.vue'
import UploadMedia from './components/uploadMedia.vue'
import NoticePopup from '@/components/NoticePopup.vue'
import { throttle } from 'lodash'
import dayjs from 'dayjs'
import permision from '@/js_sdk/wa-permission/permission.js'
import { sign, md532, md516 } from 'utils/common'
import { signSecretKey } from '@/env.js'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
import { getPlateLocation } from '@/utils/licensePlateParser'
export default {
  name: 'AddEvaluationFrom',
  components: {
    OrderPopup,
    SelectCar,
    FormCell,
    SelectCity,
    GeneralPopup,
    UploadMedia,
    NoticePopup
  },
  computed: {
    displayData() {
      console.log('currentField', this.currentField)
      if (this.currentField && this.currentField.targetObj === 'evalOrderBasicReqDTO' && this.currentField.targetKey === 'sellerUserId') {
        const tempData = { ...this.formData }
        tempData.userId = this.formData.evalOrderBasicReqDTO?.sellerUserId || ''
        console.log('tempData', tempData)
        return tempData
      }
      return this.formData
    }
  },
  data() {
    return {
      bg: require('@/assets/images/boutique/tipsPopupBg.webp'),
      carBrandData: [],
      loadingCarData: false,
      // 缓存数据
      dataCache: null,
      cacheTimestamp: null,
      // 缓存有效期(10分钟)
      CACHE_EXPIRE_TIME: 10 * 60 * 1000,
      pickerArray: [],
      index: 0,
      carList: [],
      selectDate: '',
      currentIdentifiedBrandName: null,
      popupTypeEnum,
      title: '新增评估单',
      selectedCarInfo: null,
      startDate: '1999-01-01',
      endDate: dayjs().format('YYYY-MM-DD'),
      defaultDate: dayjs().format('YYYY-MM-DD'),
      isExistSamePlate: false,
      formData: {
        evalOrderBasicReqDTO: {
          sellerUserId: '',
          sellerName: '',
          sellerMerchantId: '',
          sellerMerchantName: ''
        },
        carBaseReqDTO: {
          carBrandId: '',
          carBrand: '',
          carChildsBrandId: '',
          carChildsBrandName: '',
          carSeriesId: '',
          carSeriesName: '',
          carTypeId: '',
          carTypeName: '',
          vin: '',
          licensePlate: '',
          engineNumber: '',
          registrationDate: '',
          registrationProvinceId: '',
          registrationProvinceName: '',
          registrationCityId: '',
          registrationCityName: '',
          carProvinceId: '',
          carProvinceName: '',
          carCityId: '',
          carCityName: '',
          mileage: '',
          usageType: '1',
          ownerType: '1',
          sunroof: '2',
          vehicleCategory: '1',
          emissionStandard: '6',
          interiorColor: '',
          exteriorColor: '',
          productionDate: '',
          guidePrice: '',
          buyNewCar: 1,
          hasAccident: 0,
          overallRating: 1,
          conditionDescription: '',
          ownerTypeName: '个人',
          usageTypeName: '非营运',
          sunroofName: '普通天窗',
          vehicleCategoryName: '置换车',
          emissionStandardName: '国6',
          overallRatingName: '优'
        },
        carLicenseReqDTO: {
          keyCount: 2,
          transferCount: 1,
          compulsoryInsuranceExpiry: '',
          annualInspectionExpiry: '',
          commercialInsuranceExpiry: '',
          previousOwnerName: '',
          previousOwnerAddress: '',
          previousOwnerPhone: ''
        },
        imageList: []
      },
      formImagesData: {},
      certificateImagesData: {},
      carVideoData: {},
      reportImageData: {},
      otherImagesData: {},
      currentStep: 1, // 当前步骤，默认为1
      formFields: [
        { key: 'sellerUserId', label: '销售顾问', required: true, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'sellerUserId', targetObj: 'evalOrderBasicReqDTO', type: 'select', showText: 'shopMerchantName' },
        { key: 'brandModel', label: '品牌车型', required: true, fullWidth: false, targetNameKey: 'carBrand', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'carBrandId', targetObj: 'carBaseReqDTO', type: 'select', isCar: true },
        { key: 'vin', label: '车架号', required: true, maxlength: 17, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'vin', targetObj: 'carBaseReqDTO', type: 'input', showText: 'shopMerchantName', isScan: true, pattern: '^[A-Z0-9]{17}$' },
        { key: 'licensePlate', label: '车牌号', required: true, maxlength: 10, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'licensePlate', targetObj: 'carBaseReqDTO', type: 'input', showText: 'shopMerchantName' },
        { key: 'engineNumber', label: '发动机号', required: true, maxlength: 20, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'engineNumber', targetObj: 'carBaseReqDTO', type: 'input', showText: 'shopMerchantName' },
        { key: 'registrationCity', label: '上牌城市', required: true, fullWidth: false, targetNameKey: 'cityName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'registrationCityName', targetObj: 'carBaseReqDTO', type: 'select', showText: 'shopMerchantName', isCity: true },
        { key: 'registrationDate', label: '上牌时间', required: true, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'registrationDate', targetObj: 'carBaseReqDTO', type: 'calendar', showText: 'shopMerchantName', endDate: true },
        { key: 'carCity', label: '车辆所在地', required: true, fullWidth: false, targetNameKey: 'carCityName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'carCityName', targetObj: 'carBaseReqDTO', type: 'select', isCarCity: true },
        { key: 'mileage', label: '表显里程', inputType: 'number', min: 0, max: 999999, maxlength: 6, required: true, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'mileage', targetObj: 'carBaseReqDTO', type: 'input', showText: 'shopMerchantName', pattern: '^[0-9]{0,6}$', cell: '公里', isCell: true },
        {
          key: 'usageType',
          label: '使用性质',
          required: true,
          fullWidth: false,
          targetNameKey: 'usageTypeName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'usageType',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '非营运', value: '1' },
            { name: '营运', value: '2' },
            { name: '营转非', value: '3' }
          ]
        },
        {
          key: 'ownerType',
          label: '所有人性质',
          required: true,
          fullWidth: false,
          targetNameKey: 'ownerTypeName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'ownerType',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '个人', value: '1' },
            { name: '单位', value: '2' }
          ]
        },
        {
          key: 'sunroof',
          label: '天窗',
          required: true,
          fullWidth: false,
          targetNameKey: 'sunroofName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'sunroof',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '无天窗', value: '1' },
            { name: '普通天窗', value: '2' },
            { name: '全景天窗', value: '3' }
          ]
        },
        {
          key: 'vehicleCategory',
          label: '车辆类别',
          required: true,
          fullWidth: false,
          targetNameKey: 'vehicleCategoryName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'vehicleCategory',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '置换车', value: '1' },
            { name: '报废车', value: '2' }
          ]
        },
        {
          key: 'emissionStandard',
          label: '排放标准',
          required: true,
          fullWidth: false,
          targetNameKey: 'emissionStandardName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'emissionStandard',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '国3', value: '3' },
            { name: '国4', value: '4' },
            { name: '国5', value: '5' },
            { name: '国6', value: '6' }
          ]
        },
        {
          key: 'exteriorColor',
          label: '外观颜色',
          required: true,
          fullWidth: false,
          targetNameKey: 'exteriorColorName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'exteriorColor',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '黑色', value: '1' },
            { name: '白色', value: '2' },
            { name: '银色', value: '3' },
            { name: '灰色', value: '4' },
            { name: '红色', value: '5' },
            { name: '蓝色', value: '6' },
            { name: '绿色', value: '7' },
            { name: '棕色', value: '8' },
            { name: '金色', value: '9' },
            { name: '橙色', value: '10' },
            { name: '紫色', value: '11' },
            { name: '黄色', value: '12' },
            { name: '香槟色', value: '13' },
            { name: '其他', value: '14' }
          ]
        },
        {
          key: 'interiorColor',
          label: '内饰颜色',
          required: true,
          fullWidth: false,
          targetNameKey: 'interiorColorName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'interiorColor',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '黑色', value: '1' },
            { name: '白色', value: '2' },
            { name: '银色', value: '3' },
            { name: '灰色', value: '4' },
            { name: '红色', value: '5' },
            { name: '蓝色', value: '6' },
            { name: '绿色', value: '7' },
            { name: '棕色', value: '8' },
            { name: '金色', value: '9' },
            { name: '橙色', value: '10' },
            { name: '紫色', value: '11' },
            { name: '黄色', value: '12' },
            { name: '香槟色', value: '13' },
            { name: '其他', value: '14' }
          ]
        },
        { key: 'productionDate', label: '生产日期', required: true, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'productionDate', targetObj: 'carBaseReqDTO', type: 'calendar', endDate: true },
        { key: 'guidePrice', label: '指导价', inputType: 'number', min: 0, max: 9999999.99, maxlength: 10, required: true, fullWidth: false, targetNameKey: 'sellerName', sourceNameKey: 'staffName', sourceKey: 'uuid', targetKey: 'guidePrice', targetObj: 'carBaseReqDTO', type: 'input', showText: 'shopMerchantName', pattern: '/^\d+(\.\d{1,2})?$/', cell: '元', isCell: true },
        {
          key: 'buyNewCar',
          label: '是否购买新车',
          required: true,
          fullWidth: false,
          targetNameKey: 'buyNewCarName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'buyNewCar',
          targetObj: 'carBaseReqDTO',
          type: 'radio',
          showText: 'shopMerchantName',
          radioList: [
            {
              value: 1,
              name: '是'
            },
            {
              value: 0,
              name: '否'
            }
          ]
        },
        {
          key: 'hasAccident',
          label: '是否事故',
          required: true,
          fullWidth: false,
          targetNameKey: 'hasAccidentName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'hasAccident',
          targetObj: 'carBaseReqDTO',
          type: 'radio',
          showText: 'shopMerchantName',
          radioList: [
            {
              value: 1,
              name: '是'
            },
            {
              value: 0,
              name: '否'
            }
          ]
        },
        {
          key: 'overallRating',
          label: '综合评价',
          required: true,
          fullWidth: true,
          targetNameKey: 'overallRatingName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'overallRating',
          targetObj: 'carBaseReqDTO',
          type: 'pricek',
          showText: 'shopMerchantName',
          fieldPickerArray: [
            { name: '优', value: 1 },
            { name: '良', value: 2 },
            { name: '中', value: 3 },
            { name: '差', value: 4 }
          ]
        },
        {
          key: 'conditionDescription',
          label: '车况描述',
          required: false,
          fullWidth: true,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'conditionDescription',
          targetObj: 'carBaseReqDTO',
          type: 'textarea',
          maxlength: 200
        }
      ],
      licenseFormFields: [
        { key: 'keyCount', label: '钥匙数', required: true, fullWidth: false, targetKey: 'keyCount', targetObj: 'carLicenseReqDTO', type: 'input', inputType: 'number', min: 0, max: 9, pattern: '^[0-9]{1}$', maxlength: 1 },
        { key: 'transferCount', label: '过户次数', required: true, fullWidth: false, targetKey: 'transferCount', targetObj: 'carLicenseReqDTO', type: 'input', inputType: 'number', min: 0, max: 9, pattern: '^[0-9]{1}$', maxlength: 1 },
        { key: 'compulsoryInsuranceExpiry', label: '交强险到期', required: true, fullWidth: false, type: 'calendar', targetKey: 'compulsoryInsuranceExpiry', targetObj: 'carLicenseReqDTO', endDate: false },
        { key: 'annualInspectionExpiry', label: '年审到期', required: true, fullWidth: false, type: 'calendar', targetKey: 'annualInspectionExpiry', targetObj: 'carLicenseReqDTO', endDate: false },
        { key: 'commercialInsuranceExpiry', label: '商业险到期', required: true, fullWidth: false, type: 'calendar', targetKey: 'commercialInsuranceExpiry', targetObj: 'carLicenseReqDTO', endDate: false },
        { key: 'previousOwnerName', label: '原车主名称', required: true, fullWidth: false, targetKey: 'previousOwnerName', targetObj: 'carLicenseReqDTO', type: 'input', maxlength: 20 },
        { key: 'previousOwnerPhone', label: '原车主电话', required: true, fullWidth: true, targetKey: 'previousOwnerPhone', targetObj: 'carLicenseReqDTO', type: 'input', inputType: 'number', pattern: '^[0-9]{11}$', maxlength: 11 },
        {
          key: 'previousOwnerAddress',
          label: '原车主住址',
          required: true,
          fullWidth: true,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'previousOwnerAddress',
          targetObj: 'carLicenseReqDTO',
          type: 'textarea',
          maxlength: 52
        }
      ],
      uploadFields: [
        {
          key: 11,
          label: '左前45度',
          required: true,
          maxCount: 1,
          accept: 'image'
        },
        { key: 12, label: '主驾驶全景', maxCount: 1, accept: 'image' },
        { key: 13, label: '仪表盘', maxCount: 1, accept: 'image' },
        { key: 14, label: '后排座椅', maxCount: 1, accept: 'image' },
        { key: 15, label: '中控台全景', maxCount: 1, accept: 'image' },

        { key: 16, label: '右后45度', maxCount: 1, accept: 'image' },
        { key: 17, label: '铭牌', maxCount: 1, accept: 'image' }
      ],
      uploadCertificateFields: [
        { key: 21, label: '行驶证', maxCount: 1, accept: 'image' },
        { key: 22, label: '登记证', maxCount: 3, accept: 'image' }
      ],
      uploadVideoFields: [
        { key: 31, label: '发动机工况', required: false, accept: 'video' },
        { key: 32, label: '车况解说', required: false, accept: 'video' }
      ],
      uploadReportFields: [{ key: 51, label: '车辆检测报告', required: false, accept: 'image', maxCount: 3, fullwidth: true }],
      uploadOtherFields: [{ key: 41, label: '其他图片', required: false, accept: 'image', maxCount: 30, fullwidth: true }],
      currentField: null,
      query: {},
      validateState: true,
      carTips: ''
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
    this.loadCarData()
    console.log(this.query)
    if (this.query.type == 'edit') {
      this.title = '编辑评估单'
      this.getDetail(this.query.evalOrderNo)
      uni.$track.add({ eventCode: 'app_edit_evaluation_from' })
    } else {
      uni.$track.add({ eventCode: 'app_add_evaluation_from' })
    }
    this.formData.carBaseReqDTO.ownerTypeName = '个人'
    this.formData.carBaseReqDTO.usageTypeName = '非营运'
    this.formData.carBaseReqDTO.sunroofName = '普通天窗'
    this.formData.carBaseReqDTO.vehicleCategoryName = '置换车'
    this.formData.carBaseReqDTO.emissionStandardName = '国6'
    this.formData.carBaseReqDTO.overallRatingName = '优'
    this.userInfo = uni.$storage.get('userInfo') || {}
  },
  methods: {
    loadCachedData() {
      try {
        const cachedData = uni.getStorageSync('carBrandData')
        const timestamp = uni.getStorageSync('carBrandDataTimestamp')

        if (cachedData && timestamp) {
          const now = Date.now()
          // 检查缓存是否过期
          if (now - timestamp < this.CACHE_EXPIRE_TIME) {
            this.carBrandData = JSON.parse(cachedData)
            this.dataCache = this.carBrandData
            this.cacheTimestamp = timestamp
            return true
          }
        }
        return false
      } catch (e) {
        console.error('加载缓存数据失败:', e)
        return false
      }
    },
    saveDataToCache(data) {
      try {
        const timestamp = Date.now()
        uni.setStorageSync('carBrandData', JSON.stringify(data))
        uni.setStorageSync('carBrandDataTimestamp', timestamp)
        this.dataCache = data
        this.cacheTimestamp = timestamp
      } catch (e) {
        console.error('保存数据到缓存失败:', e)
      }
    },
    loadCarData() {
      // 先尝试从缓存加载
      if (this.loadCachedData()) {
        return
      }

      this.loadingCarData = true
      // 异步加载数据，避免阻塞UI
      setTimeout(() => {
        const params = {
          app_key: '48e5e13229b82c1b4e6e8c96151f0637',
          v: '1.0.0',
          timestamp: '1234567890',
          source: 'dev_author',
          method: 'glsx.accounts.base.car.brand.complete',
          format: 'json'
        }
        const secret = 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
        const signature = sign(params, secret)

        uni.request({
          url: signSecretKey.carBasrUrl + '?method=glsx.accounts.base.car.brand.complete',
          method: 'GET',
          dataType: 'json',
          data: {
            sign: signature,
            ...params
          },
          success: result => {
            if (result.data && result.data.code === '0' && result.data.data && result.data.data.carinfos) {
              this.carBrandData = result.data.data.carinfos
              // 保存到缓存
              this.saveDataToCache(this.carBrandData)
            } else {
              console.error('Invalid car data format:', result)
            }
          },
          fail: error => {
            console.log(error, 'error')
          },
          complete: () => {
            this.loadingCarData = false
          }
        })
      }, 100)
    },
    loadYearDataForModel(modelId) {
      return new Promise((resolve, reject) => {
        const params = {
          app_key: '48e5e13229b82c1b4e6e8c96151f0637',
          v: '1.0.0',
          timestamp: '1234567890',
          source: 'dev_author',
          method: 'glsx.accounts.base.car.types',
          format: 'json',
          csId: modelId
        }
        const secret = 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
        const signature = sign(params, secret)

        // 优化请求方式，避免重复请求
        setTimeout(() => {
          uni.request({
            url: signSecretKey.carBasrUrl + '?method=glsx.accounts.base.car.types',
            method: 'GET',
            dataType: 'json',
            data: {
              sign: signature,
              csId: modelId,
              ...params
            },
            success: result => {
              if (result.data && result.data.code === '0' && result.data.data && result.data.data.carinfos) {
                resolve(result.data.data.carinfos || [])
              } else {
                console.error('无效的车型数据格式:', result)
                resolve([])
              }
            },
            fail: error => {
              console.log(error, 'error')
              resolve([])
            }
          })
        }, 10)
      })
    },
    openSelectCar(carInfo = null) {
      this.loadCarData()

      let openData = carInfo
      if (carInfo === null && this.currentIdentifiedBrandName) {
        openData = this.currentIdentifiedBrandName
        this.currentIdentifiedBrandName = null
      } else if (carInfo === null && !this.currentIdentifiedBrandName && this.selectedCarInfo) {
        openData = this.selectedCarInfo
      }

      // 即使数据正在加载中也打开弹窗，让用户看到加载状态
      this.$refs.selectCar.open(openData)
    },
    init(options) {
      console.log('options:', options)
      this.query = options
      console.log('query:', this.query)
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

    getDetail(evalOrderNo) {
      const that = this
      uni.$api.evaluationApi
        .evalOrderDetail({
          evalOrderNo
        })
        .then(res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            const { basic = {}, carInfo = {}, carLicense = {}, images = {} } = res.data.data
            that.formData.evalOrderBasicReqDTO = { ...basic }
            that.formData.carBaseReqDTO = { ...carInfo }
            that.formData.carLicenseReqDTO = { ...carLicense }
            that.formData.imageList = [...images]
            that.formData.evalOrderNo = evalOrderNo
            that.selectedCarInfo = {
              brand: {
                id: that.formData.carBaseReqDTO.carBrandId,
                name: that.formData.carBaseReqDTO.carBrand
              },
              series: {
                id: that.formData.carBaseReqDTO.carChildsBrandId,
                name: that.formData.carBaseReqDTO.carChildsBrandName
              },
              model: {
                id: that.formData.carBaseReqDTO.carSeriesId,
                name: that.formData.carBaseReqDTO.carSeriesName
              },
              year: {
                id: that.formData.carBaseReqDTO.carTypeId,
                name: that.formData.carBaseReqDTO.carTypeName
              }
            }
            that.formImagesData = {}
            that.certificateImagesData = {}
            that.carVideoData = {}
            that.reportImageData = {}
            that.otherImagesData = {}

            // 根据 fileType 和 fileSubtype 分类存放图片
            images.forEach(image => {
              const { fileType, fileSubtype, fileUrl } = image
              const imageItem = { url: fileUrl }

              // 根据 fileType 决定存放到哪个数据结构
              let targetData = null
              switch (fileType) {
                case 1: // 车辆图片
                  targetData = that.formImagesData
                  break
                case 2: // 证件资料
                  targetData = that.certificateImagesData
                  break
                case 3: // 车辆视频
                  targetData = that.carVideoData
                  break
                case 4: // 其他图片
                  targetData = that.otherImagesData
                  break
                case 5: // 车辆检测报告
                  targetData = that.reportImageData
                  break
                default:
                  return
              }

              // 根据 fileSubtype 组织数据
              if (!targetData[fileSubtype]) {
                targetData[fileSubtype] = []
              }
              targetData[fileSubtype].push(imageItem)
            })

            that.formFields.forEach(field => {
              if (field.fieldPickerArray && field.targetObj && field.targetKey && field.targetNameKey) {
                const targetValue = that.formData[field.targetObj][field.targetKey]
                if (targetValue !== undefined && targetValue !== null && targetValue !== '') {
                  let selectedItem
                  if (field.key === 'exteriorColor' || field.key === 'interiorColor') {
                    that.$set(that.formData[field.targetObj], field.targetNameKey, targetValue)
                    selectedItem = field.fieldPickerArray.find(item => item.name === targetValue)
                    if (selectedItem) {
                    }
                  } else {
                    selectedItem = field.fieldPickerArray.find(item => Number(item.value) === Number(targetValue))
                    if (selectedItem) {
                      that.$set(that.formData[field.targetObj], field.targetNameKey, selectedItem.name)
                      that.$set(that.formData[field.targetObj], field.targetKey, selectedItem.value)
                    }
                  }
                }
              }
            })
            const licensePlateField = that.formFields.find(field => field.key === 'licensePlate')
            if (licensePlateField) {
              that.$set(licensePlateField, 'disabled', true)
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

    // 下一步逻辑
    nextStep() {
      console.log('nextStep', this.formData)
      // 验证当前步骤的必填项
      if (this.currentStep === 1) {
        const requiredFields = this.formFields.filter(field => field.required)

        // 检查必填项是否为空
        const emptyFields = requiredFields.filter(field => {
          if (field.targetObj && this.formData[field.targetObj]) {
            return this.formData[field.targetObj][field.targetKey] === undefined || this.formData[field.targetObj][field.targetKey] === null || this.formData[field.targetObj][field.targetKey] === ''
          }
          return this.formData[field.key] === undefined || this.formData[field.key] === null || this.formData[field.key] === ''
        })

        if (emptyFields.length > 0) {
          const firstEmptyField = emptyFields[0]
          uni.showToast({
            title: `${firstEmptyField.label}为必填项`,
            icon: 'none'
          })
          return
        }

        // 车架号验证 - 长度17且只能包含数字和大写字母
        // const vin = this.formData.carBaseReqDTO.vin
        // const vinRegex = /^[A-Z0-9]+$/

        // if (!vinRegex.test(vin)) {
        //   uni.showToast({
        //     title: '车架号只能包含数字和大写字母',
        //     icon: 'none'
        //   })
        //   return
        // }
        // if (vin.length != 17) {
        //   uni.showToast({
        //     title: '车架号必须为17位',
        //     icon: 'none'
        //   })
        //   return
        // }

        // VIN车架号-动态校验
        const carVin = this.formData.carBaseReqDTO.vin
        console.log('validateState', this.validateState)
        if (carVin) {
          // 前置判断
          if (carVin.length !== 17) {
            uni.showToast({ title: '请输入 17 位有效字符（支持大写 A-H/J-N/P-Z、0-9）', icon: 'none' })
            return false
          }
          // 根据接口校验结果判断
          if (carVin.length === 17 && !this.validateState) {
            uni.showToast({ title: '车架号校验不匹配，请核对后重新输入', icon: 'none' })
            return false
          }
        }
        const engineNumber = this.formData.carBaseReqDTO.engineNumber
        const engineNumberRegex = /^[A-Za-z0-9]+$/
        if (!engineNumberRegex.test(engineNumber)) {
          uni.showToast({
            title: '发动机号只能包含数字和字母',
            icon: 'none'
          })
          return
        }

        // 表显里程验证 - 数字，0-999999
        const mileage = this.formData.carBaseReqDTO.mileage
        const mileageRegex = /^[0-9]{1,6}$/
        if (!mileageRegex.test(mileage) || mileage < 0 || mileage > 999999) {
          uni.showToast({
            title: '表显里程必须为0-999999之间的数字',
            icon: 'none'
          })
          return
        }

        // 指导价验证 - 数字，0-999999
        const guidePrice = this.formData.carBaseReqDTO.guidePrice
        const priceRegex = /^\d+(\.\d{1,2})?$/
        console.log('priceRegex', guidePrice)
        if (!priceRegex.test(guidePrice) || guidePrice < 0 || guidePrice > 9999999.99) {
          uni.showToast({
            title: '指导价必须为0-9999999.99之间的数字',
            icon: 'none'
          })
          return
        }
      } else if (this.currentStep === 2) {
        // 牌证信息步骤的验证逻辑
        const requiredFields = this.licenseFormFields.filter(field => field.required)
        const emptyFields = requiredFields.filter(field => {
          if (field.targetObj && this.formData[field.targetObj]) {
            return this.formData[field.targetObj][field.targetKey] === undefined || this.formData[field.targetObj][field.targetKey] === null || this.formData[field.targetObj][field.targetKey] === ''
          }
          return this.formData[field.key] === undefined || this.formData[field.key] === null || this.formData[field.key] === ''
        })

        if (emptyFields.length > 0) {
          const firstEmptyField = emptyFields[0]
          uni.showToast({
            title: `${firstEmptyField.label}为必填项`,
            icon: 'none'
          })
          return
        }
        const keyCount = this.formData.carLicenseReqDTO.keyCount
        const keyCountRegex = /^[0-9]{1}$/
        if (!keyCountRegex.test(keyCount) || keyCount < 0 || keyCount > 9) {
          uni.showToast({
            title: '钥匙数必须为0-9之间的整数',
            icon: 'none'
          })
          return
        }

        // 过户次数验证 - 数字，整数，0-9
        const transferCount = this.formData.carLicenseReqDTO.transferCount
        const transferCountRegex = /^[0-9]{1}$/
        if (!transferCountRegex.test(transferCount) || transferCount < 0 || transferCount > 9) {
          uni.showToast({
            title: '过户次数必须为0-9之间的整数',
            icon: 'none'
          })
          return
        }

        // 原车主电话验证 - 11位数字
        const previousOwnerPhone = this.formData.carLicenseReqDTO.previousOwnerPhone
        const phoneRegex = /^[0-9]{11}$/
        if (!phoneRegex.test(previousOwnerPhone)) {
          uni.showToast({
            title: '原车主电话必须为11位数字',
            icon: 'none'
          })
          return
        }
      } else if (this.currentStep === 3) {
        const leftFront45Image = this.formImagesData['11'] // key为11的是左前45度图片
        if (!leftFront45Image || !leftFront45Image.length) {
          uni.showToast({
            title: '左前45度图片为必填项',
            icon: 'none'
          })
          return
        }
      }

      // 验证通过，进入下一步
      if (this.currentStep < 3) {
        this.currentStep++
        // 滚动到顶部
        this.scrollToTop()
      }
    },
    handleCell(field) {
      const that = this
      console.log('handleCellAAAAA')
      if (field.isCar) {
        this.openSelectCar()
      } else if (field.isCity) {
        // 处理城市选择
        this.$refs.selectCity.open()
      } else if (field.isCarCity) {
        this.$refs.selectCarCity.open()
      } else if (field.type === 'calendar') {
        this.currentField = field
        this.defaultDate = that.formData[field.targetObj][field.targetKey] || dayjs().format('YYYY-MM-DD')
        if (field.endDate) {
          this.endDate = dayjs().format('YYYY-MM-DD')
        } else {
          this.endDate = '2039-5-20'
        }
        this.$refs.calendarGeneralPopup
          .open()
          .then(() => {
            console.log('that.selectDate', that.selectDate)
            that.$set(that.formData[field.targetObj], field.targetKey, that.selectDate || this.defaultDate)
          })
          .catch(() => {
            console.log('日期取消')
          })
      } else if (field.type === 'select' && field.targetObj === 'evalOrderBasicReqDTO' && field.targetKey === 'sellerUserId') {
        this.currentField = field
        this.$refs.orderPopup.open()
      }
    },
    handleCarSelected(carInfo) {
      console.log('handleCarSelected', carInfo)
      this.selectedCarInfo = carInfo
      this.$set(this.formData.carBaseReqDTO, 'carBrandId', carInfo.brand.id)
      this.$set(this.formData.carBaseReqDTO, 'carBrand', carInfo.brand.name)
      this.$set(this.formData.carBaseReqDTO, 'carChildsBrandId', carInfo.series.id)
      this.$set(this.formData.carBaseReqDTO, 'carChildsBrandName', carInfo.series.name)
      this.$set(this.formData.carBaseReqDTO, 'carSeriesId', carInfo.model.id)
      this.$set(this.formData.carBaseReqDTO, 'carSeriesName', carInfo.model.name)
      this.$set(this.formData.carBaseReqDTO, 'carTypeId', carInfo.year.id)
      this.$set(this.formData.carBaseReqDTO, 'carTypeName', carInfo.year.name)
    },
    handleCitySelected(date) {
      console.log('handleCitySelected', date)
      this.$set(this.formData.carBaseReqDTO, 'registrationProvinceId', date.province.code)
      this.$set(this.formData.carBaseReqDTO, 'registrationProvinceName', date.province.name)
      this.$set(this.formData.carBaseReqDTO, 'registrationCityId', date.city.code)
      this.$set(this.formData.carBaseReqDTO, 'registrationCityName', date.city.name)
    },
    handleCarCitySelected(date) {
      this.$set(this.formData.carBaseReqDTO, 'carProvinceId', date.province.code)
      this.$set(this.formData.carBaseReqDTO, 'carProvinceName', date.province.name)
      this.$set(this.formData.carBaseReqDTO, 'carCityId', date.city.code)
      this.$set(this.formData.carBaseReqDTO, 'carCityName', date.city.name)
      console.log('handleCarCitySelected', this.formData.carBaseReqDTO)
    },
    pickerChange(index, field) {
      console.log('pickerChange', index, field)
      this.$set(this.formData[field.targetObj], field.targetKey, field.key == 'exteriorColor' || field.key == 'interiorColor' ? field.fieldPickerArray[index].name : field.fieldPickerArray[index].value)
      this.$set(this.formData[field.targetObj], field.targetNameKey, field.fieldPickerArray[index].name)
      console.log('pickerChange', this.formData)
    },
    radioChange(value, field) {
      console.log('radioChange', value, field)
      this.$set(this.formData[field.targetObj], field.targetKey, value)
    },
    calendarChange(date) {
      this.selectDate = date.year + '-' + date.month + '-' + date.date
      console.log('this.selectDate', this.selectDate)
    },
    blurChange(value, field) {
      console.log('blurChange', value, field)
      if (field.key == 'licensePlate') {
        uni.$api.evaluationApi
          .checkRepeat({
            licensePlate: value
          })
          .then(res => {
            console.log('res:', res)
            if (res.data.code == 0) {
              if (res.data.data.result == 1) {
                this.isExistSamePlate = true
                this.$refs.tipsPopup
                  .open()
                  .then(() => {
                    uni.navigateTo({
                      url: '/pages/evaluationForm/addEvaluationFrom?type=edit' + '&evalOrderNo=' + res.data.data.evalOrderNo
                    })
                  })
                  .catch(() => {
                    console.log('用户点击了取消')
                  })
              } else if (res.data.data.result == 2) {
                this.isExistSamePlate = false
                this.$refs.tipsPopup
                  .open()
                  .then(() => {
                    uni.navigateTo({
                      url: '/pages/evaluationForm/evaluationFormDetails?evalOrderNo=' + res.data.data.evalOrderNo
                    })
                  })
                  .catch(() => {
                    console.log('用户点击了取消')
                  })
              }
            } else {
              uni.hideLoading()
              uni.showToast({
                title: res.data.msg || '请求失败',
                icon: 'none'
              })
            }
          })
      }
      // 车架号自动转大写
      if (field.key === 'vin') {
        const upperValue = value.toUpperCase()
        if (upperValue !== value) {
          this.$set(this.formData.carBaseReqDTO, 'vin', upperValue)
        }

        // VIN车架号动态校验：车架号字段，动态转换为大写
        validateVin(upperValue)
          .then(result => {
            console.log('validateVin', result)
            let { valid } = result.data
            this.validateState = valid
            // 校验成功，所有提示已在公共方法中处理
            console.log('车架号校验成功:', result)
          })
          .catch(err => {
            console.log('validateVinErr', result)
          })
      }
      if (field.key === 'mileage') {
        let numValue = Number(value)

        if (isNaN(numValue)) {
          numValue = 0
        }

        if (numValue < 0) numValue = 0
        if (numValue > 999999) numValue = 999999

        const limitedValue = String(numValue)
        if (limitedValue !== value) {
          this.$set(this.formData.carBaseReqDTO, field.key, limitedValue)

          if (Number(value) > 999999) {
            uni.showToast({
              title: `${field.label}不能超过999999`,
              icon: 'none'
            })
          }
        }
      }
      if (field.key === 'guidePrice') {
        let numValue = Number(value)

        if (isNaN(numValue)) {
          numValue = 0
        }

        if (numValue < 0) numValue = 0
        if (numValue > 9999999.99) numValue = 9999999.99

        const limitedValue = String(numValue)
        if (limitedValue !== value) {
          this.$set(this.formData.carBaseReqDTO, field.key, limitedValue)

          if (Number(value) > 9999999.99) {
            uni.showToast({
              title: `${field.label}不能超过9999999.99`,
              icon: 'none'
            })
          }
        }
      }

      if (field.key === 'keyCount' || field.key === 'transferCount') {
        let numValue = Number(value)

        if (isNaN(numValue)) {
          numValue = field.key === 'keyCount' ? 2 : 1
        }

        if (numValue < 0) numValue = 0
        if (numValue > 9) numValue = 9

        const limitedValue = String(Math.floor(numValue))
        if (limitedValue !== value) {
          this.$set(this.formData.carLicenseReqDTO, field.key, limitedValue)
          if (Number(value) > 9) {
            uni.showToast({
              title: `${field.label}不能超过9`,
              icon: 'none'
            })
          }
        }
      }
    },
    confirmCalendar() {
      // this.rangeSelect(this.selectDate)
    },
    // 拍照
    takePhoto(type) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['camera'],
        success: async res => {
          try {
            // 上传所有选择的图片
            for (const tempFilePath of res.tempFilePaths) {
              let url = await uploadFile(tempFilePath)
              console.log('上传图片成功', url)
              this[type](url)
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
    chooseImageFromAlbum(type) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album'],
        success: async res => {
          try {
            // 上传所有选择的图片
            for (const tempFilePath of res.tempFilePaths) {
              let url = await uploadFile(tempFilePath)
              console.log('上传图片成功', url)
              this[type](url)
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

    async scan(type) {
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
            this.takePhoto(type)
          } else if (res.tapIndex === 1) {
            // 从相册选择图片
            this.chooseImageFromAlbum(type)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    vinOcr(imageUrl) {
      uni.showLoading({
        title: '识别中',
        mask: true
      })
      uni.$api.evaluationApi
        .vinOcr({
          imageUrl
        })
        .then(res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            if (res.data.data.status == 1) {
              this.formData.carBaseReqDTO.vin = res.data.data.vin
              // 只有有 VIN 时才做后续校验和 queryByVin
              if (this.formData.carBaseReqDTO.vin) {
                validateVin(this.formData.carBaseReqDTO.vin)
                  .then(result => {
                    console.log('validateVin', result)
                    let { valid } = result.data
                    this.validateState = valid
                    // 校验成功，所有提示已在公共方法中处理
                    console.log('车架号校验成功:', result)
                  })
                  .catch(err => {
                    console.log('validateVinErr', err)
                  })
                uni.$api.evaluationApi
                  .queryByVin({
                    vin: this.formData.carBaseReqDTO.vin
                  })
                  .then(res => {
                    console.log('res:queryByVin', res)
                    if (res.data.code == 0) {
                      this.carTips = res.data.data.base.commonName || ''
                    } else {
                      this.carTips = ''
                    }
                  })
              }
              uni.showToast({ title: '车架号识别完成并已自动填写到表单中', icon: 'none' })
              uni.hideLoading()
            } else {
              uni.showToast({ title: res.data.data.errorMessage, icon: 'none' })
              uni.hideLoading()
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
    carLicenseOcr(imageUrl) {
      uni.showLoading({
        title: '识别中',
        mask: true
      })
      uni.$api.evaluationApi
        .carLicenseOcr({
          imageUrl
        })
        .then(res => {
          console.log('res:', res)
          uni.hideLoading()
          if (res.data.code == 0) {
            uni.showToast({ title: '行驶证信息识别完成，已自动填写到表单中', icon: 'none' })
            if (res.data.data.status == 1) {
              this.formData.carBaseReqDTO.engineNumber = res.data.data.engineNumber

              // 识别车牌号并解析省市回显到上牌城市
              if (res.data.data.licensePlate) {
                const plateLocation = getPlateLocation(res.data.data.licensePlate)
                console.log('plateLocation', plateLocation)

                if (plateLocation.success && plateLocation.province && plateLocation.city) {
                  // 清空上牌城市的ID，只保留名称
                  this.formData.carBaseReqDTO.registrationProvinceId = null
                  this.formData.carBaseReqDTO.registrationCityId = null
                  this.formData.carBaseReqDTO.registrationProvinceName = plateLocation.province
                  this.formData.carBaseReqDTO.registrationCityName = plateLocation.city
                }
              }

              if (this.title == '新增评估单') {
                this.formData.carBaseReqDTO.licensePlate = res.data.data.licensePlate
                if (res.data.data.licensePlate) {
                  uni.$api.evaluationApi
                    .checkRepeat({
                      licensePlate: res.data.data.licensePlate
                    })
                    .then(res => {
                      console.log('res:', res)
                      if (res.data.code == 0) {
                        if (res.data.data.result == 1) {
                          this.isExistSamePlate = true
                          this.$refs.tipsPopup
                            .open()
                            .then(() => {
                              uni.navigateTo({
                                url: '/pages/evaluationForm/addEvaluationFrom?type=edit' + '&evalOrderNo=' + res.data.data.evalOrderNo
                              })
                            })
                            .catch(() => {
                              console.log('用户点击了取消')
                            })
                        } else if (res.data.data.result == 2) {
                          this.isExistSamePlate = false
                          this.$refs.tipsPopup
                            .open()
                            .then(() => {
                              uni.navigateTo({
                                url: '/pages/evaluationForm/evaluationFormDetails?evalOrderNo=' + res.data.data.evalOrderNo
                              })
                            })
                            .catch(() => {
                              console.log('用户点击了取消')
                            })
                        }
                      } else {
                        uni.hideLoading()
                        uni.showToast({
                          title: res.data.msg || '请求失败',
                          icon: 'none'
                        })
                      }
                    })
                }
              }

              this.formData.carBaseReqDTO.vin = res.data.data.vin
              this.formData.carBaseReqDTO.registrationDate = res.data.data.registrationDate

              // 处理 previousOwnerAddress，提取省市并回显到上牌城市
              const previousOwnerAddress = res.data.data.previousOwnerAddress
              this.formData.carLicenseReqDTO.previousOwnerAddress = previousOwnerAddress

              if (previousOwnerAddress) {
                // 解析地址，提取省和市（到市级）
                let provinceName = ''
                let cityName = ''

                // 处理直辖市（北京市、上海市、天津市、重庆市）
                const municipalities = ['北京市', '上海市', '天津市', '重庆市']
                const municipalityMatch = municipalities.find(city => previousOwnerAddress.startsWith(city))

                if (municipalityMatch) {
                  // 直辖市：省和市都是同一个名称
                  provinceName = municipalityMatch
                  cityName = municipalityMatch
                } else {
                  // 普通省份：例如："山东省济南市历下区" -> 省："山东省"，市："济南市"
                  const provinceMatch = previousOwnerAddress.match(/^(.+?省)/)
                  const cityMatch = previousOwnerAddress.match(/省(.+?市)/)

                  if (provinceMatch && cityMatch) {
                    provinceName = provinceMatch[1]
                    cityName = cityMatch[1]
                  }
                }

                if (provinceName && cityName) {
                  // 清空上牌城市的ID，只保留名称
                  this.formData.carBaseReqDTO.registrationProvinceId = 0
                  this.formData.carBaseReqDTO.registrationCityId = 0
                  this.formData.carBaseReqDTO.registrationProvinceName = provinceName
                  this.formData.carBaseReqDTO.registrationCityName = cityName
                }
              }

              this.formData.carLicenseReqDTO.previousOwnerName = res.data.data.previousOwnerName
              this.formData.carLicenseReqDTO.carSeriesName = res.data.data.carSeriesName
              this.formData.carLicenseReqDTO.carTypeName = res.data.data.carTypeName
              // 行驶证识别到 VIN 后，再调用 queryByVin
              if (this.formData.carBaseReqDTO.vin) {
                uni.$api.evaluationApi
                  .queryByVin({
                    vin: this.formData.carBaseReqDTO.vin
                  })
                  .then(res => {
                    console.log('res:', res)
                    if (res.data.code == 0) {
                      this.carTips = res.data.data.base.commonName || ''
                    } else {
                      this.carTips = ''
                    }
                  })
              }
            } else {
              uni.hideLoading()
              uni.showToast({ title: res.data.data.errorMessage, icon: 'none' })
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

    // 上一步逻辑
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
        // 滚动到顶部
        this.scrollToTop()
      }
    },

    // 提交表单逻辑
    submitForm: throttle(async function () {
      // 表单提交验证
      if (this.currentStep === 3) {
        const leftFront45Image = this.formImagesData['11'] // key为11的是左前45度图片
        if (!leftFront45Image || !leftFront45Image.length) {
          uni.showToast({
            title: '左前45度图片为必填项',
            icon: 'none'
          })
          return
        }
      }
      const exteriorColorField = this.formFields.find(field => field.key === 'exteriorColor')
      const interiorColorField = this.formFields.find(field => field.key === 'interiorColor')

      if (exteriorColorField && this.formData.carBaseReqDTO.exteriorColorName) {
        this.$set(this.formData.carBaseReqDTO, 'exteriorColor', this.formData.carBaseReqDTO.exteriorColorName)
      }
      if (interiorColorField && this.formData.carBaseReqDTO.interiorColorName) {
        this.$set(this.formData.carBaseReqDTO, 'interiorColor', this.formData.carBaseReqDTO.interiorColorName)
      }
      this.formData.imageList = []
      // 处理车辆图片 - fileType: 1
      this.processMediaData(this.formImagesData, 1)

      // 处理证件资料 - fileType: 2
      this.processMediaData(this.certificateImagesData, 2)

      // 处理车辆视频 - fileType: 3
      this.processMediaData(this.carVideoData, 3)

      // 处理其他图片 - fileType: 4
      this.processMediaData(this.otherImagesData, 4)
      // 处理车辆检测报告 - fileType: 5
      this.processMediaData(this.reportImageData, 5)
      uni.showLoading({
        title: '提交中...'
      })
      console.log('提交的表单数据:', this.formData)
      const guidePrice = this.formData.carBaseReqDTO.guidePrice
      this.formData.carBaseReqDTO.guidePrice = !isNaN(Number(guidePrice)) ? Number(guidePrice).toFixed(2) : '0.00'
      if (this.query.type === 'add') {
        uni.showLoading()
        const res = await uni.$api.evaluationApi.evalOrderCreate({ ...this.formData, source: 1 })
        console.log('res:', res)
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: '新增成功',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 300)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          })
        }
      } else if (this.query.type === 'edit') {
        uni.showLoading()
        const res = await uni.$api.evaluationApi.evalOrderUpdate(this.formData)
        console.log('res:', res)
        if (res.data.code == 0) {
          uni.hideLoading()
          uni.showToast({
            title: '提交成功',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 1000)
        } else {
          if (res.data.code == 3004) {
            uni.hideLoading()
            this.$refs.editTipsPopup.open().then(() => {
              uni.navigateBack({
                delta: 1
              })
            })
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        }
      }
    }, 1500),

    processMediaData(mediaData, fileType) {
      if (!mediaData || typeof mediaData !== 'object') {
        return
      }

      Object.keys(mediaData).forEach(fileSubtype => {
        const mediaItems = mediaData[fileSubtype]

        if (!Array.isArray(mediaItems)) {
          return
        }

        mediaItems.forEach(item => {
          if (!item || typeof item !== 'object' || !item.url) {
            return
          }
          const fileName = item.name
          const fileFormat = item.fileFormat

          this.formData.imageList.push({
            fileType: fileType,
            fileSubtype: parseInt(fileSubtype, 10), // 确保是数字类型
            fileUrl: item.url,
            fileFormat: fileFormat,
            fileName: fileName
          })
        })
      })
    },

    // 滚动到顶部
    scrollToTop() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.form-container').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(res => {
        if (res && res[0]) {
          uni.pageScrollTo({
            scrollTop: res[0].top + res[1].scrollTop - 100,
            duration: 300
          })
        }
      })
    },
    onConfirm(data) {
      console.log('onConfirm', data)

      // 如果有当前字段信息
      if (this.currentField) {
        // 获取字段的目标对象、目标键和名称键
        const { targetObj, targetKey, targetNameKey, key, sourceNameKey, sourceKey } = this.currentField

        // 获取弹窗返回的值
        const chooseContent = data.chooseContent || {}

        // 定义一个通用的赋值函数，支持自定义映射规则
        const setValue = (obj, prop, value) => {
          if (obj && prop) {
            obj[prop] = value
          }
        }

        // 根据是否有targetObj进行不同的赋值逻辑
        if (targetObj && targetKey) {
          // 确保目标对象存在
          if (!this.formData[targetObj]) {
            this.formData[targetObj] = {}
          }

          // 设置主要字段值
          setValue(this.formData[targetObj], targetKey, chooseContent[sourceKey] || chooseContent)

          // 如果有名称键，设置名称值
          if (targetNameKey) {
            const nameValue = chooseContent[sourceNameKey] || ''
            setValue(this.formData[targetObj], targetNameKey, nameValue)
          }
        } else if (targetKey) {
          // 没有targetObj但有targetKey的情况
          const value = chooseContent[sourceKey] || chooseContent
          setValue(this.formData, targetKey, value)

          if (targetNameKey) {
            const nameValue = chooseContent.name || chooseContent[sourceNameKey] || ''
            setValue(this.formData, targetNameKey, nameValue)
          }
        } else {
          // 否则直接赋值到formData
          setValue(this.formData, key, chooseContent[key] || chooseContent)
        }
        console.log(this.userInfo)
        this.$set(this.formData.evalOrderBasicReqDTO, 'sellerMerchantId', this.userInfo.shopMerchantId || '')
        this.$set(this.formData.evalOrderBasicReqDTO, 'sellerMerchantName', this.userInfo.shopMerchantName || '')

        console.log('formData', this.formData)

        // 清空当前字段信息
        this.currentField = null
      }
    }
  }
}
</script>
<style scoped lang="scss">
// Popup样式
::v-deep .tipsPopup .uni-popup__wrapper {
  width: toRpx(848);
  height: toRpx(644);
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
.add-evaluation-from {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  padding: toRpx(160) toRpx(64) toRpx(48);
  box-sizing: border-box;
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 999;
    pointer-events: none;

    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .title {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 700;
      font-size: toRpx(32);
      color: #1a1a1a;
    }
  }
  .detail-content {
    width: 100%;
    height: 100%;
    border-radius: toRpx(48);
    box-sizing: border-box;
    overflow: hidden;
    background: #f1f4ff;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    padding: 0 toRpx(48);
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
    .stepper-container {
      display: flex;
      align-items: center;
      padding: toRpx(32) 0;

      > view {
        display: flex;
        align-items: center;
      }

      .step-number-circle {
        width: toRpx(46);
        height: toRpx(46);
        border-radius: 50%;
        border: toRpx(2) solid #999999;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &::before {
          content: '';
          width: toRpx(38);
          height: toRpx(38);
          border-radius: 50%;
          background-color: #999999;
          position: absolute;
          z-index: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &.active {
          border: toRpx(2) solid #4673ff;

          &::before {
            background-color: #4673ff;
          }
        }
      }

      .step-number {
        font-size: toRpx(28);
        color: #fff;
        position: relative;
        z-index: 1;
      }

      .step-name {
        margin-left: toRpx(16);
        font-size: toRpx(32);
        color: #999999;

        &.active {
          color: #4673ff;
        }
      }

      .dash-line {
        width: toRpx(64);
        height: 0;
        border-top: toRpx(4) dashed #d6d6d6;
        margin: 0 toRpx(32);

        &.active {
          border-top: toRpx(4) dashed #4673ff;
        }
      }
    }
    .scanBtn {
      width: toRpx(188);
      height: toRpx(64);
      border-radius: toRpx(64);
      background: #ffffff;
      color: #333333;
      font-size: toRpx(28);
      font-weight: 400;
      .sprite-icon {
        margin-right: toRpx(8);
      }
    }
    .fromBox {
      width: 100%;
      height: calc(100% - #{toRpx(268)});
    }

    .form-container-upload {
      width: 100%;

      height: 100%;
      overflow-y: auto;
      padding-right: toRpx(8);
    }

    /* 上传按钮样式 */
    .upload-btn {
      width: toRpx(200);
      height: toRpx(64);
      border-radius: toRpx(32);
      border: toRpx(2) dashed #999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999999;
      font-size: toRpx(28);
    }

    /* 上传区域样式 */
    .upload-section {
      margin-bottom: toRpx(40);
      grid-column: 1 / -1;
      padding: toRpx(32) toRpx(48);
      border-radius: toRpx(16);
      background-color: #fff;
    }

    .section-title {
      font-size: toRpx(32);
      font-weight: 600;
      color: #333333;
      margin-bottom: toRpx(24);
    }

    .upload-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(24);
    }
    .upload-item-container {
      align-items: flex-start;
      .upload-label {
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
        display: flex;
        align-items: flex-start;
        margin-right: toRpx(42);
        width: toRpx(180);
      }
      .requiredLabel {
        color: #f24724;
        font-size: toRpx(28);
        font-weight: 400;
        margin-left: toRpx(8);
      }
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
      margin-top: toRpx(12);
      font-size: toRpx(24);
    }
  }

  .button-module {
    margin-bottom: toRpx(24);
    margin-top: toRpx(44);
    .button-container {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: toRpx(32);
    }

    .cancel-btn {
      width: toRpx(724);
      height: toRpx(80);
      border-radius: toRpx(48);
      border: toRpx(1) solid #ffffff;
      background: #3b73ff1a;
      text-align: center;
      line-height: toRpx(80);
      color: #4673ff;
      font-size: toRpx(28);
      font-weight: 500;
    }

    .next-btn {
      width: toRpx(724);
      height: toRpx(80);
      border-radius: toRpx(48);
      border: toRpx(1) solid #ffffff;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      text-align: center;
      line-height: toRpx(80);
      color: #ffffff;
      font-size: toRpx(28);
      font-weight: 500;
    }
  }
}
</style>
