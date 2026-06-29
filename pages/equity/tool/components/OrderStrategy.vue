<template>
  <view class="strategy-row">
    <!-- 打折策略 -->
    <view v-if="strategyType === 'discount'" class="strategy-left">
      <view class="tab-group">
        <view v-for="tab in discountTabs" :key="tab.value" class="tab-item" :class="{ 'tab-item--active': localState.mode === tab.value }" @click="onDiscountTabChange(tab.value)">
          {{ tab.label }}
        </view>
      </view>

      <view v-if="localState.mode === 'ratio' || localState.mode === 'amount'" class="input-box">
        <!-- 折扣比例 -->
        <view v-if="localState.mode === 'ratio'" class="ratio-input">
          <input class="ratio-input-inner" type="digit" :placeholder="ratioPlaceholder" placeholder-class="placeholder" v-model="localState.discountRatio" @blur="onBlur('discountRatio')" />
          <text class="unit">折</text>
        </view>
        <!-- 折扣金额 -->
        <view v-else class="amount-input">
          <view class="unit">¥</view>
          <input class="input amount-input-inner" type="digit" placeholder="请输入" placeholder-class="placeholder" v-model="localState.discountAmount" @blur="onBlur('discountAmount')" />
        </view>
      </view>
    </view>

    <!-- 买赠策略 -->
    <view v-else-if="strategyType === 'gift'" class="strategy-left flex">
      <view class="label">是否为赠品</view>
      <radio-group class="radio-group value" @change="onGiftRadioChange">
        <label v-for="item in giftOptions" :key="item.value" class="uni-list-cell uni-list-cell-pd">
          <radio style="transform: scale(0.65) translateY(-3px)" :value="item.value" :checked="item.value === localState.isGift" />
          <view class="radio-name">{{ item.label }}</view>
        </label>
      </radio-group>
    </view>

    <!-- 组合付款 -->
    <view v-else-if="strategyType === 'combined'" class="strategy-left">
      <view class="tab-group">
        <view v-for="tab in combinedTabs" :key="tab.value" class="tab-item" :class="{ 'tab-item--active': localState.mode === tab.value }" @click="onCombinedTabChange(tab.value)">
          {{ tab.label }}
        </view>
      </view>

      <view v-if="localState.mode === 'deduct'" class="input-box">
        <view class="amount-input">
          <view class="unit">¥</view>
          <input class="input amount-input-inner" type="digit" placeholder="请输入" placeholder-class="placeholder" v-model="localState.deductAmount" @blur="onBlur('deductAmount')" />
        </view>
      </view>
    </view>

    <!-- 右侧价格展示 -->
    <view v-if="showPrice" class="strategy-right">
      <view class="price-label">价格</view>
      <view class="price-value">{{ computedPrice }}</view>
    </view>
  </view>
</template>

