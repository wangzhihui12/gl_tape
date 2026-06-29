<template>
  <MessageBox ref="employeeBoxVisible" position="bottom" :isFooter="false" :title="`请选择${title}`" :maxHeight="1000" @close="$emit('close')">
    <view class="select-box">
      <view class="select-item" :class="{ checked: salesUuid == item.uuid }" @click="handleSelect(item)" v-for="(item, index) in employeeList" :key="index">
        {{ item.staffName }}
      </view>
    </view>
  </MessageBox>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'Employee',
  props: {
    title: {
      type: String,
      default: '销售'
    },
    salesPropsUuid: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
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
    salesUuid () {
      return this.$store.state.user.customerInfo.salesUuid || this.salesPropsUuid
    },
    employeeList () {
      return this.$store.state.user.employeeList
    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.employeeBoxVisible.open()
      const userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo;
      /**获取销售人员 */
      uni.$api.commonApi
        .getEmployeeList({
          merchantId: shopMerchantId,
        })
        .then((res) => {
          this.$store.dispatch("setEmployeeList", res);
          uni.$storage.set("employeeList", res || []);
        })
    },
    handleSelect (item) {
      this.close();
      this.$emit('select', item)
    },
    close () {
      this.$refs?.employeeBoxVisible?.close()
    }
  }
}
</script>

<style scoped lang="scss">
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
