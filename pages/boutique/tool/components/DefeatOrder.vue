<template>
  <view class="defeat-order">
    <view class="common-title">战败下单</view>
    <view class="box">
      <scroll-view
        class="scroll-view"
        scroll-y="true"
      >
        <view class="box-content">
          <GlCell
            :formList="formList"
            :formData="orderObj"
            @radioChange="radioChange"
            @inputBlur="inputBlur"
            @handleCell="handleCell"
          >
            <!-- 使用v-for循环渲染产品组件，减少重复代码 -->
            <template slot="frontGear">
              <Product
                v-if="orderObj.frontGear"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.frontGear"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></Product>
            </template>
            <template slot="frontWindow">
              <Product
                v-if="orderObj.frontWindow"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.frontWindow"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></Product>
            </template>
            <template slot="rearWindow">
              <Product
                v-if="orderObj.rearWindow"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.rearWindow"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></Product>
            </template>
            <template slot="rearGear">
              <Product
                v-if="orderObj.rearGear"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.rearGear"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></Product>
            </template>
            <template slot="sunRoof">
              <Product
                v-if="orderObj.sunRoof"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.sunRoof"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></Product>
            </template>
            <template slot="package">
              <Package
                v-if="orderObj.package"
                @changeTotalPrice="changeTotalPrice"
                :list="orderObj.package"
                :positionTypeList="positionTypeList"
              ></Package>
            </template>
            <template slot="skuGoods">
              <SkuGoods
                v-if="orderObj.skuGoods"
                :list="orderObj.skuGoods"
                @changeTotalPrice="changeTotalPrice"
                :positionTypeList="positionTypeList"
                :baseConfigData="baseConfigData"
                :isDisabled="true"
              ></SkuGoods>
              <view
                class="total"
                v-if="totalPrice > 0"
              >
                <view class="total-left">总价</view>
                <view class="total-right">¥{{ totalPrice }}</view>
              </view>
            </template>
            <template slot="otherPay">
              <view
                v-if="showPayTips"
                class="pay-tips"
              >其他收款：当客户已向嘀加付款但无法使用流水补录时，新建工单应选择收款方为「嘀加收款」且支付方为「其他收款」。</view>
            </template>
            <template slot="reasonList">
              <view class="reason-list flex flex-wrap">
                <view
                  class="reason-item"
                  v-for="(item, index) in orderObj.shortcutList"
                  :key="index"
                  @click="reasonClick(item.confValue)"
                >
                  {{ item.confValue }}
                </view>
              </view>
            </template>
          </GlCell>
        </view>
        <view
          v-if="orderObj.baseSceneCodeValue"
          @click.stop="submit"
          class="btn"
        >战败下单</view>
      </scroll-view>
    </view>
    <!-- 弹窗 -->
    <order-popup
      ref="orderPopup"
      :data="orderObj"
      :dataKey="valueKey"
      :isDefeatOrder="true"
      @onConfirm="onConfirm"
      :externalData="externalData"
      :popupType="popupType"
    />
  </view>
</template>

