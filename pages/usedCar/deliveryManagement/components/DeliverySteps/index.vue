<template>
  <view class="delivery-steps-box">
    <template v-if="detail.id">
      <steps
        :step="step"
        :list="stepList"
      />
    </template>
    <view class="step-component">
      <template v-for="(i,index) in stepList">
        <view
          :class="['step-view',
          {'animation-view': viewClass(index) && !viewComplete[index + 1]},
          {'show-view':index + 1 == step}]"
          :key="index"
        >
          <component
            :is="'Step' + (index + 1)"
            :step="step"
            @comfirm="comfirm"
            @openError="$emit('openError',$event)"
            :detail="detail"
            @refreshLog="$emit('refreshLog')"
          ></component>
        </view>
      </template>
    </view>

  </view>
</template>

<script type='text/ecmascript-6'>
import Steps from './Steps.vue'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
export default {
  components: {
    Steps,
    Step1,
    Step2,
    Step3
  },
  props: {
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  watch: {
    detail: {
      handler (val) {
        this.step = Number(val.orderStatus) + 1
      },
      deep: true
    }
  },
  name: '',
  data () {
    return {
      step: -1,
      stepList: [
        '待交付',
        '交付中',
        '交付完成'
      ],
      viewComplete: {
        1: false,
        2: false,
        3: false
      }
    }
  },
  mounted () {
  },
  methods: {
    comfirm (step) {
      const { id } = this.detail
      this.step = step + 1
      if (this.step == 3) this.$emit('refresh', id)
    },
    viewClass (index) {
      setTimeout(() => {
        this.viewComplete[this.step] = true
      }, 1e3)
      return index + 1 == this.step
    }
  }
}
</script>

<style scoped lang='scss'>
.delivery-steps-box {
  height: 100%;
  .step-component {
    height: calc(100% - #{toRpx(128)});
    overflow-y: auto;
    position: relative;
    .step-view {
      position: absolute; //验证
      width: 100%;
      height: 100%;
      z-index: -1;
      top: 0;
      left: 0;
      visibility: hidden;
    }
    .animation-view {
      position: absolute;
      z-index: 1;
      visibility: visible;
      animation: to-right 0.15s forwards;
    }
    .show-view {
      z-index: 1;
      visibility: visible;
    }
    @keyframes to-right {
      0% {
        left: 100%;
      }
      100% {
        left: 0;
      }
    }
  }
}
</style>