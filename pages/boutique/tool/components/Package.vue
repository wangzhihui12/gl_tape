<template>
  <view>
    <view :class="[list.length > 0 ? 'package-list' : '']">
      <view class="package-item" v-for="(item, index) in list" :key="index">
        <view class="header">
          <view class="header-left">
            <view class="sprite-icon icon-blue-delete" @click="deleteGoods(index)"></view>
            <view class="name">{{ item.packageGoods.packageAlias || item.packageGoods.packageName }}</view>
            <view class="control">
              <view class="minus" @click="decreaseNumber(item)">-</view>
              <input class="uni-input control-input" type="number" maxlength="3" v-model="item.packageGoods.number" @blur="validateNumber($event, item)" />
              <view class="add" @click="increaseNumber(item)">+</view>
            </view>
          </view>
          <view class="price">¥{{ changeTotal(item) }}</view>
        </view>
        <view class="goods-item" v-for="(goods, ind) in item.packageGoods.goodsList" :key="ind">
          <view class="goods-name">{{ goods.goodsAlias || goods.upgradeGoodsName }}</view>
          <!-- <view class="alias-name">商品别名：阿尔法 T5极狐非三电整车延保（新车2年6万公里)</view> -->
          <view class="front-gear-box pb-24">
            <view class="front-gear-input-box">
              <!-- <view class="front-gear-label" v-if="goods.merchantGoodsPosition || goods.goodsInfo.goodsTypeName">{{goods.goodsInfo.goodsType===1?formatPosition(goods.merchantGoodsPosition, positionTypeList):goods.goodsInfo.goodsTypeName}}</view> -->
              <view class="front-gear-input">
                <view class="unit">¥</view>
                <input class="uni-input" type="digit" maxlength="9" placeholder="请输入价格" placeholder-style="font-size: 14px" v-model="goods.sellPrice" @blur="validatePrice($event, goods, ind, index)" />
              </view>
            </view>
          </view>
          <!-- 折扣 / 买赠 / 组合付款策略组件 -->
          <OrderStrategy v-if="getStrategyType(goods)" :strategyType="getStrategyType(goods)" v-model="goods.strategyConfig" :basePrice="getBasePrice(goods, item)" :displayPrice="getDisplayPrice(goods, item)" @priceChange="onPriceChange(goods, $event, item)" />
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import utils from '@/utils/utils'
import OrderStrategy from './OrderStrategy.vue'

