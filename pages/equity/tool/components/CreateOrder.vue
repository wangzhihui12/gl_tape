<template>
  <view class="order">
    <view :class="['order-box', { hide: showUpload }]" :key="formKey">
      <view class="common-title">车险信息</view>
      <view class="box">
        <scroll-view class="scroll-view" scroll-y="true">
          <view class="box-content">
            <GlCell :formList="formList" :formData="orderObj" @radioChange="radioChange" @inputBlur="inputBlur" @handleCell="handleCell" :titleList="titleList">
              <template slot="customer">
                <view class="customer-title flex">
                  客户信息
                  <view
                    class="customer-file flex"
                    @click="
                      handleCell({
                        key: 'customer'
                      })
                    "
                  >
                    <view class="sprite-icon icon-customer-list"></view>
                    客户档案
                  </view>
                </view>
              </template>
              <template slot="skuGoods">
                <template v-if="orderObj.skuGoods.length">
                  <SkuGoods :list="orderObj.skuGoods" @changeTotalPrice="changeTotalPrice" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></SkuGoods>
                </template>
                <template v-if="orderObj.total > 0">
                  <view class="total">
                    <view class="total-left">总价</view>
                    <view class="total-right">¥{{ orderObj.total }}</view>
                  </view>
                </template>
              </template>
              <template slot="otherPay">
                <view v-if="showPayTips" class="pay-tips">其他收款：当客户已向嘀加付款但无法使用流水补录时，新建工单应选择收款方为「嘀加收款」且支付方为「其他收款」。</view>
              </template>
            </GlCell>
          </view>
          <view class="btns flex" v-if="orderObj.baseSceneCodeValue">
            <view class="btn save" @click="handleEditSave">存草稿</view>
            <view @click="submit" class="btn">{{ confirmText }}</view>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- 弹窗 -->
    <order-popup ref="orderPopup" :data="orderObj" :dataKey="valueKey" @onConfirm="onConfirm" :externalData="externalData" :popupType="popupType" :popupTitle="popupTitle" />
    <template v-if="showUpload">
      <view class="upload-box">
        <upload-proof-of-payment @back="clearPayMentDocList" @confirm="uploadConfirm" />
      </view>
    </template>
    <!-- 支付弹框 -->
    <OrderPay ref="OrderPay" @closePopup="closePopup" @jumpSuccess="jumpSuccess" />
  </view>
</template>

