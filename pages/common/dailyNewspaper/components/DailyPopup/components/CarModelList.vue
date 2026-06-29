<template>
  <view class="car-model-box">
    <scroll-view
      class="scroll-view"
      scroll-y
      :scroll-into-view="letter"
    >
      <template v-if="listData.length">
        <template v-for="(i, index) in listData">
          <view
            class="item-box"
            :key="index"
            :id="i.letter"
          >
            <view class="letter-title flex">{{i.letter}}</view>
            <template v-for="(c,cindex) in i.list">
              <view
                class="car-model"
                :key="cindex"
              >
                <view class="brand-name">{{c.name}}</view>
                <template v-for="(j, jindex) in c.childs">
                  <view
                    :key="jindex"
                    class="car-block"
                  >
                    <view
                      class="sub-brand-name"
                      @click="getCarSeries(j,c)"
                    >
                      {{j.name}}
                    </view>
                    <view class="series-list">
                      <template v-for="(k, kindex) in j.childs">
                        <view
                          class="series-name"
                          :key="kindex"
                        >
                          <view
                            class="series-name flex"
                            @click="getCarTypeList(k)"
                          >
                            {{k.name}}
                            <uni-icons
                              :type="`${k.childs && k.childs.length && k.open ?'down':'right'}`"
                              size="18"
                            ></uni-icons>
                          </view>
                          <view
                            class="brand-list"
                            v-if="k.open"
                          >
                            <template v-for="(s,sindex) in k.childs">
                              <view
                                :class="['item flex',{active: checkActive(s)}]"
                                :key="`${s.id}_${sindex}`"
                                @click.stop="chooseCarType(s,c)"
                              >
                                {{s.name}}
                                <view class="sprite-icon icon-tag-checked"></view>
                              </view>
                            </template>
                          </view>
                        </view>
                      </template>
                    </view>
                  </view>

                </template>
              </view>
            </template>

          </view>
        </template>
      </template>
    </scroll-view>
    <view class="letter-list">
      <template v-for="(i, index) in listData">
        <view
          class="letter-item"
          :key="index"
          @click="letter = i.letter"
        >
          {{i.letter}}
        </view>
      </template>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'CarModelList',
  data () {
    return {
      letter: 'A',
    }
  },
  mounted () {
  },
  methods: {
    async getList (searchValue) {
      const { userInfo, params } = this,
        { cacheData } = params
      this.currentId = ''
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      const { shopMerchantId } = userInfo,
        { data } = await uni.$api.commonApi.getMerchantCarBrandList([shopMerchantId]),
        { carBrandList } = data[0]
      this.updateParams(params, carBrandList || [])
    },
    initData (carData) {
      let { params: { idKey }, data: { customer, carInfo } } = this,
        letterList = Array.from(new Set([...carData.map((e) => e.letter)])),
        carModelList = letterList.map(e => {
          let list = []
          carData.map(i => {
            if (e === i.letter) {
              list.push(i)
            }
          })
          return {
            letter: e,
            list,
          }
        })
      console.log(carModelList)
      this.list = carModelList
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      if (!searchValue) {
        this.searchStatus = false
        this.letter = 'A'
      } else {
        searchValue = searchValue.toUpperCase()
        let { list } = this,
          carBrand = JSON.parse(JSON.stringify(list))
        let arr = [];
        carBrand.map(c => {
          c.list.map(i => {
            let childs = [],
              i_name = i.name.toUpperCase()
            i.childs.map((k) => {
              let k_name = k.name.toUpperCase()
              if (k_name.indexOf(searchValue) != -1) {
                childs.push(k);
              }
            });

            if (i_name.indexOf(searchValue) != -1 || childs.length > 0) {
              i.childs = childs.length > 0 ? childs : i.childs;
              arr.push(i);
            }
          })
        })
        let letterList = Array.from(new Set([...arr.map((e) => e.letter)]));
        let searchList = letterList.map((l) => {
          let _list = [];
          arr.map((i) => {
            if (l === i.letter) {
              _list.push(i);
            }
          })
          return {
            letter: l,
            list: _list,
          }
        })
        this.searchList = searchList
        this.searchStatus = true

      }
    },
    async getCarSeries (j, c) {
      if (j.childs && j.childs.length) return
      uni.showLoading({
        mask: true
      })
      const data = await uni.$api.popupApi.getCarSeriesList({
        brandId: c.id,
        childBrandId: j.id
      })
      uni.hideLoading()
      j.childs = data
      this.$forceUpdate()
    },
    async getCarTypeList (k) {
      if (k.childs && k.childs.length) {
        k.open = !k.open
        this.$forceUpdate()
        return
      }
      uni.showLoading({
        mask: true
      })
      const data = await uni.$api.popupApi.getCarTypeList({
        carSeriesId: k.id
      })
      uni.hideLoading()
      if (data && data.length) {
        k.childs = data
        k.open = true
        console.log(k)
        this.$forceUpdate()
      } else uni.showToast({
        title: '暂无数据',
        icon: 'none'
      })

    },
    chooseCarType (s, c) {
      let chooseItem = {
        vehicleBrandId: c.id,
        vehicleBrandName: c.name,
        vehicleSubBrandId: s.brandId,
        vehicleSubBrandName: s.brandName,
        vehicleSeriesId: s.seriesId,
        vehicleSeriesName: s.seriesName,
        vehicleShapeId: s.id,
        vehicleShapeName: s.name
      }
      this.currentId = s.id
      this.$emit('choose', chooseItem)
    },
    checkActive (s) {
      let { currentId, data, params, data: { key } } = this,
        carInfo = data[key] || {}

      return (currentId ?  s.id == currentId  : s.id == carInfo[params.idKey] || '' )
    },
  }
}
</script>

