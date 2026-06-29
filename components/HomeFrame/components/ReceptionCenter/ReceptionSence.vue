<template>
  <MessageBox
    ref="receptionSceneVisible"
    position="bottom"
    :isFooter="false"
    title="请选择接待场景"
    :maxHeight="1000"
    @close="$emit('close')"
  >
    <view class="select-box">
      <view
        class="select-item"
        :class="{ checked: id == item.id }"
        @click="handleSelect(item)"
        v-for="(item, index) in list"
        :key="index"
      >
        {{ item.receptionSceneName }}
      </view>
    </view>
  </MessageBox>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'ReceptionSence',
  props: {
    customerInfo: Object
  },
  data () {
    return {
      list: [],
      id: ''
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.close()
      }
    },
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        this.id = newval.receptionScene
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    watchCustomerInfo () {
      return this.customerInfo
    },
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.receptionSceneVisible.open()
      const userInfo = uni.$storage.get("userInfo"),
        { sceneType } = userInfo;
      /**获取接待场景 */
      uni.$api.customerApi
        .findAllSence({
          scene: sceneType,
        })
        .then((res) => {
          this.list = res || []
        }).catch(err => {
          this.list = []
        })
    },
    handleSelect (item) {
      this.close();
      this.id = item.id
      this.$emit('select', item)
    },
    close () {
      this.$refs?.receptionSceneVisible?.close()
    }
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
    color: #292d33;
    font-size: toRpx(28);
    border-radius: toRpx(8);
    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
</style>