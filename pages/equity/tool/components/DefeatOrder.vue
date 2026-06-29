<template>
  <view class="defeat-order">
    <view class="common-title">战败下单</view>
    <view class="box">
      <scroll-view class="scroll-view" scroll-y="true">
        <view class="box-content">
          <GlCell :formList="formList" :formData="orderObj" :titleList="defeat_titleList" @radioChange="radioChange" @inputBlur="inputBlur" @handleCell="handleCell">
            <template slot="customer">
              <view class="customer-title flex">
                客户信息
                <view
                  class="customer-file flex"
                  @click="
                    handleCell({
                      value: 'defeatCustomer'
                    })
                  "
                >
                  <view class="sprite-icon icon-customer-list"></view>
                  客户档案
                </view>
              </view>
            </template>
            <template slot="reasonList">
              <view class="reason-list flex flex-wrap">
                <view class="reason-item" v-for="(item, index) in reasonList" :key="index" @click="reasonClick(item.name)">
                  {{ item.name }}
                </view>
              </view>
            </template>
          </GlCell>
        </view>
      </scroll-view>
      <view class="btns flex" v-if="orderObj.baseSceneCodeValue">
        <view @click.stop="submit('reload')" class="btn save">提交后继续添加</view>
        <view @click.stop="submit" class="btn">战败下单</view>
      </view>
    </view>

    <!-- 弹窗 -->
    <order-popup ref="orderPopup" :data="orderObj" :dataKey="valueKey" :isDefeatOrder="true" @onConfirm="onConfirm" :externalData="externalData" :popupType="popupType" />
  </view>
</template>

