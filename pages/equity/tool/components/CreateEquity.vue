<template>
  <view class="equity-box">
    <view class="common-title">服务信息录入</view>
    <template v-if="loadComplete">
      <view class="box">
        <scroll-view
          scroll-y
          class="scroll-view"
        >
          <view
            class="box-content"
            :key="viewKey"
          >
            <GlCell
              :formList="formList"
              :formData="orderObj"
              @inputBlur="inputBlur"
              @handleCell="handleCell"
              :titleList="titleList"
              @collapseAll="collapseAll"
              collapseControl
              @radioChange="radioChange"
            >
              <template #goodsHtml>
                <EquityGoods
                  :externalData="orderObj"
                  ref="goodsRef"
                />
              </template>
              <template #tireHtml>
                <template v-if="orderObj.tireFlag == 1">
                  <EquityTire
                    :externalData="orderObj"
                    ref="tireRef"
                  />
                </template>
              </template>
              <template #uploadHtml>
                <EquityUpload
                  :externalData="orderObj"
                  ref="uplopdRef"
                />
              </template>
              <template #conversion>
                <template v-if="orderObj.inclueType == 1">
                  <EquityConversion
                    :externalData="orderObj"
                    ref="conversionRef"
                  />
                </template>
              </template>
            </GlCell>

          </view>
          <view class="btns flex">
            <view
              class="btn save"
              @click="submit(0)"
            >存草稿</view>
            <view
              @click="submit(1)"
              class="btn"
            >确认提交</view>
          </view>
        </scroll-view>
      </view>
    </template>
    <order-popup
      ref="orderPopup"
      :data="orderObj"
      @onConfirm="onConfirm"
      :popupType="popupType"
    />
    <uni-calendar
      ref="calendar"
      :insert="false"
      :clearDate="false"
      :endDate="endDate"
      @confirm="confirmCalendar($event,'billingDate')"
      :date="orderObj.billingDate"
      showBottomBtn
    />
    <uni-calendar
      ref="futureCalendar"
      :insert="false"
      :clearDate="false"
      :startDate="startDate"
      @confirm="confirmCalendar($event,'effectiveDate')"
      :date="orderObj.effectiveDate"
      showBottomBtn
    />
    <NoticePopup
      ref="reportNotice"
      :title="noticeObj.title"
      :text="noticeObj.text"
      :type="noticeObj.type || 'success'"
      :buttons="noticeObj.buttons"
    ></NoticePopup>
  </view>
</template>

<script type='text/ecmascript-6'>
import utils from '@/utils/utils'

import {
  EQUITY_FORM_LIST
  , EQUITY_FORM_TITLE_LIST,
  EQUITY_POPUP_ENUM,
  tireObjList,
  EQUITY_FORM_RULE,
  energyFormRule,
  oilFormRule,
  extendServiceFormRule
} from '../contant'
import GlCell from '@/components/Form/GlCell.vue'
import OrderPopup from '@/components/OrderPopup/index.vue'
import dayjs from 'dayjs'
import EquityGoods from './EquityForm/EquityGoods.vue'
import EquityTire from './EquityForm/EquityTire.vue'
import EquityUpload from './EquityForm/EquityUpload.vue'
import EquityConversion from './EquityForm/EquityConversion.vue'
import NP from 'number-precision'
import NoticePopup from '@/components/NoticePopup.vue'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
const codeToAttr = {
  YB0001: 'invoice',
  YB0003: 'driveFront',
  YB0004: 'driveBack',
  YB0002: 'contract',
  YB0005: 'other',
  QS0001: 'retrofitInvoice',
  QS0002: 'retrofit'
},
  attrToCode = {
    invoice: 'YB0001',
    driveFront: 'YB0003',
    driveBack: 'YB0004',
    contract: 'YB0002',
    other: 'YB0005',
    retrofitInvoice: 'QS0001',
    retrofit: 'QS0002'
  },
  ybAttachmentFlagTips = {
    YB0001: '购车发票',
    YB0003: '行驶证主页',
    YB0004: '行驶证副页',
    YB0002: '合同购买时里程数',
    YB0005: '其他',
  },
  qsFlagTips = {
    QS0001: '发票或收据',
    QS0002: '加改装部位'
  }
