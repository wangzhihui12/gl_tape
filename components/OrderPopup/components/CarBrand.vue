<template>
  <view class="car-model-box">
    <!-- :key="viewKey" -->
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
                <view class="brand-list">
                  <template v-for="(j, jindex) in c.childs_list">
                    <view
                      :key="jindex"
                      :class="['sub-brand-name',{'hide-border':j.children && j.children.length && j.open}]"
                    >
                      <view
                        class="subtitle subtitle-one flex"
                        @click.stop="chooseSubBrand(j, c , jindex, cindex, index)"
                      >
                        {{j.name}}
                        <uni-icons
                          :type="`${j.children && j.children.length && j.open ?'down':'right'}`"
                          size="18"
                        ></uni-icons>
                      </view>

                    </view>

                    <template v-for="(k,kindex) in j.children">
                      <view
                        :class="['sub-item flex',{'last':kindex == j.children.length-1}, {hide:!j.open}]"
                        :key="`${k.id}_${kindex}`"
                      >
                        <view
                          :class="['subtitle subtitle-two flex']"
                          @click.stop="chooseSeries(k,jindex, cindex, index ,kindex)"
                        >
                          {{k.name}}
                          <uni-icons
                            :type="`${k.children && k.children.length && k.open ?'down':'right'}`"
                            size="18"
                          ></uni-icons>
                        </view>
                        <template v-for="(s,sindex) in k.children">
                          <view
                            :class="['item flex',{active: checkActive(s)}]"
                            :key="`${s.id}_${sindex}`"
                            @click.stop="chooseCarType(s,c)"
                            v-if="k.open"
                          >
                            {{s.name}}
                            <view class="sprite-icon icon-tag-checked"></view>
                          </view>
                        </template>
                      </view>
                    </template>
                  </template>
                </view>
              </view>
            </template>

          </view>
        </template>
        <view class="block"></view>
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
    <view class="right-box">

    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'CarBrand',
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
      const data = await uni.$api.popupApi.getCarBrandList()
      this.updateParams(params, data || [])
    },
    initData (carData) {
      let { params: { idKey }, data: { customer, carInfo }, sceneType } = this,
        letterList = Array.from(new Set([...carData.map((e) => e.letter)])),
        carModelList = letterList.map(e => {
          let list = []
          carData.map(i => {
            if (e === i.letter) {
              i.childs_list = i.childs;
              list.push(i)
            }
          })
          return {
            letter: e,
            list,
          }
        })
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
            let childs_list = [],
              i_name = i.name.toUpperCase()
            i.childs_list.map((k) => {
              let k_name = k.name.toUpperCase()
              if (k_name.indexOf(searchValue) != -1) {
                childs_list.push(k);
              }
            });

            if (i_name.indexOf(searchValue) != -1 || childs_list.length > 0) {
              i.childs_list = childs_list.length > 0 ? childs_list : i.childs_list;
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
    async chooseSubBrand (that, item, jindex, cindex, index) {
      if (that.children && that.children.length) {
        this.$set(this.listData[index].list[cindex].childs_list[jindex], 'open', !that.open)
        return
      }
      uni.showLoading({
        mask: true
      })
      const data = await uni.$api.popupApi.getCarSeriesList({
        brandId: item.id,
        childBrandId: that.id
      })

      // this.listData[index].list[cindex].childs_list[jindex].children = data
      this.$set(this.listData[index].list[cindex].childs_list[jindex], 'children', data)
      this.$set(this.listData[index].list[cindex].childs_list[jindex], 'open', true)
      setTimeout(() => {
        uni.hideLoading()
      }, 200)
      // this.viewKey = Date.now()
    },
    async chooseSeries (k, jindex, cindex, index, kindex) {
      if (k.children && k.children.length) {
        this.$set(this.listData[index].list[cindex].childs_list[jindex].children[kindex], 'open', !k.open)

        return
      }
      uni.showLoading({
        mask: true
      })
      const data = await uni.$api.popupApi.getCarTypeList({
        carSeriesId: k.id
      })
      // this.listData[index].list[cindex].childs_list[jindex].children[kindex].children = data
      this.$set(this.listData[index].list[cindex].childs_list[jindex].children[kindex], 'children', data)
      this.$set(this.listData[index].list[cindex].childs_list[jindex].children[kindex], 'open', true)
      setTimeout(() => {
        uni.hideLoading()
      }, 200)
      // this.viewKey = Date.now()

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
    checkActive (j) {
      let { currentId, data, params } = this
      return currentId ?
        j.id == currentId : j.id == data[params.idKey]
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
    line-height: toRpx(28);
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
        color: #333333;
        font-size: toRpx(44);
        line-height: toRpx(54);
        margin: toRpx(24) 0;
      }
      .sub-brand-name {
        color: #888888;
        font-size: toRpx(34);
        line-height: toRpx(44);
        width: 100%;
        flex-shrink: 0;
        border-bottom: toRpx(2) solid #eee;
      }
      .hide-border {
        border-bottom: none;
      }
    }
  }
  .brand-list {
    // display: grid;
    // grid-template-columns: repeat(4, 1fr);

    display: flex;
    // gap: toRpx(32) 0;
    flex-wrap: wrap;
    .subtitle {
      width: 100%;
      flex-shrink: 0;
    }
    .subtitle-one {
      margin: toRpx(30) 0;
    }
    .subtitle-two {
      color: #000;
      font-size: toRpx(32);
      font-weight: 500;
    }
    .last {
      border-bottom: toRpx(2) solid #dce0e6;
      padding-bottom: toRpx(40);
    }
    .hide {
      visibility: hidden;
      height: 0;
      padding-bottom: 0;
    }
    .sub-item {
      width: 100%;
      box-sizing: border-box;
      position: relative;
      color: #333333;
      font-size: toRpx(28);
      display: flex;
      flex-wrap: wrap;
      gap: toRpx(32);
      line-height: toRpx(60);
      align-items: stretch;
      box-sizing: border-box;
    }
    .item {
      width: calc((100% - #{toRpx(96)}) / 4);
      justify-content: center;
      min-height: toRpx(72);
      border-radius: toRpx(8);
      border: toRpx(2) solid #dce0e6;
      box-sizing: border-box;
      position: relative;
      color: #333333;
      font-size: toRpx(28);
      padding: toRpx(10);
      line-height: toRpx(40);
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
.block {
  width: 100%;
  height: toRpx(24);
}
</style>