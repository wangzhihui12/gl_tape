<template>
  <view
    class="goods-list"
    :key="viewDataKey"
  >
    <template v-if="params.loadComplete">
      <template v-if="list.length">
        <template v-for="(i, index) in list">
          <!-- v-if="i.goodsFlag == 3" -->
          <view
            :key="`${index}_${i.key}`"
            @click.stop="choose(i, index)"
            :class="['item', { hide: !i.show }, { active: checkActive(i) }, { single: i.goodsFlag == 1 }]"
          >
            <template v-if="i.goodsFlag == 1">
              <view class="flex">
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
                <text class="goods-name">
                  <template v-if="sceneType == 1">
                    {{ replaceItemText(i.goods, 'goodsAlias')
                      || replaceItemText(i.goods, 'upgradeGoodsName') 
                      || replaceItemText(i.goodsInfo, 'goodsName') }}
                  </template>
                  <template v-else>
                    {{replaceItemText(i.goods, 'goodsAlias') 
                      || replaceItemText('','',
                      i.goods.upgradeGoodsName + (i.goods.specificationData? '/'+i.goods.specificationData:''))
                      || replaceItemText('','',
                      i.goods.goodsInfo.goodsName + (i.goods.specificationData? ('/'+i.goods.specificationData):''))
                      }}
                  </template>
                </text>
                <template v-if="i.goods.merchantGoodsPosition && (i.goods.goodsInfo.goodsType == 1 || i.goods.goodsInfo.goodsType == baseConfigData.selfBuildFilmType)">
                  <text>「{{ i.goods.positionStr }}」</text>
                </template>
                <text class="price">¥{{ i.goods.price }}</text>
              </view>
              <template v-if="i.goods.serveName">
                <view class="base-tips">包含{{i.goods.serveName}}</view>
              </template>
            </template>
            <template v-if="i.goodsFlag == 2">
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
                {{ i.multipleSpecificationsGoods.baseGoodsName }}
                <template v-if="i.multipleSpecificationsGoods.goods && i.multipleSpecificationsGoods.goods.sellPrice">
                  <text class="price">¥{{ i.multipleSpecificationsGoods.goods.sellPrice }}</text>
                </template>
              </view>
              <template v-if="sceneType == 0 && i.multipleSpecificationsGoods.goods && i.multipleSpecificationsGoods.goods.serveName">
                <view class="base-tips">包含{{i.multipleSpecificationsGoods.goods.serveName}}</view>
              </template>
              <template v-if="i.multipleSpecificationsGoods.specificationList && i.multipleSpecificationsGoods.specificationList.length">
                <view class="package-list">
                  <template v-for="(specific, specificIndex) in i.multipleSpecificationsGoods.specificationList">
                    <picker
                      @click.stop
                      @change="
                        handlePickerChange($event, {
                          item: specific,
                          list: specific.specificationSelectValueList,
                          parent: i,
                          index
                        })
                      "
                      :range="specific.specificationSelectValueList"
                      :key="`key_${index}_${specificIndex}`"
                    >
                      <view class="package-item flex">
                        <view class="label">
                          {{ specific.specificationName }}
                        </view>
                        <view class="value flex">
                          <template v-if="specific.value">
                            {{ specific.value }}
                          </template>
                          <text
                            class="placeholder flex"
                            v-else
                          >请选择</text>
                          <uni-icons
                            type="right"
                            size="14"
                            class="arrow"
                          />
                        </view>
                      </view>
                    </picker>
                  </template>
                </view>
              </template>
            </template>
            <template v-if="i.goodsFlag == 3 && sceneType == 0">
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
                <text class="goods-name">
                  {{ i.packageGoods.packageAlias || i.packageGoods.packageName }}
                </text>
                <text class="price">¥{{ i.packageGoods.sellPrice }}</text>
              </view>
              <view class="package-list">
                <template v-for="(specific, specificIndex) in i.packageGoods.goodsList">
                  <view
                    class="package-item flex"
                    :key="`${index}_${specificIndex}`"
                  >
                    <view class="label">
                      {{ 
                        replaceItemText(specific, 'goodsAlias')
                        || replaceItemText('','', 
                        specific.upgradeGoodsName +( specific.specificationData ? ('/'+specific.specificationData): '')
                        ) 
                        ||  replaceItemText('','',
                        specific.goodsInfo.goodsName+( specific.specificationData? ('/'+specific.specificationData): '')
                        )}}
                    </view>
                    <view class="value flex">
                      ¥{{ specific.sellPrice }}
                    </view>
                  </view>
                </template>
              </view>
            </template>
          </view>
        </template>
      </template>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