<style scoped lang='scss'>
.car-model-box {
  position: relative;
  height: 100%;
  width: 100%;
  .scroll-view {
    height: 100%;
  }
  .letter-list {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    color: #888888;
    font-size: toRpx(28);
    line-height: toRpx(40);
    padding: 0 toRpx(18);
    text-align: center;
  }
  .item-box {
    margin-bottom: toRpx(32);
    .letter-title {
      color: #888888;
      font-size: toRpx(28);
      height: toRpx(40);
      background: #f5f7fa;
      padding-left: toRpx(48);
    }
    .car-model {
      margin: 0 toRpx(48);
      .brand-name {
        color: #000;
        font-size: toRpx(40);
        line-height: toRpx(40);
        margin: toRpx(20) 0;
        font-weight: 500;
      }
      .car-block {
        border-bottom: toRpx(2) solid #dce0e6;
      }
      .sub-brand-name {
        color: #333;
        font-size: toRpx(32);
        line-height: toRpx(40);
        width: 100%;
        flex-shrink: 0;
        margin: 16rpx 0;
        padding-left: 10rpx;
      }
      .series-name {
        color: #555;
        font-size: toRpx(28);
        line-height: toRpx(40);
        width: 100%;
        flex-shrink: 0;
        margin-bottom: 16rpx;
        padding-left: 20rpx;
      }
    }
  }
  .brand-list {
    // display: grid;
    // grid-template-columns: repeat(4, 1fr);
    gap: toRpx(32);
    display: flex;
    // gap: toRpx(32) 0;
    flex-wrap: wrap;
    padding: 0 20rpx;
    .item {
      width: calc((100% - #{toRpx(96)}) / 4);
      justify-content: center;
      min-height: toRpx(72);
      border-radius: toRpx(8);
      border: toRpx(2) solid #dce0e6;
      box-sizing: border-box;
      position: relative;
      color: #333333;
      font-size: toRpx(32);
      padding: 10rpx 20rpx;
      box-sizing: border-box;
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
}
</style>