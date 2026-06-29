<template>
  <view class="sku-content">
    <view :class="['first-type-box flex',firstClass(list)]">
      <view :class="['block',blockClass]"></view>
      <template v-for="(i,index) in list">
        <view
          :class="['first-type-item flex',{active:i.tabId == tabId}]"
          :key="index"
          @click="changeTabId(i.tabId,index)"
        >
          <view :class="['sprite-icon',`icon-${i.icon}`]"></view>
          {{i.tabName}}
        </view>
      </template>
    </view>
    <scroll-view
      class="second-type-scroll"
      scroll-x
      enable-flex
    >
      <view class="second-type-box flex">
        <template v-for="(i,index) in secondList">
          <view
            :class="['second-type-item flex',secondIndex == index ? 'active' : '']"
            :key="index"
            @click="secondClick(index)"
          >{{i.category}}</view>
        </template>
        <view class="padding-right"></view>
      </view>
    </scroll-view>
    <template v-if="tabId == 2 && secondName == '窗膜'">
      <view class="sub-title">品牌</view>
      <scroll-view
        class="thirdly-type-scroll"
        scroll-x
        enable-flex
      >
        <view class="thirdly-type-box flex">
          <template v-for="(i,index) in brandList">
            <view
              :class="['thirdly-type-item flex',thirdlyIndex == index ? 'active' : '']"
              :key="index"
              @click="thirdlyClick(index)"
            >{{i.brandName}}</view>
          </template>
          <view class="padding-right"></view>
        </view>
      </scroll-view>
      <view class="sub-title">部位</view>
    </template>
    <template v-if="flagObject.goodsFlag">
      <template v-if="goodsList.length">
        <scroll-view
          scroll-y
          class="content-scroll-box"
          id="content-scroll"
          :style="{height:contentHeight}"
          :scroll-top="flagObject.scrollTop"
        >
          <template v-for="(i,index) in goodsList">
            <view
              :class="['goods-item',goodsIndex == index ? 'active' : '']"
              :key="index"
              @click="changeGoods(i,index)"
            >
              <view class="goods-title">{{i.name}}</view>
              <view class="goods-description">
                <rich-text :nodes="i.descriptionText"></rich-text>
              </view>
            </view>
          </template>
        </scroll-view>
      </template>
      <template v-else>
        <view class="nothing flex">
          <view class="nothing-icon"></view>
          暂无产品内容
        </view>
      </template>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'SkuBox',
  props: {
    defaultTabId: Number,
    currentCar: [Number,String],
    show: Boolean
  },

  data () {
    return {
      tabId: '1',
      blockIndex: 0,
      secondIndex: 0,
      thirdlyIndex: 0,
      goodsIndex: 0,
      contentHeight: '0',
      currentItem: {},
      goodsList: [],
      requested: false,
      flagObject: {
        goodsFlag: false,
        scrollTop: 0
      },
      secondList: [],
      secondName: ''
    }
  },
  watch: {
    defaultTabId: {
      immediate: true,
      handler (newval) {
        if (this.show) this.tabId = newval
      }
    },
    /**切换车型 */
    currentCar: {
      immediate: true,
      handler (newval) {
        if (this.show && this.requested) this.changeCar(newval)
      }
    },
    show: {
      immediate: true,
      handler (newval) {
        if (newval && !this.requested) {
          this.requested = true
          this.init(this.defaultTabId)
        }
      }
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.tabId = '1'
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus;
    },
    blockClass () {
      return ['block-0', 'block-1', 'block-2'][this.blockIndex]
    },
    boutiqueMediaConfig () {
      return this.$store.state.user.boutiqueMediaConfig
    },
    list(){
      let item = this.boutiqueMediaConfig[this.currentCar]
      return item?.retrofitting || []
    }
  },
  mounted () {
  },
  methods: {
    changeCar (newval) {
      let [item] = this.boutiqueMediaConfig[newval].retrofitting
      this.changeTabId(item.tabId, 0, false)
    },
    init (tabId) {
      let index = this.boutiqueMediaConfig[this.currentCar].retrofitting.findIndex(e => e.tabId == tabId)
      this.changeTabId(tabId, index, false)
    },
    changeTabId (tabId, index, filter = true) {
      if (filter && tabId == this.tabId && index == this.blockIndex) return
      this.tabId = tabId
      this.blockIndex = index
      this.setSecondList()
    },
    async setSecondList () {
      let secondList = this.boutiqueMediaConfig[this.currentCar].retrofitting,
        index = secondList.findIndex(e => e.tabId == this.tabId)
      if (index == -1) index = 0
      let { list } = secondList[index]
      this.secondList = list
      this.secondClick(0, false)
    },
    setScrollHeight () {
      this.$nextTick(() => {
        let query = uni.createSelectorQuery()
        query.select(`#content-scroll`).boundingClientRect(data => {
          this.contentHeight = `calc(100% - ${data.top - 72}px)`
          this.flagObject.scrollTop = 0
        }).exec()
      })
    },
    secondClick (index, filter = true) {
      if (filter && this.secondIndex == index) return
      let { secondList } = this
      this.secondIndex = index
      this.secondName = secondList[index].category
      if (this.tabId == 2 && this.secondName == '窗膜') {
        let { infoList } = this.secondList[index],
          arr = Array.from(new Set([...infoList.map((e) => e.brand)])),
          brandList = []
        arr.map(e => {
          let obj = {
            brandName: e,
            list: []
          }
          infoList.map(i => {
            if (i.brand == e) obj.list.push(i)
          })
          brandList.push(obj)
        })
        this.brandList = brandList
        this.thirdlyClick(0, false)
      } else this.getGoodsList()
    },
    thirdlyClick (index, filter = true) {
      if (filter && this.thirdlyIndex == index) return
      this.thirdlyIndex = index
      this.getGoodsList()
    },
    changeGoods (item, index, filter = true) {
      if (filter && this.goodsIndex == index) return
      this.goodsIndex = index
      this.currentItem = item
      this.changePreView()
    },
    getGoodsList () {
      this.goodsList = []
      this.flagObject.goodsFlag = false
      let { secondIndex, secondList, tabId, brandList, thirdlyIndex, secondName } = this
      let goodsList = this.setGoodsData(tabId == 2 && secondName == '窗膜' ? brandList[thirdlyIndex].list : secondList[secondIndex].infoList)
      this.goodsList = goodsList
      this.flagObject.goodsFlag = true
      this.flagObject.scrollTop = -100
      this.changeGoods(goodsList[0], 0, false)
      setTimeout(() => {
        this.setScrollHeight()
      }, 500)
    },
    changePreView () {
      this.$emit('changePreView', this.currentItem)
    },
    setGoodsData (data, key) {
      let goodsList = []
      data.map(e => {
        if (e.description) e.descriptionText = e.description.replace(/<\/?br\s*\/?>|\\n|\n/g, '<br>')
        goodsList.push(e)
      })
      return goodsList
    },
    firstClass (list = []) {
      return list.length == 2 ? 'two-block' : ''
    }
  }
}
</script>

