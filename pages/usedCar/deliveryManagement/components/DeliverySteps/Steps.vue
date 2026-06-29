<template>
  <view class="steps-box flex common-title">
    <template v-for="(item, index) in list">
      <view
        :class="['step-item flex',{
          'active-item': index <= stepNum
        }]"
        :key="index"
      >
        <template v-if="index != 0">
          <view class="line"></view>
        </template>
        <view class="serial-num flex">
          <view class="num flex">
            <template v-if="index >= stepNum">
              {{index + 1}}
            </template>
            <template v-if="index < stepNum">
              <uni-icons
                type="checkmarkempty"
                :size="12"
                color="#fff"
              ></uni-icons>
            </template>
          </view>
        </view>
        {{item}}
      </view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    step: [String, Number],
    list: Array
  },
  name: '',
  data () {
    return {
    }
  },
  computed: {
    stepNum () {
      return this.step - 1
    }
  },
  mounted () {
  },

  methods: {
  }
}
</script>

<style scoped lang='scss'>
.steps-box {
  padding: toRpx(40) 0 toRpx(24) toRpx(54);
  margin-bottom: toRpx(8);
  .step-item {
    color: #999;
    font-size: toRpx(32);
    font-weight: 500;
    height: toRpx(56);
    .serial-num {
      width: toRpx(46);
      height: toRpx(46);
      border-radius: 100%;
      box-sizing: border-box;
      margin-right: toRpx(12);
      position: relative;
      border: toRpx(3) solid #b1b1b1;
      justify-content: center;
      .num {
        width: 100%;
        height: 100%;
        border: toRpx(3) solid #fff;
        background: #b1b1b1;
        color: #fff;
        border-radius: 100%;
        justify-content: center;
        font-size: toRpx(28);
        font-weight: 700;
      }
    }
    .line {
      width: toRpx(64);
      border-top: toRpx(2) dashed #d6d6d6;
      border-bottom: toRpx(2) dashed #d6d6d6;
      margin: 0 toRpx(32);
    }
  }
  .active-item {
    color: #4673ff;
    .serial-num {
      border-color: #4673ff;
      box-shadow: toRpx(3) toRpx(3) toRpx(4) #d7e3ff;
      .num {
        background: #4673ff;
      }
    }
    .line {
      border-color: #4673ff;
    }
  }
}
</style>