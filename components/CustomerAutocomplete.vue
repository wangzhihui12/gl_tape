<template>
  <view :class="['customer-box',{'is-show':showCustomerBox}]">
    <view class="customer-title">客户档案的记录</view>
    <scroll-view
      scroll-y
      class="scroll-box"
    >
      <template v-if="loading">
        <view class="loading flex">
          <uni-icons
            type="refreshempty"
            :size="46"
            color="#3773F8"
            class="icon"
          ></uni-icons>
        </view>
      </template>
      <template v-else>
        <template v-if="searchList.length">

          <template v-for="(i,index) in searchList">
            <view
              class="item flex"
              :key="index"
              hover-class="active"
              @click="$emit('choose',i)"
            >
              {{ `${showType == 'tel'?i.ownerPhone:i.ownerName}`}}
            </view>
          </template>
        </template>
        <template v-else>
          <view class="nothing flex">
            <view class="icon"></view>
            未匹配到客户信息
          </view>
        </template>
      </template>
    </scroll-view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CustomerAutocomplete',
  props: {
    searchValue: String,
    showType: String,
    show: Boolean
  },
  data () {
    return {
      loading: true,
      searchList: []
    }
  },
  watch: {
    showCustomerBox: {
      immediate: true,
      handler (newval) {
        if (newval) this.getCustomerInfoList(this.searchValue, this.showType)
      }
    }
  },
  computed: {
    showCustomerBox () {
      return this.show && this.haveCustomerAccess && this.searchValue
    },
    haveCustomerAccess () {
      return this.$store.state.user.haveCustomerAccess
    }
  },
  mounted () {
  },
  methods: {
    async getCustomerInfoList (val, type) {
      try {
        this.loading = true
        const { shopMerchantId, sceneType } = uni.$storage.get("userInfo"),
          params = {
            merchantId: shopMerchantId,
            bussinessScene: sceneType == 0 ? 1 : 2 // 1.延保 2.轻改
          }
        if (type == 'tel') params.ownerPhone = val
        else params.ownerName = val
        this.searchList = await uni.$api.customerApi.getCustomerInfoList(params)
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.customer-box {
  position: absolute;
  left: 0;
  top: toRpx(88);
  width: 100%;
  height: toRpx(352);
  background: #ffffff;
  border-radius: toRpx(16);
  z-index: -1;
  opacity: 0;
  .customer-title {
    font-size: toRpx(24);
    color: #999999;
    line-height: toRpx(40);
    padding: toRpx(16) toRpx(24) toRpx(8);
  }
  .scroll-box {
    height: calc(100% - #{toRpx(64)});
    .loading {
      width: 100%;
      height: 100%;
      justify-content: center;
      .icon {
        animation: rotate-loading 1s linear infinite;
      }
    }
    .nothing {
      width: 100%;
      height: 100%;
      font-size: toRpx(24);
      color: #c7ccd7;
      flex-direction: column;
      
      .icon {
        margin-top: toRpx(52);
        width: toRpx(96);
        height: toRpx(96);
        background-image: url('@/assets/images/common/nothing.webp');
        background-size: 100%;
      }
    }
    .item {
      width: 100%;
      height: toRpx(48);
      font-size: toRpx(28);
      color: #333333;
      line-height: toRpx(40);
      padding-left: toRpx(24);
      margin-bottom: toRpx(8);
    }
    .active {
      background: #ecf1ff;
    }
    @keyframes rotate-loading {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
.is-show {
  z-index: 1;
  opacity: 1;
}
</style>