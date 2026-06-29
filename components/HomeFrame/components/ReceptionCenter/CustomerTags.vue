<template>
  <MessageBox
    ref="customerTagstVisible"
    position="bottom"
    :isFooter="false"
    :title="title"
    :maxHeight="1040"
    @close="$emit('close')"
  >
    <view class="select-views">
      <template v-for="(i,index) in list">
        <view
          class="select-group"
          :key="index"
        >
          <view class="select-title">{{ i.labelName }}</view>
          <view class="select-box">
            <view
              class="select-item flex"
              :class="{ checked: checkedItem(item) }"
              @click="handleSelect(item)"
              v-for="(item, ind) in i.nextList"
              :key="ind"
            >
              <view class="sprite-icon icon-tag-checked"></view>
              {{ item.labelName }}
            </view>
          </view>
        </view>
      </template>

    </view>
    <view class="footer-btns">
      <view
        class="btn cancel"
        @click="clearSwitch ? clear() : close()"
      >{{cancelText}}</view>
      <view
        :class="['btn',{disabled: disabled}]"
        @click="choose"
      >确定</view>
    </view>
  </MessageBox>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CustomerTags',
  props: {
    chooseList: Array,
    title: {
      type: String,
      default: '请选择客户标签'
    },
    disabledSwitch: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    clearSwitch: {
      type: Boolean,
      default: false
    },
    sceneNumber: {
      type: [Number, String],
      default: -1
    }
  },
  data () {
    return {
      list: [],
      component_chooseList: [],
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.close()
      }
    },
    chooseList: {
      immediate: true,
      handler (newval) {
        this.component_chooseList = JSON.parse(JSON.stringify(newval))
      }
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    disabled () {
      return this.disabledSwitch && this.component_chooseList.length == 0
    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.customerTagstVisible.open()
      const userInfo = uni.$storage.get("userInfo"),
        { sceneType } = userInfo,
        { sceneNumber } = this
      uni.$api.customerApi
        .findCustomerTags({
          scene: sceneNumber > -1 ? sceneNumber : sceneType,
        })
        .then((res) => {
          this.list = res || []
        })
    },
    handleSelect (item) {
      let { component_chooseList } = this,
        index = component_chooseList.findIndex(e => e.labelId == item.labelId)
      if (index == -1) component_chooseList.push(item)
      else component_chooseList.splice(index, 1)
      this.component_chooseList = component_chooseList
      this.$forceUpdate()
    },
    close () {
      this.$refs?.customerTagstVisible?.close()
    },
    checkedItem (item) {
      let { component_chooseList } = this
      return component_chooseList.findIndex(e => e.labelId == item.labelId) != -1
    },
    choose () {
      if (this.disabled) return
      this.$emit('select', this.component_chooseList)
      this.close();
    },
    clear () {
      this.component_chooseList = []
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang='scss'>
.select-views {
  overflow-y: scroll;
  max-height: 60vh;
  position: relative;
  padding-bottom: toRpx(128);
  .select-group {
    margin: toRpx(32) 0;
    .select-title {
      font-size: toRpx(28);
      color: #999999;
      margin-bottom: toRpx(10);
    }

    .select-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: toRpx(32);
      .select-item {
        text-align: center;
        justify-content: center;
        opacity: 1;
        border: toRpx(2) solid #dce0e6;
        color: #333;
        font-size: toRpx(32);
        border-radius: toRpx(8);
        position: relative;
        box-sizing: border-box;
        padding: toRpx(13) toRpx(40);
        word-break: break-all;
        line-height: toRpx(44);
        .sprite-icon {
          display: none;
          position: absolute;
          right: toMinusRpx(2);
          top: toMinusRpx(2);
        }
      }
      .checked {
        border: toRpx(2) solid #2c66f7;
        background: #ecf1ff;
        color: #2c66f7;
        .sprite-icon {
          display: block;
        }
      }
    }
  }
}
.footer-btns {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: toRpx(176);
  background: #ffffff;
  box-sizing: border-box;
  padding-top: toRpx(32);
  display: flex;
  justify-content: center;
  gap: 0 toRpx(34);
  .btn {
    width: toRpx(718);
    height: toRpx(80);
    background-image: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    border-radius: toRpx(48);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: toRpx(32);
    color: #ffffff;
  }
  .cancel {
    background: #dae9ff;
    color: #2c66f7;
  }
  .disabled {
    background-image: linear-gradient(0deg, #2c66f799 0%, #48a6ff99 100%);
  }
}
</style>