<script>
import utils from '@/utils/utils'
export default {
  name: 'OrderStrategy',
  props: {
    // discount（打折策略）/ gift（买赠策略）/ combined（组合付款）
    strategyType: {
      type: String,
      default: 'discount'
    },
    // v-model 绑定的值
    value: {
      type: Object,
      default() {
        return {}
      }
    },
    // 右侧价格展示文案（已废弃，改用计算值）
    priceText: {
      type: String,
      default: '-'
    },
    // 基础价格（单价，不乘以数量）
    basePrice: {
      type: [Number, String],
      default: 0
    },
    showPrice: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      localState: {
        // mode: ratio / amount / none / deduct
        mode: 'none',
        discountRatio: '',
        discountAmount: '',
        isGift: '0',
        deductAmount: ''
      },
      discountTabs: [
        { label: '无折扣', value: 'none' },
        { label: '折扣比例', value: 'ratio' },
        { label: '折扣金额', value: 'amount' }
      ],
      combinedTabs: [
        { label: '无抵扣', value: 'none' },
        { label: '抵扣金额', value: 'deduct' }
      ],
      giftOptions: [
        { label: '是', value: '1' },
        { label: '否', value: '0' }
      ],
      ratioPlaceholder: '请输入'
    }
  },
  computed: {
    // 计算最终价格
    computedPrice() {
      const basePrice = parseFloat(this.basePrice || 0)
      if (!basePrice) return '¥0.00'

      // 打折策略
      if (this.strategyType === 'discount') {
        if (this.localState.mode === 'ratio' && this.localState.discountRatio) {
          const ratio = parseFloat(this.localState.discountRatio)
          // 折扣比例：0.1-10，表示 0.1 折到 10 折（即 0.01 到 1.0）
          if (ratio >= 0.1 && ratio <= 10) {
            const finalPrice = basePrice * (ratio / 10)
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        } else if (this.localState.mode === 'amount' && this.localState.discountAmount) {
          const discountAmount = parseFloat(this.localState.discountAmount)
          // 折扣金额：0.01 到不能大于基础价格
          if (discountAmount >= 0.01 && discountAmount <= basePrice) {
            const finalPrice = basePrice - discountAmount
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        }
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
      }

      // 买赠策略
      if (this.strategyType === 'gift') {
        if (this.localState.isGift === '1') {
          return '¥0.00'
        }
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
      }

      // 组合付款
      if (this.strategyType === 'combined') {
        if (this.localState.mode === 'deduct' && this.localState.deductAmount) {
          const deductAmount = parseFloat(this.localState.deductAmount)
          // 抵扣金额：0.01 到不能大于基础价格
          if (deductAmount >= 0.01 && deductAmount <= basePrice) {
            const finalPrice = basePrice - deductAmount
            return '¥' + utils.ceilDecimal(finalPrice).toFixed(2)
          }
        }
        return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
      }

      return '¥' + utils.ceilDecimal(basePrice).toFixed(2)
    }
  },
  watch: {
    // 策略类型变化时，重置 mode 为 'none'
    strategyType: {
      handler(newType, oldType) {
        // 当策略类型改变时（从其他类型切换到 combined 或 discount），重置 mode 为 'none'
        if ((newType === 'combined' || newType === 'discount') && oldType && oldType !== newType) {
          this.$nextTick(() => {
            this.localState.mode = 'none'
          })
        }
      },
      immediate: false
    },
    // 外部 v-model -> 内部 state
    value: {
      handler(val) {
        if (!val || Object.keys(val).length === 0) {
          // 如果 value 为空，确保 mode 为 'none'（对于组合付款和打折策略）
          if (this.strategyType === 'combined' || this.strategyType === 'discount') {
            this.localState.mode = 'none'
          }
          return
        }
        // 先更新所有存在的字段
        Object.keys(this.localState).forEach(key => {
          if (val[key] !== undefined) {
            this.localState[key] = val[key]
          }
        })
        // 对于组合付款和打折策略，确保 mode 字段正确设置
        if (this.strategyType === 'combined' || this.strategyType === 'discount') {
          // 如果 value 中有 mode 字段，检查它是否与当前策略类型匹配
          if (val.mode !== undefined) {
            // 如果 strategyType 是 'discount'，但 mode 是 'deduct'（组合付款的值），重置为 'none'
            if (this.strategyType === 'discount' && val.mode === 'deduct') {
              this.localState.mode = 'none'
            }
            // 如果 strategyType 是 'combined'，但 mode 是 'ratio' 或 'amount'（打折策略的值），重置为 'none'
            else if (this.strategyType === 'combined' && (val.mode === 'ratio' || val.mode === 'amount')) {
              this.localState.mode = 'none'
            }
            // 否则使用 value 中的 mode
            else {
              this.localState.mode = val.mode
            }
          } else {
            this.localState.mode = 'none'
          }
        }
      },
      deep: true,
      immediate: true
    },
    // 内部 state 改变 -> 向外通知
    localState: {
      handler() {
        this.$emit('input', { ...this.localState })
        this.$emit('change', { ...this.localState })
        // 价格变化时通知父组件
        const basePrice = parseFloat(this.basePrice || 0)
        if (basePrice) {
          const finalPrice = this.calculateFinalPrice(basePrice)
          this.$emit('priceChange', finalPrice)
        }
      },
      deep: true
    },
    // 基础价格变化时重新计算
    basePrice: {
      handler() {
        const basePrice = parseFloat(this.basePrice || 0)
        if (basePrice) {
          const finalPrice = this.calculateFinalPrice(basePrice)
          this.$emit('priceChange', finalPrice)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 计算最终价格（内部方法）
    calculateFinalPrice(basePrice) {
      const bp = parseFloat(basePrice || 0)
      if (!bp) return 0

      // 打折策略
      if (this.strategyType === 'discount') {
        if (this.localState.mode === 'ratio' && this.localState.discountRatio) {
          const ratio = parseFloat(this.localState.discountRatio)
          if (ratio >= 0.1 && ratio <= 10) {
            return utils.ceilDecimal(bp * (ratio / 10))
          }
        } else if (this.localState.mode === 'amount' && this.localState.discountAmount) {
          const discountAmount = parseFloat(this.localState.discountAmount)
          if (discountAmount >= 0.01 && discountAmount <= bp) {
            return utils.ceilDecimal(bp - discountAmount)
          }
        }
        return utils.ceilDecimal(bp)
      }

      // 买赠策略
      if (this.strategyType === 'gift') {
        if (this.localState.isGift === '1') {
          return 0
        }
        return utils.ceilDecimal(bp)
      }

      // 组合付款
      if (this.strategyType === 'combined') {
        if (this.localState.mode === 'deduct' && this.localState.deductAmount) {
          const deductAmount = parseFloat(this.localState.deductAmount)
          if (deductAmount >= 0.01 && deductAmount <= bp) {
            return utils.ceilDecimal(bp - deductAmount)
          }
        }
        return utils.ceilDecimal(bp)
      }

      return utils.ceilDecimal(bp)
    },
    // 失去焦点时格式化（跟价格输入框一样的逻辑）
    onBlur(key) {
      let v = this.localState[key]

      if (key === 'discountAmount' || key === 'deductAmount') {
        // 折扣金额/抵扣金额：限制 0 到商品原价（直接截断，不四舍五入）
        if (!v || (typeof v === 'string' && v.trim() === '')) {
          v = '0'
        }
        // 限制只能输入数字和小数点
        v = String(v).replace(/[^\d.]/g, '')
        // 限制只能有一个小数点
        if (v.split('.').length > 2) {
          v = v.slice(0, v.lastIndexOf('.')) + v.slice(v.lastIndexOf('.') + 1)
        }
        // 限制最多两位小数（直接截断，不四舍五入）
        if (v.includes('.')) {
          const parts = v.split('.')
          if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2)
            v = parts.join('.')
          }
        }

        const basePrice = parseFloat(this.basePrice || 0)
        let amount = parseFloat(v)

        if (basePrice === 0) {
          v = '0'
        } else {
          // 限制最小值为 0.01
          if (isNaN(amount) || amount < 0.01) {
            v = '0.01'
          }
          // 限制最大值为基础价格
          else if (amount > basePrice) {
            // 如果超过基础价格，限制为基础价格
            v = basePrice.toFixed(2)
          }
        }

        this.$set(this.localState, key, v)
      } else if (key === 'discountRatio') {
        // 折扣比例：限制在 0.1-10 之间，限制 1 位小数（直接截断，不四舍五入）
        if (!v || (typeof v === 'string' && v.trim() === '')) {
          v = ''
        } else {
          // 限制只能输入数字和小数点
          v = String(v).replace(/[^\d.]/g, '')
          // 限制只能有一个小数点
          if (v.split('.').length > 2) {
            v = v.slice(0, v.lastIndexOf('.')) + v.slice(v.lastIndexOf('.') + 1)
          }
          // 限制最多 1 位小数（直接截断，不四舍五入）
          if (v.includes('.')) {
            const parts = v.split('.')
            if (parts[1] && parts[1].length > 1) {
              parts[1] = parts[1].substring(0, 1)
              v = parts.join('.')
            }
          }

          const ratio = parseFloat(v)
          if (!isNaN(ratio)) {
            if (ratio < 0.1) {
              v = '0.1'
            } else if (ratio > 10) {
              v = '10'
            }
          }
        }
        this.$set(this.localState, key, v)
      }
    },
    // 买赠单选框 change，保持与收款方式一致的事件风格
    onGiftRadioChange(e) {
      this.onGiftChange(e.detail.value)
    },
    onDiscountTabChange(mode) {
      this.localState.mode = mode
      if (mode === 'none') {
        // 无折扣：清空所有输入框
        this.localState.discountRatio = ''
        this.localState.discountAmount = ''
      } else if (mode === 'ratio') {
        // 切换到折扣比例：清空折扣金额
        this.localState.discountAmount = ''
      } else if (mode === 'amount') {
        // 切换到折扣金额：清空折扣比例
        this.localState.discountRatio = ''
      }
    },
    onCombinedTabChange(mode) {
      this.localState.mode = mode
      if (mode === 'none') {
        this.localState.deductAmount = ''
      }
    },
    onGiftChange(val) {
      this.localState.isGift = val
    }
  }
}
</script>

<style scoped lang="scss">
.strategy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: toRpx(24) toRpx(24) 0 toRpx(24);
  border-top: toRpx(3) dashed #e4e7eb;
  box-sizing: border-box;
}

.strategy-left {
  display: flex;
  align-items: center;
}

.tab-group {
  display: flex;
  background: #ededf2;
  border-radius: toRpx(16);
  overflow: hidden;
  padding: toRpx(8);
  box-sizing: border-box;

  .tab-item {
    padding: toRpx(8) toRpx(16);
    font-size: toRpx(26);
    color: #222222;
    font-weight: 400;
  }

  .tab-item--active {
    background-color: #ffffff;
    border-radius: toRpx(6);
  }
}

.input-box {
  margin-left: toRpx(16);
}

.input {
  width: toRpx(160);
  height: toRpx(64);
  padding: 0 toRpx(16);
  border-radius: toRpx(12);
  background-color: #ffffff;
  box-sizing: border-box;
  color: #333333;
}

.placeholder {
  color: #b6b6b8;
  font-size: toRpx(28);
}

.ratio-input {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: toRpx(2) solid #eff0f2;
  border-radius: toRpx(12);
  padding: 0 toRpx(16);
  height: toRpx(64);
  width: toRpx(160);
  font-size: toRpx(28);
  line-height: toRpx(64);
  box-sizing: border-box;

  .ratio-input-inner {
    flex: 1;
    border: none;
    padding: 0;
    background: transparent;

    height: 100%;
    width: 100%;
    color: #333333;
    box-sizing: border-box;
  }

  .unit {
    color: #333333;
    margin-left: toRpx(8);
    flex-shrink: 0;
    line-height: toRpx(64);
    display: inline-block;
  }
}

.amount-input {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: toRpx(12);
  padding-left: toRpx(24);

  .unit {
    font-size: toRpx(26);
    color: #333;
    flex-shrink: 0;
  }

  .amount-input-inner {
    width: toRpx(220);
    padding-left: toRpx(8);
    text-align: right;
  }
}

.label {
  font-size: toRpx(28);
  color: #222222;
  margin-right: toRpx(24);
  flex-shrink: 0;
  line-height: 1; // 使用 line-height 而不是固定高度，确保与右侧文字基线对齐
}

.radio-group {
  display: flex;
  align-items: center;

  &.value {
    justify-content: flex-end;
    width: 100%;
  }

  .uni-list-cell {
    margin-left: toRpx(48);

    &:first-child {
      margin-left: 0;
    }
  }

  .radio-name {
    display: inline-block;
    color: #292d33;
    font-size: toRpx(28);
    line-height: 1; // 确保与左侧 label 的 line-height 一致
  }
}

.radio-item {
  display: flex;
  align-items: center;
  margin-right: toRpx(24);
}

.radio-dot {
  width: toRpx(28);
  height: toRpx(28);
  border-radius: 50%;
  border: toRpx(2) solid #d1d5db;
  margin-right: toRpx(8);
}

.radio-dot--active {
  border-color: #2c66f7;
  background-color: #2c66f7;
}

.radio-text {
  font-size: toRpx(26);
  color: #666;
}

.radio-item--active .radio-text {
  color: #2c66f7;
}

.strategy-right {
  display: flex;
  align-items: center;
  font-size: toRpx(28);
  color: #333;

  .price-label {
    margin-right: toRpx(8);
    color: #222222;
  }

  .price-value {
    color: #ea6612;
  }
}
</style>
