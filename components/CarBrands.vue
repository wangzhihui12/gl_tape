<template>
  <view>
    <MessageBox
      ref="carBrandListVisible"
      position="bottom"
      :isFooter="false"
      title="请选择车品牌"
      @close="clickClose"
    >
      <view class="select-box">
        <view
          class="select-item"
          :class="{ checked: carBrand == item.name }"
          @click="selectCar(item)"
          v-for="(item, index) in carBrandList"
          :key="index"
        >
          {{ item.name }}
        </view>
      </view>
    </MessageBox>
    <MessageBox
      ref="carBoxVisible"
      position="bottom"
      :isFooter="false"
      title="请选择车系"
      :maxHeight="1000"
      back
      @close="closeCarBoxVisible"
    >
      <view class="select-box">
        <view
          class="select-item"
          :class="{ checked: carModel == item.name }"
          @click="handleSelect(item)"
          v-for="(item, index) in carlist"
          :key="index"
        >
          {{ item.name }}
        </view>
      </view>
    </MessageBox>
  </view>

</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CarBrands',
  props: {
    carBrandKey: {//品牌key
      type: String,
      default: 'carBrand'
    },
    carModelKey: {//车型key
      type: String,
      default: 'carModel'
    },
    echoData: {
      type: Object,
      default: () => ({})
    },
    customBoolean: Boolean,
    linkage: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      carlist: [],
      selectItem: {},
      clickFlga: false,
      carBrandListOff: false
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.close()
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    carModel () {
      return this.customBoolean ? this.echoData[this.carModelKey] : this.$store.state.user.customerInfo.carModel
    },
    carBrandList () {
      return this.$store.state.user.carBrands || []
    },
    carBrand () {
      return this.customBoolean ? this.echoData[this.carBrandKey] : this.$store.state.user.customerInfo.carBrand
    },
    boutiqueDefaultCarBrandId () {
      return this.$store.state.user.boutiqueDefaultCarBrandId
    },
    defaultCarId () {
      return this.$store.state.user.defaultCarId || ''
    }
  },
  mounted () {
  },
  methods: {
    autoSelect () {
      const { carBrandList, boutiqueDefaultCarBrandId, defaultCarId } = this
      let carIndex = 0
      if (boutiqueDefaultCarBrandId) carIndex = carBrandList.findIndex(e => e.id == boutiqueDefaultCarBrandId)
      if (carIndex < 0) carIndex = 0
      if (carBrandList.length) this.selectCar(carBrandList[carIndex], true, defaultCarId)
    },
    open () {
      this.$store.dispatch('setCarBrandOpenStatus', true)
      const userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo;
      /**获取品牌车型 */
      uni.$api.commonApi
        .getMerchantCarBrandList([shopMerchantId])
        .then(({ data }) => {
          let list = data[0].carBrandList,
            carBrandList = [];
          list?.map((e) => {
            e.childs.map((i) => {
              i.brandName = e.name
              i.brandId = e.id;
              carBrandList.push(i);
            });
          });
          this.$store.dispatch("setCarBrandsList", carBrandList);
          uni.$storage.set("carBrandList", carBrandList);
        })
      const { carBrand } = this
      if (carBrand) {
        const { carBrandList } = this,
          item = carBrandList.find(e => e.name == carBrand)
        if (item && carBrandList.length == 1) this.selectCar(item)
        else {
          this.$refs.carBrandListVisible.open()
          this.carBrandListOff = true
        }
        return
      }
      this.$refs.carBrandListVisible.open()
      this.carBrandListOff = true
    },
    selectCar (e, auto = false, carId) {
      if (!e.brandId || !e.id) return uni.showToast({
        title: "车型ID或品牌ID为空",
        icon: "none",
      });
      let { clickFlga } = this,
        index = 0
      if (clickFlga) return
      this.clickFlga = true
      this.selectItem = {
        carBrand: e.brandName,
        carBrandId: e.brandId,
        carChildsBrandName: e.name,
        carChildsBrandId: e.id
      }
      const carList = uni.getStorageSync(`${e.id}_${e.brandId}_carlist`)
      if (carList) {
        this.clickFlga = false
        this.carlist = carList
        if (auto && carList.length) {
          if (carId) index = carList.findIndex(i => i.id == carId)
          if (index < 0) index = 0
          this.handleSelect(carList[index])
        }
        else this.$refs.carBoxVisible.open()
      } else {
        if (!auto) uni.showLoading({
          mask: true
        })
      }
      uni.$api.commonApi.getCarBrandsList({
        brandId: e.brandId,
        childBrandId: e.id
      }).then(res => {
        uni.hideLoading()
        this.carlist = res
        if (res) uni.setStorageSync(`${e.id}_${e.brandId}_carlist`, res)
        if (!carList) {
          if (auto && res.length) {
            if (carId) index = res.findIndex(i => i.id == carId)
            if (index < 0) index = 0
            this.handleSelect(res[index])
          }
          else this.$refs.carBoxVisible.open()
        }
        this.clickFlga = false
      }).catch(err => {
        this.clickFlga = false
        uni.hideLoading()
      })

    },
    handleSelect (item) {
      const customerInfo = this.$store.state.user.customerInfo,
        { selectItem, linkage } = this
      Object.assign(customerInfo, {
        carBrand: selectItem.carChildsBrandName,
        carBrandId: selectItem.carChildsBrandId,
        oneCarBrand: selectItem.carBrand,
        oneCarBrandId: selectItem.carBrandId
      })
      uni.$logger.local.info(`选择车：
      carModel：${item.name},
      carModelId: ${item.id},
      carBrand：${customerInfo.carBrand},
      carBrandId：${customerInfo.carBrandId},
      oneCarBrand：${customerInfo.oneCarBrand},
      oneCarBrandId：${customerInfo.oneCarBrandId}`)
      if (linkage) {
        this.$store.dispatch('setCustomerInfo', customerInfo)
        this.$store.dispatch('updateViewKey')
        this.$store.dispatch('setCurrentCarInfo', selectItem)
      }
      this.$refs.carBoxVisible?.close();
      this.$store.dispatch('setCarBrandOpenStatus', false)
      this.$emit('select', {
        ...item,
        ...selectItem
      })
    },
    close () {
      this.$refs?.carBoxVisible?.close();
      this.$refs?.carBrandListVisible?.close()
      this.carBrandListOff = false
      this.$store.dispatch('setCarBrandOpenStatus', false)

    },
    closeCarBoxVisible () {
      if (this.carBrandListOff) return
      else this.$emit('close')
    },
    clickClose () {
      this.$store.dispatch('setCarBrandOpenStatus', false)
      this.$emit('close')
    },
  }
}
</script>

<style scoped lang='scss'>
.select-box {
  margin: toRpx(40) 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: toRpx(32);
  overflow-y: scroll;
  max-height: 50vh;
  padding-bottom: toRpx(60);
  .select-item {
    text-align: center;
    height: toRpx(68);
    line-height: toRpx(44);
    opacity: 1;
    border: toRpx(2) solid #dce0e6;
    color: #333;
    font-size: toRpx(32);
    border-radius: toRpx(8);
    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
</style>