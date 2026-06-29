<template>
  <view class="order">
    <view class="common-title">{{ orderCreateType == 'createWithPay' ? '新建工单' : '补录订单' }}</view>
    <view class="box">
      <scroll-view class="scroll-view" scroll-y="true">
        <view class="box-content">
          <GlCell :formList="formList" :formData="orderObj" @radioChange="radioChange" @inputBlur="inputBlur" @handleCell="handleCell">
            <template slot="frontGear">
              <Product v-if="orderObj.frontGear" @changeTotalPrice="changeTotalPrice" :list="orderObj.frontGear" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></Product>
            </template>
            <template slot="frontWindow">
              <Product v-if="orderObj.frontWindow" @changeTotalPrice="changeTotalPrice" :list="orderObj.frontWindow" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></Product>
            </template>
            <template slot="rearWindow">
              <Product v-if="orderObj.rearWindow" @changeTotalPrice="changeTotalPrice" :list="orderObj.rearWindow" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></Product>
            </template>
            <template slot="rearGear">
              <Product v-if="orderObj.rearGear" @changeTotalPrice="changeTotalPrice" :list="orderObj.rearGear" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></Product>
            </template>
            <template slot="sunRoof">
              <Product v-if="orderObj.sunRoof" @changeTotalPrice="changeTotalPrice" :list="orderObj.sunRoof" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></Product>
            </template>
            <template slot="package">
              <Package v-if="orderObj.package" @changeTotalPrice="changeTotalPrice" :list="orderObj.package" :positionTypeList="positionTypeList" :orderTypeCode="orderObj.orderTypeCode"></Package>
            </template>
            <template slot="skuGoods">
              <SkuGoods v-if="orderObj.skuGoods" :list="orderObj.skuGoods" @changeTotalPrice="changeTotalPrice" :positionTypeList="positionTypeList" :baseConfigData="baseConfigData" :orderTypeCode="orderObj.orderTypeCode"></SkuGoods>
              <view class="total" v-if="totalPrice > 0">
                <view class="total-left">总价</view>
                <view class="total-right">¥{{ totalPrice }}</view>
              </view>
            </template>
            <template slot="otherPay">
              <view v-if="showPayTips" class="pay-tips">其他收款：当客户已向嘀加付款但无法使用流水补录时，新建工单应选择收款方为「嘀加收款」且支付方为「其他收款」。</view>
            </template>
          </GlCell>
        </view>
        <view v-if="orderObj.baseSceneCodeValue" @click="submit" class="btn">直接下单</view>
      </scroll-view>
    </view>
    <!-- 弹窗 -->
    <order-popup ref="orderPopup" :data="orderObj" :dataKey="valueKey" @onConfirm="onConfirm" :externalData="externalData" :popupType="popupType" />
  </view>
</template>

