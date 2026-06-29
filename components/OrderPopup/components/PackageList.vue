<template>
  <view class="goods-list">
    <template v-if="params.loadComplete">
      <template v-if="listData.length">
        <template v-for="(item, index) in listData">
          <view
            :key="index"
            @click="choose(item)"
            :class="['item',{active: checkActive(item)}]"
          >
            <view class="title flex">
              <view class="icon flex">
                <uni-icons
                  type="circle"
                  :size="20"
                  color="#8C8C8C"
                  class="circle"
                ></uni-icons>
                <uni-icons
                  type="checkbox-filled"
                  :size="20"
                  color="#2c66f7"
                  class="filled"
                ></uni-icons>
              </view>
              {{item.packageGoods.packageAlias||item.packageGoods.packageName}}
              <text class="price">¥{{item.packageGoods.upgradePrice}}</text>
            </view>
            <view class="package-list">
              <template v-for="(i,ind) in item.packageGoods.goodsList">
                <view
                  class="package-item flex"
                  :key="ind"
                >
                  <view class="name">{{i.goodsAlias||i.upgradeGoodsAlias||i.upgradeGoodsName}}</view>
                  <view class="price">¥{{i.sellPrice}}</view>
                </view>
              </template>
            </view>
          </view>
        </template>
      </template>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
import NP from 'number-precision'
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'PackageList',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList (searchValue) {
      const { userInfo, params } = this,
        { cacheData } = params
      this.currentIds = []
      this.chooseList = []
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      const { shopMerchantId, sceneType } = userInfo,
        data = await uni.$api.popupApi.getGoodsList({
          merchantId: shopMerchantId,
          sceneType
        })
      this.updateParams(params, data || [])
    },
    handleSearch (searchValue) {
      if (!searchValue) this.searchStatus = false
      else {
        let { list } = this,
          goodsList = JSON.parse(JSON.stringify(list)),
          arr = []
        goodsList.map(c => {
          let name = ''
          if (c.goodsFlag == 3 && c.packageGoods) name = c.packageGoods.packageName || c.packageGoods.packageAlias
          if (name.indexOf(searchValue) != -1) {
            arr.push(c)
          }
        })
        this.searchList = arr
        this.searchStatus = true
      }
    },
    initData (goodsData) {
      let { data, dataKey } = this,
        arr = []
      goodsData.map(val => {
        if (val.goodsFlag == 3) {
          val.packageGoods.upgradePrice = NP.round(val.packageGoods.goodsList.reduce((prev, cur) => {
            prev = NP.plus(prev + cur.sellPrice);
            return prev;
          }, 0), 2)
          arr.push(val)
        }
      })
      let paramsData = dataKey ? data[dataKey] : data
      if (paramsData && paramsData.length) paramsData.map(e => {
        this.currentIds.push(e.packageGoods.packageCode)
        this.chooseList.push(e)
      })
      this.$emit('choose', this.chooseList)
      this.$emit('onComplete')
      this.list = arr
    },
    choose (i) {
      let { packageCode } = i.packageGoods,
        { currentIds } = this,
        index = currentIds.indexOf(packageCode)
      if (index == -1) {
        this.currentIds.push(packageCode)
        this.chooseList.push(i)
      }
      else {
        this.currentIds.splice(index, 1)
        this.chooseList.splice(index, 1)
      }
      this.$emit('choose', this.chooseList)
    },
    replaceItemText (item, key) {
      let reg = getRegExp(';~;', 'g'),
        value = item[key]
      return value ? value.replace(reg, ' ') : ''
    },
    checkActive (i) {
      let { currentIds } = this,
        active = false
      if (currentIds.length) active = currentIds.includes(i.packageGoods.packageCode)
      return active
    }
  }
}
</script>

<style scoped lang='scss'>
.goods-list {
  display: flex;
  flex-direction: column;
  gap: toRpx(32) 0;
  margin: 0 toRpx(48);
  .item {
    justify-content: center;
    border-radius: toRpx(24);
    border: toRpx(2) solid #dce0e6;
    box-sizing: border-box;
    position: relative;
    color: #333333;
    font-size: toRpx(32);
    box-sizing: border-box;
    padding: 0 toRpx(32) toRpx(24);
    .price {
      margin-left: auto;
    }
    .title {
      height:  toRpx(88);
      padding: toRpx(24) 0 toRpx(20);
      .icon {
        margin-right: toRpx(16);
      }
      .filled {
        display: none;
      }
    }
    .package-list {
      border-radius: toRpx(16);
      background-color: #f5f7fa;
      padding-left: toRpx(32);
      overflow: hidden;
      .package-item {
        color: #333333;
        font-size: toRpx(28);
        line-height: toRpx(40);
        padding: toRpx(24) 0;
        border-bottom: toRpx(2) solid #f0f0ef;
        padding-right: toRpx(32);
        .price {
          margin-left: auto;
        }
        &:last-of-type {
          border: none;
        }
      }
    }
  }
  .active {
    border-color: #2c66f7;
    background: #ecf1ff;
    color: #2c66f7;

    .icon {
      .circle {
        display: none;
      }
      .filled {
        display: block;
      }
    }
    .package-list {
      background: #fff;
    }
  }
}
</style>