<template>
  <view>
    <view :class="[list.length ? 'shop-list' : '']">
      <view class="shop-item" v-for="(item, index) in list" :key="item.goods.goodsId">
        <view class="flex flex-1 pb-24">
          <view class="sprite-icon icon-blue-delete" @click="deleteGoods(index)"></view>
          <view class="right">
            <view class="shop-name">商品名称：{{ item.goods.goodsAlias || item.goods.upgradeGoodsName || item.goods.goodsInfo.goodsName }}</view>
            <!-- <view class="alias">商品别名：{{ item.goods.goodsAlias }}</view> -->
            <view class="front-gear-box">
              <view class="front-gear-input-box">
                <view class="front-gear-label" v-if="(item.goods.merchantGoodsPosition || item.goods.upgradeGoodsPosition) && (item.goods.goodsInfo.goodsType == 1 || item.goods.upgradeGoodsType == 1 || item.goods.goodsInfo.goodsType == baseConfigData.selfBuildFilmType || item.goods.upgradeGoodsType == baseConfigData.selfBuildFilmType)">
                  {{ formatPosition(item.goods.merchantGoodsPosition || item.goods.upgradeGoodsPosition, positionTypeList) }}
                </view>
                <view class="front-gear-input">
                  <view class="unit">¥</view>
                  <input class="uni-input" :disabled="isDisabled" type="digit" maxlength="9" placeholder="请输入价格" placeholder-style="font-size: 14px" v-model="item.goods.sellPrice" @blur="validatePrice($event, item, index)" />
                </view>
              </view>
              <view class="control">
                <view class="minus" @click="decreaseNumber(item)">-</view>
                <input class="uni-input control-input" type="number" maxlength="3" v-model="item.goods.number" @blur="validateNumber($event, item)" />
                <view class="add" @click="increaseNumber(item)">+</view>
              </view>
            </view>
          </view>
        </view>
        <!-- 28 行：折扣 / 买赠 / 组合付款策略组件 -->
        <OrderStrategy v-if="getStrategyType(item)" :strategyType="getStrategyType(item)" v-model="item.goods.strategyConfig" :basePrice="getBasePrice(item)" :displayPrice="getDisplayPrice(item)" @priceChange="onPriceChange(item, $event)" />
      </view>
    </view>
  </view>
</template>

<script>
import utils from '@/utils/utils'
import OrderStrategy from './OrderStrategy.vue'

