<template>
  <view :class="['goods-list', { 'is-defeat-order': isDefeatOrder }]">
    <template v-if="params.loadComplete">
      <template v-if="listData.length">
        <template v-for="(i, index) in listData">
          <template v-if="isDefeatOrder">
            <view
              class="item-box"
              :key="index"
            >
              <view class="goods-title flex">{{ i.goodsTypeName }}｜建议价</view>
              <view class="defeat-goods-list">
                <template v-for="(item, ind) in i.upgradeGoodsList">
                  <view
                    :class="['item flex', { active: checkActive(item) }]"
                    :key="`${index}_${ind}`"
                    @click="choose(item)"
                  >
                    <view class="sprite-icon icon-tag-checked"></view>
                    <text class="goods-name text-hide">
                      {{ replaceItemText(item, 'upgradeGoodsAlias') || replaceItemText(item, 'upgradeGoodsName') || replaceItemText(item.goodsInfo, 'goodsName') }}
                    </text>
                    <template v-if="item.merchantGoodsPosition && (item.goodsInfo.goodsType == 1 || item.goodsInfo.goodsType == baseConfigData.selfBuildFilmType)">
                      <text>「{{ item.positionStr }}」</text>
                    </template>
                    <template v-if="!item.merchantGoodsPosition && (item.goodsInfo.goodsType == 1 || item.goodsInfo.goodsType == baseConfigData.selfBuildFilmType)">
                      <view class="no-postion">无部位</view>
                    </template>
                    <text class="price">¥{{ item.upgradePrice }}</text>
                  </view>
                </template>
              </view>
            </view>
          </template>
          <template v-else>
            <view
              :key="index"
              @click="choose(i)"
              :class="['item flex', { active: checkActive(i) }]"
            >
              <view class="sprite-icon icon-tag-checked"></view>
              <text class="goods-name text-hide">
                {{ replaceItemText(i.goods, 'goodsAlias') || replaceItemText(i.goods, 'upgradeGoodsName') || replaceItemText(i.goodsInfo, 'goodsName') }}
              </text>
              <template v-if="i.goods.merchantGoodsPosition && (i.goods.goodsInfo.goodsType == 1 || i.goods.goodsInfo.goodsType == baseConfigData.selfBuildFilmType)">
                <text>「{{ i.goods.positionStr }}」</text>
              </template>
              <template v-if="!i.goods.merchantGoodsPosition && (i.goods.goodsInfo.goodsType == 1 || i.goods.goodsInfo.goodsType == baseConfigData.selfBuildFilmType)">
                <text class="no-postion">无部位</text>
              </template>
              <text class="price">¥{{ i.goods.price }}</text>
            </view>
          </template>
        </template>
      </template>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'GoodsList',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList (searchValue) {
      const { userInfo, params, isDefeatOrder } = this,
        { shopMerchantId, sceneType } = userInfo,
        { cacheData } = params

      this.currentIds = []
      this.chooseList = []
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      let apiName = isDefeatOrder ? 'getOrderUpgradeGoodsList' : 'getGoodsList',
        apiParams = {
          merchantId: shopMerchantId
        }
      apiParams.sceneType = sceneType
      apiParams.baseSceneCode = this.data.baseSceneCodeValue || this.data.baseSceneCode
      if (isDefeatOrder) {
        apiParams.upradeFlag = 'N'
      }
      const data = await uni.$api.popupApi[apiName](apiParams)
      this.updateParams(params, data || [])
    },
    handleSearch (searchValue) {
      let { isDefeatOrder } = this
      if (!searchValue) this.searchStatus = false
      else {
        let { list } = this,
          goodsList = JSON.parse(JSON.stringify(list)),
          arr = []
        goodsList.map(i => {
          let name = ''
          if (isDefeatOrder) {
            let upgradeGoodsList = [];
            i.upgradeGoodsList.map((c) => {
              let name = c.upgradeGoodsAlias || c.upgradeGoodsName || c.goodsInfo.goodsName;
              if (name.indexOf(searchValue) != -1) upgradeGoodsList.push(c)
            })
            if (i.goodsTypeName.indexOf(searchValue) != -1 || upgradeGoodsList.length > 0) {
              i.upgradeGoodsList = upgradeGoodsList.length > 0 ? upgradeGoodsList : i.upgradeGoodsList
              arr.push(i)
            }
          } else {
            if (i.goodsFlag == 1 && i.goods) name = i.goods.goodsAlias || i.goods.upgradeGoodsName || i.goods.goodsName || ''
            if (name.indexOf(searchValue) != -1) {
              arr.push(i)
            }
          }

        })
        this.searchList = arr
        this.searchStatus = true
      }
    },
    initData (goodsData) {
      let { data, dataKey, isDefeatOrder, baseConfigData, positionTypeList, params } = this,
        { goodsType } = params,
        arr = []
      if (isDefeatOrder) {
        let arrData = []
        goodsData?.forEach(val => {
          if ([1, baseConfigData?.selfBuildFilmType].includes(val.goodsType))
            arrData.push(val)
        })
        arrData.map(val => {
          if (val.goodsType == 1 || val.goodsType == baseConfigData?.selfBuildFilmType) {
            arr.push({
              goodsType: val.goodsType,
              goodsTypeName: val.goodsTypeName,
              upgradeGoodsList: []
            })
            for (var i = 0; i < arr?.length; i++) {
              let arr2 = []
              val?.upgradeGoodsList?.forEach(subVal => {
                subVal.positionStr = positionTypeList.filter(
                  v => v.positionValue == subVal.merchantGoodsPosition
                )[0]?.positionName
                subVal.price = 0
                subVal.shopMinPrice = 0
                subVal.upgradePrice = 0
                subVal.totalPrice = 0
                subVal.number = 1
                if (goodsType.includes(subVal.merchantGoodsPosition)) {
                  arr2.push(subVal)
                  if (subVal?.goodsInfo?.goodsType == arr[i]?.goodsType || subVal?.upgradeGoodsType == arr[i]?.goodsType) arr[i].upgradeGoodsList = arr2
                }
              });
              if (!arr[i]?.upgradeGoodsList?.length) arr.splice(i, 1);
            }
          }
        })
      } else {
        goodsData.map(val => {
          if (val.goodsFlag == 1) {
            let subVal = val.goods
            subVal.positionStr = subVal.position
            subVal.upgradePrice = subVal.sellPrice
            subVal.price = subVal.sellPrice
            subVal.goodsId = subVal.merchantGoodsId
            if (goodsType.includes(subVal.merchantGoodsPosition)) arr.push(val)
          }
        })
      }
      let paramsData = dataKey ? data[dataKey] : data
      if (paramsData && paramsData.length) {
        // let idName = isDefeatOrder ? 'id' : 'goodsId'
        // paramsData.map(e => {
        //   this.currentIds.push(e.goods[idName])
        //   this.chooseList.push(e)
        // })
        arr.map(i => {
          console.log(i)
          if (isDefeatOrder) i.upgradeGoodsList.map(e => {
            paramsData.map(c => {
              if (c.goods.id == e.id) this.choose(e)
            })
          })
          else paramsData.map(c => {
            if (i.goods.goodsId == c.goods.goodsId) this.choose(i)
          })
        })
      }
      this.$emit('choose', this.chooseList)
      this.$emit('onComplete')
      this.list = arr
    },
    choose (i) {
      let { currentIds, isDefeatOrder } = this,
        id = ''
      if (isDefeatOrder) id = i.id
      else id = i.goods.goodsId
      let index = currentIds.indexOf(id)
      if (index == -1) {
        this.currentIds.push(id)
        this.chooseList.push(i)
      } else {
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
      let { currentIds, isDefeatOrder } = this,
        id = '',
        active = false
      if (isDefeatOrder) id = i.id
      else id = i.goods.goodsId
      if (currentIds.length) active = currentIds.includes(id)
      return active
    }
  }
}
</script>

