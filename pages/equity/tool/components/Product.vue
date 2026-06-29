<template>
  <view>
    <view :class="[list.length ? 'shop-list':'']">
      <view class="shop-item" v-for="(item, index) in list" :key="item.goods.goodsId">
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
    </view>
  </view>
</template>

<script>
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
  methods: {
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
      // this.$set(item.goods, 'sellPrice', value)
      this.$set(this.list[index].goods, 'sellPrice', value)
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
      this.$emit('changeTotalPrice')
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
