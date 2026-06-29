<template>
  <view class="merchant-list">
    <template v-for="(i, index) in list">
      <view :key="index" @click="choose(i)" :class="['item flex', { active: currentId ? i.value == currentId : i.value == data.orderTypeCode }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.name }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'OrderTypePopup',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList () {
      const params = this.params
      let flag = null
      let hasStorage = !!(uni && uni.$storage && uni.$storage.get)
      // 默认支持所有订单类型
      let data = [
        { name: '正常订单', value: '1' },
        { name: '内部结算', value: '6' },
        { name: '打折策略', value: '2' },
        { name: '买赠策略', value: '3' },
        { name: '冲量活动', value: '4' },
        { name: '组合付款', value: '5' }
      ]

      // 基于门店配置控制是否只允许“正常订单”
      try {
        // 1）优先从本地缓存读取（CreateOrder / EquityCreateOrder 入口会写入）
        if (hasStorage) {
          const rawFlag = uni.$storage.get('createAllGoodsFlag')
          if (rawFlag !== undefined && rawFlag !== null) {
            flag = String(rawFlag)
          }
        }

        // 2）本地没有时，实时调轻改/权益配置接口兜底一次（避免先打开弹窗再拿到配置的竞态）
        if (flag === null) {
          const userInfo = hasStorage ? uni.$storage.get('userInfo') : null
          // merchantId 来源：userInfo > 父组件传入的 data（如 orderObj）.merchantId > params.merchantId
          const merchantId =
            (userInfo && (userInfo.shopMerchantId || userInfo.merchantId)) ||
            (this.data && this.data.merchantId) ||
            (params && params.merchantId)
          if (merchantId) {
            // 轻改接口
            if (uni?.$api?.boutiqueApi?.getShopMerchantPointConfig) {
              try {
                const res = await uni.$api.boutiqueApi.getShopMerchantPointConfig({ merchantId })
                if (res && res.createAllGoodsFlag !== undefined && res.createAllGoodsFlag !== null) {
                  flag = String(res.createAllGoodsFlag)
                  uni.$storage.set('createAllGoodsFlag', res.createAllGoodsFlag)
                }
              } catch (err) {
                console.warn('fetch createAllGoodsFlag failed in OrderTypePopup (boutique)', err)
              }
            }
            // 若轻改未返回 createAllGoodsFlag，再试权益接口（同一弹窗可能用于权益页）
            if (flag === null && uni?.$api?.equityApi?.getShopMerchantPointConfig) {
              try {
                const res = await uni.$api.equityApi.getShopMerchantPointConfig({ merchantId })
                if (res && res.createAllGoodsFlag !== undefined && res.createAllGoodsFlag !== null) {
                  flag = String(res.createAllGoodsFlag)
                  uni.$storage.set('createAllGoodsFlag', res.createAllGoodsFlag)
                }
              } catch (err) {
                console.warn('fetch createAllGoodsFlag failed in OrderTypePopup (equity)', err)
              }
            }
          }
        }

        // 3）有 flag 且不为 1 时，只允许“正常订单”
        if (flag !== null && flag !== '1') {
          // 内部结算与正常订单同逻辑，也一并允许
          data = [{ name: '正常订单', value: '1' }, { name: '内部结算', value: '6' }]
        }
      } catch (e) {
        // 读取失败时不影响默认行为
        console.warn('read createAllGoodsFlag failed', e)
      }

      // 打开弹窗时输出：当前 createAllGoodsFlag 值、本次展示的订单类型
      console.log('[OrderTypePopup] createAllGoodsFlag:', flag, '| 订单类型:', (data || []).map(i => i.name).join('、'))
      this.updateParams(params, data || [])
    },
    initData (list) {
      const { data } = this
      // 使用 orderTypeCode 而不是 djOrderType，因为 orderTypeCode 存储的是代码（如 "1"），而 djOrderType 存储的是名称（如 "正常订单"）
      if (data.orderTypeCode) {
        this.currentId = data.orderTypeCode
        let item = list.find(i => i.value == this.currentId)
        if (item) {
        this.$emit('choose', item)
        }
      }
      this.list = list
      this.$emit('onComplete')
    },
    choose (i) {
      this.currentId = i.value
      this.$emit('choose', i)
    }
  }
}
</script>

<style scoped lang="scss">
.merchant-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRpx(32);
  margin: 0 toRpx(48);
  .item {
    justify-content: center;
    height: toRpx(72);
    border-radius: toRpx(8);
    border: toRpx(2) solid #dce0e6;
    box-sizing: border-box;
    position: relative;
    color: #333333;
    font-size: toRpx(32);
    .sprite-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .active {
    border-color: #2c66f7;
    background: #ecf1ff;
    color: #2c66f7;
    .sprite-icon {
      display: block;
    }
  }
}
</style>
