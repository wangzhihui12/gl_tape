<template>
  <view class="coupon-box">
    <template v-if="params.loadComplete">
      <template v-if="customerCouponList.length">
        <view class="item-box">
          <view class="coupon-title flex">客户拥有的券</view>
          <view class="coupon-list">
            <template v-for="(c,cindex) in customerCouponList">
              <view
                :key="cindex"
                :class="[
                    'item flex',
                    {active: currentId ? c.customerCouponCode == currentId : c.customerCouponCode == data[params.idKey]},
                    ]"
                @click="choose(c,true)"
              >
                <view class="sprite-icon icon-tag-checked"></view>
                {{c.couponName}}{{c.customerCouponCode}}
              </view>
            </template>
          </view>
        </view>
      </template>
      <template v-if="listData.length">
        <template v-for="(i, index) in listData">
          <view
            class="item-box"
            :key="index"
          >
            <view class="coupon-title flex">{{i.title}}</view>
            <view class="coupon-list">
              <template v-for="(c,cindex) in i.list">
                <view
                  :key="cindex"
                  :class="[
                    'item flex',
                    {active: currentId ? c.merchantCouponCode == currentId : c.merchantCouponCode == data[params.idKey]},
                    {disabled:checkDisabled(c) }
                    ]"
                  @click="choose(c)"
                >
                  <view class="sprite-icon icon-tag-checked"></view>
                  {{c.couponName}}{{c.merchantCouponCode}}
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
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'CouponList',
  data () {
    return {
      customerCouponList: []
    }
  },
  watch: {
    'data.customer.customerPhone': {
      handler (val) {
        if (val) this.getCustomerCouponList(val)
      },
      deep: true,
      immediate: true
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
      const { shopMerchantId, merchantId } = userInfo,
        data = await uni.$api.popupApi.getMerchantCouponList({
          merchantId: shopMerchantId,
          yqMerchantId: merchantId,
          orderByType: 9
        })
      this.updateParams(params, data || [])
    },
    initData (dataList) {
      let couponTypeList = Array.from(new Set([...dataList.map((e) => e.couponInfo.couponType)])),
        couponList = couponTypeList.map((e, index) => {
          let list = [];
          let title = "";
          dataList.map((i) => {
            i.merchantCouponCode = i.merchantCouponCode.split("-")[0];
            if (i.couponInfo.couponType == e) {
              list.push(i);
              title = i.couponInfo.couponTypeName;
            }
          });
          return {
            title,
            list,
          };
        })
      const { params: { idKey }, data, customerCouponList } = this
      this.$emit('onComplete')
      this.list = couponList
      if (data[idKey]) {
        this.currentId = data[idKey]
        let item = null,
          isCustomer = false
        couponList.map(e => {
          e.list.map(i => {
            if (i.merchantCouponCode == data[idKey]) item = i
          })
        })
        customerCouponList.map(i => {
          if (i.customerCouponCode == data[idKey]) {
            item = i
            isCustomer = true
          }
        })
        if (item) this.choose(item, isCustomer)
      }
    },
    async getCustomerCouponList (customerPhone) {
      const phoneRex = /^[1]([3-9])[0-9]{9}$/,
        { data: orderObj, params: { idKey } } = this,
        params = {
          customerPhone,
          statusList: [0, 1],
          usedFlag: "N",
        }
      if (phoneRex.test(customerPhone)) {
        const data = await uni.$api.popupApi.getCustomerCouponList(params)
        this.customerCouponList = data.filter((item) => {
          return (
            item.status != 1 ||
            (item.status == 1 && item.id == orderObj.customerCouponId)
          );
        })
        if (this.customerCouponList.length && !orderObj[idKey]) this.choose(this.customerCouponList[0], true, true)
      }
    },
    handleSearch (searchValue) {
      if (!searchValue) {
        this.searchStatus = false
      } else {
        searchValue = searchValue.toUpperCase()
        let { list } = this,
          couponList = JSON.parse(JSON.stringify(list))
        let arr = [];
        couponList.map((i) => {
          let list = [];
          i.list.map((s) => {
            let name = s.couponName.toUpperCase()
            if (name.indexOf(searchValue) != -1) {
              list.push(s);
            }
          });
          let title = i.title.toUpperCase()
          if (title.indexOf(searchValue) != -1 || list.length > 0) {
            i.list = list.length > 0 ? list : i.list;
            arr.push(i);
          }
        })
        this.searchList = arr
        this.searchStatus = true
      }
    },
    choose (item, isCustomer = false, autoSelect = false) {
      if (item.disabled) return
      let customerCouponCode = isCustomer ? item.customerCouponCode : item.merchantCouponCode,
        key = isCustomer ? 'customerCouponId' : 'merchantCouponId',
        chooseItem = {
          couponName: item.couponName,
          merchantId: item.merchantId,
          customerCouponCode,
          [key]: item.id
        }
      this.currentId = customerCouponCode
      this.$emit('choose', chooseItem)
      if (autoSelect) this.$emit('confirm', true)
    },
    checkDisabled (item) {
      let disabled = false,
        { customerCouponList } = this
      if (customerCouponList.length) {
        disabled = customerCouponList.some(i => i.merchantCoupon.id == item.id)
      }
      item.disabled = disabled
      return disabled
    }
  }
}
</script>

<style scoped lang='scss'>
.coupon-box {
  position: relative;
  height: 100%;
  width: 100%;
  .item-box {
    margin-bottom: toRpx(32);
    .coupon-title {
      color: #888888;
      font-size: toRpx(28);
      height: toRpx(40);
      background: #f5f7fa;
      padding-left: toRpx(48);
      margin-bottom: toRpx(16);
    }
  }
  .coupon-list {
    // display: grid;
    // grid-template-columns: repeat(4, 1fr);
    gap: toRpx(32);
    display: flex;
    // gap: toRpx(32) 0;
    flex-wrap: wrap;
    margin: 0 toRpx(48);
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
      padding: toRpx(14) toRpx(16);
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
</style>