import NP from 'number-precision'
export default {
  mixins: [popupmixin],
  name: 'SkuGoodsList',
  data () {
    return {
      viewDataKey: Date.now(),
    }
  },

  mounted () {
  },
  methods: {
    async getList (searchValue) {
      const { userInfo, params, isDefeatOrder } = this
      const { shopMerchantId, sceneType } = userInfo
      const { cacheData } = params
      this.currentIds = []
      this.chooseList = []
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      let apiName = isDefeatOrder ? 'getOrderUpgradeGoodsList' : 'getGoodsList';
      let apiParams = {
        merchantId: shopMerchantId
      }
      apiParams.sceneType = sceneType
      apiParams.baseSceneCode = this.data.baseSceneCodeValue || this.data.baseSceneCode
      if (isDefeatOrder) {
        apiParams.upradeFlag = 'N'
      }
      const data = await uni.$api.popupApi[apiName](apiParams)
      if (isDefeatOrder) {
        let newArray = []
        const dataList = data.flatMap(val => val.upgradeGoodsList)
        dataList.forEach(subVal => {
          subVal.positionStr = subVal.position
          subVal.price = 0
          subVal.shopMinPrice = 0
          subVal.sellPrice = 0
          subVal.upgradePrice = 0
          subVal.totalPrice = 0
          subVal.number = 1
          subVal.goodsId = subVal.merchantGoodsId
          newArray.push({
            goodsFlag: 1, goods: subVal,
            multipleSpecificationsGoods: null,
            packageGoods: null
          })
        })
        this.updateParams(params, newArray || [])
      } else {
        this.updateParams(params, data || [])
      }

    },
    handleSearch (searchValue) {
      let { list, params } = this,
        ids = []
      if (!searchValue) {
        list.map(c => {
          c.show = true
          ids.push(1)
        })
      }
      else {
        list.map(c => {
          c.show = false
          let name = ''
          if (c.goodsFlag == 1 && c.goods) {
            name = c.goods.goodsAlias || c.goods.upgradeGoodsName || c.goods.goodsName || ''
          }
          if (c.goodsFlag == 2 && c.multipleSpecificationsGoods) {
            name = c.multipleSpecificationsGoods.baseGoodsName
          }
          if (c.goodsFlag == 3 && c.packageGoods) {
            name = c.packageGoods.packageAlias || c.packageGoods.packageName
          }
          if (name.indexOf(searchValue) != -1) {
            c.show = true
            ids.push(1)
          }
        })
      }
      params.noData = !ids.length
      this.updateParams(params)
      this.viewDataKey = Date.now()
    },
    initData (goodsData) {
      let { data, dataKey, sceneType } = this,
        arr = []
      goodsData.map((val) => {
        val.show = true
        if (val.goodsFlag == 1) {
          if (sceneType == 0) val.goods = this.setServeName(val.goods)
          let subVal = val.goods
          subVal.positionStr = subVal.position
          subVal.upgradePrice = subVal.sellPrice
          subVal.price = subVal.sellPrice
          subVal.goodsId = subVal.merchantGoodsId || subVal.id
          if (![1, 2, 3, 4, 5, 6, 7].includes(subVal.merchantGoodsPosition)) {
            arr.push(val)
          }
        }
        if (val.goodsFlag == 2) {
          val.active = false
          val.key = Date.now()
          if (val.multipleSpecificationsGoods?.goods?.sellPrice) val.multipleSpecificationsGoods.goods.sellPrice = null
          val.multipleSpecificationsGoods.specificationList.forEach(item => {
            item.value = ''
            item.specificationSelectValueList = []
            item.specificationValueList.forEach(second => {
              if (second.show) {
                item.specificationSelectValueList.push(second.specificationValue)
              }
            })
          })
          arr.push(val)
        }
        if (val.goodsFlag == 3) {
          let { goodsList } = val.packageGoods
          val.packageGoods.goodsList = goodsList.map(item => {
            (item.specificationNameSequence =
              item.specificationTypeSequence && item.specificationNameSequence ?
                item.specificationNameSequence.replace(/;~;/g, '/') :
                ''),
              (item.specificationData =
                item.specificationTypeSequence && item.specificationData ?
                  item.specificationData.replace(/;~;/g, '/') :
                  '')
            item.number = 1
            item.price = item.sellPrice
            return item
          })
          val.packageGoods.sellPrice = goodsList.reduce((pre, item) => {
            pre = NP.plus(pre, item.sellPrice)
            return pre
          }, 0)
          arr.push(val)
        }
      })
      let paramsData = dataKey ? data[dataKey] : data
      if (paramsData && paramsData.length) paramsData.map(e => {
        if (e.goodsFlag != 2) {
          let id = ''
          if (e.goodsFlag == 3) id = e.packageGoods.packageCode
          if (e.goodsFlag == 1) id = String(e.goods.goodsId)
          this.currentIds.push(id)
          this.chooseList.push(e)
        }
        this.$emit('choose', this.chooseList)
      })
      this.list = arr
      this.$emit('onComplete')
    },
    async choose (i, index) {
      try {
        if (i.goodsFlag == 2) {
          if (!await this.watchAllChose(index, true)) {
            uni.showToast({
              title: '请先选择该商品规格',
              icon: 'none'
            })
            return
          }
        } else {
          let id = ''
          if (i.goodsFlag == 3) {
            let { packageCode } = i.packageGoods
            id = packageCode
          } else {
            let { goodsId } = i.goods
            id = String(goodsId)
          }
          let { currentIds, chooseList } = this,
            delIndex = currentIds.indexOf(id)
          if (delIndex == -1) {
            this.currentIds.push(id)
            this.chooseList.push(i)
          } else {
            this.currentIds.splice(delIndex, 1)

            const delChooseIndex = chooseList.findIndex(e => {
              let chooseId = ''
              if (e.goodsFlag == 3) chooseId = e.packageGoods.packageCode
              if (e.goodsFlag == 1) chooseId = String(e.goods.goodsId)
              if (e.goodsFlag == i.goodsFlag) {
                if (id == chooseId) return e
              }
            })
            if (delChooseIndex != -1) this.chooseList.splice(delChooseIndex, 1)
          }
          this.$emit('choose', this.chooseList)
        }
      } catch (error) {
        console.log(error)
      }
    },
    replaceItemText (item, key, specification) {
      let reg = getRegExp(';~;', 'g'),
        value = item && key ? item[key] : ''
      if (specification) {
        return specification ? specification.replace(reg, '/') : ''
      }
      return value ? value.replace(reg, ' ') : ''
    },
    checkActive (i) {
      let { goodsFlag, goods, packageGoods } = i,
        id = '',
        { currentIds, chooseList } = this,
        active = false
      if (goodsFlag == 2) {
        let ids = []
        chooseList.map(e => {
          if (e.goodsFlag == 2) ids.push(e.multipleSpecificationsGoods.id)
        })
        return ids.includes(i.multipleSpecificationsGoods.id)
      }
      if (goodsFlag == 3) id = packageGoods.packageCode
      else id = goods.goodsId
      if (currentIds.length) active = currentIds.includes(String(id))
      return active
    },
    handlePickerChange (e, {
      item, list, parent, index
    }) {
      let { value } = e.detail
      item.value = list[value]
      parent.key = Date.now()
      this.$set(this.list, index, parent)
      this.watchAllChose(index)
    },
    async watchAllChose (index, cancel) {
      let {
        list: goodsList,
        sceneType
      } = this;
      let result = goodsList[index].multipleSpecificationsGoods.specificationList.every(item => item.value)
      if (result) {
        if (!cancel) {
          let arr = []
          goodsList[index].multipleSpecificationsGoods.specificationList.forEach(spec => {
            arr.push(spec.value)
          })
          let str = arr.join(';~;')

          //获取该规格的商品是否存在
          goodsList[index].multipleSpecificationsGoods.skuGoodsList = []
          if (goodsList[index].multipleSpecificationsGoods.specificationGoodsMap[str]) {
            let goodsArr = goodsList[index].multipleSpecificationsGoods.specificationGoodsMap[str]
            //当多规格商品只有一个时，直接选中
            if (goodsArr.length == 1) {
              let { chooseList } = this,
                addIndex = -1
              chooseList.map((item, ind) => {
                if (item.goodsFlag == 2 && item.multipleSpecificationsGoods.id == goodsList[index].multipleSpecificationsGoods.id) addIndex = ind
              })
              goodsList[index].active = true
              goodsList[index].multipleSpecificationsGoods.goods = goodsArr[0]
              goodsList[index].multipleSpecificationsGoods.goods.goodsId = goodsList[index].multipleSpecificationsGoods.goods.merchantGoodsId
              goodsList[index].multipleSpecificationsGoods.goods.specificationStr = goodsList[index].multipleSpecificationsGoods.goods.specificationData.replace(/;~;/g, '/')
              if (addIndex == -1) this.chooseList.push(goodsList[index])
              else this.chooseList[addIndex] = goodsList[index]
              this.$emit('choose', this.chooseList)
            } else {
              //多个多规格商品时出现弹窗
              goodsList[index].active = false
              goodsArr.forEach(item => {
                item.count = 1
                item.active = false
                item.goodsId = item.merchantGoodsId
                item.specificationStr = item.specificationData.replace(/;~;/g, '/')
              })
              goodsList[index].multipleSpecificationsGoods.skuGoodsList = goodsArr
              this.$emit('openSkuPopup', goodsList[index], this.chooseList)
              this.$set(this.list, index, goodsList[index])
            }
          } else {
            uni.showToast({
              icon: 'none',
              title: '暂无该规格商品'
            })
            goodsList[index].active = false
            goodsList[index].multipleSpecificationsGoods.goods = ''
            goodsList[index].multipleSpecificationsGoods.specificationList.forEach(item => {
              item.value = ''
            })
            let { chooseList } = this
            chooseList.forEach((item, ind) => {
              if (item.goodsFlag == 2 && item.multipleSpecificationsGoods.id == goodsList[index].multipleSpecificationsGoods.id) {
                chooseList.splice(ind, 1)
                console.log(chooseList)
              }
            })
            // this.chooseList = chooseList
            console.log(this.chooseList)
            this.$emit('choose', this.chooseList)
          }
          // console.log(this.list, index, goodsList[index])
          this.$set(this.list, index, goodsList[index])
        } else {
          if (goodsList[index].active) {
            goodsList[index].active = false
            goodsList[index].multipleSpecificationsGoods.goods = ''
            goodsList[index].multipleSpecificationsGoods.specificationList.forEach(item => {
              item.value = ''
            })
            let { chooseList } = this
            chooseList.forEach((item, ind) => {
              if (item.goodsFlag == 2 && item.multipleSpecificationsGoods.id === goodsList[index].multipleSpecificationsGoods.id) {
                chooseList.splice(ind, 1)
              }
            })
            this.$emit('choose', this.chooseList)
            this.$set(this.list, index, goodsList[index])
          }
        }
        if (sceneType == 0 && goodsList[index].multipleSpecificationsGoods.goods) this.handleGoods(index)
      }
      return result

    },
    handleGoods (index) {
      let {
        list: goodsList
      } = this
      let ele = goodsList[index]
      ele.multipleSpecificationsGoods.goods = this.setServeName(ele.multipleSpecificationsGoods.goods)
      this.list = goodsList
    },
    setServeName (item) {
      let serveName = ''
      if (
        item?.upgradeGoodsServiceItemsList &&
        item.upgradeGoodsServiceItemsList.length
      ) {
        serveName = item.upgradeGoodsServiceItemsList.reduce(
          (label, ele, index) => {
            let unit = index == 0 ? '' : '/'
            label = label + unit + ele?.serviceName
            return label
          },
          ''
        )
      }

      if (item.position) {
        const fieldMap = {
          '4大件': '燃油车4大件服务',
          '3电': '新能源3电服务',
          '6大件': '新能源6大件服务'
          // 在这里可以添加更多的替换规则
        }
        // 如果输入字段在字段映射中有匹配项，则进行替换，否则保持不变
        fieldMap[item.position] && (serveName = fieldMap[item.position])
      }
      return {
        ...item,
        goodsId: item.merchantGoodsId,
        serveName,
        goodsNameAlias: item.upgradeGoodsAlias,
        appreciation: item?.appreciation,
        goodsName: item?.upgradeGoodsName,
        specificationNameSequence: item.specificationTypeSequence && item.specificationNameSequence ?
          item.specificationNameSequence.replace(/;~;/g, '/') : '',
        specificationData: item.specificationTypeSequence && item.specificationData ?
          item.specificationData.replace(/;~;/g, '/') : '',
        quotationGoodsServiceItemsRelationDTOList: item?.upgradeGoodsServiceItemsList,
        titlePictureUrl: item.goodsInfo?.thumbUrl
      }
    }

  }
}
</script>