export default {
  name: 'Product',
  props: {
    list: {
      type: Array,
      default: []
    },
    positionTypeList: {
      type: Array,
      default: []
    },
    baseConfigData: {
      type: Object,
      default: {}
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    orderTypeCode: {
      type: [String, Number],
      default: ''
    }
  },
  components: {
    OrderStrategy
  },
  created() {
    // 初始化商品数量
    this.initProductNumbers()
  },
  mounted() {
    // 确保每次使用组件时都检查并设置number属性
    this.initProductNumbers()
  },
  updated() {
    // 当组件数据更新时也检查number属性
    this.initProductNumbers()
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
    // 根据订单类型获取策略类型
    getStrategyType(item) {
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
    getBasePrice(item) {
      if (!item || !item.goods) return 0
      const sellPrice = parseFloat(item.goods.sellPrice || 0)
      // 四舍五入保留两位小数
      return utils.ceilDecimal(sellPrice)
    },
    // 计算最终显示价格
    getDisplayPrice(item) {
      const basePrice = this.getBasePrice(item)
      if (!basePrice) return '¥0.00'

      const orderType = String(this.orderTypeCode || '')
      const strategyConfig = item.goods.strategyConfig || {}

      // '2' 打折策略
      if (orderType === '2') {
        if (strategyConfig.mode === 'ratio' && strategyConfig.discountRatio) {
          // 折扣比例：0.1-10，表示 0.1 折到 10 折（即 0.01 到 1.0）
          const ratio = parseFloat(strategyConfig.discountRatio)
          if (ratio >= 0.1 && ratio <= 10) {
            const finalPrice = basePrice * (ratio / 10)
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        } else if (strategyConfig.mode === 'amount' && strategyConfig.discountAmount) {
          // 折扣金额：0.01 到不能大于基础价格
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
          // 抵扣金额：0.01 到不能大于基础价格
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
    onPriceChange(item, finalPricePerUnit) {
      // 计算总价：单件优惠价 * 数量
      const number = parseInt(item.goods.number || 1)
      const totalFinalPrice = utils.ceilDecimal(finalPricePerUnit * number)
      // 存储总价
      this.$set(item.goods, 'finalPrice', totalFinalPrice)
      // 同时存储单价优惠后的价格，用于数量改变时重新计算
      this.$set(item.goods, 'finalPricePerUnit', finalPricePerUnit)
      this.$emit('changeTotalPrice')
    },
    // 重新计算 finalPrice（当数量改变时调用）
    recalculateFinalPrice(item) {
      // 如果有优惠策略配置
      if (item.goods.strategyConfig && item.goods.finalPricePerUnit !== undefined) {
        const number = parseInt(item.goods.number || 1)
        const totalFinalPrice = utils.ceilDecimal(item.goods.finalPricePerUnit * number)
        this.$set(item.goods, 'finalPrice', totalFinalPrice)
      }
    },
    // 初始化策略配置
    initStrategyConfig() {
      if (!this.list || this.list.length === 0) return
      const strategyType = this.getStrategyType({})
      if (!strategyType) {
        // 订单类型切换时，重置所有商品的策略配置
        this.list.forEach(item => {
          if (!item.goods) return
          if (item.goods.strategyConfig) {
            item.goods.strategyConfig = {}
          }
          item.goods.discountType = null
          item.goods.discountValue = null
          item.goods.finalPrice = null
        })
        return
      }

      this.list.forEach(item => {
        if (!item.goods) return
        // 如果商品已经有 discountType 和 discountValue（回显数据），则跳过初始化
        const hasDiscountData = item.goods.discountType !== undefined && item.goods.discountType !== null
        if (hasDiscountData && item.goods.strategyConfig && Object.keys(item.goods.strategyConfig).length > 0) {
          // 回显时已经有正确的 strategyConfig，不重置
          return
        }
        // 无论 strategyConfig 是否存在，都根据新的策略类型重新初始化
        if (strategyType === 'discount') {
          this.$set(item.goods, 'strategyConfig', {
            mode: 'none',
            discountRatio: '',
            discountAmount: ''
          })
        } else if (strategyType === 'gift') {
          this.$set(item.goods, 'strategyConfig', {
            isGift: '0'
          })
        } else if (strategyType === 'combined') {
          this.$set(item.goods, 'strategyConfig', {
            mode: 'none',
            deductAmount: ''
          })
        }
      })
    },
    // 初始化商品数量方法
    initProductNumbers() {
      if (this.list && this.list.length > 0) {
        this.list.forEach(item => {
          if (!item.goods.number) {
            this.$set(item.goods, 'number', '1')
          }
        })
      }
    },
    circulation(data, str) {
      let arr = str.split('.'),
        result
      if (arr.length) {
        result = arr.reduce((pre, key) => {
          return pre[key]
        }, data)
      }
      return result
    },
    // 格式化位置信息
    formatPosition(item, positionTypeList) {
      const filterData = positionTypeList.filter(v => v.positionValue == item)
      return (filterData.length && filterData[0] && filterData[0].positionName) || ''
    },
    // 验证价格输入
    validatePrice(event, item, index) {
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
      // 限制最 大值为100000
      if (parseFloat(value) > 100000) {
        value = '100000'
      }
      // 限制最小值为0
      if (parseFloat(value) < 0 || parseFloat(value) == 0) {
        value = '0'
      }
      if (item.goods.validMinSellPrice === 'Y' && item.goods.minSellPrice && parseFloat(value) < parseFloat(item.goods.minSellPrice)) {
        console.log('最小值', item.goods.minSellPrice)
        uni.showToast({
          title: '单价不可低于商品最低价',
          icon: 'none'
        })
        value = item.goods.minSellPrice.toString()
      }
      // 更新值
      this.$set(this.list[index].goods, 'sellPrice', value)

      // 商品价格修改时，清空折扣 / 抵扣配置，避免旧的优惠继续生效
      this.resetStrategyWhenPriceChange(this.list[index])

      // 价格变化时，如果已选择订单类型，触发策略组件重新计算价格
      this.$forceUpdate()
      this.$emit('changeTotalPrice')
    },
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
      this.$set(item.goods, 'number', value)
      // 数量改变时，需要重新计算 finalPrice
      this.recalculateFinalPrice(item)
      // 数量变化时，如果已选择订单类型，触发策略组件重新计算价格
      this.$forceUpdate()
      this.$emit('changeTotalPrice')
    },
    // 增加数量
    increaseNumber(item) {
      if (!item.goods.number) {
        this.$set(item.goods, 'number', '1')
      } else {
        const currentValue = parseInt(item.goods.number)
        // 限制最大数量为999
        const newValue = currentValue >= 999 ? 999 : currentValue + 1
        this.$set(item.goods, 'number', newValue.toString())
      }
      // 数量改变时，需要重新计算 finalPrice
      this.recalculateFinalPrice(item)
      this.$emit('changeTotalPrice')
    },
    // 商品价格变动时，清空当前商品的折扣/抵扣配置，并重算 finalPrice
    resetStrategyWhenPriceChange(item) {
      if (!item || !item.goods) return
      const goods = item.goods

      // 重置内部 strategyConfig
      const strategyConfig = goods.strategyConfig || {}
      this.$set(goods, 'strategyConfig', {
        mode: 'none',
        discountRatio: '',
        discountAmount: '',
        // 买赠：强制恢复为非赠品
        isGift: '0',
        deductAmount: ''
      })

      // 同时清空用于提交/回显的折扣字段
      this.$set(goods, 'discountType', null)
      this.$set(goods, 'discountValue', null)
      this.$set(goods, 'discountAmount', null)
      // 按当前单价和数量，重新计算无优惠时的 finalPrice
      const unitPrice = parseFloat(goods.sellPrice || 0)
      const number = parseInt(goods.number || 1)
      const totalFinalPrice = utils.ceilDecimal(unitPrice * number)
      this.$set(goods, 'finalPricePerUnit', unitPrice)
      this.$set(goods, 'finalPrice', totalFinalPrice)
    },
    // 减少数量
    decreaseNumber(item) {
      // 如果商品数量不存在或小于等于1，设置为1
      if (!item.goods.number || parseInt(item.goods.number) <= 1) {
        this.$set(item.goods, 'number', '1')
        return
      }
      const currentValue = parseInt(item.goods.number)
      // 确保减少后的值不小于1
      const newValue = Math.max(1, currentValue - 1)
      this.$set(item.goods, 'number', newValue.toString())
      // 数量改变时，需要重新计算 finalPrice
      this.recalculateFinalPrice(item)
      this.$emit('changeTotalPrice')
    },
    // 删除商品
    deleteGoods(index) {
      this.list.splice(index, 1)
      this.$emit('changeTotalPrice')
    }
  }
}
</script>

<style scoped lang="scss">
.shop-list {
  padding: toRpx(12) toRpx(32) toRpx(12) 0;

  .shop-item {
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
</style>