<script>
import utils from '@/utils/utils'
import dayjs from 'dayjs'
import OrderPopup from '@/components/OrderPopup/index.vue'
import GlCell from '../../../../components/Form/GlCell.vue'
import { checkDailyReport, showNextModal } from '@/utils/modalUtils'
import { DEFEAT_FORM_LIST, defeat_titleList, popupTypeEnum, payTypeList } from '../contant'
import { debounce } from 'lodash'
import NP from 'number-precision'
export default {
  name: 'DefeatOrder',
  components: {
    GlCell,
    OrderPopup
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
          console.log('接收到的交易数据:', newVal)
          // 处理交易数据
          const handleTransactionData = newVal => {
            this.orderCreateType = newVal.type
            // 新增订单处理
            const {
              paramsData: { customer, customerCoupon, ...rest }
            } = newVal

            // 基础字段映射
            const baseFields = ['id', 'orderCode', 'userId', 'employeeName', 'defeatEmployeeName', 'deliveryUserId', 'subShopMerchantName', 'subShopMerchantId', 'sellerName', 'sellerUserId', 'sellerMerchantName', 'sellerMerchantId', 'merchantId', 'merchantName', 'customerCouponId']
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

            this.orderObj.carBrand = `${customer.carBrand}-${customer.carChildsBrandName}-${customer.carSeriesName}`
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

            this.goodsList = rest.subOrderList
          }
          handleTransactionData(newVal)
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      orderCreateType: 'createWithPay', // supplementOrder(补录订单) createWithPay(新增)
      formList: utils.deepClone(DEFEAT_FORM_LIST),
      userInfo: {},
      baseConfigData: {},
      valueKey: '',
      requiredList: [], // 录单设置的必填项
      orderObj: {
        deafeatReason: '',
        customerName: '',
        customerPhone: '',
        salesType: 0
      },
      popupType: 0,
      reasonList: [
        {
          select: false,
          name: '回去考虑一下'
        },
        {
          select: false,
          name: '完全不需要'
        },
        {
          select: false,
          name: '问家里意见'
        },
        {
          select: false,
          name: '没钱'
        },
        {
          select: false,
          name: '开一两年就不用了'
        },
        {
          select: false,
          name: '车开不了那么久换车'
        }
      ],
      defeat_titleList,
      externalData: [], //弹窗接口数据
      popupTypeEnum,
      externalData: [], //弹窗接口数据
      djPayList: [], // 嘀加收款方对应支付方式
      merchantPayList: [], // 门店收款方对应支付方式
      configPayTypeList: [], // 园区店配置支持的支付方式
      payTypeList,
      defaultMsg: null
    }
  },
  computed: {
    showPayTips() {
      if (this.orderObj.payeeType == 0 && this.orderObj.selectPayType == 7) return true
      else return false
    }
  },
  onload(options) {
    console.log(options, 'options')
  },
  mounted() {
    uni.$track.add({ eventCode: 'app_equity_defeat_order' })
    console.log('mounted', this.orderCreateType)
    this.userInfo = uni.$storage.get('userInfo') || {}
    this.baseConfigData = uni.$storage.get('mock_data') || {}
    const { userInfo } = this
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
    resetParams() {
      // 重置表单数据
      this.orderObj = {
        deafeatReason: '',
        customerName: '',
        customerPhone: '',
        salesType: 0
      }
      // 重置表单列表
      this.formList = utils.deepClone(DEFEAT_FORM_LIST)

      this.initData()
    },
    async initData() {
      const { userInfo } = this
      console.log(this.orderObj, 'this.orderObj')
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
      // 进页面回显最近一次选中的场景
      if (!this.orderObj.id) await this.initRecentSceneEcho()
      const hasScene = this.updateSceneGate()
      if (!hasScene) return
      await this.getEmployeeList()
      this.getLastUserOrderInfo()
      this.getGoodsProduct()
    },
    // handlerUserInfo() {
    //   let userInfo = uni.$storage.get('userInfo')
    //   this.orderObj.sellerMerchantName = userInfo.merchantName
    //   this.orderObj.sellerMerchantId = userInfo.merchantId
    //   this.orderObj.sellerName = userInfo.name
    //   this.orderObj.sellerUserId = userInfo.uuid
    // },
    // 选择行事件
    handleCell(val) {
      let { payType } = this.orderObj,
        { pointsMultiRole } = this
      this.popupTitle = ''
      // 获取当前选中的popupType
      console.log(val, 'val')
      console.log(this.popupTypeEnum, 'this.popupTypeEnum')
      this.popupType = Object.keys(this.popupTypeEnum).find(key => this.popupTypeEnum[key].key === val.value) * 1
      // 获取对应的list字段
      const popupConfig = this.popupTypeEnum[this.popupType]
      if (popupConfig && popupConfig.list) {
        this.externalData = this[popupConfig.list] || []
      } else {
        this.externalData = []
      }
      this.popupTitle = {
        0: pointsMultiRole == 'Y' ? '销售顾问/录单员' : '推荐人',
        4: '车型',
        13: payType == 2 ? '4S店收款时间' : '嘀加收款时间'
      }[this.popupType]
      console.log(this.popupType, this.externalData, '-------------')
      this.$refs.orderPopup.open()
    },
    // 获取 销售顾问列表
    async getEmployeeList() {
      console.log('getEmployeeList')
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
        console.log(data, 'data')
        this.$set(this.orderObj, 'employeeName', data[0].staffName)
        this.orderObj.userId = data[0].uuid
        this.orderObj.referrerId = data[0].uuid
        // this.orderObj.referrerId = data[0].uuid
        console.log(this.orderObj, 'this.orderObj')
      }
    },
    // 获取上一个订单的销售顾问信息 并且不是再次下单
    async getLastUserOrderInfo() {
      const res = await uni.$api.boutiqueApi.getLastUserOrderInfo({
        sellerUserId: this.userInfo.subLoginUser.uuid
      })
      let item = this.employeeList.find(i => i.uuid == res.userId)
      if (!item) {
        this.$set(this.orderObj, 'employeeName', this.employeeList[0].staffName)
        this.$set(this.orderObj, 'defeatEmployeeName', this.employeeList[0].staffName)
        this.orderObj.userId = this.employeeList[0].uuid
        this.orderObj.referrerId = this.employeeList[0].uuid
      } else {
        this.$set(this.orderObj, 'employeeName', res.employeeName)
        this.$set(this.orderObj, 'defeatEmployeeName', res.employeeName)
        this.orderObj.userId = res.userId
        this.orderObj.referrerId = res.userId
      }
    },
    // 单选框change事件
    radioChange(e, val) {
      console.log(e, val)
      this.orderObj[val.value] = e.detail.value
      if (val.value == 'payeeType') {
        this.changePayee()
      }
    },
    // 输入框失去焦点事件
    inputBlur(e, val) {
      console.log(e, val)
      console.log(this.orderObj)
      this.orderObj.customer[val.value] = this.orderObj[val.value]
    },
    // 弹窗确认回调
    onConfirm(val) {
      console.log(val, 'onConfirm')
      this.externalData = []
      // // const { chooseContent } = val
      const chooseContent = utils.deepClone(val.chooseContent)
      // 根据popupTypeEnum优化处理
      const _typeValue = this.popupTypeEnum[this.popupType]
      console.log(_typeValue)
      if (_typeValue.key == 'todayShow') {
        const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        this.$set(this.orderObj, 'todayShow', dayjs(chooseContent).format('YYYY-MM-DD') + ' ' + weeks[dayjs(chooseContent).day()])
        this.$set(this.orderObj, 'createDate', dayjs(chooseContent).format('YYYY-MM-DD'))
      } else if (_typeValue.key === 'baseSceneCode') {
        // 场景名称：页面显示名称；后续接口参数使用 sceneType/code
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
        // 场景名称切换时，清除已选/带入的商品（与新建工单一致）
        const productFields = ['frontGear', 'frontWindow', 'rearGear', 'rearWindow', 'sunRoof', 'package', 'skuGoods']
        productFields.forEach(field => {
          this.$set(this.orderObj, field, null)
        })
        this.goodsList = []
        // 按新场景重拉报价商品列表，更新 defaultMsg.vdQuotationGoodsList（取列表首条）
        this.getGoodsProduct()
        // 选中场景后，放开下方表单并触发依赖接口
        this.$refs.orderPopup && this.$refs.orderPopup.clearCacheByTypes([0, 1, 3, 6, 7, 8, 9, 10, 11, 12])
        this.updateSceneGate()
        this.getEmployeeList()
      }
      // 定义产品相关字段数组
      if (val.popupType == 20) {
        console.log(chooseContent, 'chooseContent')
        this.orderObj.customerName = chooseContent.customer.customerName
        this.orderObj.customerPhone = chooseContent.customer.customerPhone
      }
      if (val.popupType == 27) {
        console.log(chooseContent, 'chooseContent')
        this.orderObj.employeeName = chooseContent.staffName
        this.orderObj.defeatEmployeeName = chooseContent.staffName
        this.orderObj.userId = chooseContent.uuid
        this.orderObj.referrerId = chooseContent.uuid
      }
      console.log(this.orderObj)
    },
    checkRequired() {
      console.log(this.orderObj, '必填项')
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
        let value = this.orderObj[item.value]
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

      if (this.orderObj.standNo) {
        const vinRex = /^(?=.*[A-Za-z])[A-Za-z0-9]{17}$/
        console.log(this.orderObj.standNo, vinRex.test(this.orderObj.standNo))
        if (!vinRex.test(this.orderObj.standNo)) {
          uni.showToast({
            title: `请输入正确的VIN码`,
            icon: 'none'
          })
          return false
        }
      }

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

    submit: debounce(async function (type) {
      // 校验是否填写昨日日报
      let staffCheck = await checkDailyReport()
      if (staffCheck) return false
      if (!this.checkRequired()) return
      console.log(this.orderObj, '提交参数')
      let { default4SStoreInfo } = this.userInfo
      console.log(default4SStoreInfo, '4s店信息')
      let params = this.defaultMsg
      // 业务场景（与新建工单一致：提交使用 code；页面展示用 name）
      params.baseSceneCode = this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode
      if (this.orderObj.sceneType !== undefined && this.orderObj.sceneType !== null) {
        params.sceneType = this.orderObj.sceneType
      }
      params.owner.owner = this.orderObj.customerName
      params.owner.phone = this.orderObj.customerPhone
      params.owner.salesType = this.orderObj.salesType
      params.referrer = this.orderObj.employeeName
      params.referrerId = this.orderObj.userId
      params.remark = this.orderObj.deafeatReason
      params.defeatOrderTime = this.orderObj.createDate + ' 00:00:00'
      params.payee = 0
      console.log(params, 'rucan')
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      const res = await uni.$api.equityApi.defeatOrderCreate(params)
      console.log(res, '===submit')
      if (res) {
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        if (type == 'reload') {
          this.resetParams()
        } else {
          this.$emit('jump', 'OrderManagement')
        }
      }
    }, 300),

    // 获取商品列表数据（与权益新建工单 getSelectOrderGoodsList 一致带上场景，便于切换场景名称后刷新 vdQuotationGoodsList 数据源）
    getGoodsProduct() {
      const userInfo = this.userInfo || {}
      const { default4SStoreInfo } = userInfo
      if (!default4SStoreInfo?.merchantId) return
      const params = {
        merchantId: default4SStoreInfo.merchantId,
        suitCarPrice: ''
      }
      const baseSceneCode = this.orderObj.baseSceneCodeValue || this.orderObj.baseSceneCode
      if (baseSceneCode) params.baseSceneCode = baseSceneCode
      if (userInfo.sceneType !== undefined && userInfo.sceneType !== null) {
        params.sceneType = userInfo.sceneType
      }
      uni.$api.equityApi
        .quotationGoodsList(params)
        .then(data => {
          data = data.map(ele => {
            if (ele.goods) {
              let item = ele.goods
              ele.goods = {
                ...item,
                goodsId: item.merchantGoodsId,
                // goodsNameAlias: item.upgradeGoodsAlias,
                goodsNameAlias: item.goodsAlias || item.goodsNameAlias,
                appreciation: item?.appreciation,
                goodsName: item?.upgradeGoodsName,
                quotationGoodsServiceItemsRelationDTOList: item?.upgradeGoodsServiceItemsList,
                titlePictureUrl: item.goodsInfo?.thumbUrl
              }
            }
            if (ele.packageGoods) {
              let item = ele.packageGoods
              item.goodsList = item.goodsList.map(ele => {
                // console.log(ele, '2222');
                let obj = {
                  packageId: item.packageCode,
                  packageName: item.packageName,
                  packageNameAlias: item.packageAlias || item.packageNameAlias,
                  goodsId: ele.merchantGoodsId || ele.upgradeGoodsId,
                  goodsName: ele.upgradeGoodsName || ele.goodsName,
                  goodsNameAlias: ele.goodsAlias || ele.goodsNameAlias,
                  // shopMinPrice: item.shopMinPrice,
                  goodsPrice: this.multipliedByHundred(ele.price),
                  sellPrice: ele.sellPrice
                }
                return obj
                // ele.push(obj);
              })
              ele.packageGoods.sellPrice = item.goodsList.reduce((pre, item) => {
                pre = NP.plus(pre, item.sellPrice)
                return pre
              }, 0)
            }
            return ele
          })
          console.log(data, 'data')
          this.setDefailtInfo(data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 处理默认隐藏信息
    setDefailtInfo(data) {
      let vdQuotationGoodsList = []
      if (Array.isArray(data)) {
        let item = data[0]

        if (item.goods) {
          item = item.goods
          const obj = {
            goodsId: item.merchantGoodsId,
            goodsName: item.goodsName,
            goodsNameAlias: item.goodsAlias || item.goodsNameAlias,
            // shopMinPrice: item.shopMinPrice,
            goodsPrice: this.multipliedByHundred(item.sellPrice)
          }
          // pre.push(obj);
          item = obj
          vdQuotationGoodsList.push(item)
        }
        if (item.packageGoods) {
          let packageGoods = item.packageGoods

          item = item.packageGoods
          item = item.goodsList.map(ele => {
            console.log(ele, '2222')
            let obj = {
              packageId: packageGoods.packageCode,
              packageName: packageGoods.packageName,
              packageNameAlias: packageGoods.packageAlias || pachageGoods.packageNameAlias,
              goodsId: ele.goodsId,
              goodsName: ele.goodsName,
              goodsNameAlias: ele.goodsNameAlias,
              // shopMinPrice: item.shopMinPrice,
              goodsPrice: this.multipliedByHundred(ele.sellPrice)
            }
            // pre.push(obj);
            // item = obj
            return obj
          })
          // item.
          vdQuotationGoodsList = item
        }
        // let item = {
        //   goodsId: firstItem.goodsId,
        //   goodsName: firstItem.goodsName,
        //   goodsNameAlias: firstItem.goodsNameAlias,
        //   goodsPrice: NP.times(100, firstItem.sellPrice),
        // }
        console.log(item, 'firstItem')
      }
      let { default4SStoreInfo } = this.userInfo
      const msg = {
        total: 1,
        mode: 1,
        check: true,
        insurancePrice: 0,
        merchantId4s: default4SStoreInfo.merchantId,
        merchantName4s: default4SStoreInfo.merchantName,
        minEquityPrice: 0,
        payType: 1,
        paymentDocList: [],
        quotedPriceUpdate: 0,
        referrer: '', //推荐人，
        referrerId: '', //
        transactionNo: '',
        vdQuotationGoodsList,
        owner: {
          ageRange: '',
          carBrand: '',
          carBrandId: '',
          carChildsBrandId: '',
          carChildsBrandName: '',
          carColor: '',
          carSeriesId: '',
          carSeriesName: '',
          carVin: '',
          certificateNo: '',
          city: '',
          companion: '',
          confirmStatus: false,
          owner: '', //客户姓名
          ownerGender: '',
          phone: '', //客户手机号
          price: '',
          salesType: 0,
          saveStatus: false,
          seat: 5
        },
        defeatOrder: true
      }
      this.defaultMsg = msg
    },

    // 乘以100保留两位小数点
    multipliedByHundred: str => {
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

    reasonClick(text) {
      let deafeatReason = (this.orderObj.deafeatReason || '') + text
      // this.orderObj.customer.deafeatReason = deafeatReason.substring(0, 30)
      this.$set(this.orderObj, 'deafeatReason', deafeatReason.substring(0, 30))
      // console.log(this.orderObj.customer?.deafeatReason)
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
  position: relative;
  .scroll-view {
    height: calc(100% - #{toRpx(168)});
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
  // margin-bottom: 0;
  height: toRpx(192) !important;
}
.btns {
  padding: 24rpx 128rpx;
  gap: 32rpx;
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
  .save {
    background: #3b73ff1a;
    color: #4673ff;
    font-size: 28rpx;
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
    margin-left: 20rpx;
    color: #347bff;
    font-size: 24rpx;
    .sprite-icon {
      margin-right: 4rpx;
    }
  }
}
</style>