<script>
import utils from '@/utils/utils'
import OrderPopup from '@/components/OrderPopup/index.vue'
import GlCell from '../../../../components/Form/GlCell.vue'
import Product from './Product.vue'
import Package from './Package.vue'
import SkuGoods from './SkuGoods.vue'
import { FORM_LIST, popupTypeEnum, titleList } from '../contant'
import { interceptionMixin } from '@/mixin/index'
import UploadProofOfPayment from './UploadProofOfPayment.vue'
import dayjs from 'dayjs'
import OrderPay from './OrderPay.vue'
import NP from 'number-precision'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
export default {
  name: 'CreateOrder',
  mixins: [interceptionMixin],
  components: {
    GlCell,
    OrderPopup,
    Product,
    Package,
    SkuGoods,
    UploadProofOfPayment,
    OrderPay
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => null
    }
  },
  watch: {
    'orderObj.payee': {
      handler(val) {
        this.formList[4].map(e => {
          if (e.value == 'pay2Time')
            e.label = {
              0: '嘀加收款时间',
              1: '4S店收款时间'
            }[val]
        })
      },
      immediate: true,
      deep: true
    },
    'orderObj.payType': {
      handler(val) {
        this.formList[4].map(e => {
          if (e.value == 'notes') e.required = val == 7
          if (e.value == 'pay2Time') e.hidden = ![2, 5, 6, 7].includes(+val)
        })
      },
      immediate: true,
      deep: true
    },
    transmissionOfData: {
      handler(val) {
        const paramsData = val?.paramsData || {}
        if (paramsData && paramsData.id) this.paramsData = paramsData
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      paramsData: {},
      saveStatus: false,
      showUpload: false,
      titleList,
      formList: utils.deepClone(FORM_LIST),
      baseConfigData: {},
      orderObj: {
        mode: 1,
        payee: 0, // 收款方式
        payType: 1, // 支付方式
        orderTypeCode: '1', // 默认正常订单
        djOrderType: '正常订单', // 默认正常订单
        insurancePrice: '',
        skuGoods: [], //商品列表
        referrerId: '', //销售顾问id
        referrer: '', //销售顾问名称
        deliveryId: '', //交付专员id
        deliveryName: '', //交付专员名称
        total: '', //总价
        notes: '', //备注
        carSeriesId: '', //车系id
        seat: '5', //座位数
        ownerGender: '男',
        salesType: '0',
        carInfo: {},
        price: ''
      }, // 弹窗传入的数据},
      popupType: 0,
      popupTypeEnum,
      externalData: [], //弹窗接口数据
      djPayList: [], // 嘀加收款方对应支付方式
      merchantPayList: [], // 门店收款方对应支付方式
      configPayTypeList: [], // 园区店配置支持的支付方式
      goodsList: [],
      subOrderList: [],
      otherProduct: [],
      positionTypeList: [],
      valueKey: '',
      popupTitle: '',
      pointsMultiRole: 'Y',
      formKey: Date.now(),
      validateState: true
    }
  },
  computed: {
    showPayTips() {
      return this.orderObj.payee == 0 && this.orderObj.payType == 7
    },
    confirmText() {
      return [1, 3].includes(+this.orderObj.payType) ? '下一步·去支付' : '下一步·上传凭证'
    },
    userInfo() {
      return uni.$storage.get('userInfo') || {}
    }
  },
  mounted() {
    this.baseConfigData = uni.$storage.get('mock_data') || {}
    this.initData()
  },
  methods: {
    updateSceneGate () {
      const selected = Boolean(this.orderObj && (this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode))
      const list = this.formList || []
      list.forEach(group => {
        ;(group || []).forEach(item => {
          if (!item) return
          if (item._originHidden === undefined) item._originHidden = Boolean(item.hidden)
          if (!selected) {
            item.hidden = item.value !== 'baseSceneCode'
          } else {
            item.hidden = item._originHidden
          }
        })
      })
      this.formList = list
      return selected
    },
    async initRecentSceneEcho () {
      try {
        const userInfo = this.userInfo || (uni.$storage.get('userInfo') || {})
        const phone = userInfo.phone
        const userSceneType = userInfo.sceneType
        if (!phone || userSceneType === undefined || userSceneType === null) return

        const recent = await uni.$api.equityApi.getUserRecentScene({
          phone,
          sceneType: userSceneType
        })
        // HTTP 层已将 data.data 解包，recent 直接是 { baseSceneCode: '...' }
        const recentBaseSceneCode = recent?.baseSceneCode || recent?.uuid
        if (!recentBaseSceneCode) return

        // getSceneListWithOrder 有 Promise 缓存，不会重复发请求
        const rawList = await uni.$api.equityApi.getSceneListWithOrder({
          phone,
          sceneType: String(userSceneType)
        })
        const listData = Array.isArray(rawList) ? rawList : []
        const item = listData.find(i => String(i.baseSceneCode || i.uuid) === String(recentBaseSceneCode))
        if (!item) return

        this.$set(this.orderObj, 'baseSceneCode', item.name || item.staffName)
        this.$set(this.orderObj, 'baseSceneCodeValue', item.baseSceneCode || item.uuid)
        this.$set(this.orderObj, 'sceneType', item.sceneType)
        // 同步表单展示（GlCell 部分字段依赖 current）
        const sceneCell = this.formList?.[0]?.find(v => v && v.value === 'baseSceneCode')
        if (sceneCell) sceneCell.current = item.name || item.staffName || ''
      } catch (e) {}
    },
    async getQuotationInfoById(id) {
      try {
        let { goodsList: quotationGoodsList } = this,
          data = await uni.$api.equityApi.getQuotationInfoById({ id }),
          { orderObj } = this,
          { owner, insurancePrice, quotedPriceUpdate } = data
        uni.hideLoading()
        orderObj.price = this.divideByHundred(owner.price)
        orderObj.insurancePrice = this.divideByHundred(insurancePrice)
        orderObj.quotedPriceUpdate = this.divideByHundred(quotedPriceUpdate)

        // 回显订单类型（orderType：1 正常订单，2 打折策略，3 买赠策略，4 冲量活动，5 组合付款）
        const orderTypeMap = {
          1: '正常订单',
          2: '打折策略',
          3: '买赠策略',
          4: '冲量活动',
          5: '组合付款'
        }
        const orderTypeCode = data.orderType ? String(data.orderType) : this.orderObj.orderTypeCode || '1'
        orderObj.orderTypeCode = orderTypeCode
        orderObj.djOrderType = orderTypeMap[orderTypeCode] || '正常订单'
        // 回显表单中“订单类型”这一行的展示文案
        const orderTypeCell = this.formList[3]?.find(item => item.value === 'djOrderType')
        if (orderTypeCell) {
          orderTypeCell.current = orderObj.djOrderType
        }

        if (!data.vdQuotationGoodsList) data.vdQuotationGoodsList = []
        orderObj.vdQuotationGoodsList = data.vdQuotationGoodsList.map(item => {
          item.price = this.divideByHundred(item.goodsPrice)
          return item
        })
        if (!owner.ownerGender) owner.ownerGender = '男'
        if (owner.carSeriesId) {
          orderObj.carInfo = {
            carBrand: owner.carBrand,
            carBrandId: owner.carBrandId,
            carChildsBrandId: owner.carChildsBrandId,
            carChildsBrandName: owner.carChildsBrandName,
            carSeriesId: owner.carSeriesId,
            carSeriesName: owner.carSeriesName
          }
          orderObj.carBrandText = `${owner.carBrand}-${owner.carChildsBrandName}-${owner.carSeriesName}`
        }
        if (owner.city) {
          let [provinceText, cityText] = owner.city.split('-')
          if (cityText) {
            orderObj.provinceText = provinceText
            orderObj.cityText = cityText
          } else {
            orderObj.provinceText = owner.city
            orderObj.cityText = owner.city
          }
        }
        this.formList[1].map(e => {
          if (e.value == 'salesType') e.current = owner.salesType
          if (e.value == 'ownerGender') e.current = owner.ownerGender
        })

        // 根据 discountType / discountValue / finalPrice 回显策略配置
        const buildStrategyConfigFromDiscountFields = (item, orderTypeCode) => {
          const orderType = String(orderTypeCode || '')
          const discountType = item.discountType !== undefined && item.discountType !== null ? Number(item.discountType) : null
          const discountValue = item.discountValue

          // 打折策略
          if (orderType === '2') {
            if (discountType === 1 && discountValue !== undefined && discountValue !== null && discountValue !== '') {
              return {
                mode: 'ratio',
                discountRatio: discountValue,
                discountAmount: ''
              }
            }
            if (discountType === 2 && discountValue !== undefined && discountValue !== null && discountValue !== '') {
              return {
                mode: 'amount',
                discountRatio: '',
                discountAmount: discountValue
              }
            }
            // 无折扣
            return {
              mode: 'none',
              discountRatio: '',
              discountAmount: ''
            }
          }

          // 买赠策略
          if (orderType === '3') {
            // 4：赠品，5：非赠品
            const isGift = discountType === 4 ? '1' : '0'
            return {
              isGift
            }
          }

          // 组合付款
          if (orderType === '5') {
            if (discountValue !== undefined && discountValue !== null && discountValue !== '') {
              return {
                mode: 'deduct',
                deductAmount: discountValue
              }
            }
            return {
              mode: 'none',
              deductAmount: ''
            }
          }

          return {}
        }

        orderObj.skuGoods = data.vdQuotationGoodsList.reduce((pre, item) => {
          // 是普通商品
          if (!item.packageName && !item.specificationsValue) {
            console.log(item)
            let obj = {
              ...item,
              goodsInfo: item,
              upgradeGoodsId: item.goodsId,
              merchantGoodsId: item.goodsId,
              sellPrice: this.divideByHundred(item.goodsPrice),
              // 数量回显（默认 1）
              number: item.number || 1,
              // 回显优惠相关字段
              discountType: item.discountType,
              discountValue: item.discountValue,
              finalPrice: item.finalPrice,
              // 根据折扣字段还原策略配置
              strategyConfig: buildStrategyConfigFromDiscountFields(item, orderObj.orderTypeCode),
              minSellPrice: quotationGoodsList?.find(val => val?.goods?.merchantGoodsId == item.goodsId)?.goods?.minSellPrice, // 按商品数据对比补充详情商品最低价
              validMinSellPrice: quotationGoodsList?.find(val => val?.goods?.merchantGoodsId == item.goodsId)?.goods?.validMinSellPrice // 按商品数据对比补充详情商品校验最低价字段
            }
            pre.push({
              goodsFlag: 1,
              goods: obj,
              packageGoods: null
            })
          }
          //套餐
          if (item.packageName) {
            let obj = {
              ...item,
              merchantGoodsId: item.goodsId,
              upgradeGoodsId: item.goodsId,
              sellPrice: this.divideByHundred(item.goodsPrice),
              number: item.number || 1,
              // 回显优惠相关字段
              discountType: item.discountType,
              discountValue: item.discountValue,
              finalPrice: item.finalPrice,
              strategyConfig: buildStrategyConfigFromDiscountFields(item, orderObj.orderTypeCode),
              minSellPrice: quotationGoodsList?.find(val => val.packageGoods?.goodsList?.length && val.packageGoods?.packageCode == item?.packageId)?.packageGoods?.goodsList?.find(subV => subV.merchantGoodsId == item.goodsId)?.minSellPrice, // 按商品数据对比补充详情商品最低价
              validMinSellPrice: quotationGoodsList?.find(val => val.packageGoods?.goodsList?.length && val.packageGoods?.packageCode == item?.packageId)?.packageGoods?.goodsList?.find(subV => subV.merchantGoodsId == item.goodsId)?.validMinSellPrice // 按商品数据对比补充详情商品校验最低价字段
            }
            let index = pre.findIndex(ele => {
              if (ele.packageGoods) {
                return ele.packageGoods.packageId == item.packageId
              }
            })
            if (index != -1) {
              pre[index].packageGoods.goodsList.push(obj)
              pre[index].price = NP.plus(pre[index].price, obj.price)
            } else {
              pre.push({
                goods: null,
                goodsFlag: 3,
                price: item.price,
                packageGoods: {
                  ...item,
                  packageCode: item.packageId,
                  goodsList: [
                    {
                      ...obj
                    }
                  ]
                }
              })
            }
          }
          //多规格商品
          if (!item.packageName && item.specificationsValue) {
            // 将折扣相关字段传递给多规格处理
            let specificdata = this.handleSpecificationsEcho({
              ...item,
              discountType: item.discountType,
              discountValue: item.discountValue,
              finalPrice: item.finalPrice,
              orderTypeCode: orderObj.orderTypeCode
            })
            pre = pre.concat(specificdata)
          }

          return pre
        }, [])

        let keyList = ['mode', 'payee', 'payType', 'referrerId', 'referrer', 'deliveryId', 'deliveryName', 'notes', 'id', 'orderId'],
          customerKeyList = ['owner', 'phone', 'certificateNo', 'carVin', 'seat', , 'ownerGender', 'ageRange', 'hobby', 'companion', 'carColor', 'salesType', 'city']
        keyList.map(key => {
          if (data[key] != null) orderObj[key] = data[key]
        })
        customerKeyList.map(key => {
          if (owner[key] != null) orderObj[key] = owner[key]
        })
        if (owner.id) orderObj.ownerId = owner.id
        let payeeCell = this.formList[4].find(item => item.value === 'payee')
        if (payeeCell) payeeCell.current = orderObj.payee

        this.orderObj = orderObj
        this.getConfig()
        setTimeout(() => {
          this.changeTotalPrice()
        }, 0)
      } catch (error) {
        console.log(error)
        uni.hideLoading()
        if (error)
          uni.showToast({
            title: error,
            icon: 'none'
          })
      }
    },
    initData() {
      // 埋点
      //   uni.$track.add({ eventCode: 'app_create_order' })
      const { paramsData } = this
      // 去报价/编辑进入（带 id）时，优先用入参回显业务场景名称
      // 这里不走 recent 覆盖，避免把用户正在编辑的单子场景冲掉
      if (paramsData && paramsData.id) {
        const sceneName = paramsData.baseSceneName || paramsData.sceneName || ''
        const sceneCode = paramsData.baseSceneCode || paramsData.baseSceneId || ''
        if (sceneName || sceneCode) {
          this.$set(this.orderObj, 'baseSceneCode', sceneName)
          this.$set(this.orderObj, 'baseSceneCodeValue', sceneCode)
          const sceneCell = this.formList?.[0]?.find(v => v && v.value === 'baseSceneCode')
          if (sceneCell) sceneCell.current = sceneName
        }
      }
      // 设置订单类型表单显示（新建订单时）
      if (!paramsData.id && this.orderObj.djOrderType) {
        const orderTypeCell = this.formList[3]?.find(item => item.value === 'djOrderType')
        if (orderTypeCell) {
          orderTypeCell.current = this.orderObj.djOrderType
        }
      }
      // 新增页：先回显最近场景；未选场景时不展示/不请求下方表单与接口
      const p = this.paramsData || {}
      if (!p.id) {
        this.initRecentSceneEcho().finally(() => {
          const hasScene = this.updateSceneGate()
          if (!hasScene) return
          this.getSelectOrderGoodsList()
        })
      } else {
        // 编辑页不做 recent 覆盖
        this.updateSceneGate()
        this.getSelectOrderGoodsList()
      }
      if (!paramsData.id) this.getConfig()

      this.getShopMerchantPointConfig()

      this.orderSettingList()
    },
    async orderSettingList() {
      const { shopMerchantId } = this.userInfo,
        params = {
          scene: 0,
          isRequired: 1,
          merchantId: shopMerchantId
        },
        data = await uni.$api.equityApi.orderSettingList(params)
      if (data) {
        let required = data.reduce((pre, item) => {
          if (item.isRequired) {
            pre.push(item.fieldKey)
          }
          return pre
        }, [])
        if (required.includes('carBrand'))
          this.formList[2].map(e => {
            if (e.value == 'carBrandText') e.required = true
          })
        if (required.includes('carNo'))
          this.formList[2].map(e => {
            if (e.value == 'carVin') e.required = true
          })
        if (required.includes('idNumber'))
          this.formList[1].map(e => {
            if (e.value == 'certificateNo') e.required = true
          })
      }
    },
    async getShopMerchantPointConfig() {
      const { shopMerchantId: merchantId } = this.userInfo
      const { pointsMultiRole, createAllGoodsFlag } = await uni.$api.equityApi.getShopMerchantPointConfig({
        merchantId
      })
      this.pointsMultiRole = pointsMultiRole
      if (pointsMultiRole != 'Y') {
        this.formList[0].map(e => {
          if (e.value == 'deliveryName') e.hidden = true
          if (e.value == 'referrer') e.label = '推荐人'
        })
      }
      // 订单类型配置：createAllGoodsFlag = 1 显示全部类型；0 仅正常订单
      if (createAllGoodsFlag !== undefined && createAllGoodsFlag !== null) {
        uni.$storage.set('createAllGoodsFlag', createAllGoodsFlag)
      }
    },
    // 选择行事件
    handleCell(val) {
      let { payType } = this.orderObj,
        { pointsMultiRole } = this
      this.popupTitle = ''
      // 获取当前选中的popupType
      let foundKey = Object.keys(this.popupTypeEnum).find(key => this.popupTypeEnum[key].key === val.value)
      if (!foundKey && val.key) {
        foundKey = Object.keys(this.popupTypeEnum).find(key => this.popupTypeEnum[key].key === val.key)
      }
      if (!foundKey) {
        console.error(`Popup type not found for value: ${val.value}, key: ${val.key}`)
        return
      }
      this.popupType = foundKey * 1
      // 获取对应的list字段
      const popupConfig = this.popupTypeEnum[this.popupType]
      if (!popupConfig) {
        console.error(`Popup config not found for popupType: ${this.popupType}`)
        return
      }
      if (popupConfig.list) {
        this.externalData = this[popupConfig.list] || []
      } else {
        this.externalData = []
      }
      // 定义产品相关字段数组
      const productFields = ['skuGoods']
      if (productFields.includes(val.value)) {
        this.valueKey = val.value
        this.externalData = utils.deepClone(this.goodsList)
      }
      this.popupTitle = {
        0: pointsMultiRole == 'Y' ? '销售顾问/录单员' : '推荐人',
        4: '车型',
        13: payType == 2 ? '4S店收款时间' : '嘀加收款时间',
        29:'确认业务场景名称'
      }[this.popupType]
      // 确保 orderPopup 引用存在后再调用 open 方法
      if (this.$refs.orderPopup && this.$refs.orderPopup.open) {
        this.$refs.orderPopup.open()
      } else {
        console.error('OrderPopup ref is not available')
      }
    },
    // 单选框change事件
    radioChange(e, val) {
      this.$set(this.orderObj, val.value, e.detail.value)
      if (val.value == 'payee') this.changePayee()
    },
    // 弹窗确认回调
    onConfirm(val, flag) {
      console.log(JSON.parse(JSON.stringify(val)), 'onConfirm')
      this.externalData = []
      // // const { chooseContent } = val
      const chooseContent = utils.deepClone(val.chooseContent)
      // 根据popupTypeEnum优化处理
      const _typeValue = this.popupTypeEnum[this.popupType]
      console.log(_typeValue)
      // 定义产品相关字段数组
      if (val.popupType == 19) return this.setCustomerInfo(chooseContent)
      const productFields = ['skuGoods']
      if (_typeValue.key == 'djOrderType') {
        // 订单类型
        this.$set(this.orderObj, 'djOrderType', chooseContent.name)
        this.$set(this.orderObj, 'orderTypeCode', chooseContent.value)
        // 订单类型切换时，清除已选商品
        this.$set(this.orderObj, 'skuGoods', [])
        this.changeTotalPrice()
      } else if (_typeValue.key == 'carBrand') {
        // 车型
        this.$set(this.orderObj, 'carBrandText', `${chooseContent.carBrand}-${chooseContent.carChildsBrandName}-${chooseContent.carSeriesName}`)
        Object.assign(this.orderObj, {
          carInfo: chooseContent
        })
      } else if (productFields.includes(_typeValue.key)) {
        if (_typeValue.key == 'skuGoods') {
          if (!this.orderObj.skuGoods) {
            // 其他精品第一次赋值
            this.$set(this.orderObj, 'skuGoods', chooseContent)
          } else {
            // 过滤出已选的goodFlag为2的对象
            const selectedGoods = this.orderObj[_typeValue.key].filter(item => item.goodsFlag === 2)
            const singleGoods = flag ? this.orderObj[_typeValue.key].filter(item => item.goodsFlag != 2) : chooseContent.filter(item => item.goodsFlag != 2)
            const moreGoods = chooseContent
              .filter(item => item.goodsFlag === 2)
              .filter(item => {
                return !selectedGoods.some(selectedItem => selectedItem.multipleSpecificationsGoods.goods.goodsId === item.multipleSpecificationsGoods.goods.goodsId)
              })
            console.log(singleGoods, '===')
            // 合并已选的goodFlag为2的对象
            this.orderObj.skuGoods = [...singleGoods, ...moreGoods, ...selectedGoods]
          }
        }
        setTimeout(() => {
          this.changeTotalPrice()
        }, 0)
      } else {
        if (_typeValue.key == 'city') {
          this.$set(this.orderObj, 'provinceText', chooseContent.province)
          this.$set(this.orderObj, 'cityText', chooseContent.city)
          this.$set(this.orderObj, 'city', chooseContent.city == chooseContent.province ? chooseContent.city : `${chooseContent.province}-${chooseContent.city}`)
        } else if (_typeValue.key === 'baseSceneCode') {
          // 场景名称：界面显示名称；提交时使用 code
          this.$set(this.orderObj, 'baseSceneCode', chooseContent.name || chooseContent.staffName)
          this.$set(this.orderObj, 'baseSceneCodeValue', chooseContent.baseSceneCode || chooseContent.uuid)
          this.$set(this.orderObj, 'sceneType', chooseContent.sceneType)
          // 选择后保存最近选中场景（sceneType 用登录场景）
          const userInfo = this.userInfo || (uni.$storage.get('userInfo') || {})
          if (userInfo.phone) {
            uni.$api.equityApi.saveUserRecentScene({
              phone: userInfo.phone,
              sceneType: userInfo.sceneType,
              baseSceneCode: chooseContent.baseSceneCode || chooseContent.uuid
            })
          }
          // 选中场景后，放开下方表单并触发依赖接口
          // 立即清空 goodsList，确保弹窗打开时 externalData 为空，迫使 SkuGoodsList 重新调接口
          this.goodsList = []
          this.$set(this.orderObj, 'skuGoods', [])
          this.changeTotalPrice()
          this.$refs.orderPopup && this.$refs.orderPopup.clearCacheByTypes([0, 1, 3, 6, 7, 8, 9, 10, 11, 12])
          this.updateSceneGate()
          this.getSelectOrderGoodsList()
        } else if (_typeValue.key == 'todayShow') {
          this.$set(this.orderObj, 'pay2Time', chooseContent)
        } else if (_typeValue.list == 'employeeList') {
          this.$set(this.orderObj, _typeValue.targetIdKey, chooseContent[_typeValue.sourceIdKey])
          this.$set(this.orderObj, _typeValue.targetNameKey, chooseContent[_typeValue.sourceNameKey])
        } else this.$set(this.orderObj, _typeValue.key, chooseContent)
        console.log(this.orderObj, 'this.orderObj')
      }
      console.log(this.orderObj)
    },
    // 输入框失去焦点事件
    inputBlur(e, val) {
      console.log(e, val)
      if (val.value == 'price') {
        this.orderObj[val.value] = parseFloat(this.orderObj[val.value]) > 2000000 ? 2000000 : this.orderObj[val.value]
        return
      }
      this.orderObj[val.value] = this.orderObj[val.value]
      // VIN车架号动态校验：车架号字段，动态转换为大写
      if (val.value === 'carVin') this.validateVin()
    },
    validateVin() {
      let carVinVal = this.orderObj.carVin
      if (carVinVal) {
        this.orderObj.carVin = formatVinInput(carVinVal)
        validateVin(this.orderObj.carVin)
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
    },
    // 校验必填等规则
    checkRequired() {
      try {
        const phoneRex = /^[1]([3-9])[0-9]{9}$/,
          requiredArr = [],
          onlyLabelItem = [],
          { orderObj } = this

        this.formList.forEach(group => {
          group.forEach(item => {
            if (item.required === true && item.hidden !== true) {
              if (item.isArray) onlyLabelItem.push(item)
              else requiredArr.push(item)
            }
          })
        })
        // VIN车架号-动态校验
        const carVin = this.orderObj.carVin
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
        // 遍历requiredArr，检查orderObj中是否有对应的值
        for (let i = 0; i < requiredArr.length; i++) {
          const item = requiredArr[i]
          // 兼容嵌套customer对象的情况
          let value = orderObj[item.value]
          if (value === undefined || value === null || value === '') throw `${item.label}不能为空`
          // 如果是customerPhone，添加phoneRex校验
          if (item.value === 'phone' && !phoneRex.test(value)) throw `请输入正确的${item.label}`
        }
        // if (orderObj.carVin) {
        //   if (!utils.validateVIN(orderObj.carVin)) throw '车架号校验不匹配，请核对后重新输入'
        // }

        if (onlyLabelItem.length) {
          const labelFields = ['skuGoods']
          const hasValue = labelFields.some(field => {
            const value = orderObj[field]
            return value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== '')
          })
          if (!hasValue) throw '请选择增值车损险商品'
        }
        if (orderObj.certificateNo && orderObj.certificateNo.length != 18) throw '请输入正确的18位证件号'
        return true
      } catch (error) {
        if (error)
          uni.showToast({
            title: error,
            icon: 'none'
          })
        return false
      }
    },
    // 提交

    // 验证订单策略和总价
    checkOrderStrategyAndTotal() {
      const orderTypeCode = String(this.orderObj.orderTypeCode || '')
      const skuGoods = this.orderObj.skuGoods || []

      // 检查订单总价
      const total = parseFloat(this.orderObj.total || 0)
      if (total < 0.01) {
        uni.showToast({
          title: '商品总价不可小于0.01，请修改商品价格后提交',
          icon: 'none'
        })
        return false
      }

      // 如果是打折策略（2）、买赠策略（3）、组合付款（5），需要验证策略配置
      if (orderTypeCode === '2') {
        // 打折策略：至少存在一项SKU为"比例折扣"或"折扣金额"
        let hasDiscount = false
        skuGoods.forEach(item => {
          let goods = null
          if (item.goods) {
            goods = item.goods
          } else if (item.packageGoods && item.packageGoods.goodsList) {
            // 套餐商品，检查套餐内的商品
            item.packageGoods.goodsList.forEach(g => {
              const strategyConfig = g.strategyConfig || {}
              if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
                hasDiscount = true
              } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
                hasDiscount = true
              }
            })
          } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
            goods = item.multipleSpecificationsGoods.goods
          }

          if (goods) {
            const strategyConfig = goods.strategyConfig || {}
            if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
              hasDiscount = true
            } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
              hasDiscount = true
            }
          }
        })

        if (!hasDiscount) {
          uni.showToast({
            title: '至少存在一项SKU为"比例折扣"或"折扣金额"',
            icon: 'none'
          })
          return false
        }
      } else if (orderTypeCode === '3') {
        // 买赠策略：至少存在一项SKU为"赠品"
        let hasGift = false
        skuGoods.forEach(item => {
          let goods = null
          if (item.goods) {
            goods = item.goods
          } else if (item.packageGoods && item.packageGoods.goodsList) {
            // 套餐商品，检查套餐内的商品
            item.packageGoods.goodsList.forEach(g => {
              const strategyConfig = g.strategyConfig || {}
              if (strategyConfig.isGift === '1') {
                hasGift = true
              }
            })
          } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
            goods = item.multipleSpecificationsGoods.goods
          }

          if (goods) {
            const strategyConfig = goods.strategyConfig || {}
            if (strategyConfig.isGift === '1') {
              hasGift = true
            }
          }
        })

        if (!hasGift) {
          uni.showToast({
            title: '至少存在一项SKU为"赠品"',
            icon: 'none'
          })
          return false
        }
      } else if (orderTypeCode === '5') {
        // 组合付款：至少存在一项SKU为"抵扣金额"
        let hasDeduct = false
        skuGoods.forEach(item => {
          let goods = null
          if (item.goods) {
            goods = item.goods
          } else if (item.packageGoods && item.packageGoods.goodsList) {
            // 套餐商品，检查套餐内的商品
            item.packageGoods.goodsList.forEach(g => {
              const strategyConfig = g.strategyConfig || {}
              if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
                hasDeduct = true
              }
            })
          } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
            goods = item.multipleSpecificationsGoods.goods
          }

          if (goods) {
            const strategyConfig = goods.strategyConfig || {}
            if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
              hasDeduct = true
            }
          }
        })

        if (!hasDeduct) {
          uni.showToast({
            title: '至少存在一项SKU为"抵扣金额"',
            icon: 'none'
          })
          return false
        }
      }

      return true
    },
    async submit() {
      if (!this.checkRequired() || (await this.checkDailyReport())) return

      if (!this.checkOrderStrategyAndTotal()) return
      this.handleSecondConfirmCheck(true)
    },
    async handleSecondConfirmCheck(check) {
      try {
        let orderInfo = this.getInsurance(),
          { payType } = orderInfo
        if (check && [2, 5, 6, 7].includes(+payType) && !(orderInfo.transactionNo && orderInfo.paymentDocList.length)) return (this.showUpload = true)

        if (orderInfo.pay2Time && ![1, 3].includes(+payType)) orderInfo.pay2Time = dayjs(orderInfo.pay2Time).format('YYYY-MM-DD HH:mm:ss')
        else delete orderInfo.pay2Time
        uni.showLoading({
          title: `${check ? '报价' : '保存'}中...`,
          mask: true
        })
        orderInfo.check = check
        console.log(orderInfo, 'orderInfo')
        let apiName = orderInfo.id ? 'updateQuotation' : 'quotationAdd'
        const data = await uni.$api.equityApi[apiName](orderInfo)
        this.saveStatus = false
        if (data) {
          this.showUpload = false
          wx.hideLoading()
          if (check) {
            if ([2, 5, 6, 7].includes(+payType)) return this.$emit('jump', 'OrderManagement')
            let status = await this.createWithPay(data)
            if (status) this.$refs.OrderPay.open(data)
            else throw false
          } else this.$emit('jump', 'OrderManagement')
        } else throw false
      } catch (error) {
        console.log(error)
        this.saveStatus = false
        uni.hideLoading()
        let title = '提交失败'
        if (typeof error === 'string' && error) title = error
        else if (error instanceof Error && error.message) title = error.message
        else if (error && typeof error === 'object' && typeof error.message === 'string' && error.message) {
          title = error.message
        }
        uni.showToast({
          title,
          icon: 'none'
        })
      }
    },

    createWithPay(id) {
      return new Promise((resolve, reject) => {
        let para = {
          id,
          customerNameUrl: '',
          orderStatus: 2
        }
        uni.$api.equityApi.quotationUpgrade(para).then(res => {
          resolve(res)
        })
      })
    },
    // 计算最终价格（优惠后的总价，单位：元），与页面展示保持一致：
    // 先算单件优惠价（向上取整两位），再乘数量（再向上取整两位）
    calculateFinalPrice(goods, sellPrice, number, orderTypeCode) {
      const price = parseFloat(sellPrice || 0)
      const qty = parseInt(number || 1)

      if (!price || !orderTypeCode) {
        const unit = utils.ceilDecimal(price)
        return utils.ceilDecimal(unit * qty)
      }

      const orderType = String(orderTypeCode || '')
      const strategyConfig = goods.strategyConfig || {}

      // '2' 打折策略
      if (orderType === '2') {
        if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
          const ratio = parseFloat(strategyConfig.discountRatio)
          if (ratio >= 0.1 && ratio <= 10) {
            const unit = utils.ceilDecimal(price * (ratio / 10))
            return utils.ceilDecimal(unit * qty)
          }
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          const discountAmount = parseFloat(strategyConfig.discountAmount)
          if (discountAmount >= 0.01 && discountAmount <= price) {
            const unit = utils.ceilDecimal(price - discountAmount)
            return utils.ceilDecimal(unit * qty)
          }
        }
        const unit = utils.ceilDecimal(price)
        return utils.ceilDecimal(unit * qty)
      }

      // '3' 买赠策略
      if (orderType === '3') {
        if (strategyConfig.isGift === '1') {
          return 0
        }
        const unit = utils.ceilDecimal(price)
        return utils.ceilDecimal(unit * qty)
      }

      // '5' 组合付款
      if (orderType === '5') {
        if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
          const deductAmount = parseFloat(strategyConfig.deductAmount)
          if (deductAmount >= 0.01 && deductAmount <= price) {
            const unit = utils.ceilDecimal(price - deductAmount)
            return utils.ceilDecimal(unit * qty)
          }
        }
        const unit = utils.ceilDecimal(price)
        return utils.ceilDecimal(unit * qty)
      }

      // '1' 正常订单、'4' 冲量活动：原价
      const unit = utils.ceilDecimal(price)
      return utils.ceilDecimal(unit * qty)
    },
    // 计算优惠相关字段（discountType, discountValue）
    calculateDiscountFields(goods, sellPrice, number, orderTypeCode) {
      const result = {
        discountType: null,
        discountValue: null
      }

      if (!orderTypeCode) {
        return result
      }

      const price = parseFloat(sellPrice || 0)
      const orderType = String(orderTypeCode || '')
      const strategyConfig = goods.strategyConfig || {}

      // '2' 打折策略
      if (orderType === '2') {
        if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
          // 比例折扣
          result.discountType = 1
          result.discountValue = parseFloat(strategyConfig.discountRatio)
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          // 折扣金额
          result.discountType = 2
          result.discountValue = parseFloat(strategyConfig.discountAmount)
        } else {
          // 无折扣
          result.discountType = 3
        }
      }

      // '3' 买赠策略
      if (orderType === '3') {
        if (strategyConfig.isGift === '1') {
          // 赠品
          result.discountType = 4
        } else {
          // 非赠品
          result.discountType = 5
        }
      }

      // '5' 组合付款：有抵扣时 discountType=2、discountValue=抵扣金额，无抵扣时 discountType=3
      if (orderType === '5') {
        if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
          result.discountType = 2
          result.discountValue = parseFloat(strategyConfig.deductAmount)
        } else {
          result.discountType = 3
        }
      }

      return result
    },
    getInsurance() {
      let { orderObj, userInfo } = this,
        orderInfo = utils.deepClone(orderObj),
        { default4SStoreInfo } = userInfo,
        params = {
          owner: {
            ...orderInfo.carInfo
          }
        }
      if (orderInfo.id) params.id = orderInfo.id
      // 场景 code（用于后端入参）
      if (orderInfo.baseSceneCodeValue) params.baseSceneCode = orderInfo.baseSceneCodeValue
      else if (orderInfo.baseSceneCode) params.baseSceneCode = orderInfo.baseSceneCode
      params.merchantId4s = default4SStoreInfo?.merchantId
      params.merchantName4s = default4SStoreInfo?.merchantName
      orderInfo.price = this.multipliedByHundred(orderInfo.price)
      params.insurancePrice = this.multipliedByHundred(orderInfo.insurancePrice)
      params.quotedPriceUpdate = this.multipliedByHundred(orderInfo.quotedPriceUpdate)
      params.minEquityPrice = this.multipliedByHundred(orderInfo.minEquityPrice)

      // 添加外层 orderType 字段
      if (orderInfo.orderTypeCode) {
        params.orderType = parseInt(orderInfo.orderTypeCode)
      }

      params.vdQuotationGoodsList = orderInfo.skuGoods.reduce((pre, item) => {
        if (item.goods) {
          item = item.goods
          const sellPrice = parseFloat(item.sellPrice || 0)
          const number = parseInt(item.number || 1)
          // finalPrice 存在时为“元”，表示该 SKU 按当前策略计算后的总价
          // 仅当 finalPrice 不为 null 且是有效数字时才使用它，否则重新根据策略计算
          const hasValidFinalPrice = item.finalPrice !== undefined && item.finalPrice !== null && !isNaN(parseFloat(item.finalPrice))
          const finalPrice = hasValidFinalPrice ? parseFloat(item.finalPrice) : this.calculateFinalPrice(item, sellPrice, number, orderInfo.orderTypeCode)
          const discountFields = this.calculateDiscountFields(item, sellPrice, number, orderInfo.orderTypeCode)
          const unitFinalPrice = finalPrice / number
          const obj = {
            goodsId: item.merchantGoodsId,
            goodsName: item.goodsName,
            goodsNameAlias: item.goodsAlias || item.goodsNameAlias,
            specificationsName: item.specificationNameSequence,
            specificationsValue: item.specificationData ? item.specificationData.replace(/;~;/g, '/') : '',
            goodsPrice: this.multipliedByHundred(item.sellPrice),
            // 后端使用“分”单位，这里将元转为分
            finalPrice: this.multipliedByHundred(finalPrice),
            // 商品实付单价（向上取整保留两位，单位：分）
            singleProductFinalPrice: this.multipliedByHundred(utils.ceilDecimal(unitFinalPrice)),
            discountType: discountFields.discountType,
            discountValue: discountFields.discountValue
          }
          pre.push(obj)
        }

        if (item.packageGoods) {
          item = item.packageGoods
          item.goodsList.map(ele => {
            const sellPrice = parseFloat(ele.sellPrice || 0)
            const number = parseInt(item.number || 1)
            const hasValidFinalPrice = ele.finalPrice !== undefined && ele.finalPrice !== null && !isNaN(parseFloat(ele.finalPrice))
            const finalPrice = hasValidFinalPrice ? parseFloat(ele.finalPrice) : this.calculateFinalPrice(ele, sellPrice, number, orderInfo.orderTypeCode)
            const discountFields = this.calculateDiscountFields(ele, sellPrice, number, orderInfo.orderTypeCode)
            const unitFinalPrice = finalPrice / number
            let obj = {
              packageId: item.packageCode,
              packageName: item.packageName,
              packageNameAlias: item.packageAlias || item.packageNameAlias,
              goodsId: ele.merchantGoodsId || ele.upgradeGoodsId,
              goodsName: ele.upgradeGoodsName || ele.goodsName,
              goodsNameAlias: ele.goodsAlias || ele.goodsNameAlias,
              specificationsName: ele.specificationNameSequence,
              specificationsValue: ele.specificationData ? ele.specificationData.replace(/;~;/g, '/') : '',
              goodsPrice: this.multipliedByHundred(ele.sellPrice),
              finalPrice: this.multipliedByHundred(finalPrice),
              singleProductFinalPrice: this.multipliedByHundred(utils.ceilDecimal(unitFinalPrice)),
              discountType: discountFields.discountType,
              discountValue: discountFields.discountValue
            }
            pre.push(obj)
          })
        }
        if (item.multipleSpecificationsGoods) {
          if (item.multipleSpecificationsGoods.goods) {
            const multipleSpecGoods = item.multipleSpecificationsGoods
            const goods = multipleSpecGoods.goods
            const sellPrice = parseFloat(goods.sellPrice || 0)
            const number = parseInt(multipleSpecGoods.number || 1)
            const hasValidFinalPrice = goods.finalPrice !== undefined && goods.finalPrice !== null && !isNaN(parseFloat(goods.finalPrice))
            const finalPrice = hasValidFinalPrice ? parseFloat(goods.finalPrice) : this.calculateFinalPrice(goods, sellPrice, number, orderInfo.orderTypeCode)
            const discountFields = this.calculateDiscountFields(goods, sellPrice, number, orderInfo.orderTypeCode)
            const unitFinalPrice = finalPrice / number
            const obj = {
              goodsId: goods.merchantGoodsId,
              goodsName: goods.upgradeGoodsName || goods.goodsName,
              goodsNameAlias: goods.goodsAlias || goods.goodsNameAlias,
              specificationsName: goods.specificationNameSequence,
              specificationsValue: goods.specificationData ? goods.specificationData.replace(/;~;/g, '/') : '',
              goodsPrice: this.multipliedByHundred(goods.sellPrice),
              finalPrice: this.multipliedByHundred(finalPrice),
              singleProductFinalPrice: this.multipliedByHundred(utils.ceilDecimal(unitFinalPrice)),
              discountType: discountFields.discountType,
              discountValue: discountFields.discountValue
            }
            pre.push(obj)
          }
        }
        return pre
      }, [])
      let keyList = ['mode', 'payee', 'payType', 'referrerId', 'referrer', 'deliveryId', 'deliveryName', 'total', 'notes', 'tradeNo', 'transactionNo', 'paymentDocList', 'id', 'orderId', 'pay2Time'],
        customerKeyList = ['owner', 'phone', 'certificateNo', 'carVin', 'seat', 'price', 'ownerGender', 'city', 'ageRange', 'hobby', 'companion', 'carColor', 'salesType']
      keyList.map(key => {
        if (orderInfo[key] != null) params[key] = orderInfo[key]
      })
      customerKeyList.map(key => {
        if (orderInfo[key] != null) params.owner[key] = orderInfo[key]
      })
      if (orderInfo.ownerId) params.owner.id = orderInfo.ownerId
      return params
    },
    // 乘以100保留两位小数点
    multipliedByHundred(str) {
      let floatVal = parseFloat(str)
      if (isNaN(floatVal)) {
        return 0
      }
      floatVal = Math.round(str * 10000) / 100
      let strVal = floatVal.toString()
      let searchVal = strVal.indexOf('.')
      if (searchVal < 0) {
        searchVal = strVal.length
        strVal += '.'
      }
      while (strVal.length <= searchVal + 2) {
        strVal += '0'
      }
      return parseFloat(strVal)
    },
    // 计算所有产品的总价
    changeTotalPrice() {
      let total = 0
      const orderType = String(this.orderObj.orderTypeCode || '')
      // 打折（2）/ 买赠（3）/ 组合付款（5）使用优惠后的价格，否则使用原价
      const useFinalPrice = orderType === '2' || orderType === '3' || orderType === '5'

      // 遍历所有商品
      const productFields = ['skuGoods']
      productFields.forEach(slotName => {
        const productList = this.orderObj[slotName]
        if (Array.isArray(productList) && productList.length > 0) {
          // 计算每个产品的价格 * 数量，并累加到总价
          productList.forEach(item => {
            // 单个商品（goodsFlag == 1）
            if (item.goods && item.goods.sellPrice) {
              const goods = item.goods
              const number = parseInt(goods.number || 1)
              console.log(goods, '---单商品')
              if (useFinalPrice && goods.finalPrice !== undefined && goods.finalPrice !== null) {
                // 使用优惠后的总价（单位：元）
                total = NP.plus(total, parseFloat(goods.finalPrice || 0))
              } else {
                // 使用原始价格（单价 * 数量，单位：元）
                total = NP.plus(total, NP.times(goods.sellPrice, number))
              }
            }
            // 套餐商品（goodsFlag == 3）
            else if (item.packageGoods && item.packageGoods.goodsList && item.packageGoods.goodsList.length > 0) {
              console.log(item.packageGoods, '套餐')
              const packageNumber = parseInt(item.packageGoods.number || 1)
              item.packageGoods.goodsList.forEach(goods => {
                if (goods.sellPrice) {
                  if (useFinalPrice && goods.finalPrice !== undefined && goods.finalPrice !== null) {
                    // 使用优惠后的总价（finalPrice 已经是按数量计算后的总价，单位：元）
                    total = NP.plus(total, parseFloat(goods.finalPrice || 0))
                  } else {
                    // 使用原始价格（单价 * 套餐数量）
                    total = NP.plus(total, NP.times(goods.sellPrice, packageNumber))
                  }
                }
              })
            }
            // 多规格商品（goodsFlag == 2）
            else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods && item.multipleSpecificationsGoods.goods.sellPrice) {
              console.log(item.multipleSpecificationsGoods, '多规格')
              const goods = item.multipleSpecificationsGoods.goods
              const number = parseInt(item.multipleSpecificationsGoods.number || 1)
              if (useFinalPrice && goods.finalPrice !== undefined && goods.finalPrice !== null) {
                // 使用优惠后的总价（单位：元）
                total = NP.plus(total, parseFloat(goods.finalPrice || 0))
              } else {
                // 使用原始价格（单价 * 数量）
                total = NP.plus(total, NP.times(goods.sellPrice, number))
              }
            }
          })
        }
      })
      console.log(total, 'total')
      // 更新总价（单位：元，向上取整保留两位小数）
      this.orderObj.total = utils.ceilDecimal(total).toFixed(2)
    },

    // 获取园区店支付方式
    async getConfig() {
      this.djPayList = [
        {
          value: '1',
          name: '微信支付'
        },
        {
          name: '对公转账',
          value: '6'
        },
        {
          name: '其它收款',
          value: '7'
        }
      ]
      this.merchantPayList = [
        {
          value: '2',
          name: '门店收款'
        }
      ]
      this.changePayee()
    },
    changePayee() {
      const cell = this.formList[4].find(item => item.value === 'payType'),
        { payType } = this.orderObj
      if (cell) {
        cell.radioList = this.orderObj.payee == 1 ? this.merchantPayList : this.djPayList
        let index = cell.radioList.findIndex(i => i.value == payType)
        if (index == -1) index = 0
        if (cell.radioList && cell.radioList.length > 0) {
          cell.current = cell.radioList[index].value
          // 使用 $set 确保响应式更新
          this.$set(this.orderObj, 'payType', cell.radioList[index].value)
        }
      }
    },
    // 商品列表
    async getSelectOrderGoodsList() {
      const { userInfo, paramsData } = this
      if (paramsData.id)
        uni.showLoading({
          title: '加载中...',
          mask: true
        })
      const res = await uni.$api.boutiqueApi.getSelectOrderGoodsList({
        merchantId: userInfo.shopMerchantId,
        sceneType: userInfo.sceneType,
        baseSceneCode: this.orderObj.baseSceneCodeValue
      })
      this.goodsList = res
      this.changeTotalPrice()
      if (paramsData.id) this.getQuotationInfoById(paramsData.id)
    },
    handleSpecificationsEcho(item) {
      console.log('item', item)
      let { goodsList: quotationGoodsList } = this,
        skuArr = [],
        arr = item.specificationsValue.split('/'),
        str = arr.join(';~;')
      quotationGoodsList.forEach(data => {
        if (data.goodsFlag == 2) {
          let tempData = data.multipleSpecificationsGoods.specificationGoodsMap[str]
          if (tempData) {
            tempData.forEach(temp => {
              if (temp.merchantGoodsId == item.goodsId) {
                let obj = {
                  goodsFlag: 2,
                  goods: null
                }

                obj.multipleSpecificationsGoods = {
                  goods: temp,
                  baseGoodsName: item.goodsName
                }
                temp.price = this.divideByHundred(item.goodsPrice)
                temp.goodsId = item.goodsId
                temp.specificationStr = item.specificationsValue
                console.log('🚀', obj)
                skuArr.push(obj)
              }
            })
          }
        }
      })
      return skuArr
    },
    uploadConfirm({ payVoucherList, outTradeNo }) {
      let paymentDocList = []
      payVoucherList.map(e => {
        paymentDocList.push({
          paymentDocUrl: e,
          type: 1
        })
      })
      this.orderObj.transactionNo = outTradeNo
      this.orderObj.tradeNo = outTradeNo
      this.orderObj.paymentDocList = paymentDocList
      this.submit()
    },
    setCustomerInfo(customerInfo) {
      const { orderObj } = this,
        ownerGender = customerInfo.customerSex != 2 ? '男' : '女',
        salesType = customerInfo.salesType || '0',
        city = customerInfo.customerCity
      Object.assign(orderObj, {
        customerId: customerInfo.id,
        owner: customerInfo.customerName,
        phone: customerInfo.customerPhone,
        ownerGender,
        seat: customerInfo.carSeat || 5,
        ageRange: customerInfo.customerAgeRange,
        hobby: customerInfo.customerHobby,
        companion: customerInfo.customerCompanion,
        certificateNo: customerInfo.customerCertificateNo || '',
        salesType,
        carVin: customerInfo.carVin || '',
        carColor: customerInfo.carColor || ''
      })
      this.formList[1].map(e => {
        if (e.value == 'salesType') e.current = salesType
        if (e.value == 'ownerGender') e.current = ownerGender
      })
      if (city) {
        let [provinceText, cityText] = city.split('-')
        if (cityText) {
          orderObj.provinceText = provinceText
          orderObj.cityText = cityText
        } else {
          orderObj.provinceText = city
          orderObj.cityText = city
        }
        orderObj.city = city
      }
      if (customerInfo.carPrice) orderObj.price = this.divideByHundred(customerInfo.carPrice)
      if (customerInfo.salesUuid) {
        orderObj.referrerId = customerInfo.salesUuid
        orderObj.referrer = customerInfo.salesName
      }
      if (customerInfo.carSeriesName) {
        orderObj.carInfo = {
          carBrand: customerInfo.carBrand,
          carBrandId: customerInfo.carBrandId,
          carChildsBrandId: customerInfo.carChildsBrandId,
          carChildsBrandName: customerInfo.carChildsBrandName,
          carSeriesId: customerInfo.carSeriesId,
          carSeriesName: customerInfo.carSeriesName
        }
        orderObj.carBrandText = `${customerInfo.carBrand}-${customerInfo.carChildsBrandName}-${customerInfo.carSeriesName}`
      }
      this.orderObj = orderObj
      this.formKey = Date.now()
      this.validateVin()
      console.log(this.orderObj)
    },
    jumpSuccess(params) {
      this.$emit('jump', 'OrderDetail', params)
    },
    async handleEditSave() {
      let { saveStatus } = this
      if (saveStatus) return false
      this.saveStatus = true
      this.handleSecondConfirmCheck(false)
    },
    divideByHundred: str => {
      let floatVal = parseFloat(str)
      if (isNaN(floatVal)) {
        return 0
      }
      floatVal = Math.round(str * 100) / 10000
      let strVal = floatVal.toString()
      let searchVal = strVal.indexOf('.')
      if (searchVal < 0) {
        searchVal = strVal.length
        strVal += '.'
      }
      while (strVal.length <= searchVal + 2) {
        strVal += '0'
      }
      return parseFloat(strVal)
    },
    closePopup() {
      this.$emit('jump', 'OrderManagement')
    },
    clearPayMentDocList() {
      this.showUpload = false
      this.orderObj.paymentDocList = []
      this.orderObj.transactionNo = ''
    }
  }
}
</script>

<style scoped lang="scss">
.order {
  height: 100%;
  position: relative;
  &-box {
    visibility: visible;
    height: 100%;
  }
  .hide {
    opacity: 0;
    visibility: hidden;
  }
  .upload-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.box {
  height: calc(100% - #{toRpx(120)});
  padding-bottom: toRpx(24);

  .scroll-view {
    height: 100%;
  }
}

.box-content {
  padding: 0 toRpx(48);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: toRpx(24) toRpx(32) toRpx(24) 0;
  font-size: toRpx(28);
  border-bottom: toRpx(2) solid #f7f7f6;

  &-left {
    color: #333;
    font-weight: 500;
  }

  &-right {
    color: #f24724;
    font-weight: 500;
  }
}

.pay-tips {
  padding: toRpx(24) toRpx(24) toRpx(24) 0;
  font-size: toRpx(24);
  color: #999;
}
.btns {
  padding: toRpx(24) toRpx(128);
  gap: toRpx(32);
  .save {
    background: #3b73ff1a;
    color: #4673ff;
    font-size: toRpx(28);
    font-weight: 500;
  }
}
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
</style>
