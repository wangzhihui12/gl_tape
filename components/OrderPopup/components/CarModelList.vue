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
                <view class="brand-list">
                  <template v-for="(j, jindex) in c.childs_list">
                    <view
                      :key="jindex"
                      :class="[
                    {'sub-brand-name':j.isTitle},
                    {'item flex':!j.isTitle},
                    {active:checkActive(j) && !j.isTitle}
                    ]"
                      @click="choose(j,c)"
                    >
                      <view
                        class="sprite-icon icon-tag-checked"
                        v-if="!j.isTitle"
                      ></view>
                      {{j.name}}
                    </view>
                  </template>
                </view>
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
        data = await uni.$api.popupApi.getMerchantCarBrandList({
          merchantId: shopMerchantId
        })
      this.updateParams(params, data || [])
    },
    initData (carData) {
      let { params: { idKey }, data: { customer, carInfo }, sceneType } = this,
        letterList = Array.from(new Set([...carData.map((e) => e.letter)])),
        carModelList = letterList.map(e => {
          let list = []
          carData.map(i => {
            if (e === i.letter) {
              let c_list = []
              i.childs.map(c => {
                if (c.childs) {
                  c.childs.map((s) => {
                    s.carChildsBrandId = c.id;
                    s.carChildsBrandName = c.name;
                    if (sceneType == 1) {
                      if (customer && customer[idKey]) {
                        if (s.id == customer[idKey]) {
                          s.active = true;
                          this.letter = i.letter;
                          this.choose(s, c)
                        }
                      }
                    } else {
                      if (carInfo && carInfo[idKey]) {
                        if (s.id == carInfo[idKey]) {
                          s.active = true;
                          this.letter = i.letter;
                          this.choose(s, c)
                        }
                      }
                    }
                  });
                  let carSecondInfo = {
                    carChildsBrandId: c.id,
                    carChildsBrandName: c.name,
                    name: c.name,
                    isTitle: true,
                  };
                  c_list = [...c_list, carSecondInfo, ...c.childs];
                }
              })
              i.childs_list = c_list;
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
    choose (that, item) {
      if (that.isTitle) return
      let chooseItem = {
        carBrandId: item.id,
        carBrand: item.name,
        carChildsBrandId: that.carChildsBrandId,
        carChildsBrandName: that.carChildsBrandName,
        carSeriesId: that.id,
        carSeriesName: that.name,
      }
      this.currentId = that.id
      this.$emit('choose', chooseItem)
    },
    checkActive (j) {
      let { currentId, data, params, sceneType } = this
      return (currentId ?
        j.id == currentId :
        sceneType == 0 ? j.id == data.carInfo[params.idKey] || '' :
          (j.id == (data.customer ? data.customer[params.idKey] : '') || j.id == data[params.idKey]))
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
        color: #333333;
        font-size: toRpx(32);
        line-height: toRpx(44);
        margin: toRpx(16) 0;
      }
      .sub-brand-name {
        color: #888888;
        font-size: toRpx(28);
        line-height: toRpx(40);
        width: 100%;
        flex-shrink: 0;
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
    .item {
      width: calc((100% - #{toRpx(96)}) / 4);
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
}
</style>