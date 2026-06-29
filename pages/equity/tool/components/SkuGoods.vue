<template>
  <view>
    <view class="shop-list">
      <view class="shop-item" v-for="(item, index) in list" :key="index">
        <template v-if="item.goodsFlag == 3">
          <view class="package-box">
            <view class="shop-name flex">
              <view class="sprite-icon icon-blue-delete" @click="deleteGoods(index)"></view>
              <view class="name">{{ goodsName(item) }}</view>
              <view class="total-price">{{ packageTotal(item) }}</view>
            </view>
            <view class="line"></view>
            <view class="package-goods-list">
              <view class="package-item" v-for="(i, ind) in item.packageGoods.goodsList" :key="`package_${index}_${ind}`">
                <view class="flex flex-1 pb-24">
                  <view class="package-icon"></view>
                  <view class="package-label">{{ packageName(i, item) }}</view>
                  <view class="package-value flex">
                    <template v-if="i.goodsPriceModify">
                      <view class="package-price">￥{{ i.sellPrice }}</view>
                    </template>
                    <template v-else>
                      <view class="front-gear-input flex">
                        <view class="unit">¥</view>
                        <input class="uni-input" type="digit" maxlength="9" placeholder="请输入价格" placeholder-style="font-size: 14px" v-model="i.sellPrice" @blur="validatePrice($event, item, index, ind)" />
                      </view>
                    </template>
                    <view class="number">x1</view>
                  </view>
                </view>

                <!-- 折扣 / 买赠 / 组合付款策略组件 -->
                <OrderStrategy v-if="getStrategyType(i)" :strategyType="getStrategyType(i)" :value="getStrategyConfig(i)" :basePrice="getBasePrice(i)" :displayPrice="getDisplayPrice(i)" @input="onStrategyConfigChange(i, $event)" @priceChange="onPriceChange(i, $event, item)" />
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view class="flex flex-1 pb-24">
            <view class="sprite-icon icon-blue-delete" @click="deleteGoods(index)"></view>
            <view :class="['right', { 'one-line': item.goodsFlag == 1 }]">
              <view :class="['shop-name', { 'name-top': item.goodsFlag == 2 }]">{{ goodsName(item) }}</view>
              <view class="alias" v-if="item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods.goodsAlias">商品别名：{{ item.multipleSpecificationsGoods.goods.goodsAlias }}</view>
              <view class="front-gear-box">
                <view class="front-gear-input-box">
                  <template v-if="item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods.specificationStr">
                    <view class="front-gear-label">
                      {{ item.multipleSpecificationsGoods.goods.specificationStr }}
                    </view>
                  </template>
                  <view class="front-number-box flex">
                    <template v-if="item.goodsFlag == 1">
                      <template v-if="item.goods.goodsPriceModify">¥{{ item.goods.sellPrice }}</template>
                      <template v-else>
                        <view class="front-gear-input">
                          <view class="unit">¥</view>
                          <input class="uni-input" type="digit" maxlength="9" placeholder="请输入价格" placeholder-style="font-size: 14px" v-model="item.goods.sellPrice" @blur="validatePrice($event, item, index)" />
                        </view>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="item.multipleSpecificationsGoods.goods.goodsPriceModify">¥{{ item.multipleSpecificationsGoods.goods.sellPrice }}</template>
                      <template v-else>
                        <view class="front-gear-input">
                          <view class="unit">¥</view>
                          <input class="uni-input" type="digit" maxlength="9" placeholder="请输入价格" placeholder-style="font-size: 14px" v-model="item.multipleSpecificationsGoods.goods.sellPrice" @blur="validatePrice($event, item, index)" />
                        </view>
                      </template>
                    </template>
                    <view class="number">x1</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- 折扣 / 买赠 / 组合付款策略组件 -->
          <OrderStrategy v-if="getStrategyType(item)" :strategyType="getStrategyType(item)" :value="getStrategyConfig(item)" :basePrice="getBasePrice(item)" :displayPrice="getDisplayPrice(item)" @input="onStrategyConfigChange(item, $event)" @priceChange="onPriceChange(item, $event)" />
        </template>
      </view>
    </view>
  </view>
</template>

<script>
import utils from '@/utils/utils'
import NP from 'number-precision'
import OrderStrategy from './OrderStrategy.vue'

