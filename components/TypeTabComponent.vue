<template>
  <view class="type-tab">
    <template v-if="!styleV2">
      <view class="type-box">
        <view
          class="tab-item"
          v-for="(i, index) in typeList"
          :key="index"
          @click="tabClick(index)"
        >
          <view
            :class="['sprite-icon',tabClass(index)]"
            :style="{
          left:blockLeft
        }"
          ></view>
          <view
            class="text"
            :class="[tabIndex == index ? `active` : '']"
          >
            {{ i[nameKey] }}
          </view>
        </view>
      </view>
      <view class="mask-box"></view>
    </template>
    <template v-else>

      <scroll-view
        scroll-x
        enable-flex
        class="scroll-box"
        :scroll-into-view="`tab-id-${tabIndex}`"
      >
        <view class="type-box-v2">
          <view
            :class="['tab-item',{active:tabIndex == index}]"
            v-for="(i, index) in typeList"
            :key="index"
            @click="tabClick(index)"
            :id="`tab-id-${index}`"
          >
            <template v-if="index == 0">
              <view class="sprite-icon icon-first-right"></view>
            </template>
            <template v-else>
              <view class="sprite-icon icon-second-left"></view>
              <view class="sprite-icon icon-second-right"></view>
            </template>
            <view class="text">
              {{ i[nameKey] }}
            </view>
          </view>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    typeList: Array,
    tabIndex: {
      type: Number,
      default: 0
    },
    nameKey: {
      type: String,
      default: 'tabName'
    },
    styleV2: {
      type: Boolean,
      default: false
    }
  },
  name: '',
  data () {
    return {
      firstClass: Object.freeze(['first-nav', 'second-nav']),
      viewIndex: ''
    }
  },
  computed: {
    blockLeft () {
      let { tabIndex } = this
      return `${(tabIndex * 400) - (tabIndex == 0 ? 0 : 48)}rpx`
    },
  },
  mounted () {
  },
  methods: {
    tabClass (index) {
      let className = ''
      if (this.tabIndex == index) {
        className = 'active icon-'
        if (index == 0) className += 'first-nav'
        else className += 'second-nav'
      }
      return className
    },
    tabClick (index) {
      if (this.tabIndex == index) return
      // this.viewIndex = `tab-id-${index}`
      // console.log(this.viewIndex)
      this.$emit('update:tabIndex', index)
      this.$emit('tabClick', index)
    }
  }
}
</script>

<style scoped lang='scss'>
.type-tab {
  position: relative;
  .type-box {
    position: relative;
    display: flex;
    width: 100%;
    background-color: #eef4fe;
    height: toRpx(160);
    line-height: toRpx(128);
    border-radius: toRpx(48) toRpx(48) 0 0;
    overflow: hidden;
    z-index: 0;
    .tab-item {
      width: toRpx(400);
      text-align: center;
      font-weight: 500;
      font-size: toRpx(40);
      color: #1f2133;
      .text {
        position: relative;
        text-align: center;
        width: toRpx(400);
      }
      .active {
        position: absolute;
        top: 0;
        z-index: -1;
        font-weight: 700;
        font-size: toRpx(40);
        color: #2c66f7;
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: toRpx(48);
          height: toRpx(8);
          background-color: #2c66f7;
          border-radius: toRpx(16);
        }
      }
      .sprite-icon {
        transition: left 0.15s;
      }
    }
  }
  .mask-box {
    position: absolute;
    height: 100vh;
    width: 100%;
    background: #fff;
    left: 0;
    top: toRpx(128);
    border-radius: toRpx(48);
    overflow: hidden;
  }
  .scroll-box {
    width: 100%;
  }
  .type-box-v2 {
    position: relative;
    display: flex;
    width: 100%;
    background-color: #eef4fe;
    height: toRpx(96);
    line-height: toRpx(96);
    border-radius: toRpx(48) toRpx(48) 0 0;
    z-index: 0;
    flex-wrap: nowrap;
    gap: 0 toRpx(80);
    .tab-item {
      padding: 0 toRpx(40);
      flex-shrink: 0;
      position: relative;
      background-color: #eef4fe;
      &:first-of-type {
        padding-left: toRpx(80);
      }
      .text {
        color: #292d33;
        font-size: toRpx(32);
        position: relative;
        z-index: 2;
      }
      .sprite-icon {
        position: absolute;
        display: none;
      }
    }
    .active {
      background: #fff;
      &:last-of-type {
        .icon-second-right {
          // display: none;
        }
      }
      .text {
        color: #3b73ff;
        font-weight: 500;
        transition: all 0.15s;
        position: relative;
        &::after {
          width: toRpx(40);
          height: toRpx(6);
          border-radius: toRpx(4);
          background: #3b73ff;
          position: absolute;
          content: '';
          left: 50%;
          transform: translateX(-50%);
          bottom: toRpx(12);
        }
      }
      .sprite-icon {
        display: block;
      }
      .icon-first-right {
        right: toMinusRpx(100);
      }
      .icon-second-left {
        left: toMinusRpx(100);
      }
      .icon-second-right {
        right: toMinusRpx(100);
        background-color: #eef4fe;
      }
    }
  }
}
</style>