<script>
import utils from '@/utils/utils'
import dayjs from 'dayjs'
import OrderPopup from '@/components/OrderPopup/index.vue'
import GlCell from '../../../../components/Form/GlCell.vue'
import Product from './Product.vue'
import Package from './Package.vue'
import SkuGoods from './SkuGoods.vue'
import { checkDailyReport, showNextModal } from '@/utils/modalUtils'
import { DEFEAT_FORM_LIST, popupTypeEnum, payTypeList } from '../contant'
import { debounce } from 'lodash'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
export default {
  name: 'DefeatOrder',
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
      handler (newVal) {
        if (newVal) {
          console.log('接收到的交易数据:', newVal)
          // 处理交易数据
          const handleTransactionData = newVal => {
            this.orderCreateType = newVal.type
            // 新增订单处理
            const {
              paramsData: { customer, customerCoupon, ...rest }
            } = newVal

            // 基础字段映射
            const baseFields = ['id', 'orderCode', 'userId', 'employeeName', 'deliveryEmployeeName', 'deliveryUserId', 'subShopMerchantName', 'subShopMerchantId', 'sellerName', 'sellerUserId', 'sellerMerchantName', 'sellerMerchantId', 'merchantId', 'merchantName', 'customerCouponId']
            Object.assign(this.orderObj, Object.fromEntries(baseFields.map(field => [field, rest[field]])))

            // 场景回显：列表进入会带 baseSceneName/baseSceneCode
            const sceneName = rest.baseSceneName || rest.sceneName || ''
            const sceneCode = rest.baseSceneCode || rest.baseSceneId || ''
            if (sceneName || sceneCode) {
              this.$set(this.orderObj, 'baseSceneCode', sceneName)
              this.$set(this.orderObj, 'baseSceneCodeValue', sceneCode)
              const sceneCell = this.formList?.[0]?.find(item => item.value === 'baseSceneCode')
              if (sceneCell) sceneCell.current = sceneName
            }

            // 二级流量方回显（列表进入会直接带 subShopMerchantName/subShopMerchantId）
            const subShopCell = this.formList?.[0]?.find(item => item.value === 'subShopMerchantName')
            if (subShopCell && this.orderObj.subShopMerchantName) subShopCell.current = this.orderObj.subShopMerchantName

            // 客户信息映射
            const customerFields = ['customerName', 'customerSex', 'customerPhone', 'standNo', 'plateNumber', 'experienceFlag']
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
              customerName: customer.customerName
            }

            this.orderObj.carBrand = customer.carBrandId ? `${customer.carBrand}-${customer.carChildsBrandName}-${customer.carSeriesName}` : ''
            const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
            this.$set(this.orderObj, 'todayShow', dayjs(this.orderObj.createDate).format('YYYY-MM-DD') + ' ' + weeks[dayjs(this.orderObj.createDate).day()])

            // 更新表单状态
            const updateFormCell = (formIndex, fieldName, value) => {
              const cell = this.formList[formIndex].find(item => item.value === fieldName)
              if (cell) cell.current = value
            }

            const formUpdates = [
              [1, 'customerSex', customer.customerSex],
              [1, 'experienceFlag', customer.experienceFlag],
              [2, 'payeeType', this.orderObj.payeeType]
            ]

            formUpdates.forEach(([index, field, value]) => updateFormCell(index, field, value))

            this.goodsList = []
          }
          handleTransactionData(newVal)
        }
      },
      immediate: true
    }
  },
  data () {
    return {
      orderCreateType: 'createWithPay', // supplementOrder(补录订单) createWithPay(新增)
      formList: utils.deepClone(DEFEAT_FORM_LIST),
      userInfo: {},
      baseConfigData: {},
      requiredList: [], // 录单设置的必填项
      orderObj: {
        customer: {},
        customerSex: '1',
        experienceFlag: 'Y',
        payeeType: 1,
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
    showPayTips () {
      if (this.orderObj.payeeType == 0 && this.orderObj.selectPayType == 7) return true
      else return false
    }
  },
  onload (options) {
    console.log(options, 'options')
  },
  mounted () {
    uni.$track.add({ eventCode: 'app_defeat_order' })
    console.log('mounted', this.orderCreateType)
    this.userInfo = uni.$storage.get('userInfo') || {}
    this.baseConfigData = uni.$storage.get('mock_data') || {}
    const { userInfo } = this
    this.initData()
  },
  methods: {
    async tryEchoSubShopMerchantFromDetail (orderCode) {
      try {
        if (!orderCode) return
        // 订单列表接口可能不返回二级流量方，详情接口通常会返回
        const detail = await uni.$api.boutiqueApi.getPackageGoodsDetail({ orderCode })
        const name = detail?.subShopMerchantName
        const id = detail?.subShopMerchantId
        if (name || id) {
          this.$set(this.orderObj, 'subShopMerchantId', id)
          this.$set(this.orderObj, 'subShopMerchantName', name)
          const subShopCell = this.formList?.[0]?.find(item => item.value === 'subShopMerchantName')
          if (subShopCell) subShopCell.current = name
        }
      } catch (e) {}
    },
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
    async initData () {
      const { userInfo } = this
      if (!this.orderObj.id) {
        const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        this.$set(this.orderObj, 'todayShow', dayjs().format('YYYY-MM-DD') + ' ' + weeks[dayjs().day()])
        this.$set(this.orderObj, 'createDate', dayjs().format('YYYY-MM-DD'))
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

      this.getShopMerchantPointConfig(userInfo.shopMerchantId)
      this.getSubShopMerchantList(userInfo.shopMerchantId)
      this.getSetting()

      // 列表进入（带 id/orderCode）但未返回二级流量方时，走详情兜底回显
      if (this.orderObj.id && this.orderObj.orderCode && !this.orderObj.subShopMerchantName && !this.orderObj.subShopMerchantId) {
        await this.tryEchoSubShopMerchantFromDetail(this.orderObj.orderCode)
      }

      // 进页面先回显最近场景；未选场景时不展示/不请求下方表单与接口
      if (!this.orderObj.id) await this.initRecentSceneEcho()
      const hasScene = this.updateSceneGate()
      if (!hasScene) return

      this.getConfig()
      this.getConfigList()
      // this.getEmployeeList()
      this.getSelectOrderGoodsList()
      this.getPositionList()
      if (this.orderCreateType == 'createWithPay') this.getLastUserOrderInfo() // 补录订单不需要设置默认值
    },
    // 选择行事件
    handleCell (val) {
      console.log(val, this.orderObj)
      // 获取当前选中的popupType
      this.popupType = Object.keys(this.popupTypeEnum).find(key => this.popupTypeEnum[key].key === val.value) * 1
      // 获取对应的list字段
      const popupConfig = this.popupTypeEnum[this.popupType]
      console.log(popupConfig.list)
      if (popupConfig && popupConfig.list) {
        this.externalData = this[popupConfig.list] || []
      } else {
        this.externalData = []
      }
      // 定义产品相关字段数组
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      if (productFields.includes(val.value)) {
        this.valueKey = val.value
      }
      console.log(this.popupType, this.externalData, '-------------')
      this.$refs.orderPopup.open()
    },
    // 单选框change事件
    radioChange (e, val) {
      console.log(e, val)
      this.orderObj[val.value] = e.detail.value
      if (val.value == 'payeeType') {
        this.changePayee()
      }
    },
    // 弹窗确认回调
    onConfirm (val) {
      console.log(val, 'onConfirm')
      const { chooseContent } = val
      // 根据popupTypeEnum优化处理
      const _typeValue = this.popupTypeEnum[this.popupType]
      console.log(_typeValue)
      // 定义产品相关字段数组
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      if (_typeValue.key == 'carBrand') {
        // 车型
        this.$set(this.orderObj, _typeValue.key, `${chooseContent.carBrand}-${chooseContent.carChildsBrandName}-${chooseContent.carSeriesName}`)
        this.orderObj.customer = {
          ...(this.orderObj.customer || {}),
          ...chooseContent,
          standNo: '',
          plateNumber: ''
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
      } else if (productFields.includes(_typeValue.key)) {
        if (_typeValue.key == 'skuGoods') {
          if (!this.orderObj[_typeValue.key]) {
            this.$set(this.orderObj, _typeValue.key, chooseContent)
          } else {
            // 过滤出已选的goodFlag为2的对象
            const selectedGoods = this.orderObj[_typeValue.key].filter(item => item.goodsFlag === 2)
            const singleGoods = chooseContent.filter(item => item.goodsFlag === 1)
            const moreGoods = chooseContent
              .filter(item => item.goodsFlag === 2)
              .filter(item => {
                return !selectedGoods.some(selectedItem => selectedItem.multipleSpecificationsGoods.id === item.multipleSpecificationsGoods.id)
              })
            // 合并已选的goodFlag为2的对象
            this.orderObj[_typeValue.key] = [...singleGoods, ...moreGoods, ...selectedGoods]
          }
        } else {
          // 手动拼装和新增工单一样的结构
          console.log(this.orderObj)
          this.$set(this.orderObj, _typeValue.key, Array.isArray(chooseContent) ? chooseContent.map(item => ({ goodsFlag: 1, goods: { ...item, sellPrice: item.price } })) : [{ goodsFlag: 1, goods: chooseContent }])
        }
        // 商品类，需计算总价
        setTimeout(() => {
          this.changeTotalPrice()
        }, 0)
      } else if (_typeValue.key == 'todayShow') {
        const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        this.$set(this.orderObj, 'todayShow', dayjs(chooseContent).format('YYYY-MM-DD') + ' ' + weeks[dayjs(chooseContent).day()])
        this.$set(this.orderObj, 'createDate', dayjs(chooseContent).format('YYYY-MM-DD'))
      } else if (_typeValue.key === 'baseSceneCode') {
        // 场景名称：页面显示名称；接口参数使用 code
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
        // 场景名称切换时，清除已选商品（与新建工单一致）
        productFields.forEach(field => {
          this.$set(this.orderObj, field, null)
        })
        this.goodsList = []
        this.otherProduct = []
        this.changeTotalPrice()
        // 选中场景后，放开下方表单并触发依赖接口
        this.$refs.orderPopup && this.$refs.orderPopup.clearCacheByTypes([0, 1, 3, 6, 7, 8, 9, 10, 11, 12])
        this.updateSceneGate()
        this.getConfig()
        this.getConfigList()
        // 场景变化后重新拉取商品列表
        this.getSelectOrderGoodsList()
      } else if (_typeValue.key) {
        this.orderObj[_typeValue.targetIdKey] = chooseContent[_typeValue.sourceIdKey]
        this.$set(this.orderObj, _typeValue.targetNameKey, chooseContent[_typeValue.sourceNameKey])
      }
    },
    // 输入框失去焦点事件
    inputBlur (e, val) {
      console.log(e, val)
      console.log(this.orderObj)
      this.orderObj.customer[val.value] = this.orderObj[val.value]
      // VIN车架号动态校验：车架号字段，动态转换为大写
      let standNoVal = this.orderObj.standNo;
      if (val.value === 'standNo' && standNoVal) {
        this.orderObj.standNo = formatVinInput(standNoVal)
        validateVin(this.orderObj.standNo).then(result => {
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
    checkRequired () {
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

      // VIN车架号-动态校验
      const carVin = this.orderObj.standNo
      console.log("validateState", this.validateState);
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
      //   const vinRex = /^(?=.*[A-Za-z])[A-Za-z0-9]{17}$/
      //   console.log(this.orderObj.standNo, vinRex.test(this.orderObj.standNo))
      //   if (!vinRex.test(this.orderObj.standNo)) {
      //     uni.showToast({
      //       title: `请输入正确的VIN码`,
      //       icon: 'none'
      //     })
      //     return false
      //   }
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
    // 提交

    submit: debounce(async function () {
      // 校验是否填写昨日日报
      let staffCheck = await checkDailyReport()
      if (staffCheck) return false
      console.log("this.checkRequired()", this.checkRequired());
      if (!this.checkRequired()) return
      const { orderCreateType } = this
      const obj = utils.deepClone(this.orderObj)
      // 场景名称：界面展示用 name；提交入参需要 code
      if (obj.baseSceneCodeValue) obj.baseSceneCode = obj.baseSceneCodeValue
      delete obj.baseSceneCodeValue
      const otherCustomer = ['customerSex', 'experienceFlag']
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
      console.log(goodsList, 'goodsList提交')
      if (goodsList.length > 0) {
        // obj.subOrderList = goodsList.map(item => {
        //   return {
        //     totalPrice: item.goods.sellPrice,
        //     number: item.goods.number,
        //     merchantGoodsId: item.goods.merchantGoodsId || item.goods.id,
        //     baseGoodsId: item.goods.baseGoodsId
        //   }
        // })
        goodsList.map(e => {
          if (e.goodsFlag == 1) {
            // 单商品
            subGoodsList.push({
              totalPrice: e.goods.sellPrice,
              number: e.goods.number,
              merchantGoodsId: e.goods.merchantGoodsId || e.goods.id,
              baseGoodsId: e.goods.baseGoodsId
            })
          }
          // 套餐
          if (e.goodsFlag == 3) {
            e.packageGoods.goodsList.forEach(g => {
              subGoodsList.push({
                packageCode: e.packageGoods.packageCode,
                packageName: e.packageGoods.packageName,
                totalPrice: g.sellPrice,
                number: e.packageGoods.number,
                merchantGoodsId: g.merchantGoodsId,
                upgradePrice: g.oldPrice
              })
            })
          }
          // 多规格
          if (e.goodsFlag == 2) {
            subGoodsList.push({
              baseGoodsId: e.multipleSpecificationsGoods.goods.baseGoodsId,
              totalPrice: Number(e.multipleSpecificationsGoods.goods.sellPrice),
              number: e.multipleSpecificationsGoods.number,
              merchantGoodsId: e.multipleSpecificationsGoods.goods.id || e.multipleSpecificationsGoods.goods.merchantGoodsId
            })
          }
        })
        obj.subOrderList = subGoodsList
      }
      obj.notUpgradeOrderList = [{ customer: obj.customer, subOrderList: obj.subOrderList, confirmIndex: false, isTouchMove: false, txtStyle: 'left:0' }]
      obj.subOrderList = !this.transmissionOfData?.isExpiredTraffic ? obj.subOrderList : []
      if (this.transmissionOfData?.isExpiredTraffic) {
        delete obj.customer?.['experienceFlag'] // 删除是否体验参数
        obj['packageGoodsList'] = [] // 删除商品参数
      }
      delete obj.carBrand
      delete obj.couponInfo
      delete obj.refusalReason
      delete obj.customer
      delete obj.subOrderList
      delete obj.todayShow
      delete obj.package
      delete obj.payeeType
      delete obj.skuGoods
      delete obj.customerName
      delete obj.customerPhone
      console.log(obj, 'rucan')
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      const res = await uni.$api.boutiqueApi.notUpgradeOrder({ json: JSON.stringify(obj) })
      console.log(res, '===submit')
      if (res) {
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        this.$emit('jump', 'OrderManagement')
      }
    }, 300),
    // 计算所有产品的总价
    changeTotalPrice () {
      let total = 0
      // 遍历所有商品
      const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
      productFields.forEach(slotName => {
        const productList = this.orderObj[slotName]
        if (Array.isArray(productList) && productList.length > 0) {
          // 计算每个产品的价格 * 数量，并累加到总价
          productList.forEach(item => {
            if (item.goods && item.goods.sellPrice && item.goods.number) {
              console.log(item.goods, '---单商品')
              total += parseFloat(item.goods.sellPrice) * parseInt(item.goods.number)
            } else if (item.packageGoods && item.packageGoods.upgradePrice && item.packageGoods.number) {
              console.log(item.packageGoods, '套餐')
              // if (item.packageGoods.price) {
              //   total += parseFloat(item.packageGoods.price) * parseInt(item.packageGoods.number)
              // } else {
              //   total += parseFloat(item.packageGoods.upgradePrice) * parseInt(item.packageGoods.number)
              // }
              item.packageGoods.goodsList.forEach(i => {
                total += parseFloat(i.sellPrice) * parseInt(item.packageGoods.number)
              })
            } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods && item.multipleSpecificationsGoods.goods.sellPrice) {
              console.log(item.multipleSpecificationsGoods, '多规格')
              total += parseFloat(item.multipleSpecificationsGoods.goods.sellPrice) * parseInt(item.multipleSpecificationsGoods.number || 1)
            }
          })
        }
      })
      console.log(total, 'total')
      // 更新总价
      this.totalPrice = total.toFixed(2)
    },

    // 获取上一个订单的销售顾问信息 并且不是再次下单
    async getLastUserOrderInfo () {
      const res = await uni.$api.boutiqueApi.getLastUserOrderInfo({
        sellerUserId: this.userInfo.subLoginUser.uuid
      })
      this.$set(this.orderObj, 'employeeName', res.employeeName)
      this.orderObj.userId = res.userId
      console.log(res, '上一个订单的销售顾问信息')
    },
    async getShopMerchantPointConfig (merchantId) {
      const res = await uni.$api.boutiqueApi.getShopMerchantPointConfig({ merchantId })
      console.log(res)
      if (res.pointsMultiRole == 'Y') {
        const employeeCell = this.formList[0].find(item => item.label === '销售顾问')
        if (employeeCell) employeeCell.label = '销售顾问/录单员'
        // 找到formList中label为"交付专员"的对象，添加hidden: true
        // const deliveryCell = this.formList[0].find(item => item.label === '交付专员')
        // if (deliveryCell) {
        //   deliveryCell.hidden = false
        // }
      }
      // 订单类型配置：createAllGoodsFlag = 1 显示全部类型；0 仅正常订单
      if (res.createAllGoodsFlag !== undefined && res.createAllGoodsFlag !== null) {
        uni.$storage.set('createAllGoodsFlag', res.createAllGoodsFlag)
      }
    },
    // 判断二级流量方
    async getSubShopMerchantList (merchantId) {
      const res = await uni.$api.boutiqueApi.getSubShopMerchantList({ merchantId })
      console.log(res, '流量方')
      if (res && res.length) {
        this.subShopMerchantList = res
        const cell = this.formList[0].find(item => item.label === '二级流量方')
        if (cell) {
          cell._originHidden = false
          const hasScene = Boolean(this.orderObj && (this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode))
          cell.hidden = !hasScene
        }

        // 列表进入时后端可能不返回 subShopMerchantName/subShopMerchantId；
        // 若仅有一个可选项且当前未选择，则默认回填，避免“空白不可操作”的体验
        if (!this.orderObj.subShopMerchantId && !this.orderObj.subShopMerchantName && res.length === 1) {
          const only = res[0] || {}
          this.$set(this.orderObj, 'subShopMerchantId', only.subMerchantId)
          this.$set(this.orderObj, 'subShopMerchantName', only.subMerchantName)
          const subShopCell = this.formList?.[0]?.find(item => item.value === 'subShopMerchantName')
          if (subShopCell) subShopCell.current = only.subMerchantName
        }
      }
    },
    // 动态获取 车型 车架 车牌 是否必填
    getYQorderInfo () {
      return new Promise(async (resolve, reject) => {
        const YQorderSetting = uni.$storage.get('boutique_YQorderSetting')
        if (YQorderSetting) return resolve(YQorderSetting)
        else {
          const { userInfo } = this
          let { shopMerchantId, merchantId } = userInfo

          const data = await uni.$api.boutiqueApi.getMerchantRecordingSettings({
            scene: 1,
            merchantId: shopMerchantId,
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
              ; (data.orderFieldSettingList || []).forEach(e => {
                const key = keyMap[e.fieldKey] || e.fieldKey
                YQorderSetting[key] = e.isRequired ? 'Y' : 'N'
              })

            YQorderSetting.shopMerchantId = userInfo.shopMerchantId
            // 过滤园区店是否需要屏蔽手机号选项
            let filterYqPhoneConfig = JSON.parse(data.yqPhoneConfig)
            YQorderSetting.yqPhoneConfig =
              filterYqPhoneConfig?.find(item => item.yqMerchantId == merchantId)

            console.log(YQorderSetting)
            uni.$storage.set('boutique_YQorderSetting', YQorderSetting)
            resolve(YQorderSetting)
          }
        }
      })
    },
    // 获取车型、车架号、车牌号必填规则
    async getSetting () {
      const res = await this.getYQorderInfo()
      console.log(res, '========')
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
    async getConfig () {
      const res = await uni.$api.boutiqueApi.getYqStoreConfig({
        yqMerchantId: this.orderObj.sellerMerchantId
      })
      console.log(res)
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
    changePayee () {
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
    async getEmployeeList () {
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
    async getPositionList () {
      const res = await uni.$api.boutiqueApi.getPositionList({})
      this.positionTypeList = res
    },
    // 商品列表
    async getSelectOrderGoodsList () {
      const { userInfo } = this
      const res = await uni.$api.boutiqueApi.getOrderBaseGoodsList({
        merchantId: userInfo.shopMerchantId,
        upradeFlag: 'N',
        sceneType: this.orderObj.sceneType != null ? this.orderObj.sceneType : userInfo.sceneType,
        baseSceneCode: this.orderObj.baseSceneCodeValue
      })

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
      const dataList = res.flatMap(val => val.upgradeGoodsList)
      console.log(dataList)
      // this.goodsList = dataList
      dataList.forEach(subVal => {
        subVal.positionStr = subVal.position
        subVal.upgradePrice = subVal.sellPrice
        subVal.price = subVal.sellPrice
        subVal.goodsId = subVal.merchantGoodsId

        Object.keys(posMap).forEach(key => {
          if (posMap[key].includes(subVal.merchantGoodsPosition)) {
            arrMap[key].push({ goodsFlag: 1, goods: subVal })
          }
        })
      })
      console.log('arrMap', arrMap)

      // 批量设置 hidden 属性
      Object.keys(arrMap).forEach(key => {
        const cell = this.formList[2].find(item => item.value === key)
        if (cell) cell.hidden = arrMap[key].length === 0
      })
      // 失效客户进来的战败单
      console.log(this.transmissionOfData, '失效客户进来的战败单')
      console.log(this.formList, '失效客户进来的战败单')
      if (this.transmissionOfData?.isExpiredTraffic) {
        this.formList[2].map(item => {
          item.hidden = true
        })
        const isExpiredTrafficCell = this.formList[1].find(item => item.label === '是否体验')
        if (isExpiredTrafficCell) {
          isExpiredTrafficCell.hidden = true
        }
      }

      const subOrderList = this.goodsList || []
      let chooseList = []
      console.log('subOrderList', subOrderList)
      subOrderList.map(e => {
        // 普通商品
        if (e && !e.packageName) {
          if (e.specificationData.indexOf(';~;') == -1) {
            // 修复取值字段名字错误问题
            if (!e.price) {
              e.price = utils.ceilDecimal(Number(e.totalPrice) / Number(e.number || 1))
              //最低价
            }
            e.sellPrice = e.price
            e.goodsId = e.merchantGoodsId
            if (!e.minSellPrice) e.minSellPrice = e.upgradeShopMinPrice
            e.goodsInfo = {
              goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName
            }
            e.merchantGoodsId = e.merchantGoodsId || e.id
            chooseList.push({
              goodsFlag: 1,
              goods: e,
              number: e.number,
              active: true
            })
          }
          // 多规格商品
          // if (e.specificationData.indexOf(';~;') > -1) {
          //   // 修复取值字段名字错误问题
          //   if (!e.price) {
          //     e.price = utils.decimal(Number(e.totalPrice / e.number), 2)
          //     //最低价
          //     e.sellPrice = e.price
          //   }
          //   e.goodsId = e.merchantGoodsId
          //   if (!e.minSellPrice) e.minSellPrice = e.upgradeShopMinPrice
          //   e.goodsInfo = {
          //     goodsName: e.upgradeGoodsAlias || e.upgradeGoodsName
          //   }
          //   e.count = e.number
          //   e.merchantGoodsId = e.merchantGoodsId || e.id
          //   let specificdata = this.handleSpecificationsEcho(e)
          //   console.log(specificdata, 'specificdata')
          //   chooseList = chooseList.concat(specificdata)
          // }
        }
        // 套餐
        if (e && e.packageName) {
          e.packageGoodsOrderList.forEach(g => {
            g.oldPrice = g.sellPrice || g.upgradePrice
            // g.sellPrice = g.sellPrice || g.upgradePrice;
            g.price = g.totalPrice ? Number(g.totalPrice) / Number(g.number) : g.sellPrice
            g.sellPrice = g.price
          })
          e.goodsList = e.packageGoodsOrderList
          e.upgradePrice = e.goodsList.reduce((prev, cur) => {
            console.log(prev, cur)
            return prev + cur.sellPrice
          }, 0)
          e.number = e.goodsList.length ? e.goodsList[0].number : 1

          e.price = e.goodsList.reduce((prev, cur) => {
            return prev + Number(cur.totalPrice) / Number(cur.number)
          }, 0)

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
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 3)
        )
        this.$set(
          this.orderObj,
          'rearGear',
          _singleGoods.filter(item => item.goods.upgradeGoodsPosition == 4)
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
      // if (_packageGoods) {
      //   this.$set(this.orderObj, 'package', _packageGoods)
      // }
      console.log(_skuGoods, '_skuGoods')
      if (_skuGoods && _skuGoods.length) {
        this.$set(this.orderObj, 'skuGoods', _skuGoods)
      }
      console.log(this.orderObj, 'this.orderObj')
      this.changeTotalPrice()
    },
    // 获取不升级常用字符列表
    getConfigList () {
      uni.$api.boutiqueApi
        .getConfigList({
          confGroup: 'SMARTCARLIFE_NOT_UPGRADE_LABEL'
        })
        .then(data => {
          console.log(data)
          this.orderObj.shortcutList = data
        })
    },

    reasonClick (text) {
      let refusalReason = (this.orderObj.refusalReason || '') + text
      this.orderObj.customer.refusalReason = refusalReason.substring(0, 30)
      this.$set(this.orderObj, 'refusalReason', refusalReason.substring(0, 30))
      console.log(this.orderObj.customer?.refusalReason)
    },
    handleSpecificationsEcho (item) {
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
                obj.multipleSpecificationsGoods = {
                  ...data.multipleSpecificationsGoods,
                  baseGoodsName: item.goodsName || item.upgradeGoodsName,
                  goods: {
                    ...temp,
                    price: item.price,
                    sellPrice: item.price,
                    goodsId: item.goodsId,
                    specificationStr: item.specificationData.replace(/;~;/g, '/')
                  }
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
.defeat-order {
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

.shop-list {
  padding: toRpx(12) toRpx(32) toRpx(12) 0;

  .shop-item {
    display: flex;
    align-items: center;
    background-color: #f5f7fa;
    border-radius: toRpx(16);
    margin-bottom: toRpx(16);
    padding: toRpx(24);

    .right {
      flex: 1;
      font-size: toRpx(28);
      margin-left: toRpx(24);

      .shop-name {
        color: #ff781f;
      }

      .alias {
        margin-top: toRpx(12);
        font-size: toRpx(24);
        color: #666;
      }
    }
  }
}

.front-gear-box {
  display: flex;
  justify-content: space-between;
  margin-top: toRpx(24);

  .front-gear-input-box {
    display: flex;
    align-items: center;

    .front-gear-label {
      font-size: toRpx(24);
      margin-right: toRpx(24);
      color: #999999;
    }

    .front-gear-input {
      position: relative;
      display: flex;
      border: toRpx(2) solid #eff0f2;
      background-color: #fff;
      font-size: toRpx(28);
      height: toRpx(70);
      width: toRpx(250);
      line-height: toRpx(70);
      text-align: right;

      .uni-input {
        padding: 0 toRpx(32);
        height: 100%;
      }

      .unit {
        position: absolute;
        top: 50%;
        left: toRpx(32);
        transform: translateY(-50%);
      }
    }
  }

  .control {
    display: flex;
    align-items: center;

    .control-input {
      width: toRpx(94);
      height: toRpx(74);
      background-color: #fff;
      border: toRpx(2) solid #eff0f2;
      padding: 0 toRpx(10);
      text-align: center;
    }

    .minus,
    .add {
      width: toRpx(80);
      height: toRpx(74);
      line-height: toRpx(70);
      text-align: center;
      background-color: #fff;
      border-top: toRpx(2) solid #eff0f2;
      border-bottom: toRpx(2) solid #eff0f2;
    }

    .minus {
      border-radius: toRpx(12) 0 0 toRpx(12);
      border-left: toRpx(2) solid #eff0f2;
    }

    .add {
      border-radius: 0 toRpx(12) toRpx(12) 0;
      border-right: toRpx(2) solid #eff0f2;
    }
  }
}

.package-list {
  padding: toRpx(12) toRpx(32) toRpx(12) 0;

  .package-item {
    background-color: #f5f7fa;
    border-radius: toRpx(16);
    margin-bottom: toRpx(16);

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: toRpx(1.6) solid #dce1e6;
      padding: toRpx(24);

      &-left {
        display: flex;
        align-items: center;
        font-size: toRpx(28);

        .name {
          margin-left: toRpx(26);
          color: #999;
        }

        .price {
          color: #666;
        }
      }
    }

    .goods-item {
      padding: toRpx(24);
      border-bottom: toRpx(1.6) solid #dce1e6;

      &:last-child {
        border-bottom: none;
      }

      .goods-name {
        color: #ff781f;
        font-size: toRpx(28);
      }

      .alias-name {
        margin-top: toRpx(12);
        font-size: toRpx(24);
        color: #666;
      }
    }
  }
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

.reason-list {
  gap: toRpx(24);
  margin-bottom: toRpx(32);
  margin-top: toRpx(24);
  .reason-item {
    padding: toRpx(28) toRpx(18);
    border-radius: toRpx(16);
    background: #f2f2f2;
    color: #666666;
    font-size: toRpx(28);
    font-weight: 400;
  }
}
.defeat-order ::v-deep .cell-value .textarea {
  margin-bottom: 0;
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
