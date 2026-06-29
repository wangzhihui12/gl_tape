<template>
  <popup
    ref="popup"
    @onConfirm="confirm"
    @onCancel="cancel"
  >
    <view class="popup-title flex">
      确认需购买的商品
      <view
        class="popup-close flex"
        @click="close"
      >
        <uni-icons
          type="closeempty"
          size="16"
        ></uni-icons>
      </view>
    </view>
    <view class="popup-tips">温馨提示：请仔细确认当前售价，避免录错单</view>
    <template v-if="data">
      <view class="popup-body">
        <scroll-view
          scroll-y
          class="popup-scroll-view"
        >
          <view class="goods-list">
            <template v-for="(i, index) in data.multipleSpecificationsGoods.skuGoodsList">
              <view
                :key="index"
                @click="choose(i)"
                :class="['item flex',{active: i.goodsId == currentId }]"
              >
                <view class="sprite-icon icon-tag-checked"></view>
                <view class="text">
                  <view class="name"> {{data.multipleSpecificationsGoods.baseGoodsName}}</view>
                  <view
                    class="alias"
                    v-if="i.goodsAlias"
                  >
                    商品别名：{{i.goodsAlias}}
                  </view>
                  <view
                    class="position"
                    v-if="i.specificationStr "
                  >{{i.specificationStr}}</view>
                </view>
                <view class="price">¥<text class="price-num">{{i.sellPrice}}</text>x1</view>
              </view>
            </template>
          </view>
        </scroll-view>
      </view>
    </template>
  </popup>
</template>

<script type='text/ecmascript-6'>
import Popup from '@/components/Popup.vue'
export default {
  components: {
    Popup,
  },
  name: 'SkuPopup',
  props: {
  },

  data () {
    return {
      data: null,
      currentId: ''
    }
  },
  mounted () {
  },
  methods: {
    open (data) {
      this.currentId = ''
      this.data = data
      this.$nextTick(() => {
        this.$refs.popup.open()
      })
    },
    cancel () {
      this.$refs.popup.close()
      this.$emit('cancel')
    },
    close () {
      this.$refs.popup.close()
      this.$emit('close')
    },
    choose (i) {
      let { currentId } = this
      if (currentId == i.goodsId) {
        this.currentId = ''
        return
      }
      this.currentId = i.goodsId
    },
    confirm () {
      let { currentId, data } = this
      if (!currentId || !data) return uni.showToast({
        title: '请勾选商品',
        icon: 'none',
      })
      let { baseGoodsName, id, specificationGoodsMap, specificationList, skuGoodsList } = data.multipleSpecificationsGoods
      let goods = skuGoodsList.find(e => e.goodsId == currentId)
      this.$emit('onConfirm', {
        count: 1,
        goods: null,
        goodsFlag: 2,
        isFlag: true,
        multipleSpecificationsGoods: {
          baseGoodsName,
          id,
          specificationGoodsMap,
          specificationList,
          goods
        }
      })
      this.close()
    },
  }
}
</script>

<style scoped lang='scss'>
.popup-box {
  border-radius: toRpx(32) toRpx(32) 0 0;
  background: #ffffff;
  height: 70vh;
  .popup-title {
    height: toRpx(104);
    justify-content: center;
    position: relative;
    color: #333333;
    font-size: toRpx(36);
    font-weight: 500;
    .popup-close {
      position: absolute;
      height: 100%;
      top: 0;
      right: 0;
      padding: 0 toRpx(48);
      font-weight: 400;
      color: #1a1a1a;
    }
  }
  .popup-tips {
    color: #999ea8;
    font-size: toRpx(28);
    padding-left: toRpx(48);
  }
  .popup-body {
    height: calc(100% - #{toRpx(350)});
    .popup-scroll-view {
      height: 100%;
      padding-top: toRpx(24);
      .goods-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: toRpx(32);
        margin: 0 toRpx(48);
        .item {
          height: toRpx(176);
          border-radius: toRpx(8);
          border: toRpx(2) solid #dce0e6;
          box-sizing: border-box;
          position: relative;
          color: #333333;
          font-size: toRpx(32);
          box-sizing: border-box;
          padding: 0 toRpx(32);
          background: #f5f7fa;
          .sprite-icon {
            display: none;
            position: absolute;
            top: 0;
            right: 0;
          }
          .text {
            color: #666666;
            font-size: toRpx(24);
            line-height: toRpx(36);
            .name {
              color: #333333;
              font-size: toRpx(28);
              font-weight: 500;
              margin-bottom: toRpx(8);
              line-height: toRpx(40);
            }
            .alias {
              margin-bottom: toRpx(8);
            }
          }
          .price {
            margin-left: auto;
            color: #333333;
            font-size: toRpx(28);
            font-weight: 500;
            &-num {
              margin-right: toRpx(16);
            }
          }
        }
        .active {
          border-color: #4673ff;
          background: #4673ff1a;
          .sprite-icon {
            display: block;
          }
        }
      }
    }
  }
}
</style>