<style scoped lang="scss">
.goods-list {
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
    box-sizing: border-box;
    padding: 0 toRpx(32);
    .no-postion {
      color: #f24724;
      margin-left: toRpx(10);
      font-size: toRpx(22);
    }
    .sprite-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
    .price {
      margin-left: auto;
    }
    .goods-name {
      max-width: toRpx(600);
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
.is-defeat-order {
  display: block;
  margin: 0;
  .item-box {
    margin-bottom: toRpx(32);
    .goods-title {
      color: #888888;
      font-size: toRpx(28);
      height: toRpx(40);
      background: #f5f7fa;
      padding-left: toRpx(48);
      margin-bottom: toRpx(16);
    }
    .defeat-goods-list {
      gap: toRpx(32);
      display: flex;
      flex-wrap: wrap;
      margin: 0 toRpx(48);
      .item {
        width: calc((100% - #{toRpx(32)}) / 2);
        justify-content: center;
        min-height: toRpx(72);
        border-radius: toRpx(8);
        border: toRpx(2) solid #dce0e6;
        box-sizing: border-box;
        position: relative;
        color: #333333;
        font-size: toRpx(32);
        padding: toRpx(14) toRpx(32);
        word-break: break-all;
        text-align: center;
        .sprite-icon {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
        }
      }
      .disabled {
        border: toRpx(2) solid #dce0e666;
        color: #3333331a;
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
  }
}
</style>
