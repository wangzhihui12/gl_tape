<template>
  <MessageBox
    ref="carBuyersVisible"
    position="bottom"
    :isFooter="false"
    :title="`请选择${title}`"
    :maxHeight="1000"
    @close="$emit('close')"
  >
    <view class="select-box">
      <view
        class="select-item"
        :class="{ checked: carBuyers == item.name }"
        @click="handleSelect(item)"
        v-for="(item, index) in carBuyersList"
        :key="index"
      >
        {{ item.name }}
      </view>
    </view>
  </MessageBox>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'carBuyers',
  props: {
    title: {
      type: String,
      default: '购车方式'
    },
    salesPropsUuid: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      carBuyersList: [
        {
          name: '全款',
          id: 1
        },
        {
          name: '按揭',
          id: 2
        }
      ]
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
    carBuyers () {
      return this.$store.state.user.customerInfo.carBuyers
    },
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.carBuyersVisible.open()
    },
    handleSelect (item) {
      this.close();
      this.$emit('select', item)
    },
    close () {
      this.$refs?.carBuyersVisible?.close()
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