export default {
  name: 'CreateEquity',
  components: {
    GlCell,
    OrderPopup,
    EquityGoods,
    EquityTire,
    EquityUpload,
    EquityConversion,
    NoticePopup
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      formList: utils.deepClone(EQUITY_FORM_LIST),
      titleList: utils.deepClone(EQUITY_FORM_TITLE_LIST),
      endDate: dayjs().format('YYYY-MM-DD'),
      startDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      equityFormRule: utils.deepClone(EQUITY_FORM_RULE),
      orderObj: {},
      loadComplete: false,
      popupType: 0,
      viewKey: Date.now(),
      conSecondObj: {
        vin: ''
      },
      noticeObj: {},
      validateState: true
    }
  },
  watch: {
    transmissionOfData: {
      handler (val) {
        if (val && val.contractNo) this.getServiceInfoDetail({
          contractNo: val.contractNo
        }, 1)
        if (val && val.orderId) this.getServiceInfoDetail({
          orderId: val.orderId
        }, 2)
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    orderPopupRef () {
      return this.$refs.orderPopup
    }
  },
  mounted () {

  },
  methods: {
    // 车架号动态校验
    validateVin () {
      let carVinVal = this.orderObj.vin;
      if (carVinVal) {
        this.orderObj.carVin = formatVinInput(carVinVal)
        validateVin(this.orderObj.carVin).then(result => {
          console.log("validateVin", result);
          let { valid } = result.data;
          this.validateState = valid
          // 校验成功，所有提示已在公共方法中处理
          console.log('车架号校验成功:', result)
        }).catch(err => {
          console.log("validateVinErr", result);
        })
      }
    },
    // 单选框change事件
    radioChange (e, val) {
      this.$set(this.orderObj, val.value, e.detail.value)
      this.formList.map(k => {
        k.map(i => {
          if (i.value == val.value) i.current = e.detail.value
        })
      })
    },
    handleCell (val) {
      if (['calendar', 'futureCalendar'].includes(val.key)) return this.$refs[val.key]?.open()
      this.popupType = Object.keys(EQUITY_POPUP_ENUM).find(key => EQUITY_POPUP_ENUM[key].key === val.key) * 1
      this.orderPopupRef.open()
    },
    onConfirm (val) {
      const { chooseContent, popupType } = val,
        _typeValue = EQUITY_POPUP_ENUM[popupType]
      if (_typeValue.key == 'carBrand') {
        Object.assign(this.orderObj, chooseContent)
        this.$set(this.orderObj, 'carBrandText',
          `${chooseContent.vehicleBrandName}/${chooseContent.vehicleSubBrandName}/${chooseContent.vehicleSeriesName}/${chooseContent.vehicleShapeName}`)
        return
      } else if (_typeValue.options) {
        this.$set(this.orderObj, _typeValue.targetIdKey, chooseContent[_typeValue.sourceIdKey || 'optionId'])
        this.$set(this.orderObj, _typeValue.targetNameKey, chooseContent[_typeValue.sourceNameKey || 'optionLabel'])
        return
      }
      this.$set(this.orderObj, _typeValue.value, chooseContent)
    },
    inputBlur (e, val) {
      this.orderObj[val.value] = this.orderObj[val.value]
      // VIN车架号动态校验：车架号字段，动态转换为大写
      if (val.value === 'vin') this.validateVin()
    },
    async getServiceInfoDetail (paramSdata, type) {
      try {
        uni.showLoading({
          title: '加载中...',
          mask: true
        })
        let targetApi = type == 1 ? 'getServiceInfoDetail' : 'getEquityOrderByOrderId'
        const data = await uni.$api.equityApi[targetApi](paramSdata)
        if (!data) throw '获取数据失败'
        if (data.ybAttachmentFlag != 0) this.formList[3] = []
        if (data.qsFlag != 1) this.formList[4] = []

        this.orderObj.goodInfoList = data.goodInfoList
        this.orderObj.tireFlag = data.tireFlag
        let carInfo = {},
          params = {}
        if (data.vehicleShapeId) {
          carInfo = {
            carBrandText: `${data.vehicleBrandName}/${data.vehicleSubBrandName}/${data.vehicleSeriesName}/${data.vehicleShapeName}`,
            vehicleShapeId: data.vehicleShapeId,
            vehicleShapeName: data.vehicleShapeName,
            vehicleSeriesId: data.vehicleSeriesId,
            vehicleSeriesName: data.vehicleSeriesName,
            vehicleBrandId: data.vehicleBrandId,
            vehicleBrandName: data.vehicleBrandName,
            vehicleSubBrandId: data.vehicleSubBrandId,
            vehicleSubBrandName: data.vehicleSubBrandName,
          }
        }
        if (!data.customerType) data.customerType = 1
        if (data.customerType) {
          const customerTypeEnum = this.orderPopupRef.componentObject[21].options
          params = {
            customerType: data.customerType,
            customerTypeName: customerTypeEnum.find(i => i.optionId == data.customerType).optionLabel
          }
        }
        if (data.cardType) {
          const cardTypeEnum = this.orderPopupRef.componentObject[22].options
          params.cardType = data.cardType
          params.cardTypeName = cardTypeEnum.find(i => i.optionId == data.cardType).optionLabel
        }
        if (data.buyCarType == null) data.buyCarType = 1
        if (data.buyCarType != null) {
          const buyCarTypeEnum = this.orderPopupRef.componentObject[23].options
          params.buyCarType = data.buyCarType
          params.buyCarTypeName = buyCarTypeEnum.find(i => i.optionId == data.buyCarType).optionLabel
        }
        let priceList = ['actualSalesPrice']
        data.goodInfoList.map((item, idx) => {
          if (item.actualSalesPrice) item.actualSalesPrice = NP.divide(Number(item.actualSalesPrice), 100).toFixed(2)
          // priceList.forEach(k => {
          //   data.goodInfoList[idx][k] = item[k] === null ? null : (item[k] / 100).toFixed(2)
          // })
          if (item.vehicleRegistrationDate) {
            item.vehicleRegistrationDate = dayjs(item.vehicleRegistrationDate).format('YYYY-MM-DD')
          }
          if (item.buyDate) {
            item.buyDate = dayjs(item.buyDate).format('YYYY-MM-DD')
          }
          if (item.qualityBeginDate) {
            item.qualityBeginDate = dayjs(item.qualityBeginDate).format('YYYY-MM-DD')
          }
          if (item.itemsCode == 'YB0003') {
            item.gearbox = item.gearbox || ''
            item.vehicleNature = typeof item.vehicleNature == 'number' ? item.vehicleNature : 1
            let val = constantData.vehicleNatureList.find(k => k.optionId == item.vehicleNature)
            if (val) {
              item.vehicleNatureName = val.optionLabel
            }
          }
          if (item.printType == 2 && !['YB0001', 'YB0002', 'YB0003'].includes(item.itemsCode)) item.displacementPowerFlag = item.displacementPowerFlag || 0
        })
        // 判断购买商品是否全部是延保allWarrantyFlag
        const allWarrantyFlag = data?.goodInfoList?.some(v => v.printType != 2),
          imgObj = {}
        Object.keys(codeToAttr).map(key => {
          if (codeToAttr[key] == 'other') imgObj[codeToAttr[key]] = []
          else imgObj[codeToAttr[key]] = ''
        })
        this.formList.map(i => {
          i.map(e => {
            if (e.value == 'effectiveDate') e.hidden = !allWarrantyFlag //false 显示生效日期 true不显示
          })
        })
        /**图片 */
        if ((data.ybAttachmentFlag == 0 || data.qsFlag == 1) && data.attachmentList?.length) {
          data.attachmentList.forEach(item => {
            if (item.attachmentCode == 'YB0005') imgObj[codeToAttr[item.attachmentCode]].push(item.attachmentFile)
            else imgObj[codeToAttr[item.attachmentCode]] = item.attachmentFile
          })
        }
        if (data.tireFlag == 0) {
          const list = ['tireBrand', 'tireScale', 'leftFrontDTO', 'leftFrontBatch', 'rightFrontDTO', 'rightFrontBatch', 'leftRearDTO', 'leftRearBatch', 'rightRearDTO', 'rightRearBatch']
          list.map(key => {
            this.equityFormRule[key][0].required = false
          })
        }
        /**轮胎 */
        if (data.attributeList?.length) {
          data.attributeList.map((e, idx) => {
            if (e.attributeValue) data[tireObjList[idx].attr] = e.attributeValue
          })
        }
        let inclueType = data.addOnsFlag == 0 ? 2 : 1
        this.orderObj = utils.deepClone({
          ...this.orderObj,
          ...data,
          vin: data.vin,
          invoicePrice: NP.divide(Number(data.invoicePrice || 0), 100).toFixed(2),
          seatesNum: data.seatesNum,
          seat: data.seatesNum,
          engineNo: data.engineNo,
          vehicleColor: data.vehicleColor,
          billingDate: data.billingDate ? dayjs(data.billingDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          cardNo: data.cardNo,
          customerAddress: data.customerAddress,
          goodInfoList: data.goodInfoList,
          effectiveDate: data.effectiveDate ? dayjs(data.effectiveDate).format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD'),
          tireFlag: data.tireFlag,
          compensationName: data.compensationName || data.customerName,
          attachmentList: data.attachmentList || [],
          merchantName: data.merchantName,
          merchantPhone: data.merchantPhone,
          merchantAddress: data.merchantAddress,
          imgObj,
          inclueType,
          ...carInfo,
          ...params
        })
        this.formList[4].map(e => {
          if (e.value == 'inclueType') e.current = inclueType
        })
        this.viewKey = Date.now()
        this.loadComplete = true
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        this.viewKey = Date.now()
        this.loadComplete = true
        if (error) uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    collapseAll (index) {
      this.titleList[index].collapseAll = !this.titleList[index].collapseAll
    },
    confirmCalendar (e, key) {
      this.orderObj[key] = e.fulldate
    },
    async submit (operationType) {
      // VIN车架号-动态校验
      const carVin = this.orderObj.vin
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
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      const { orderObj, conSecondObj } = this,
        { goodsRef, tireRef, uplopdRef, conversionRef } = this.$refs
      let params = utils.deepClone(orderObj),
        attachmentList = [],
        attributeList = []
      if (tireRef) {
        let { tireObj } = tireRef
        tireObjList.map(item => {
          if (tireObj[item.attr]) {
            attributeList.push({
              attributeValue: tireObj[item.attr],
              sort: item.sort,
              attributeGroup: item.attributeGroup,
              attributeName: item.attributeName
            })
            params[item.attr] = tireObj[item.attr]
          }
        })
        params.attributeList = attributeList
        params.tireBrand = tireObj.tireBrand
        params.tireScale = tireObj.tireScale
      }
      if (goodsRef) {
        let goodInfoList = utils.deepClone(goodsRef.goodInfoList)
        goodInfoList.map(item => {
          item.actualSalesPrice = NP.times(Number(item.actualSalesPrice), 100)
        })
        params.goodInfoList = goodInfoList
      }
      if (uplopdRef || conversionRef) {
        let imgObj = {}
        if (uplopdRef) imgObj = uplopdRef.imgObj
        if (conversionRef && params.inclueType == 1) imgObj = {
          ...imgObj,
          ...conversionRef.imgObj
        }
        Object.keys(imgObj).map(key => {
          if (Array.isArray(imgObj[key])) {
            imgObj[key].map(item => {
              attachmentList.push({
                attachmentCode: attrToCode[key],
                attachmentType: 'IMG',
                attachmentFile: item
              })
            })
          } else {
            attachmentList.push({
              attachmentCode: attrToCode[key],
              attachmentType: 'IMG',
              attachmentFile: imgObj[key]
            })
          }
        })
      }
      params.invoicePrice = NP.times(Number(params.invoicePrice), 100)
      params.attachmentList = attachmentList
      if (operationType == 0) {
        this.confirm(params, operationType)
        return
      }
      if (!this.checkOrder(params)) return uni.hideLoading()
      const { code, message } = await uni.$api.equityApi.checkVinBuyEquityOrder({
        vin: orderObj.vin
      })
      if (code == 0) {
        this.confirm(params, operationType)
      } else if (code == '-2') {
        if (conSecondObj.vin == orderObj.vin) {
          this.confirm(params, operationType)
          this.conSecondObj.vin = ''
        } else {
          this.conSecondObj.vin = orderObj.vin
          this.openNotice(message, params)
        }
      } else this.openNotice(message, params)
    },
    checkOrder (params) {
      let { equityFormRule } = this
      try {
        Object.keys(equityFormRule).map(key => {
          let [nullCheck, validatorCheck] = equityFormRule[key]
          if (nullCheck.required) {
            if (!params[key]) throw equityFormRule[key][0].message
            else {
              if (validatorCheck && validatorCheck.validator) {
                const res = validatorCheck.validator('', params[key])
                if (res && res.message) throw res.message
              }
            }
          }
        })
        params.goodInfoList?.map(item => {
          if (item.printType == 2) {
            if (item.itemsCode == 'YB0003') Object.keys(oilFormRule).map(key => {
              let [nullCheck, validatorCheck] = oilFormRule[key]
              if (nullCheck.required) {
                if (!item[key]) throw oilFormRule[key][0].message
                else {
                  if (validatorCheck && validatorCheck.validator) {
                    const res = validatorCheck.validator('', item[key])
                    if (res && res.message) throw res.message
                  }
                }
              }
            })
            if (item.itemsCode == 'YB0001' || item.itemsCode == 'YB0002') Object.keys(energyFormRule).map(key => {
              let [nullCheck, validatorCheck] = energyFormRule[key]
              if (nullCheck.required) {
                if (!item[key]) throw energyFormRule[key][0].message
              } else {
                if (validatorCheck && validatorCheck.validator) {
                  const res = validatorCheck.validator('', item[key])
                  if (res && res.message) throw res.message
                }
              }

            })
            if (item.itemsCode != 'YB0001' && item.itemsCode != 'YB0002' && item.itemsCode != 'YB0003') Object.keys(extendServiceFormRule).map(key => {

              let [nullCheck, validatorCheck] = extendServiceFormRule[key]
              if (nullCheck.required) {
                if (!item[key]) throw extendServiceFormRule[key][0].message
              } else {
                if (validatorCheck && validatorCheck.validator) {
                  const res = validatorCheck.validator('', item[key])
                  if (res && res.message) throw res.message
                }
              }
            })
          }
        })

        if (params.ybAttachmentFlag == 0 || params.qsFlag == 1) {
          if (params.ybAttachmentFlag == 0) {
            params.attachmentList.map(e => {
              let item = ybAttachmentFlagTips[e.attachmentCode]
              if (e.attachmentCode != 'YB0005') {
                if (!e.attachmentFile) throw `请上传${item}`
              }
            })
          }
          if (params.qsFlag == 0 && params.inclueType == 1) {
            params.attachmentList.map(e => {
              let item = qsFlagTips[e.attachmentCode]
              if (!e.attachmentFile) throw `请上传${item}`
            })
          }
        }
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
        return false
      }
      return true
    },
    async confirm (paramsData, operationType) {
      try {
        let params = utils.deepClone(paramsData)
        this.$refs.reportNotice.close()
        // 0草稿,1提单
        params.operationType = operationType
        params.addOnsFlag = params.inclueType == 2 ? 0 : 1
        params.seatesNum = params.seat
        delete params.imgObj
        delete params.inclueType
        delete params.seat
        uni.showLoading({
          mask: true
        })
        const { code, message } = await uni.$api.equityApi.addEquityOrder(params)
        if (code == 0) {

          if (operationType == 0) {
            uni.hideLoading()
            uni.showToast({
              title: '保存成功',
              icon: 'none',
              mask: true
            })
            setTimeout(() => {
              this.$emit('jump', 'EquityManagement')
            }, 1500)
          } else {
            uni.showLoading({
              mask: true
            })
            setTimeout(async () => {
              // 从URL获取文件名
              const getFileNameFromUrl = (url) => {
                return url.split('/').pop().split('?')[0] || '未知文件'
              }
              const { contractNo } = params,
                url = await uni.$api.equityApi.printContract({ contractNo }),
                fileName = getFileNameFromUrl(url),
                type = 3
              if (!url) throw '获取合同失败'
              this.noticeObj = {
                title: '提单成功',
                text: '提单合同支持分享或保存',
                type: 'success',
                buttons: [
                  {
                    text: '查看合同',
                    type: 'primary',
                    callback: _ => {
                      this.$refs.reportNotice.close()
                      this.$emit('jump', 'EquityManagement')
                      // 跳转到预览页面
                      uni.navigateTo({
                        url: `/pages/common/filePreview?fileUrl=${encodeURIComponent(url)}&fileType=${type}&fileName=${encodeURIComponent(fileName)}`
                      })
                    }
                  }
                ]
              }
              setTimeout(() => {
                uni.hideLoading()
                this.$refs.reportNotice.open()
              }, 100)
            }, 1500)
          }
        } else throw message

      } catch (error) {
        uni.hideLoading()
        if (error) uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    openNotice (message, params) {
      uni.hideLoading()
      let title = '出单失败',
        btnText = '重新提单',
        callbackFun = () => { }
      if (message.includes('该车架已经购买过')) {
        title = '信息确认'
        btnText = '继续出单'
        callbackFun = () => {
          this.confirm(params, 1)
        }
      }
      this.noticeObj = {
        title,
        text: message,
        type: 'warning',
        buttons: [
          {
            text: btnText,
            type: 'primary',
            callback: callbackFun
          }
        ]
      }
      this.$nextTick(() => this.$refs.reportNotice.open())
    },
  }
}
</script>

<style scoped lang='scss'>
.equity-box {
  height: 100%;
  position: relative;
  .box {
    height: calc(100% - #{toRpx(120)});
    .scroll-view {
      height: 100%;
    }
    &-content {
      padding: 0 toRpx(48);
    }
  }
  .customer-title {
    .customer-file {
      margin-left: toRpx(20);
      color: #347bff;
      font-size: toRpx(24);
      .sprite-icon {
        margin-right: toRpx(4);
      }
    }
  }
  .btns {
    padding: toRpx(24) toRpx(128);
    gap: toRpx(32);
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: toRpx(1130);
      height: toRpx(80);
      color: #fff;
      border-radius: toRpx(48);
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    }
    .save {
      background: #3b73ff1a;
      color: #4673ff;
      font-size: toRpx(28);
      font-weight: 500;
    }
  }
}
</style>