export default {
  name: 'SkuGoods',
  components: {
    OrderStrategy
  },
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
    orderTypeCode: {
      type: [String, Number],
      default: ''
    }
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
  computed: {},
  methods: {
    goodsName(item) {
      let { goodsFlag } = item,
        str = ''
      if (goodsFlag == 3) str = item.packageGoods.packageAlias || item.packageGoods.packageName
      else str = item.multipleSpecificationsGoods ? item.multipleSpecificationsGoods.baseGoodsName : item.goods.goodsAlias || item.goods.upgradeGoodsName || item.goods.goodsInfo.goodsName
      return str
    },
    // 初始化商品数量方法
    initProductNumbers() {
      if (this.list && this.list.length > 0) {
        this.list.forEach(item => {
          if (!item.multipleSpecificationsGoods) {
            // 如果没有多规格商品，直接设置goods的number
            if (item.goodsFlag == 1 && !item.goods.number) {
              this.$set(item.goods, 'number', '1')
            }
          } else if (item.multipleSpecificationsGoods) {
            // 如果有多规格商品，给multipleSpecificationsGoods中的goods添加number
            if (!item.multipleSpecificationsGoods.number) {
              this.$set(item.multipleSpecificationsGoods, 'number', '1')
            }
          }
        })
      }
    },
    filterIncludes(item, arr) {
      return arr.indexOf(item) > -1
    },
    // 格式化位置信息
    formatPosition(item, positionTypeList) {
      const filterData = positionTypeList.filter(v => v.positionValue == item)
      return (filterData.length && filterData[0] && filterData[0].positionName) || ''
    },
    // 验证价格输入（包含最低价校验 + 重置折扣/抵扣策略）
    validatePrice(event, item, index, cindex) {
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
      // 检查最小价格
      if (!item.multipleSpecificationsGoods) {
        if (item.packageGoods) {
          item.packageGoods?.goodsList[cindex]
          let packageItem = item.packageGoods?.goodsList[cindex]
          if (packageItem && packageItem.validMinSellPrice === 'N' && packageItem.minSellPrice && parseFloat(value) < parseFloat(packageItem.minSellPrice)) {
            uni.showToast({
              title: '价格不可低于商品最低价',
              icon: 'none'
            })
            value = packageItem.minSellPrice.toString()
          }
        } else {
          // 普通商品的最小价格检查
          if (item.goods.validMinSellPrice === 'Y' && item.goods.minSellPrice && parseFloat(value) < parseFloat(item.goods.minSellPrice)) {
            uni.showToast({
              title: '价格不可低于商品最低价',
              icon: 'none'
            })
            value = item.goods.minSellPrice.toString()
          }
        }
      } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        // 多规格商品的最小价格检查
        if (item.multipleSpecificationsGoods.goods.validMinSellPrice === 'Y' && item.multipleSpecificationsGoods.goods.minSellPrice && parseFloat(value) < parseFloat(item.multipleSpecificationsGoods.goods.minSellPrice)) {
          uni.showToast({
            title: '价格不可低于商品最低价',
            icon: 'none'
          })
          value = item.multipleSpecificationsGoods.goods.minSellPrice.toString()
        }
      }

      if (!item.multipleSpecificationsGoods) {
        if (item.goodsFlag == 1) {
          // 如果没有多规格商品，更新普通商品的价格
          this.$set(this.list[index].goods, 'sellPrice', value)
        } else {
          // 套餐内商品
          this.$set(this.list[index].packageGoods.goodsList[cindex], 'sellPrice', value)
        }
      } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        // 如果有多规格商品，更新多规格商品的价格
        this.$set(this.list[index].multipleSpecificationsGoods.goods, 'sellPrice', value)
      }

      // 商品价格变动时，清空折扣 / 抵扣配置，并重算 finalPrice
      this.resetStrategyWhenPriceChange(item, index, cindex)

      this.$emit('changeTotalPrice')
    },
    // 原始价格校验逻辑（保留作备用，不再直接使用）
    validatePriceRaw(event, item, index, cindex) {
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

      // 更新价格到对应商品
      if (!item.multipleSpecificationsGoods) {
        if (item.goodsFlag == 1) {
          this.$set(this.list[index].goods, 'sellPrice', value)
        } else {
          this.$set(this.list[index].packageGoods.goodsList[cindex], 'sellPrice', value)
        }
      } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        this.$set(this.list[index].multipleSpecificationsGoods.goods, 'sellPrice', value)
      }

      // 商品价格修改时，清空折扣 / 抵扣配置
      this.resetStrategyWhenPriceChange(item, index, cindex)

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
      if (!item.multipleSpecificationsGoods) {
        this.$set(item.goods, 'number', value)
      } else if (item.multipleSpecificationsGoods) {
        // 强制更新多规格商品的数量
        this.$set(item.multipleSpecificationsGoods, 'number', value)
      }
      this.$emit('changeTotalPrice')
    },
    // 增加数量
    increaseNumber(item) {
      if (!item.multipleSpecificationsGoods) {
        // 处理普通商品
        if (!item.goods.number) {
          this.$set(item.goods, 'number', '1')
        } else {
          const currentValue = parseInt(item.goods.number)
          // 限制最大数量为999
          const newValue = currentValue >= 999 ? 999 : currentValue + 1
          this.$set(item.goods, 'number', newValue.toString())
        }
      } else if (item.multipleSpecificationsGoods) {
        // 处理多规格商品
        if (!item.multipleSpecificationsGoods.number) {
          this.$set(item.multipleSpecificationsGoods, 'number', '1')
        } else {
          const currentValue = parseInt(item.multipleSpecificationsGoods.number)
          // 限制最大数量为999
          const newValue = currentValue >= 999 ? 999 : currentValue + 1
          this.$set(item.multipleSpecificationsGoods, 'number', newValue.toString())
        }
      }
      this.$emit('changeTotalPrice')
    },
    // 减少数量
    decreaseNumber(item) {
      if (!item.multipleSpecificationsGoods) {
        // 处理普通商品
        // 如果商品数量不存在或小于等于1，设置为1
        if (!item.goods.number || parseInt(item.goods.number) <= 1) {
          this.$set(item.goods, 'number', '1')
          return
        }
        const currentValue = parseInt(item.goods.number)
        // 确保减少后的值不小于1
        const newValue = Math.max(1, currentValue - 1)
        this.$set(item.goods, 'number', newValue.toString())
      } else if (item.multipleSpecificationsGoods) {
        // 处理多规格商品
        // 如果商品数量不存在或小于等于1，设置为1
        if (!item.multipleSpecificationsGoods.number || parseInt(item.multipleSpecificationsGoods.number) <= 1) {
          this.$set(item.multipleSpecificationsGoods, 'number', '1')
          return
        }
        const currentValue = parseInt(item.multipleSpecificationsGoods.number)
        // 确保减少后的值不小于1
        const newValue = Math.max(1, currentValue - 1)
        this.$set(item.multipleSpecificationsGoods, 'number', newValue.toString())
      }
      this.$emit('changeTotalPrice')
    },
    // 删除商品
    deleteGoods(index) {
      this.list.splice(index, 1)
      this.$emit('changeTotalPrice')
    },
    // 商品价格变动时，清空当前商品（含套餐内单个商品）的折扣 / 抵扣配置，并重算 finalPrice
    resetStrategyWhenPriceChange(item, index, cindex) {
      if (!item) return

      let goods = null

      // 1）套餐内单个商品（通过 goodsFlag === 3 + cindex 定位）
      if (item.goodsFlag === 3 && item.packageGoods && item.packageGoods.goodsList && typeof cindex === 'number') {
        goods = item.packageGoods.goodsList[cindex]
      }
      // 2）直接传进来的就是 goods 对象（无 goodsFlag）
      else if (item && item.sellPrice !== undefined && item.goodsFlag === undefined) {
        goods = item
      }
      // 3）多规格商品
      else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        goods = item.multipleSpecificationsGoods.goods
      }
      // 4）普通商品
      else if (item.goods) {
        goods = item.goods
      }

      if (!goods) return

      // 重置策略配置
      this.$set(goods, 'strategyConfig', {
        mode: 'none',
        discountRatio: '',
        discountAmount: '',
        // 买赠：强制恢复为非赠品
        isGift: '0',
        deductAmount: ''
      })

      // 同步清空老字段，避免 OrderStrategy 里看到旧的折扣金额 / 比例
      this.$set(goods, 'discountType', null)
      this.$set(goods, 'discountValue', null)
      this.$set(goods, 'discountAmount', null)

      // 按当前单价和数量，重新计算无优惠时的 finalPrice
      const unitPrice = parseFloat(goods.sellPrice || 0)
      let number = 1

      if (item.goodsFlag === 3 && item.packageGoods && item.packageGoods.number) {
        // 套餐：用套餐数量
        number = parseInt(item.packageGoods.number || 1)
      } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.number) {
        // 多规格商品
        number = parseInt(item.multipleSpecificationsGoods.number || 1)
      } else if (item.goods && item.goods.number) {
        // 普通商品
        number = parseInt(item.goods.number || 1)
      }

      const totalFinalPrice = utils.ceilDecimal(unitPrice * number)
      this.$set(goods, 'finalPricePerUnit', unitPrice)
      this.$set(goods, 'finalPrice', totalFinalPrice)
    },
    replaceItemText(value) {
      let reg = getRegExp(';~;', 'g')
      return value ? value.replace(reg, '/') : ''
    },
    packageName(item, parent) {
      return item.goodsAlias || item.goodsNameAlias || this.replaceItemText(item.upgradeGoodsName, parent.specificationData ? '/' + item.specificationData : '') || this.replaceItemText(item.goodsName, parent.specificationData ? '/' + item.specificationData : '')
    },
    packageTotal(item) {
      let total = 0
      const orderType = String(this.orderTypeCode || '')
      const packageNumber = parseInt(item.packageGoods.number || 1)

      item.packageGoods.goodsList.forEach(goods => {
        const sellPrice = parseFloat(goods.sellPrice || 0)

        // 正常订单（'1'）和冲量订单（'4'）：使用原价
        if (orderType === '1' || orderType === '4') {
          total = NP.plus(total, NP.times(sellPrice, packageNumber))
        }
        // 其他类型（打折/买赠/组合付款）：使用优惠后的价格
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

          // 单价优惠后 × 套餐数量
          total = NP.plus(total, NP.times(finalPricePerUnit, packageNumber))
        }
      })
      item.packageGoods.totalPrice = total
      return utils.ceilDecimal(total).toFixed(2)
    },
    // 根据订单类型获取策略类型
    getStrategyType(item) {
      // item 可能是套餐商品（goodsFlag == 3）或普通商品，也可能是套餐内的商品（直接是商品对象）
      // 如果是套餐商品，不显示策略组件（策略组件应该显示在套餐内的商品上）
      if (item && item.goodsFlag == 3) {
        return null
      }
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
    // 获取策略配置对象
    getStrategyConfig(item) {
      // 如果是套餐内的商品（直接是商品对象，有 sellPrice 等属性）
      if (item && item.sellPrice !== undefined && !item.goodsFlag) {
        return item.strategyConfig || {}
      }
      // 如果是多规格商品
      if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        return item.multipleSpecificationsGoods.goods.strategyConfig || {}
      }
      // 如果是普通商品
      if (item.goods) {
        return item.goods.strategyConfig || {}
      }
      return {}
    },
    // 策略配置变化回调
    onStrategyConfigChange(item, config) {
      // 如果是套餐内的商品（直接是商品对象）
      if (item && item.sellPrice !== undefined && !item.goodsFlag) {
        this.$set(item, 'strategyConfig', config)
      }
      // 如果是多规格商品
      else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        this.$set(item.multipleSpecificationsGoods.goods, 'strategyConfig', config)
      }
      // 如果是普通商品
      else if (item.goods) {
        this.$set(item.goods, 'strategyConfig', config)
      }
    },
    // 计算基础价格（单价，不乘以数量）
    getBasePrice(item) {
      let sellPrice = 0

      // 如果是套餐内的商品（直接是商品对象）
      if (item && item.sellPrice !== undefined && !item.goodsFlag) {
        sellPrice = parseFloat(item.sellPrice || 0)
      }
      // 如果是多规格商品
      else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        sellPrice = parseFloat(item.multipleSpecificationsGoods.goods.sellPrice || 0)
      }
      // 如果是普通商品
      else if (item.goods) {
        sellPrice = parseFloat(item.goods.sellPrice || 0)
      }

      // 四舍五入保留两位小数
      return utils.ceilDecimal(sellPrice)
    },
    // 计算最终显示价格
    getDisplayPrice(item) {
      const basePrice = this.getBasePrice(item)
      if (!basePrice) return '¥0.00'

      const orderType = String(this.orderTypeCode || '')
      const strategyConfig = this.getStrategyConfig(item)

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
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
      }

      // '3' 买赠策略
      if (orderType === '3') {
        if (strategyConfig.isGift === '1') {
          return '¥0.00'
        }
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
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
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
      }

      return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
    },
    // 价格变化回调（finalPricePerUnit 为单件优惠价，需要乘以数量得到总价，单位：元）
    onPriceChange(item, finalPricePerUnit, packageItem) {
      // 计算总价：单件优惠价 * 数量（单位：元）
      let number = 1
      // 套餐内商品：用套餐数量
      if (packageItem && packageItem.packageGoods && packageItem.packageGoods.number) {
        number = parseInt(packageItem.packageGoods.number || 1)
      } else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.number) {
        // 多规格商品
        number = parseInt(item.multipleSpecificationsGoods.number || 1)
      } else if (item.goods && item.goods.number) {
        // 普通商品
        number = parseInt(item.goods.number || 1)
      }

      const totalFinalPrice = utils.ceilDecimal(finalPricePerUnit * number) // 元

      // 如果是套餐内的商品（直接是商品对象，有 sellPrice 等属性）
      if (item && item.sellPrice !== undefined && !item.goodsFlag) {
        if (totalFinalPrice === 0) {
          // 赠品
          this.$set(item, 'finalPrice', 0)
        } else {
          const originalTotal = utils.ceilDecimal(parseFloat(item.sellPrice || 0) * number)
          // 有优惠且不等于原价，保存优惠后的总价；否则置为 null
          if (totalFinalPrice < originalTotal) {
            this.$set(item, 'finalPrice', totalFinalPrice)
          } else {
            this.$set(item, 'finalPrice', null)
          }
        }
        this.$set(item, 'finalPricePerUnit', finalPricePerUnit)
      }
      // 多规格商品
      else if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
        if (totalFinalPrice === 0) {
          this.$set(item.multipleSpecificationsGoods.goods, 'finalPrice', 0)
        } else {
          const originalTotal = utils.ceilDecimal(parseFloat(item.multipleSpecificationsGoods.goods.sellPrice || 0) * number)
          if (totalFinalPrice < originalTotal) {
            this.$set(item.multipleSpecificationsGoods.goods, 'finalPrice', totalFinalPrice)
          } else {
            this.$set(item.multipleSpecificationsGoods.goods, 'finalPrice', null)
          }
        }
        this.$set(item.multipleSpecificationsGoods.goods, 'finalPricePerUnit', finalPricePerUnit)
      }
      // 普通商品
      else if (item.goods) {
        if (totalFinalPrice === 0) {
          this.$set(item.goods, 'finalPrice', 0)
        } else {
          const originalTotal = utils.ceilDecimal(parseFloat(item.goods.sellPrice || 0) * number)
          if (totalFinalPrice < originalTotal) {
            this.$set(item.goods, 'finalPrice', totalFinalPrice)
          } else {
            this.$set(item.goods, 'finalPrice', null)
          }
        }
        this.$set(item.goods, 'finalPricePerUnit', finalPricePerUnit)
      }
      this.$emit('changeTotalPrice')
    },
    // 初始化策略配置（支持编辑回显）
    initStrategyConfig() {
      if (!this.list || this.list.length === 0) return
      const strategyType = this.getStrategyType({})

      // 没有策略类型时，清空所有优惠配置
      if (!strategyType) {
        this.list.forEach(item => {
          // 套餐商品：重置套餐内所有商品
          if (item.goodsFlag == 3 && item.packageGoods && item.packageGoods.goodsList) {
            item.packageGoods.goodsList.forEach(goods => {
              if (goods.strategyConfig) {
                goods.strategyConfig = {}
              }
              goods.discountType = null
              goods.discountValue = null
              goods.finalPrice = null
            })
            return
          }

          // 普通商品和多规格商品
          let goods = null
          if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
            goods = item.multipleSpecificationsGoods.goods
          } else if (item.goods) {
            goods = item.goods
          }

          if (goods) {
            if (goods.strategyConfig) {
              goods.strategyConfig = {}
            }
            goods.discountType = null
            goods.discountValue = null
            goods.finalPrice = null
          }
        })
        return
      }

      this.list.forEach(item => {
        // 套餐商品：初始化套餐内所有商品的策略配置
        if (item.goodsFlag == 3 && item.packageGoods && item.packageGoods.goodsList) {
          item.packageGoods.goodsList.forEach(goods => {
            // 如果是编辑回显，并且已经有 discountType 和非空的 strategyConfig，则不重置
            const hasDiscountData = goods.discountType !== undefined && goods.discountType !== null
            if (hasDiscountData && goods.strategyConfig && Object.keys(goods.strategyConfig).length > 0) {
              return
            }

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
          return
        }

        // 普通商品和多规格商品
        let goods = null
        if (item.multipleSpecificationsGoods && item.multipleSpecificationsGoods.goods) {
          goods = item.multipleSpecificationsGoods.goods
        } else if (item.goods) {
          goods = item.goods
        }

        if (!goods) return

        // 如果是编辑回显，并且已经有 discountType 和非空的 strategyConfig，则不重置
        const hasDiscountData = goods.discountType !== undefined && goods.discountType !== null
        if (hasDiscountData && goods.strategyConfig && Object.keys(goods.strategyConfig).length > 0) {
          return
        }

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
    }
  }
}
</script>

<style scoped lang="scss">
.shop-list {
  padding-right: toRpx(32);

  .shop-item {
    background-color: #f5f7fa;
    border-radius: toRpx(16);
    margin-top: toRpx(16);
    padding: toRpx(24);

    .right {
      flex: 1;
      font-size: toRpx(28);
      margin-left: toRpx(24);
      position: relative;
    }
    .one-line {
      display: flex;
      align-items: center;
      min-height: toRpx(72);
      .front-gear-box {
        margin-left: auto;
      }
    }
    .shop-name {
      color: #ff781f;
      max-width: 70%;
      word-break: break-all;
    }
    .name-top {
      margin-top: toRpx(4);
    }
    .alias {
      margin-top: toRpx(12);
      font-size: toRpx(24);
      color: #666;
    }
    .package-box {
      width: 100%;
      .shop-name {
        width: 100%;
        max-width: 100%;
        .name {
          max-width: 70%;
        }
        .total-price {
          margin-left: auto;
          color: #292d33;
          font-size: toRpx(28);
          font-weight: 400;
        }
      }
      .line {
        width: calc(100% + #{toRpx(48)});
        margin-left: toMinusRpx(24);
        height: toRpx(2);
        background-color: #dce1e6;
        margin-top: toRpx(24);
      }
      .package-item {
        margin-top: toRpx(16);
        border-bottom: toRpx(1.6) solid #dce1e6;
        padding-bottom: toRpx(24);
        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
      }
      .sprite-icon {
        margin-right: toRpx(24);
        flex-shrink: 0;
      }
      .package-icon {
        width: toRpx(12);
        height: toRpx(12);
        border-radius: 50%;
        background: #4673ff;
        margin-right: toRpx(16);
      }
      .package-label {
        color: #292d33;
        font-size: toRpx(28);
        flex-shrink: 0;
        max-width: 74%;
      }
      .package-value {
        flex-shrink: 0;
        margin-left: auto;
      }
    }
    .number {
      margin-left: toRpx(16);
    }
    .front-number-box {
      position: absolute;
      top: 50%;
      right: toRpx(24);
      transform: translateY(-50%);
    }
  }
}
.front-gear-input-box {
  display: flex;
  align-items: center;
  width: 100%;
  .front-gear-label {
    font-size: toRpx(24);
    margin-right: toRpx(24);
    color: #999999;
  }
}
.front-gear-input {
  margin-left: auto;
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
    font-size: toRpx(28);
  }

  .unit {
    position: absolute;
    top: 50%;
    left: toRpx(24);
    transform: translateY(-50%);
  }
}
.front-gear-box {
  display: flex;
  justify-content: space-between;
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