<style scoped lang="scss">
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
    padding: 0 toRpx(32);

    .price {
      margin-left: auto;
      flex-shrink: 0;
      font-weight: 600;
    }

    .title {
      min-height: toRpx(88);
      padding: toRpx(24) 0 toRpx(20);
    }
    .goods-name {
      max-width: 80%;
      word-break: break-all;
    }
    .base-tips {
      margin-bottom: 20rpx;
      color: #999999;
      font-size: 28rpx;
      padding-left: 58rpx;
      margin-top: -16rpx;
    }
    .icon {
      margin-right: toRpx(16);
    }

    .filled {
      display: none;
    }

    .package-list {
      border-radius: toRpx(16);
      background-color: #f5f7fa;
      padding-left: toRpx(32);
      overflow: hidden;
      margin-bottom: toRpx(24);

      .package-item {
        color: #333333;
        font-size: toRpx(28);
        line-height: toRpx(40);
        padding: toRpx(24) 0;
        border-bottom: toRpx(2) solid #f0f0ef;
        padding-right: toRpx(32);

        .value {
          margin-left: auto;
          max-width: 50%;
          flex-shrink: 0;

          .arrow {
            margin-left: toRpx(4);
          }
        }

        &:last-of-type {
          border: none;
        }

        .placeholder {
          color: #999;
        }
      }
    }
  }

  .hide {
    display: none;
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
    .base-tips {
      color: inherit;
    }
  }

  .single {
    min-height: toRpx(72);
    padding: toRpx(14) toRpx(32);
    border-radius: toRpx(8);
    .base-tips {
      margin: 4rpx 0 0 !important;
    }
  }
}
</style>