<script>
import utils from '@/utils/utils'
import OrderPopup from '@/components/OrderPopup/index.vue'
import GlCell from '../../../../components/Form/GlCell.vue'
import Product from './Product.vue'
import Package from './Package.vue'
import SkuGoods from './SkuGoods.vue'
import { FORM_LIST, popupTypeEnum, payTypeList } from '../contant'
import { interceptionMixin } from '@/mixin/index'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
export default {
  name: 'CreateOrder',
  mixins: [interceptionMixin],
  components: {
    GlCell,
    OrderPopup,
    Product,
    Package,
    SkuGoods
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => null
    }
  },
  watch: {
    transmissionOfData: {
      handler(newVal) {
        if (newVal) {
          // 处理交易数据
          const handleTransactionData = newVal => {
            console.log('接收到的交易数据:', newVal)
            this.orderCreateType = newVal.type

            if (this.orderCreateType === 'supplementOrder') {
              // 补录订单处理
              const { outTradeNo, tradeNo } = newVal.selectedItems.reduce(
                (acc, item) => ({
                  outTradeNo: [...(acc.outTradeNo || []), item.outTradeNo],
                  tradeNo: [...(acc.tradeNo || []), item.tradeNo]
                }),
                {}
              )

              Object.assign(this.orderObj, {
                outTradeNo: outTradeNo.join(','),
                tradeNo: tradeNo.join(',')
              })

              // 补录订单也需要默认订单类型（用于页面“订单类型”字段展示）
              if (!this.orderObj.orderTypeCode) this.$set(this.orderObj, 'orderTypeCode', '1')
              if (!this.orderObj.djOrderType) this.$set(this.orderObj, 'djOrderType', '正常订单')
              const orderTypeCell = this.formList?.[2]?.find(item => item.value === 'djOrderType')
              if (orderTypeCell) orderTypeCell.current = this.orderObj.djOrderType
              return
            }
            // 编辑和修改订单进入这里
            // 新增订单处理
            const {
              paramsData: { customer, customerCoupon, ...rest }
            } = newVal

            // 基础字段映射
            const baseFields = ['id', 'orderCode', 'userId', 'employeeName', 'deliveryEmployeeName', 'deliveryUserId', 'subShopMerchantName', 'subShopMerchantId', 'sellerName', 'sellerUserId', 'sellerMerchantName', 'sellerMerchantId', 'merchantId', 'merchantName', 'customerCouponId', 'selectPayType']
            Object.assign(this.orderObj, Object.fromEntries(baseFields.map(field => [field, rest[field]])))

            // 场景名称回显：后端给 baseSceneCode(code) + baseSceneName(name)
            this.$set(this.orderObj, 'baseSceneCode', rest.baseSceneName || '')
            this.$set(this.orderObj, 'baseSceneCodeValue', rest.baseSceneCode || '')
            const sceneCell = this.formList?.[0]?.find(item => item.value === 'baseSceneCode')
            if (sceneCell) sceneCell.current = rest.baseSceneName || ''

            // 回显订单类型
            const orderTypeMap = {
              1: '正常订单',
              2: '打折策略',
              3: '买赠策略',
              4: '冲量活动',
              5: '组合付款',
              6: '内部结算'
            }
            if (rest.djOrderType !== undefined && rest.djOrderType !== null) {
              this.orderObj.orderTypeCode = String(rest.djOrderType)
              this.orderObj.djOrderType = orderTypeMap[this.orderObj.orderTypeCode] || ''
            } else {
              // 如果没有订单类型，默认设置为正常订单
              this.orderObj.orderTypeCode = '1'
              this.orderObj.djOrderType = orderTypeMap['1'] || '正常订单'
            }

            // 设置支付类型
            this.orderObj.payeeType = rest.selectPayType == '2' ? '1' : '0'

            // 客户信息映射
            const customerFields = ['customerName', 'customerSex', 'customerPhone', 'salesType', 'standNo', 'plateNumber', 'experienceFlag']
            Object.assign(this.orderObj, Object.fromEntries(customerFields.map(field => [field, customer[field]])))

            // 优惠券信息
            const { couponName, customerCouponCode } = customerCoupon
            Object.assign(this.orderObj, {
              couponName,
              customerCouponCode,
              couponInfo: couponName + customerCouponCode
            })

            // 车辆信息
            this.orderObj.customer = {
              carBrand: customer.carBrand,
              carBrandId: customer.carBrandId,
              carChildsBrandId: customer.carChildsBrandId,
              carChildsBrandName: customer.carChildsBrandName,
              carSeriesId: customer.carSeriesId,
              carSeriesName: customer.carSeriesName,
              customerPhone: customer.customerPhone,
              standNo: customer.standNo,
              plateNumber: customer.plateNumber,
              customerSex: customer.customerSex,
              experienceFlag: customer.experienceFlag,
              salesType: customer.salesType,
              customerName: customer.customerName
            }

            this.orderObj.carBrand = customer.carBrandId ? `${customer.carBrand}-${customer.carChildsBrandName}-${customer.carSeriesName}` : ''

            // 更新表单状态
            const updateFormCell = (formIndex, fieldName, value) => {
              const cell = this.formList[formIndex].find(item => item.value === fieldName)
              if (cell) cell.current = value
            }

            const formUpdates = [
              [1, 'salesType', customer.salesType],
              [1, 'customerSex', customer.customerSex],
              [1, 'experienceFlag', customer.experienceFlag],
              [2, 'selectPayType', this.orderObj.selectPayType],
              [2, 'payeeType', this.orderObj.payeeType]
            ]

            formUpdates.forEach(([index, field, value]) => updateFormCell(index, field, value))

            // 更新订单类型字段显示
            const orderTypeCell = this.formList[2].find(item => item.value === 'djOrderType')
            if (orderTypeCell && this.orderObj.djOrderType) {
              orderTypeCell.current = this.orderObj.djOrderType
            }
            // 商品回显，在获取商品列表之后
            this.subOrderList = rest.subOrderList
          }
          console.log(this.orderObj, 'orderObj')
          handleTransactionData(newVal)
        } else {
          this.userInfo = uni.$storage.get('userInfo') || {}
          this.baseConfigData = uni.$storage.get('mock_data') || {}
          this.orderCreateType = 'createWithPay'
          this.orderObj = {
            customer: {},
            customerSex: '1',
            experienceFlag: 'Y',
            payeeType: 1,
            salesType: '0',
            orderTypeCode: '1', // 默认正常订单
            djOrderType: '正常订单', // 默认正常订单
            frontGear: null, // 1 ，回显upgradeGoodsPosition == 1
            frontWindow: null, // 2
            rearWindow: null, // 3
            rearGear: null, // 4
            sunRoof: null, // 5， 6，7
            package: null,
            skuGoods: null // upgradeGoodsPosition 为空，则是其他精品单商品
          }
          this.initData()
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      orderCreateType: 'createWithPay', // supplementOrder(补录订单) createWithPay(新增)
      formList: utils.deepClone(FORM_LIST),
      userInfo: {},
      baseConfigData: {},
      requiredList: [], // 录单设置的必填项
      orderObj: {
        customer: {},
        customerSex: '1',
        experienceFlag: 'Y',
        payeeType: 1,
        salesType: '0',
        orderTypeCode: '1', // 默认正常订单
        djOrderType: '正常订单', // 默认正常订单（表单展示用）
        frontGear: null, // 1 ，回显upgradeGoodsPosition == 1
        frontWindow: null, // 2
        rearWindow: null, // 3
        rearGear: null, // 4
        sunRoof: null, // 5， 6，7
        package: null,
        skuGoods: null // upgradeGoodsPosition 为空，则是其他精品单商品
      }, // 弹窗传入的数据},
      popupType: 0,
      popupTypeEnum,
      externalData: [], //弹窗接口数据
      subShopMerchantList: [], // 二级流量方列表
      employeeList: [],
      djPayList: [], // 嘀加收款方对应支付方式
      merchantPayList: [], // 门店收款方对应支付方式
      configPayTypeList: [], // 园区店配置支持的支付方式
      payTypeList,
      goodsList: [],
      subOrderList: [],
      otherProduct: [],
      positionTypeList: [],
      valueKey: '',
      totalPrice: 0,
      validateState: true,
      // 产品槽位配置，用于循环渲染产品组件
      productSlots: {
        frontGear: true,
        frontWindow: true,
        rearGear: true,
        rearWindow: true,
        sunRoof: true
      }
    }
  },
  computed: {
    showPayTips() {
      if (this.orderObj.payeeType == 0 && this.orderObj.selectPayType == 7) return true
      else return false
    }
  },
  mounted() {
    console.log('mounted', this.orderCreateType)
    this.userInfo = uni.$storage.get('userInfo') || {}
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
        // 同步表单展示（GlCell 某些字段依赖 current）
        const sceneCell = this.formList?.[0]?.find(v => v && v.value === 'baseSceneCode')
        if (sceneCell) sceneCell.current = item.name || item.staffName || ''
      } catch (e) {}
    },
    // 计算单个商品的最终价格（与页面展示保持一致：先算单件优惠价，再乘数量，均向上取整两位）
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
            // 单件优惠价：单价 * 折扣比例，先向上取整两位
            const unit = utils.ceilDecimal(price * (ratio / 10))
            // 总价：单件优惠价 * 数量，再向上取整两位
            return utils.ceilDecimal(unit * qty)
          }
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          const discountAmount = parseFloat(strategyConfig.discountAmount)
          if (discountAmount >= 0.01 && discountAmount <= price) {
            // 单件优惠价：单价 - 折扣金额，先向上取整两位
            const unit = utils.ceilDecimal(price - discountAmount)
            // 总价：单件优惠价 * 数量，再向上取整两位
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
            // 单件优惠价：单价 - 抵扣金额，先向上取整两位
            const unit = utils.ceilDecimal(price - deductAmount)
            // 总价：单件优惠价 * 数量，再向上取整两位
            return utils.ceilDecimal(unit * qty)
          }
        }
        const unit = utils.ceilDecimal(price)
        return utils.ceilDecimal(unit * qty)
      }

      const unit = utils.ceilDecimal(price)
      return utils.ceilDecimal(unit * qty)
    },
    // 计算主订单的总 finalPrice
    calculateTotalFinalPrice(subGoodsList) {
      if (!subGoodsList || subGoodsList.length === 0) return 0
      const total = subGoodsList.reduce((sum, item) => {
        return sum + parseFloat(item.finalPrice || 0)
      }, 0)
      return utils.ceilDecimal(total)
    },
    // 根据 discountType、discountValue 等字段构建 strategyConfig（用于回显）
    buildStrategyConfigFromDiscountFields(item, orderTypeCode) {
      const strategyConfig = {}
      const orderType = String(orderTypeCode || '')
      // 确保 discountType 是数字类型进行比较
      const discountType = item.discountType !== undefined && item.discountType !== null ? Number(item.discountType) : null

      // '2' 打折策略
      if (orderType === '2') {
        if (discountType === 1) {
          // 比例折扣
          strategyConfig.mode = 'ratio'
          // 确保 discountValue 存在且有效
          const discountValue = item.discountValue !== undefined && item.discountValue !== null && item.discountValue !== '' ? parseFloat(item.discountValue) : null
          if (discountValue !== null && !isNaN(discountValue)) {
            strategyConfig.discountRatio = discountValue
          } else {
            // 如果 discountValue 无效，但 discountType 是 1，仍然设置为 ratio 模式，但 discountRatio 为空
            strategyConfig.discountRatio = ''
          }
        } else if (discountType === 2) {
          // 折扣金额
          strategyConfig.mode = 'amount'
          // 确保 discountValue 存在且有效
          const discountValue = item.discountValue !== undefined && item.discountValue !== null && item.discountValue !== '' ? parseFloat(item.discountValue) : null
          if (discountValue !== null && !isNaN(discountValue)) {
            strategyConfig.discountAmount = discountValue
          } else {
            // 如果 discountValue 无效，但 discountType 是 2，仍然设置为 amount 模式，但 discountAmount 为空
            strategyConfig.discountAmount = ''
          }
        } else {
          // 无折扣（discountType === 3 或其他）
          strategyConfig.mode = 'none'
          strategyConfig.discountRatio = ''
          strategyConfig.discountAmount = ''
        }
      }
      // '3' 买赠策略
      else if (orderType === '3') {
        if (discountType === 4) {
          // 赠品
          strategyConfig.isGift = '1'
        } else {
          // 非赠品（discountType === 5 或其他）
          strategyConfig.isGift = '0'
        }
      }
      // '5' 组合付款
      else if (orderType === '5') {
        if (discountType === 2) {
          // 抵扣金额
          strategyConfig.mode = 'deduct'
          // 确保 discountValue 存在且有效
          const discountValue = item.discountValue !== undefined && item.discountValue !== null && item.discountValue !== '' ? parseFloat(item.discountValue) : null
          if (discountValue !== null && !isNaN(discountValue)) {
            strategyConfig.deductAmount = discountValue
          } else {
            strategyConfig.deductAmount = ''
          }
        } else {
          // 无抵扣（discountType === 3 或其他）
          strategyConfig.mode = 'none'
          strategyConfig.deductAmount = ''
        }
      }

      return strategyConfig
    },
    // 计算优惠相关字段（discountType, discountValue, discountAmount）
    calculateDiscountFields(goods, sellPrice, number, orderTypeCode) {
      const result = {
        discountType: null,
        discountValue: null,
        discountAmount: null
      }

      if (!orderTypeCode) {
        return result
      }

      const price = parseFloat(sellPrice || 0)
      const qty = parseInt(number || 1)
      const totalPrice = price * qty
      const orderType = String(orderTypeCode || '')
      const strategyConfig = goods.strategyConfig || {}

      // '2' 打折策略
      if (orderType === '2') {
        if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
          // 比例折扣
          result.discountType = 1
          result.discountValue = parseFloat(strategyConfig.discountRatio)
          // 优惠金额 = 总价 - 折扣后总价（保持和 calculateFinalPrice 完全一致的算法）
          const finalPrice = this.calculateFinalPrice(goods, price, qty, orderTypeCode)
          result.discountAmount = Math.round((totalPrice - finalPrice) * 100) / 100
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          // 折扣金额（单价折扣）
          result.discountType = 2
          result.discountValue = parseFloat(strategyConfig.discountAmount)
          // 优惠金额 = 单价折扣 * 数量
          result.discountAmount = Math.round(result.discountValue * qty * 100) / 100
        } else {
          // 无折扣
          result.discountType = 3
          result.discountAmount = 0
        }
      }
      // '3' 买赠策略
      else if (orderType === '3') {
        if (strategyConfig.isGift === '1') {
          // 赠品
          result.discountType = 4
          result.discountAmount = totalPrice
        } else {
          // 非赠品
          result.discountType = 5
          result.discountAmount = 0
        }
      }
      // '5' 组合付款
      else if (orderType === '5') {
        if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
          // 抵扣金额（单价抵扣）
          result.discountType = 2
          result.discountValue = parseFloat(strategyConfig.deductAmount)
          // 优惠金额 = 单价抵扣 * 数量
          result.discountAmount = Math.round(result.discountValue * qty * 100) / 100
        } else {
          // 无抵扣
          result.discountType = 3
          result.discountAmount = 0
        }
      }
      // '1' 正常订单 或 '4' 冲量活动
      // '6' 内部结算：与正常订单同逻辑
      else {
        result.discountType = 3
        result.discountAmount = 0
      }

      return result
    },
    async initData() {
      console.log('initData', this.orderCreateType, this.orderObj.id)
      // 埋点
      if (this.orderCreateType == 'createWithPay' && !this.orderObj.id) {
        uni.$track.add({ eventCode: 'app_create_order' })
      } else if (this.orderCreateType == 'supplementOrder') {
        uni.$track.add({ eventCode: 'app_supplement_order' })
      }
      const { userInfo } = this
      if (!this.orderObj.id) {
        // 在原有的 orderObj 对象上新增这些属性
        Object.assign(this.orderObj, {
          sellerMerchantName: userInfo.merchantName,
          sellerName: userInfo.name,
          sellerMerchantId: userInfo.merchantId,
          sellerUserId: userInfo.uuid,
          merchantId: userInfo.shopMerchantId,
          merchantName: userInfo.shopMerchantName
        })
      }

      this.getShopMerchantPointConfig(this.orderObj.merchantId)

      this.getSetting()
      // 补录订单默认为嘀加收款，不需要获取园区店支付方式
      if (this.orderCreateType == 'supplementOrder') {
        this.orderObj.payeeType = 0
        const cell = this.formList[2].find(item => item.value == 'payeeType')
        if (cell) {
          cell.current = 0
          cell.radioList[1].disabled = true // 禁用4s店收款
        }
        this.djPayList = [
          {
            value: '5',
            name: '嘀加收款'
          }
        ]
        this.changePayee()
      } else {
        // 防止从补录进来4s店收款为禁用
        const cell = this.formList[2].find(item => item.value == 'payeeType')
        if (cell) {
          // 编辑订单时，使用已有的payeeType值，新建订单时使用默认值1
          if (!this.orderObj.id) {
            cell.current = 1
          } else {
            cell.current = this.orderObj.payeeType
          }
          cell.radioList[1].disabled = false
        }
        // 兼容：如果方法不存在则不调用，避免运行时报错
        if (typeof this.getConfig === 'function') {
          this.getConfig()
        }
      }
      // 设置订单类型表单显示（新建订单时）
      if (!this.orderObj.id && this.orderObj.djOrderType) {
        const orderTypeCell = this.formList[2].find(item => item.value === 'djOrderType')
        if (orderTypeCell) {
          orderTypeCell.current = this.orderObj.djOrderType
        }
      }
      // 新增页：先回显最近场景；未选场景时不展示/不请求下方表单与接口
      // 补录订单也需要回显最近场景（否则首屏场景名称为空，无法继续）
      if (!this.orderObj.id && (this.orderCreateType === 'createWithPay' || this.orderCreateType === 'supplementOrder')) {
        const hasScene = Boolean(this.orderObj && (this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode))
        if (!hasScene) await this.initRecentSceneEcho()
      }
      const hasScene = this.updateSceneGate()
      if (!hasScene) return

      // this.getEmployeeList()
      this.getSelectOrderGoodsList()
      this.getPositionList()
      if (this.orderCreateType == 'createWithPay' && !this.orderObj.id) this.getLastUserOrderInfo() // 补录订单和有id的情况，不需要设置默认值
    },
    // 选择行事件
    handleCell(val) {
      // 获取当前选中的popupType
      const foundKey = Object.keys(this.popupTypeEnum).find(key => this.popupTypeEnum[key].key === val.value)
      if (!foundKey) {
        console.error(`Popup type not found for value: ${val.value}`)
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
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      if (productFields.includes(val.value)) {
        this.valueKey = val.value
        this.externalData = utils.deepClone(this.goodsList)
      }
      // 确保 orderPopup 引用存在后再调用 open 方法
      if (this.$refs.orderPopup && this.$refs.orderPopup.open) {
        this.$refs.orderPopup.open()
      } else {
        console.error('OrderPopup ref is not available')
      }
    },
    // 单选框change事件
    radioChange(e, val) {
      console.log(e, val)
      this.$set(this.orderObj, val.value, e.detail.value)
      if (val.value == 'payeeType') {
        this.changePayee()
      }
    },
    // 弹窗确认回调
    onConfirm(val, flag) {
      this.externalData = []
      const chooseContent = utils.deepClone(val.chooseContent)
      // 确保popupType是数字类型
      const popupTypeNum = Number(this.popupType)
      // 根据popupTypeEnum优化处理
      const _typeValue = this.popupTypeEnum[popupTypeNum]

      // 安全检查：如果_typeValue不存在，直接返回并关闭弹窗
      if (!_typeValue || !_typeValue.key) {
        console.error(`Invalid popupType: ${popupTypeNum}`)
        // 确保弹窗能够关闭
        if (this.$refs.orderPopup && this.$refs.orderPopup.close) {
          this.$refs.orderPopup.close()
        }
        return
      }
      // 定义产品相关字段数组
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      if (_typeValue.key == 'carBrand') {
        // 车型
        this.$set(this.orderObj, _typeValue.key, `${chooseContent.carBrand}-${chooseContent.carChildsBrandName}-${chooseContent.carSeriesName}`)
        this.orderObj.customer = {
          ...(this.orderObj.customer || {}),
          ...chooseContent
        }
      } else if (_typeValue.key == 'couponInfo') {
        // 礼券
        const { couponName, merchantCouponId, customerCouponCode } = chooseContent
        Object.assign(this.orderObj, {
          couponName: couponName,
          merchantCouponId: merchantCouponId,
          customerCouponCode: customerCouponCode
        })
        this.$set(this.orderObj, 'couponInfo', couponName + customerCouponCode)
      } else if (_typeValue.key == 'djOrderType') {
        // 订单类型
        this.$set(this.orderObj, 'djOrderType', chooseContent.name)
        this.$set(this.orderObj, 'orderTypeCode', chooseContent.value)
        // 订单类型切换时，清除已选商品
        const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
        productFields.forEach(field => {
          this.$set(this.orderObj, field, null)
        })
        this.changeTotalPrice()
      } else if (productFields.includes(_typeValue.key)) {
        if (_typeValue.key == 'skuGoods') {
          if (!this.orderObj[_typeValue.key]) {
            // 其他精品第一次赋值
            this.$set(this.orderObj, _typeValue.key, chooseContent)
          } else {
            // 过滤出已选的goodFlag为2的对象
            const selectedGoods = this.orderObj[_typeValue.key].filter(item => item.goodsFlag === 2)
            const singleGoods = flag ? this.orderObj[_typeValue.key].filter(item => item.goodsFlag === 1) : chooseContent.filter(item => item.goodsFlag === 1)
            const moreGoods = chooseContent
              .filter(item => item.goodsFlag === 2)
              .filter(item => {
                return !selectedGoods.some(selectedItem => selectedItem.multipleSpecificationsGoods.goods.goodsId === item.multipleSpecificationsGoods.goods.goodsId)
              })
            // 合并已选的goodFlag为2的对象
            this.orderObj[_typeValue.key] = [...singleGoods, ...moreGoods, ...selectedGoods]
          }
        } else {
          this.$set(this.orderObj, _typeValue.key, chooseContent)
        }
        // 商品类，需计算总价
        setTimeout(() => {
          this.changeTotalPrice()
        }, 0)
      } else if (_typeValue.key === 'baseSceneCode') {
        // 场景名称：页面显示名称；提交时使用 code
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
        // 场景名称切换时，清除已选商品（与订单类型切换一致）
        productFields.forEach(field => {
          this.$set(this.orderObj, field, null)
        })
        this.goodsList = []
        this.otherProduct = []
        this.changeTotalPrice()
        // 选中场景后，放开下方表单并触发依赖接口
        this.$refs.orderPopup && this.$refs.orderPopup.clearCacheByTypes([0, 1, 3, 6, 7, 8, 9, 10, 11, 12])
        this.updateSceneGate()
        this.getSelectOrderGoodsList()
        this.getPositionList()
      } else if (_typeValue.key) {
        this.orderObj[_typeValue.targetIdKey] = chooseContent[_typeValue.sourceIdKey]
        this.$set(this.orderObj, _typeValue.targetNameKey, chooseContent[_typeValue.sourceNameKey])
      }
    },
    // 输入框失去焦点事件
    inputBlur(e, val) {
      console.log(e, val)
      this.orderObj.customer[val.value] = this.orderObj[val.value]

      // VIN车架号动态校验：车架号字段，动态转换为大写
      let standNoVal = this.orderObj.standNo
      if (val.value === 'standNo' && standNoVal) {
        this.orderObj.standNo = formatVinInput(standNoVal)
        validateVin(this.orderObj.standNo)
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
      const phoneRex = /^[1]([3-9])[0-9]{9}$/
      // 把formList中所有required为true的对象放到一个数组中
      const requiredArr = []
      const onlyLabelItem = []

      this.formList.forEach(group => {
        group.forEach(item => {
          if (item.required === true && item.hidden !== true) {
            if (item.onlyLabel === true) {
              onlyLabelItem.push(item)
            } else {
              requiredArr.push(item)
            }
          }
        })
      })

      // 遍历requiredArr，检查orderObj中是否有对应的值
      for (let i = 0; i < requiredArr.length; i++) {
        const item = requiredArr[i]
        // 兼容嵌套customer对象的情况
        let value
        if (item.value === 'customerName' || item.value === 'customerPhone' || item.value === 'standNo' || item.value === 'plateNumber') {
          value = this.orderObj.customer ? this.orderObj.customer[item.value] : undefined
        } else {
          value = this.orderObj[item.value]
        }
        // 0、false、'0'等视为有效，null/undefined/空字符串视为无效
        if (value === undefined || value === null || value === '') {
          uni.showToast({
            title: `${item.label}不能为空`,
            icon: 'none'
          })
          return false
        }
        // 如果是customerPhone，添加phoneRex校验
        if (item.value === 'customerPhone' && !phoneRex.test(value)) {
          uni.showToast({
            title: `请输入正确的${item.label}`,
            icon: 'none'
          })
          return false
        }
      }

      // if (this.orderObj.standNo) {
      //   if (!utils.validateVIN(this.orderObj.standNo)) throw '车架号校验不匹配，请核对后重新输入'
      // }

      // 处理onlyLabel为true的特殊校验
      if (onlyLabelItem.length > 0) {
        // 检查frontGear、frontWindow、rearGear、rearWindow、sunRoof和couponInfo字段中是否至少有一个不为空
        const labelFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
        const hasValue = labelFields.some(field => {
          console.log(field, this.orderObj[field])
          const value = this.orderObj[field]
          return value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== '')
        })
        console.log(hasValue, hasValue)
        if (!hasValue) {
          uni.showToast({
            title: '商品不能为空',
            icon: 'none'
          })
          return false
        }
      }

      return true
    },
    // 验证订单策略和总价
    checkOrderStrategyAndTotal() {
      const orderTypeCode = String(this.orderObj.orderTypeCode || '')
      const labelFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      let allGoods = []

      // 收集所有商品
      labelFields.forEach(field => {
        const goodsList = this.orderObj[field]
        if (Array.isArray(goodsList) && goodsList.length > 0) {
          allGoods = allGoods.concat(goodsList)
        }
      })

      // 检查订单总价
      const total = parseFloat(this.totalPrice || 0)
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
        allGoods.forEach(item => {
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
        allGoods.forEach(item => {
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
        allGoods.forEach(item => {
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
    // 提交

    async submit() {
      // 必填校验
      if (!this.checkRequired()) {
        return
      }

      // VIN车架号-动态校验
      const carVin = this.orderObj.standNo
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

      // 验证订单策略和总价
      if (!this.checkOrderStrategyAndTotal()) {
        return
      }

      // 日报校验
      const hasInterception = await this.checkDailyReport()
      if (hasInterception) {
        return
      }

      const { orderCreateType } = this
      const obj = utils.deepClone(this.orderObj)
      // 场景名称：界面展示用 name；提交入参需要 code
      if (obj.baseSceneCodeValue) obj.baseSceneCode = obj.baseSceneCodeValue
      delete obj.baseSceneCodeValue
      const otherCustomer = ['standNo', 'plateNumber', 'customerSex', 'experienceFlag', 'salesType']
      obj.customer = {
        ...obj.customer,
        ...otherCustomer.reduce((acc, key) => {
          if (obj[key] !== undefined) {
            acc[key] = obj[key]
            delete obj[key]
          }
          return acc
        }, {})
      }
      // 将 frontGear、frontWindow、rearGear、rearWindow、sunRoof 字段合并到 goodsList 中
      const labelFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      let goodsList = []
      let subGoodsList = []
      labelFields.forEach(field => {
        if (Array.isArray(obj[field]) && obj[field].length > 0) {
          goodsList = goodsList.concat(obj[field])
        }
        delete obj[field]
      })
      if (goodsList.length > 0) {
        goodsList.map(e => {
          if (e.goodsFlag == 1) {
            // 单商品
            const sellPrice = parseFloat(e.goods.sellPrice || 0)
            const number = parseInt(e.goods.number || 1)
            const finalPrice = this.calculateFinalPrice(e.goods, sellPrice, number, obj.orderTypeCode)
            const discountFields = this.calculateDiscountFields(e.goods, sellPrice, number, obj.orderTypeCode)
            const unitFinalPrice = finalPrice / number
            subGoodsList.push({
              totalPrice: e.goods.sellPrice,
              number: e.goods.number,
              merchantGoodsId: e.goods.merchantGoodsId,
              finalPrice: finalPrice,
              // 商品实付单价（向上取整保留两位）
              singleProductFinalPrice: utils.ceilDecimal(unitFinalPrice),
              discountType: discountFields.discountType,
              discountValue: discountFields.discountValue,
              discountAmount: discountFields.discountAmount,
              djOrderType: obj.orderTypeCode ? parseInt(obj.orderTypeCode) : null
            })
          }
          // 套餐
          if (e.goodsFlag == 3) {
            e.packageGoods.goodsList.forEach(g => {
              const sellPrice = parseFloat(g.sellPrice || 0)
              const number = parseInt(e.packageGoods.number || 1)
              const finalPrice = this.calculateFinalPrice(g, sellPrice, number, obj.orderTypeCode)
              const discountFields = this.calculateDiscountFields(g, sellPrice, number, obj.orderTypeCode)
              const unitFinalPrice = finalPrice / number
              subGoodsList.push({
                packageCode: e.packageGoods.packageCode,
                packageName: e.packageGoods.packageName,
                totalPrice: g.sellPrice,
                number: e.packageGoods.number,
                merchantGoodsId: g.merchantGoodsId,
                upgradePrice: g.oldPrice,
                finalPrice: finalPrice,
                singleProductFinalPrice: utils.ceilDecimal(unitFinalPrice),
                discountType: discountFields.discountType,
                discountValue: discountFields.discountValue,
                discountAmount: discountFields.discountAmount,
                djOrderType: obj.orderTypeCode ? parseInt(obj.orderTypeCode) : null
              })
            })
          }
          // 多规格
          if (e.goodsFlag == 2) {
            const goods = e.multipleSpecificationsGoods.goods
            const sellPrice = parseFloat(goods.sellPrice || 0)
            const number = parseInt(e.multipleSpecificationsGoods.number || 1)
            const finalPrice = this.calculateFinalPrice(goods, sellPrice, number, obj.orderTypeCode)
            const discountFields = this.calculateDiscountFields(goods, sellPrice, number, obj.orderTypeCode)
            const unitFinalPrice = finalPrice / number
            subGoodsList.push({
              baseGoodsId: goods.baseGoodsId,
              totalPrice: Number(goods.sellPrice),
              number: e.multipleSpecificationsGoods.number,
              merchantGoodsId: goods.id || goods.merchantGoodsId,
              finalPrice: finalPrice,
              // 商品实付单价（向上取整保留两位）
              singleProductFinalPrice: utils.ceilDecimal(unitFinalPrice),
              discountType: discountFields.discountType,
              discountValue: discountFields.discountValue,
              discountAmount: discountFields.discountAmount,
              djOrderType: obj.orderTypeCode ? parseInt(obj.orderTypeCode) : null
            })
          }
        })
        obj.subOrderList = subGoodsList
      }
      // 主订单传 finalPrice（后端暂时不用）
      obj.finalPrice = this.calculateTotalFinalPrice(subGoodsList)
      // 主订单传 djOrderType（订单类型）
      if (obj.orderTypeCode) {
        obj.djOrderType = parseInt(obj.orderTypeCode)
      }
      delete obj.carBrand
      delete obj.couponInfo
      console.log(obj, 'rucan')

      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      const res = await uni.$api.boutiqueApi[orderCreateType](obj).finally(() => {
        uni.hideLoading()
      })
      if (res) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        if (this.orderCreateType == 'createWithPay' && !this.orderObj.id) {
          uni.$track.add({ eventCode: 'app_submit_create_order' })
        } else if (this.orderCreateType == 'supplementOrder') {
          uni.$track.add({ eventCode: 'app_submit_supplement_order' })
        }
        this.$emit('jump', orderCreateType == 'supplementOrder' ? 'OrderDetail' : 'ConfirmOrder', res)
      }
    },
    // 计算所有产品的总价
    changeTotalPrice() {
      let total = 0
      const orderTypeCode = this.orderObj.orderTypeCode
      const orderType = String(orderTypeCode || '')
      // 判断是否使用优惠后的价格（不是正常订单和冲量活动的，都要用优惠后的价格）
      const useFinalPrice = orderType !== '1' && orderType !== '4' && orderType !== '6'

      // 遍历所有商品
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      productFields.forEach(slotName => {
        const productList = this.orderObj[slotName]
        if (Array.isArray(productList) && productList.length > 0) {
          // 计算每个产品的价格 * 数量，并累加到总价
          productList.forEach(item => {
            if (item.goods && item.goods.sellPrice) {
              const number = parseInt(item.goods.number || 1)
              if (useFinalPrice && item.goods.finalPrice !== undefined && item.goods.finalPrice !== null) {
                // 使用优惠后的价格（已经是总价：单价优惠后 × 数量）
                total += parseFloat(item.goods.finalPrice || 0)
              } else {
                // 使用原始价格
                total += parseFloat(item.goods.sellPrice) * number
              }
            } else if (item.packageGoods && item.packageGoods.goodsList && item.packageGoods.goodsList.length > 0) {
              const packageNumber = parseInt(item.packageGoods.number || 1)
              item.packageGoods.goodsList.forEach(i => {
                if (i.sellPrice) {
                  if (useFinalPrice && i.finalPrice !== undefined && i.finalPrice !== null) {
                    // 使用优惠后的价格
                    total += parseFloat(i.finalPrice || 0)
                  } else {
                    // 使用原始价格
                    total += parseFloat(i.sellPrice) * packageNumber
                  }
                }
              })
            } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods && item.multipleSpecificationsGoods.goods.sellPrice) {
              const goods = item.multipleSpecificationsGoods.goods
              const number = parseInt(item.multipleSpecificationsGoods.number || 1)
              if (useFinalPrice && goods.finalPrice !== undefined && goods.finalPrice !== null) {
                // 使用优惠后的价格
                total += parseFloat(goods.finalPrice || 0)
              } else {
                // 使用原始价格
                total += parseFloat(goods.sellPrice) * number
              }
            }
          })
        }
      })
      // 更新总价
      this.totalPrice = total.toFixed(2)
    },

    // 获取上一个订单的销售顾问信息 并且不是再次下单
    async getLastUserOrderInfo() {
      const res = await uni.$api.boutiqueApi.getLastUserOrderInfo({
        sellerUserId: this.userInfo.subLoginUser.uuid
      })
      console.log(this.orderObj.merchantId)
      if (this.orderObj.merchantId == res.merchantId) {
        this.$set(this.orderObj, 'employeeName', res.employeeName)
        this.orderObj.userId = res.userId
        console.log(res, '上一个订单的销售顾问信息')
      } else {
        this.getEmployeeList()
      }
    },
    async getShopMerchantPointConfig(merchantId) {
      const res = await uni.$api.boutiqueApi.getShopMerchantPointConfig({ merchantId })
      // 录单员/交付专员配置
      if (res.pointsMultiRole == 'Y') {
        const employeeCell = this.formList[0].find(item => item.label === '销售顾问')
        if (employeeCell) employeeCell.label = '销售顾问/录单员'
        const deliveryCell = this.formList[0].find(item => item.label === '交付专员')
        if (deliveryCell) {
          // 告知 updateSceneGate 选中场景后该字段应展示
          deliveryCell._originHidden = false
          // 当前有无场景决定是否立即展示（避免无场景时提前出现）
          const hasScene = Boolean(this.orderObj && (this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode))
          deliveryCell.hidden = !hasScene
        }
      }
      // 订单类型配置：createAllGoodsFlag = 1 显示全部类型；0 仅正常订单
      if (res.createAllGoodsFlag !== undefined && res.createAllGoodsFlag !== null) {
        uni.$storage.set('createAllGoodsFlag', res.createAllGoodsFlag)
      }
    },
    // 判断二级流量方
    async getSubShopMerchantList(merchantId) {
      const res = await uni.$api.boutiqueApi.getSubShopMerchantList({ merchantId })
      if (res && res.length) {
        this.subShopMerchantList = res
        const cell = this.formList[0].find(item => item.label === '二级流量方')
        if (cell) {
          cell._originHidden = false
          const hasScene = Boolean(this.orderObj && (this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode))
          cell.hidden = !hasScene
        }
      }
    },
    // 动态获取 车型 车架 车牌 是否必填
    getYQorderInfo() {
      return new Promise(async (resolve, reject) => {
        const YQorderSetting = uni.$storage.get('boutique_YQorderSetting')
        if (YQorderSetting) return resolve(YQorderSetting)
        else {
          const { userInfo } = this
          let { shopMerchantId, merchantId, shopMerchantName } = userInfo
          const data = await uni.$api.boutiqueApi.getMerchantRecordingSettings({
            scene: 1,
            merchantId: shopMerchantId,
            merchantName: shopMerchantName
          })
          if (data) {
            let YQorderSetting = {}
            const keyMap = {
              carBrand: 'carTypeRequiredFlag',
              carNo: 'standNoRequiredFlag',
              plateNo: 'plateNumRequiredFlag',
              notUpgradeExperience: 'foEfRequiredFlag',
              notUpgradeRejectionReason: 'foRrRequiredFlag'
            }
            ;(data.orderFieldSettingList || []).forEach(e => {
              const key = keyMap[e.fieldKey] || e.fieldKey
              YQorderSetting[key] = e.isRequired ? 'Y' : 'N'
            })

            YQorderSetting.shopMerchantId = userInfo.shopMerchantId
            // 过滤园区店是否需要屏蔽手机号选项
            let filterYqPhoneConfig = JSON.parse(data.yqPhoneConfig)
            YQorderSetting.yqPhoneConfig = filterYqPhoneConfig?.find(item => item.yqMerchantId == merchantId)

            console.log(YQorderSetting)
            uni.$storage.set('boutique_YQorderSetting', YQorderSetting)
            resolve(YQorderSetting)
          }
        }
      })
    },
    // 获取车型、车架号、车牌号必填规则
    async getSetting() {
      const res = await this.getYQorderInfo()
      const dictionaryObj = {
        carTypeRequiredFlag: 'carBrand',
        standNoRequiredFlag: 'standNo',
        plateNumRequiredFlag: 'plateNumber'
      }
      for (const key in dictionaryObj) {
        const cell = this.formList[1].find(item => item.value === dictionaryObj[key])
        if (cell) cell.required = res[key] == 'Y'
      }
    },
    // 获取园区店支付方式
    async getConfig() {
      const res = await uni.$api.boutiqueApi.getYqStoreConfig({
        yqMerchantId: this.orderObj.sellerMerchantId
      })
      let m = res.supportPayTypes || []
      let n = this.payTypeList
      let list = n.filter(k => {
        let idx = m.find(j => j == k.value)
        return idx >= 0
      })
      // this.configPayTypeList = list
      this.djPayList = [
        ...list?.filter(v => ![2, 5].includes(Number(v.value))),
        {
          name: '对公转账',
          value: '6'
        },
        {
          name: '其它收款',
          value: '7'
        }
      ]
      this.merchantPayList = [...list?.filter(v => v.value == 2)]
      this.changePayee()
      console.log(this.djPayList, this.merchantPayList, 'list')
    },
    changePayee() {
      const cell = this.formList[2].find(item => item.value === 'selectPayType')
      if (cell) {
        cell.radioList = this.orderObj.payeeType == 1 ? this.merchantPayList : this.djPayList
        if (!this.orderObj.id && cell.radioList && cell.radioList.length > 0) {
          cell.current = cell.radioList[0].value
          // 使用 $set 确保响应式更新
          this.$set(this.orderObj, 'selectPayType', cell.radioList[0].value)
        }
      }
    },
    // 获取 销售顾问列表
    async getEmployeeList() {
      const { userInfo, orderObj } = this
      const { shopMerchantId, sceneType, merchantId } = userInfo,
        data = await uni.$api.popupApi.getEmployeeList({
          merchantId: orderObj.idKey == 'sellerUserId' ? merchantId : shopMerchantId,
          sceneList: orderObj.idKey == 'sellerUserId'
            ? ''
            : [this.orderObj.sceneType != null ? this.orderObj.sceneType : sceneType]
        })
      if (data && data.length) {
        this.employeeList = data
        this.$set(this.orderObj, 'employeeName', data[0].staffName)
        this.orderObj.userId = data[0].uuid
      }
    },
    async getPositionList() {
      const res = await uni.$api.boutiqueApi.getPositionList({})
      this.positionTypeList = res
    },
    // 商品列表
    async getSelectOrderGoodsList() {
      const { userInfo } = this
      const res = await uni.$api.boutiqueApi.getSelectOrderGoodsList({
        merchantId: userInfo.shopMerchantId,
        sceneType: userInfo.sceneType,
        baseSceneCode: this.orderObj.baseSceneCodeValue
      })
      this.goodsList = res

      // 分类映射
      const posMap = {
        frontGear: [1],
        frontWindow: [2],
        rearGear: [3],
        rearWindow: [4],
        sunRoof: [5, 6, 7]
      }
      // 初始化各类商品数组
      const arrMap = {
        frontGear: [],
        frontWindow: [],
        rearGear: [],
        rearWindow: [],
        sunRoof: []
      }

      res.forEach(val => {
        if (val.goodsFlag == 1) {
          let subVal = val.goods
          subVal.positionStr = subVal.position
          subVal.upgradePrice = subVal.sellPrice
          subVal.price = subVal.sellPrice
          subVal.goodsId = subVal.merchantGoodsId

          Object.keys(posMap).forEach(key => {
            if (posMap[key].includes(subVal.merchantGoodsPosition)) {
              arrMap[key].push(val)
            }
          })
        }
        //商品多规格
        if (val.goodsFlag == 2) {
          val.multipleSpecificationsGoods.specificationList.forEach(item => {
            item.specificationSelectValueList = []
            item.specificationValueList.forEach(second => {
              if (second.show) {
                item.specificationSelectValueList.push(second.specificationValue)
              }
            })
          })
          this.otherProduct.push(val)
        }
      })
      console.log(arrMap, 'arrMap')
      // 批量设置 hidden 属性
      Object.keys(arrMap).forEach(key => {
        const cell = this.formList[2].find(item => item.value === key)
        if (cell) cell.hidden = arrMap[key].length === 0
      })
      console.log('this.formList', this.formList)
      const subOrderList = this.subOrderList || []
      console.log('subOrderList', subOrderList)
      let chooseList = []
      subOrderList.map(e => {
        // 普通商品
        if (e && !e.packageName) {
          if (e.specificationData.indexOf(';~;') == -1) {
            // 修复取值字段名字错误问题
            // 始终使用 totalPrice（原价）来计算单价，确保编辑时显示的是原价，而不是优惠后的价格
            // 即使 e.price 已存在（可能被 ConfirmOrder.vue 设置为优惠后的价格），也要重新计算
            if (e.totalPrice !== undefined && e.totalPrice !== null) {
              e.price = utils.ceilDecimal(Number(e.totalPrice) / Number(e.number || 1))
            } else if (!e.price) {
              // 如果没有 totalPrice，才使用已存在的 price 或计算默认值
              e.price = utils.ceilDecimal(Number(e.finalPrice || 0) / Number(e.number || 1))
            }
            e.sellPrice = e.price
            e.goodsId = e.merchantGoodsId
            if (!e.minSellPrice) e.minSellPrice = e.upgradeShopMinPrice
            e.goodsInfo = {
              goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName
            }
            e.merchantGoodsId = e.merchantGoodsId || e.id
            // 确保 number 字段存在且正确（用于回显）
            if (e.number !== undefined && e.number !== null) {
              e.number = String(e.number)
            } else {
              e.number = '1'
            }

            // 回显 finalPrice 和 strategyConfig
            if (e.finalPrice !== undefined && e.finalPrice !== null) {
              e.finalPrice = parseFloat(e.finalPrice)
            }
            // 优先使用商品级别的 djOrderType，否则使用订单级别的 orderTypeCode
            const goodsOrderTypeCode = e.djOrderType ? String(e.djOrderType) : this.orderObj.orderTypeCode
            // 始终根据 discountType 和 discountValue 重新构建 strategyConfig，忽略后端可能错误的 strategyConfig
            if (goodsOrderTypeCode && e.discountType !== undefined && e.discountType !== null) {
              // 删除后端可能错误的 strategyConfig，重新构建
              delete e.strategyConfig
              const newStrategyConfig = this.buildStrategyConfigFromDiscountFields(e, goodsOrderTypeCode)
              this.$set(e, 'strategyConfig', newStrategyConfig)
            }

            chooseList.push({
              goodsFlag: 1,
              goods: e,
              number: e.number,
              active: true
            })
          }
          // 多规格商品
          if (e.specificationData.indexOf(';~;') > -1) {
            // 修复取值字段名字错误问题
            // 始终使用 totalPrice（原价）来计算单价，确保编辑时显示的是原价，而不是优惠后的价格
            // 即使 e.price 已存在（可能被 ConfirmOrder.vue 设置为优惠后的价格），也要重新计算
            if (e.totalPrice !== undefined && e.totalPrice !== null) {
              e.price = utils.ceilDecimal(Number(e.totalPrice) / Number(e.number || 1))
            } else if (!e.price) {
              // 如果没有 totalPrice，才使用已存在的 price 或计算默认值
              e.price = utils.ceilDecimal(Number(e.finalPrice || 0) / Number(e.number || 1))
            }
            e.sellPrice = e.price
            e.goodsId = e.merchantGoodsId
            if (!e.minSellPrice) e.minSellPrice = e.upgradeShopMinPrice
            e.goodsInfo = {
              goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName
            }
            // 确保数量字段正确回显（多规格商品使用 count 字段）
            if (e.number !== undefined && e.number !== null) {
              e.count = e.number
            } else {
              e.count = 1
            }
            e.merchantGoodsId = e.merchantGoodsId || e.id

            // 回显 finalPrice 和 strategyConfig（多规格商品需要传递给 handleSpecificationsEcho）
            if (e.finalPrice !== undefined && e.finalPrice !== null) {
              e.finalPrice = parseFloat(e.finalPrice)
            }
            // 优先使用商品级别的 djOrderType，否则使用订单级别的 orderTypeCode
            const goodsOrderTypeCode = e.djOrderType ? String(e.djOrderType) : this.orderObj.orderTypeCode
            if (goodsOrderTypeCode && e.discountType !== undefined && e.discountType !== null) {
              // 删除后端可能错误的 strategyConfig，重新构建
              delete e.strategyConfig
              const newStrategyConfig = this.buildStrategyConfigFromDiscountFields(e, goodsOrderTypeCode)
              this.$set(e, 'strategyConfig', newStrategyConfig)
            }

            let specificdata = this.handleSpecificationsEcho(e)
            console.log(specificdata, 'specificdata')
            chooseList = chooseList.concat(specificdata)
          }
        }
        // 套餐
        if (e && e.packageName) {
          e.packageGoodsOrderList.forEach(g => {
            g.oldPrice = g.sellPrice || g.upgradePrice
            // g.sellPrice = g.sellPrice || g.upgradePrice;
            // 注意：价格为 0 时也要回显，不能用 truthy 判断
            if (g.totalPrice !== undefined && g.totalPrice !== null) {
              g.price = utils.ceilDecimal(Number(g.totalPrice) / Number(g.number || 1)).toFixed(2)
            } else if (g.sellPrice !== undefined && g.sellPrice !== null && g.sellPrice !== '') {
              g.price = utils.ceilDecimal(Number(g.sellPrice)).toFixed(2)
            } else {
              g.price = '0.00'
            }
            g.sellPrice = g.price

            // 回显 finalPrice 和 strategyConfig（套餐内每个商品）
            if (g.finalPrice !== undefined && g.finalPrice !== null) {
              g.finalPrice = parseFloat(g.finalPrice)
            }
            // 优先使用商品级别的 djOrderType，否则使用订单级别的 orderTypeCode
            const goodsOrderTypeCode = g.djOrderType ? String(g.djOrderType) : this.orderObj.orderTypeCode
            if (goodsOrderTypeCode && g.discountType !== undefined && g.discountType !== null) {
              // 删除后端可能错误的 strategyConfig，重新构建
              delete g.strategyConfig
              const newStrategyConfig = this.buildStrategyConfigFromDiscountFields(g, goodsOrderTypeCode)
              this.$set(g, 'strategyConfig', newStrategyConfig)
            }
          })
          e.goodsList = e.packageGoodsOrderList
          e.upgradePrice = e.goodsList.reduce((prev, cur) => {
            console.log(prev, cur)
            return prev + cur.sellPrice
          }, 0)
          e.number = e.goodsList.length ? e.goodsList[0].number : 1

          e.price = e.goodsList.reduce((prev, cur) => {
            // 注意：cur.totalPrice 可能为 0 或空，需要显式处理
            const unit = cur.totalPrice !== undefined && cur.totalPrice !== null ? Number(cur.totalPrice) / Number(cur.number || 1) : Number(cur.sellPrice || 0)
            return prev + unit
          }, 0)
          e.price = Number(utils.decimal(e.price, 2)).toFixed(2)

          chooseList.push({
            isType: 'meal',
            active: true,
            goodsFlag: 3,
            packageGoods: e,
            number: e.number,
            totalPrice: e.price
          })
        }
      })
      console.log(chooseList, 'chooseList')
      const _singleGoods = chooseList.filter(item => item.goodsFlag == 1)
      const _packageGoods = chooseList.filter(item => item.goodsFlag == 3)
      const _skuGoods = chooseList.filter(item => item.goodsFlag == 2) || []
      console.log(_singleGoods, 'singleGoods')
      if (_singleGoods) {
        // 回显upgradeGoodsPosition   1：前挡 2：前窗 3：后窗 4：后挡 5、6、7：天窗。 为空则是其他精品
        this.$set(
          this.orderObj,
          'frontGear',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 1)
        )
        this.$set(
          this.orderObj,
          'frontWindow',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 2)
        )
        this.$set(
          this.orderObj,
          'rearWindow',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 4)
        )
        this.$set(
          this.orderObj,
          'rearGear',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 3)
        )
        this.$set(
          this.orderObj,
          'sunRoof',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 5 || item.goods.upgradeGoodsPosition == 6 || item.goods.upgradeGoodsPosition == 7)
        )
        // 将没有upgradeGoodsPosition的商品添加到_skuGoods中
        const noPositionGoods = _singleGoods.filter(item => !item.goods.upgradeGoodsPosition)
        if (noPositionGoods.length > 0) {
          _skuGoods.push(...noPositionGoods)
        }
      }
      if (_packageGoods) {
        this.$set(this.orderObj, 'package', _packageGoods)
      }
      console.log(_skuGoods, '_skuGoods')
      if (_skuGoods && _skuGoods.length) {
        this.$set(this.orderObj, 'skuGoods', _skuGoods)
      }
      console.log(this.orderObj, 'this.orderObj')
      this.changeTotalPrice()
    },
    handleSpecificationsEcho(item) {
      let skuArr = []
      const { otherProduct } = this,
        arr = item.specificationData.split('/'),
        str = arr.join(';~;'),
        obj = {
          count: item.count,
          goodsFlag: 2,
          goods: null,
          active: true,
          isFlag: true //初始化进来不显示标识
        }
      otherProduct.forEach(data => {
        if (data.goodsFlag == 2) {
          let tempData = data.multipleSpecificationsGoods.specificationGoodsMap[str]
          if (tempData) {
            tempData.forEach(temp => {
              if (temp.merchantGoodsId == item.goodsId) {
                // 回显 finalPrice 和 strategyConfig（多规格商品）
                // 确保使用原价（totalPrice），而不是可能被设置为优惠后的 item.price
                let goodsPrice = item.price
                if (item.totalPrice !== undefined && item.totalPrice !== null) {
                  // 优先使用 totalPrice（原价）计算单价
                  goodsPrice = utils.ceilDecimal(Number(item.totalPrice) / Number(item.number || 1))
                } else if (!item.price && item.finalPrice !== undefined && item.finalPrice !== null) {
                  // 如果没有 totalPrice 和 price，才使用 finalPrice
                  goodsPrice = utils.ceilDecimal(Number(item.finalPrice) / Number(item.number || 1))
                }
                const goodsData = {
                  ...temp,
                  price: goodsPrice,
                  sellPrice: goodsPrice,
                  goodsId: item.goodsId,
                  specificationStr: item.specificationData.replace(/;~;/g, '/')
                }
                if (item.finalPrice !== undefined && item.finalPrice !== null) {
                  goodsData.finalPrice = parseFloat(item.finalPrice)
                }
                // 确保 discountType 和 discountValue 也传递到 goodsData 中，以便 initStrategyConfig 能正确识别回显数据
                if (item.discountType !== undefined && item.discountType !== null) {
                  goodsData.discountType = item.discountType
                }
                if (item.discountValue !== undefined && item.discountValue !== null) {
                  goodsData.discountValue = item.discountValue
                }
                // 优先使用商品级别的 djOrderType，否则使用订单级别的 orderTypeCode
                const goodsOrderTypeCode = item.djOrderType ? String(item.djOrderType) : this.orderObj.orderTypeCode
                if (goodsOrderTypeCode && item.discountType !== undefined && item.discountType !== null) {
                  // 删除后端可能错误的 strategyConfig，重新构建
                  delete goodsData.strategyConfig
                  const newStrategyConfig = this.buildStrategyConfigFromDiscountFields(item, goodsOrderTypeCode)
                  goodsData.strategyConfig = newStrategyConfig
                }

                obj.multipleSpecificationsGoods = {
                  ...data.multipleSpecificationsGoods,
                  baseGoodsName: item.goodsName || item.upgradeGoodsName,
                  goods: goodsData,
                  // 确保数量字段正确回显
                  number: item.count !== undefined && item.count !== null ? String(item.count) : '1'
                }
                skuArr.push(obj)
              }
            })
          }
        }
      })
      console.log(skuArr)
      return skuArr
    }
  }
}
</script>

<style scoped lang="scss">
.order {
  height: 100%;
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
    color: #f45001;
    font-weight: 500;
  }
}

.pay-tips {
  padding: toRpx(24) toRpx(24) toRpx(24) 0;
  font-size: toRpx(24);
  color: #999;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: toRpx(88) auto 0;
  width: toRpx(1130);
  height: toRpx(80);
  color: #fff;
  border-radius: toRpx(48);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
}
</style>