export default {
  name: 'Package',
  components: {
    OrderStrategy
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    positionTypeList: {
      type: Array,
      default: []
    },
    orderTypeCode: {
      type: [String, Number],
      default: ''
    }
  },
  created() {
    // 初始化商品数量
    this.initProductNumbers()
    console.log(this.list, 'Package-list')
  },
  mounted() {
    // 确保每次使用组件时都检查并设置number属性
    this.initProductNumbers()
    // 根据订单类型初始化策略配置
    this.initStrategyConfig()
  },
  updated() {
    // 当组件数据更新时也检查number属性
    this.initProductNumbers()
    console.log(this.list, 'Package-list2')
  },
  watch: {
    orderTypeCode: {
      handler() {
        this.initStrategyConfig()
      },
      immediate: true
    }
  },
  methods: {
    // 验证价格输入（修改套餐内单个商品单价）
    validatePrice(event, goods, goodsIndex, packageIndex) {
      let value = event.detail.value
      // 如果为空则设置为0
      if (!value || value.trim() === '') {
        value = '0'
      }
      // 限制只能输入数字和小数点
      value = value.replace(/[^\d.]/g, '')
      // 限制只能有一个小数点
      if (value.split('.').length > 2) {
        value = value.slice(0, value.lastIndexOf('.')) + value.slice(value.lastIndexOf('.') + 1)
      }
      // 限制最多两位小数
      if (value.includes('.')) {
        const parts = value.split('.')
        if (parts[1].length > 2) {
          parts[1] = parts[1].substring(0, 2)
          value = parts.join('.')
        }
      }
      // 限制最大值为100000
      if (parseFloat(value) > 100000) {
        value = '100000'
      }
      // 限制最小值为0
      if (parseFloat(value) < 0 || parseFloat(value) == 0) {
        value = '0'
      }

      // 更新商品单价
      this.$set(this.list[packageIndex].packageGoods.goodsList[goodsIndex], 'sellPrice', value)

      // 价格变动时，清空该商品的折扣/抵扣配置，并按原价重算 finalPrice
      this.resetStrategyWhenPriceChange(this.list[packageIndex].packageGoods.goodsList[goodsIndex], this.list[packageIndex])

      // 重新计算套餐总价
      this.$emit('changeTotalPrice')
    },
    // 初始化商品数量方法
    initProductNumbers() {
      if (this.list && this.list.length > 0) {
        this.list.forEach(item => {
          if (!item.packageGoods.number) {
            this.$set(item.packageGoods, 'number', '1')
          }
          // 存储旧值
          item.packageGoods.goodsList.forEach(goods => {
            if (!goods.price) {
              goods.oldPrice = goods.sellPrice
            }
          })
        })
      }
    },
    // // 格式化位置信息
    // formatPosition(item, positionTypeList) {
    //   const filterData = positionTypeList.filter(v => v.positionValue == item)
    //   return (filterData.length && filterData[0] && filterData[0].positionName) || ''
    // },
    // 验证数量输入
    validateNumber(event, item) {
      let value = event.detail.value
      // 限制只能输入整数
      value = value.replace(/[^\d]/g, '')
      // 如果为空或0，设置为1
      if (!value || value.trim() === '' || parseInt(value) === 0) {
        value = '1'
      }
      // 更新值
      this.$set(item.packageGoods, 'number', value)
      // 数量改变时，需要重新计算所有包内商品的 finalPrice
      this.recalculateFinalPriceForPackage(item)
      this.$emit('changeTotalPrice')
    },
    // 增加数量
    increaseNumber(item) {
      if (!item.packageGoods.number) {
        this.$set(item.packageGoods, 'number', '1')
      } else {
        const currentValue = parseInt(item.packageGoods.number)
        // 限制最大数量为999
        const newValue = currentValue >= 999 ? 999 : currentValue + 1
        this.$set(item.packageGoods, 'number', newValue.toString())
      }
      // 数量改变时，需要重新计算所有包内商品的 finalPrice
      this.recalculateFinalPriceForPackage(item)
      this.$emit('changeTotalPrice')
    },
    // 减少数量
    decreaseNumber(item) {
      // 如果商品数量不存在或小于等于1，设置为1
      if (!item.packageGoods.number || parseInt(item.packageGoods.number) <= 1) {
        this.$set(item.packageGoods, 'number', '1')
        return
      }
      const currentValue = parseInt(item.packageGoods.number)
      // 确保减少后的值不小于1
      const newValue = Math.max(1, currentValue - 1)
      this.$set(item.packageGoods, 'number', newValue.toString())
      // 数量改变时，需要重新计算所有包内商品的 finalPrice
      this.recalculateFinalPriceForPackage(item)
      this.$emit('changeTotalPrice')
    },
    validatePrice(event, goods, ind, index) {
      let value = event.detail.value
      // 如果为空则设置为0
      if (!value || value.trim() === '') {
        value = '0'
      }
      // 限制只能输入数字和小数点
      value = value.replace(/[^\d.]/g, '')
      // 限制只能有一个小数点
      if (value.split('.').length > 2) {
        value = value.slice(0, value.lastIndexOf('.')) + value.slice(value.lastIndexOf('.') + 1)
      }
      // 限制最多两位小数
      if (value.includes('.')) {
        const parts = value.split('.')
        if (parts[1].length > 2) {
          parts[1] = parts[1].substring(0, 2)
          value = parts.join('.')
        }
      }
      // 限制最大值为100000
      if (parseFloat(value) > 100000) {
        value = '100000'
      }
      // 限制最小值为0
      if (parseFloat(value) < 0 || parseFloat(value) == 0) {
        value = '0'
      }
      // 如果validMinSellPrice为Y，则强制修改值为最小值
      if (goods.validMinSellPrice === 'Y' && goods.minSellPrice && parseFloat(value) < parseFloat(goods.minSellPrice)) {
        console.log('最小值', goods.minSellPrice)
        uni.showToast({
          title: '单价不可低于商品最低价',
          icon: 'none'
        })
        value = goods.minSellPrice.toString()
      }
      // 更新值
      this.$set(this.list[index].packageGoods.goodsList[ind], 'sellPrice', value)

      // 价格变动时，清空该商品的折扣/买赠/抵扣配置，并按原价重算 finalPrice
      this.resetStrategyWhenPriceChange(this.list[index].packageGoods.goodsList[ind], this.list[index])

      this.$emit('changeTotalPrice')
    },
    // 删除商品
    deleteGoods(index) {
      this.list.splice(index, 1)
      this.$emit('changeTotalPrice')
    },
    // 计算套餐的总价（显示优惠后的单价相加，不乘以数量）
    changeTotal(item) {
      let total = 0
      const orderType = String(this.orderTypeCode || '')

      item.packageGoods.goodsList.forEach(goods => {
        const sellPrice = parseFloat(goods.sellPrice || 0)

        // 正常订单（'1'）和冲量订单（'4'）：显示原价相加
        if (orderType === '1' || orderType === '4') {
          total += sellPrice
        }
        // 其他类型（打折/买赠/组合付款）：显示优惠后的单价相加
        else {
          const strategyConfig = goods.strategyConfig || {}
          let finalPricePerUnit = sellPrice // 默认使用原价

          // '2' 打折策略
          if (orderType === '2') {
            if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
              const ratio = parseFloat(strategyConfig.discountRatio)
              if (ratio >= 0.1 && ratio <= 10) {
                finalPricePerUnit = utils.ceilDecimal(sellPrice * (ratio / 10))
              }
            } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
              const discountAmount = parseFloat(strategyConfig.discountAmount)
              if (discountAmount >= 0.01 && discountAmount <= sellPrice) {
                finalPricePerUnit = utils.ceilDecimal(sellPrice - discountAmount)
              }
            }
          }

          // '3' 买赠策略
          if (orderType === '3') {
            if (strategyConfig.isGift === '1') {
              finalPricePerUnit = 0
            }
          }

          // '5' 组合付款
          if (orderType === '5') {
            if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
              const deductAmount = parseFloat(strategyConfig.deductAmount)
              if (deductAmount >= 0.01 && deductAmount <= sellPrice) {
                finalPricePerUnit = utils.ceilDecimal(sellPrice - deductAmount)
              }
            }
          }

          total += finalPricePerUnit
        }
      })

      item.packageGoods.upgradePrice = total
      return total.toFixed(2)
    },
    // 根据订单类型获取策略类型
    getStrategyType(goods) {
      const orderType = String(this.orderTypeCode || '')
      // '1' 正常订单、'4' 冲量活动：不显示策略组件
      if (orderType === '1' || orderType === '4') {
        return null
      }
      // '2' 打折策略
      if (orderType === '2') {
        return 'discount'
      }
      // '3' 买赠策略
      if (orderType === '3') {
        return 'gift'
      }
      // '5' 组合付款
      if (orderType === '5') {
        return 'combined'
      }
      return null
    },
    // 计算基础价格（单价，不乘以数量）
    getBasePrice(goods, item) {
      if (!goods) return 0
      const sellPrice = parseFloat(goods.sellPrice || 0)
      // 四舍五入保留两位小数
      return utils.ceilDecimal(sellPrice)
    },
    // 计算最终显示价格
    getDisplayPrice(goods, item) {
      const basePrice = this.getBasePrice(goods, item)
      if (!basePrice) return '¥0.00'

      const orderType = String(this.orderTypeCode || '')
      const strategyConfig = goods.strategyConfig || {}

      // '2' 打折策略
      if (orderType === '2') {
        if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
          const ratio = parseFloat(strategyConfig.discountRatio)
          if (ratio >= 0.1 && ratio <= 10) {
            const finalPrice = basePrice * (ratio / 10)
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          const discountAmount = parseFloat(strategyConfig.discountAmount)
          if (discountAmount >= 0.01 && discountAmount <= basePrice) {
            const finalPrice = basePrice - discountAmount
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        }
        return '¥' + basePrice.toFixed(2)
      }

      // '3' 买赠策略
      if (orderType === '3') {
        if (strategyConfig.isGift === '1') {
          return '¥0.00'
        }
        return '¥' + basePrice.toFixed(2)
      }

      // '5' 组合付款
      if (orderType === '5') {
        if (strategyConfig.mode === 'deduct' && strategyConfig.deductAmount) {
          const deductAmount = parseFloat(strategyConfig.deductAmount)
          if (deductAmount >= 0.01 && deductAmount <= basePrice) {
            const finalPrice = basePrice - deductAmount
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        }
        return '¥' + basePrice.toFixed(2)
      }

      return '¥' + basePrice.toFixed(2)
    },
    // 价格变化回调（finalPrice 是单件商品优惠后的价格，需要乘以数量得到总价）
    onPriceChange(goods, finalPricePerUnit, item) {
      // 从父组件的 item 中获取数量
      const packageItem = this.list.find(pkg => pkg.packageGoods.goodsList.includes(goods))
      if (packageItem) {
        const number = parseInt(packageItem.packageGoods.number || 1)
        const totalFinalPrice = utils.ceilDecimal(finalPricePerUnit * number)
        // 存储总价和单价优惠后的价格
        this.$set(goods, 'finalPrice', totalFinalPrice)
        this.$set(goods, 'finalPricePerUnit', finalPricePerUnit)
      } else {
        this.$set(goods, 'finalPrice', finalPricePerUnit)
        this.$set(goods, 'finalPricePerUnit', finalPricePerUnit)
      }
      this.$emit('changeTotalPrice')
    },
    // 商品价格变动时，清空当前套餐内单个商品的折扣/抵扣配置，并重算 finalPrice
    resetStrategyWhenPriceChange(goods, item) {
      if (!goods) return

      const strategyConfig = goods.strategyConfig || {}
      // 重置策略为无优惠，买赠强制为非赠品
      this.$set(goods, 'strategyConfig', {
        mode: 'none',
        discountRatio: '',
        discountAmount: '',
        isGift: '0',
        deductAmount: ''
      })

      this.$set(goods, 'discountType', null)
      this.$set(goods, 'discountValue', null)
      this.$set(goods, 'discountAmount', null)

      // 按当前单价和套餐数量，重新计算无优惠时的 finalPrice
      const unitPrice = parseFloat(goods.sellPrice || 0)
      const number = parseInt(item?.packageGoods?.number || 1)
      const totalFinalPrice = utils.ceilDecimal(unitPrice * number)
      this.$set(goods, 'finalPricePerUnit', unitPrice)
      this.$set(goods, 'finalPrice', totalFinalPrice)
    },
    // 重新计算套餐内所有商品的 finalPrice（当数量改变时调用）
    recalculateFinalPriceForPackage(item) {
      const number = parseInt(item.packageGoods.number || 1)
      if (item.packageGoods && item.packageGoods.goodsList) {
        item.packageGoods.goodsList.forEach(goods => {
          if (goods.strategyConfig && goods.finalPricePerUnit !== undefined) {
            const totalFinalPrice = utils.ceilDecimal(goods.finalPricePerUnit * number)
            this.$set(goods, 'finalPrice', totalFinalPrice)
          }
        })
      }
    },
    // 初始化策略配置
    initStrategyConfig() {
      if (!this.list || this.list.length === 0) return
      const strategyType = this.getStrategyType({})
      if (!strategyType) {
        // 订单类型切换时，重置所有商品的策略配置
        this.list.forEach(item => {
          if (!item.packageGoods || !item.packageGoods.goodsList) return
          item.packageGoods.goodsList.forEach(goods => {
            if (goods.strategyConfig) {
              goods.strategyConfig = {}
            }
            goods.discountType = null
            goods.discountValue = null
            goods.finalPrice = null
          })
        })
        return
      }

      this.list.forEach(item => {
        if (!item.packageGoods || !item.packageGoods.goodsList) return
        item.packageGoods.goodsList.forEach(goods => {
          // 如果商品已经有 discountType 和 discountValue（回显数据），则跳过初始化
          const hasDiscountData = goods.discountType !== undefined && goods.discountType !== null
          if (hasDiscountData && goods.strategyConfig && Object.keys(goods.strategyConfig).length > 0) {
            // 回显时已经有正确的 strategyConfig，不重置
            return
          }
          // 无论 strategyConfig 是否存在，都根据新的策略类型重新初始化
          if (strategyType === 'discount') {
            this.$set(goods, 'strategyConfig', {
              mode: 'none',
              discountRatio: '',
              discountAmount: ''
            })
          } else if (strategyType === 'gift') {
            this.$set(goods, 'strategyConfig', {
              isGift: '0'
            })
          } else if (strategyType === 'combined') {
            this.$set(goods, 'strategyConfig', {
              mode: 'none',
              deductAmount: ''
            })
          }
        })
      })
    }
  }
}
</script>
<style scoped lang="scss">
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
      height: toRpx(72);
      width: toRpx(250);
      line-height: toRpx(70);
      text-align: right;
      border-radius: toRpx(12);

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
}

.package-list {
  padding: toRpx(12) toRpx(32) toRpx(12) 0;

  .package-item {
    background-color: #f5f7fa;
    border-radius: toRpx(16);
    margin-bottom: toRpx(16);
    .control {
      margin-left: toRpx(32);
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
          color: #333;
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
</style>
