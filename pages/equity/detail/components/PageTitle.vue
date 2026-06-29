<template>
  <view class="page-title-box flex">
    {{title}}
    <view
      class="car-options flex"
      v-if="hasCarBrand"
      @click="$refs.carBrandListVisible.open()"
    >
      {{customerInfo.carModel||'请选择'}}
      <view class="sprite-icon icon-arrow-bottom"></view>
    </view>
    <car-brands
      ref="carBrandListVisible"
      @select="handleSelect($event)"
    />
  </view>
</template>

<script type='text/ecmascript-6'>
import CarBrands from '@/components/CarBrands.vue'
export default {
  components: { CarBrands },
  name: 'PageTitle',
  props: {
    title: String,
    hasCarBrand: Boolean,
    show: Boolean
  },
  data () {
    return {
      customerInfo: {}
    }

  },
  watch: {
    show: {
      immediate: true,
      handler (newval) {
        setTimeout(() => {
          if (newval && this.hasCarBrand && !this.customerInfo.carModel && this.isAito) this.$refs.carBrandListVisible.autoSelect()
        }, 1e3)
      }
    },
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        if (newval) this.customerInfo = newval
      }
    },
  },
  computed: {
    watchCustomerInfo () {
      return this.$store.state.user.customerInfo
    },
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    isAito () {
      //  1问界 
      return uni.$storage.get('userInfo').channelType == 1
    }
  },
  mounted () {
  },
  methods: {
    handleSelect (item) {
      this.$refs.carBrandListVisible.close()
      this.customerInfo.carModel = item.name
      this.customerInfo.carModelId = item.id
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
    },
  }
}
</script>

<style scoped lang='scss'>
.page-title-box {
  justify-content: center;
  position: absolute;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  font-weight: 500;
  font-size: toRpx(36);
  color: #333;
  text-align: center;
  width: 100%;
  z-index: 2;
  .car-options {
    &::before {
      content: '';
      width: toRpx(2);
      height: toRpx(36);
      opacity: 1;
      background: #333333;
      margin: 0 toRpx(24);
    }
  }
}
</style>