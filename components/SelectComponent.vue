<template>
  <view :class="['select-box',{styleV2:styleV2},{'disabled':disabled}]">
    <view
      class="select"
      @click.stop="showPop"
    >
      {{selectValue}}
      <template v-if="!disabled">
        <view class="sprite-icon icon-arrow-bottom"></view>
      </template>
    </view>
    <view
      class="pop-box"
      v-if="isSelect"
    >
      <view
        v-for="(i,index) in selectList"
        :key="index"
        class="type-item flex"
        :class="index == selectIndex ? 'active' : ''"
        @click="chooseType(index, i)"
      >{{i[labelKey]}}</view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    selectList: Array,
    labelKey: {
      type: String,
      default: 'label'
    },
    styleV2: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    defaultValue: [String, Number],
    valueKey: {
      type: String,
      default: 'value'
    }
  },
  computed: {
    selectValue () {
      let { selectList, selectIndex, labelKey } = this
      if (selectIndex == -1) selectIndex = 0
      return selectList[selectIndex][labelKey]
    }
  },
  watch: {
    defaultValue: {
      immediate: true,
      deep: true,
      handler (n) {
        let { selectList, valueKey } = this,
          selectIndex = selectList.findIndex(e => e[valueKey] == n)
        if (selectIndex == -1) selectIndex = 0
        this.selectIndex = selectIndex
      }
    }
  },
  name: '',
  data () {
    return {
      selectIndex: 0,
      isSelect: false
    }
  },
  mounted () {
  },
  methods: {
    hideSelect () {
      this.isSelect = false
    },
    chooseType (index, item) {
      this.selectIndex = index
      this.isSelect = false
      this.$emit('chooseType', { item, index })
    },
    showPop () {
      if (this.disabled) return
      this.isSelect = !this.isSelect
    }
  }
}
</script>

<style scoped lang='scss'>
.select-box {
  position: relative;
  z-index: 5;
  .select {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: toRpx(84);
    border-radius: toRpx(16);
    opacity: 1;
    background: #f2f2f2;
    padding: 0 toRpx(24) 0 toRpx(40);
  }
  .arrow-bottom {
    width: toRpx(48);
    height: toRpx(48);
  }
  .pop-box {
    position: absolute;
    top: toRpx(100);
    left: 0;
    width: 100%;
    background: #ffffff;
    box-shadow: 0 0 toRpx(16) 0 #99999933;
    border-radius: toRpx(16);
    padding: toRpx(16) 0;
    text-align: center;
    animation: show-view-opacity 0.15s forwards;
    .type-item {
      padding: 0 toRpx(28);
      margin-bottom: toRpx(8);
      height: toRpx(84);
      justify-content: center;
      &:last-child {
        margin-bottom: 0;
      }
      &.active {
        background-color: #ecf1ff;
      }
    }
  }
}
.styleV2 {
  .select {
    height: toRpx(80);
    background: #3b73ff1a;
    color: #333333;
    font-size: toRpx(28);
    transition: all 0.15s;
  }
  .pop-box {
    font-size: toRpx(28);
    .type-item {
      height: toRpx(80);
    }
  }
}
.disabled {
  .select {
    padding: 0 toRpx(40);
  }
}
</style>