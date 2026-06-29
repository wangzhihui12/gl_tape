<template>
  <MessageBox
    ref="packageVisible"
    position="bottom"
    :isFooter="false"
    title="请选择适用套餐"
    :maxHeight="1000"
    @close="$emit('close')"
  >
    <view class="search-box">
      <view class="search-input">
        <template v-if="!edit">
          <view
            :class="['input', `${searchValue ? '' : 'placeholder'}`]"
            @click="openInput"
          >
            <template v-if="searchValue">
              {{searchValue}}
            </template>
            <template v-else>
              请输入关键字搜索
              <view class="sprite-icon icon-search"></view>
            </template>
          </view>
        </template>
        <template v-else>
          <input
            type="text"
            class="input"
            v-model="searchValue"
            :focus='inputFocus'
            confirm-type="search"
            @confirm="search"
          />
        </template>
      </view>
      <template v-if="searchValue">
        <view
          class="clear"
          @click="clear"
        >
          <uni-icons
            type="closeempty"
            :size="16"
            color="#1A1A1A"
          ></uni-icons>
        </view>
      </template>
    </view>
    <view class="select-box">
      <view
        class="select-item"
        :class="{ checked: salesUuid == item.uuid }"
        @click="handleSelect(item)"
        v-for="(item, index) in employeeList"
        :key="index"
      >
        {{ item.staffName }}
      </view>
    </view>
  </MessageBox>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'Employee',
  props: {
  },
  data () {
    return {
      searchValue: '',
      edit: false,
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
      return this.$store.state.user.customerInfo.salesUuid
    },
    employeeList () {
      return this.$store.state.user.employeeList
    }
  },
  mounted () {
  },
  methods: {
    search () {
      this.edit = false
      console.log(this.searchValue)
    },
    openInput () {
      this.edit = true
      this.inputFocus = true
    },
    open () {
      this.$refs.packageVisible.open()
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
      this.$emit('close')
      this.$refs?.packageVisible?.close()
    },
    clear () {
      this.searchValue = ''
      this.search()
    }
  }
}
</script>

<style scoped lang='scss'>
.search-box {
  margin: toRpx(32) 0;
  position: relative;
  z-index: 2;
  .search-input {
    width: 100%;
    height: toRpx(80);
    background: #ffffff;
    border: toRpx(3) solid #a8c1ff;
    border-radius: toRpx(16);
    box-sizing: border-box;
    color: #333;
    padding: 0 toRpx(24);
    font-size: toRpx(28);
    position: relative;
    .input {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      justify-content: center;
      text-align: center;
      font-size: toRpx(28);
    }
    .icon-search {
      margin-left: toRpx(16);
    }
    .placeholder {
      font-size: toRpx(28);
      color: #999999;
    }
  }
  .clear {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    padding: 0 toRpx(32);
    height: 100%;
    display: flex;
    align-items: center;
  }
}
.select-box {
  margin: toRpx(32) 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: toRpx(32);
  overflow-y: scroll;
  max-height: 50vh;
  padding-bottom: toRpx(60);
  .select-item {
    text-align: center;
    height: toRpx(68);
    line-height: toRpx(68);
    opacity: 1;
    border: toRpx(2) solid #dce0e6;
    color: #292d33;
    font-size: toRpx(28);
    border-radius: toRpx(8);
    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
</style>