<style scoped lang='scss'>
.sku-content {
  width: 100%;
  height: 100%;
  .padding-right {
    height: toRpx(80);
    width: toRpx(40);
    flex-shrink: 0;
  }
  .first-type-box {
    width: calc(100% - #{toRpx(64)});
    height: toRpx(176);
    background: #f2f2f2;
    border-radius: toRpx(24);
    box-sizing: border-box;
    border: toRpx(8) solid #f2f2f2;
    position: relative;
    .first-type-item {
      width: toRpx(280);
      height: toRpx(160);
      border-radius: toRpx(24);
      flex-direction: column;
      justify-content: center;
      font-weight: 500;
      font-size: toRpx(36);
      color: #333333;
      line-height: toRpx(44);
      position: relative;
      z-index: 2;
      opacity: 0.7;
      .sprite-icon {
        margin-bottom: toRpx(12);
        transform: scale(1.45);
      }
    }
    .active {
      opacity: 1;
    }
    .block {
      width: toRpx(280);
      height: toRpx(160);
      border-radius: toRpx(24);
      background: #ffffff;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      transition: all 0.15s;
    }
    .block-0 {
      left: 0;
    }
    .block-1 {
      left: toRpx(280);
    }
    .block-2 {
      left: toRpx(560);
    }
  }
  .two-block {
    .first-type-item,
    .block {
      width: toRpx(420);
    }
    .block-0 {
      left: 0;
    }
    .block-1 {
      left: toRpx(420);
    }
  }
  .second-type-scroll {
    width: 100%;
    animation: show-view-opacity 0.15s forwards;
    .second-type-box {
      width: 100%;
      gap: toRpx(24);
      flex-wrap: nowrap;
      padding: toRpx(32) 0 toRpx(24);
      .second-type-item {
        width: fit-content;
        flex-shrink: 0;
        height: toRpx(80);
        background: #f2f2f2;
        border-radius: toRpx(16);
        font-size: toRpx(28);
        color: #666666;
        line-height: toRpx(44);
        padding: 0 toRpx(32);
        justify-content: center;
        transition: all 0.15s;
      }
      .active {
        background: #2d66f71a;
        font-weight: 500;
        color: #2d66f7;
      }
    }
  }
  .thirdly-type-scroll {
    width: 100%;
    animation: show-view-opacity 0.15s forwards;
    .thirdly-type-box {
      width: 100%;

      gap: toRpx(24);
      flex-wrap: nowrap;
      padding-bottom: toRpx(24);
      .thirdly-type-item {
        flex-shrink: 0;
        height: toRpx(80);
        border: toRpx(3) solid #33333333;
        border-radius: toRpx(16);
        font-size: toRpx(28);
        color: #666666;
        line-height: toRpx(36);
        padding: 0 toRpx(32);
        justify-content: center;
        transition: all 0.15s;
      }
      .active {
        font-weight: 500;
        color: #333333;
        border-color: #333333;
      }
    }
  }
  .sub-title {
    font-size: toRpx(24);
    color: #999999;
    line-height: toRpx(36);
    padding-bottom: toRpx(16);
  }
  .content-scroll-box {
    .goods-item {
      width: calc(100% - #{toRpx(64)});
      border: toRpx(3) solid #33333333;
      border-radius: toRpx(16);
      padding: toRpx(24) toRpx(32);
      margin-bottom: toRpx(24);
      transition: all 0.15s;
      .goods-title {
        font-weight: 500;
        font-size: toRpx(28);
        color: #333333;
        line-height: toRpx(44);
      }
      .goods-description {
        margin-top: toRpx(8);
        font-size: toRpx(24);
        color: #666666;
        line-height: toRpx(36);
        max-height: toRpx(144);
        overflow: hidden;
      }
    }
    .active {
      border-color: #333;
      .goods-description {
        max-height: none;
        overflow: auto;
      }
    }
  }
  .nothing {
    flex-direction: column;
    padding-top: toRpx(136);
    font-size: toRpx(28);
    color: #999999;
    line-height: toRpx(40);
    &-icon {
      width: toRpx(676);
      height: toRpx(284);
      margin-bottom: toRpx(24);
      background-image: url('@/assets/images/boutique/nothing.webp');
      background-size: 100%;
    }
  }
}

</style>