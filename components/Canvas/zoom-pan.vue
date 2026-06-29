<template>
  <view>
    <movable-area
      class="container zoom-pan-container"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchEnd="handleTouchEnd"
    >
      <movable-view
        class="content"
        :style="{'transform-origin': transformOriginStyle}"
        :scale="!disabled"
        :direction="scale == 1?'none':'all'"
        :scale-min="scaleMin"
        :scale-max="scaleMax"
        :disabled="disabled"
        @scale="onScale"
        :scale-value="defalutscale"
      >
        <slot name="content"></slot>
      </movable-view>
    </movable-area>
  </view>

</template>

<script>
import utils from "@/utils/utils.js";

export default {
  props: {
    disabled: Boolean,
    scaleMax: {
      type: Number,
      default: 10
    },
    scaleMin: {
      type: Number,
      default: 1
    },
  },
  data () {
    return {
      scale: 1,
      defalutscale: 1,
      isScaling: false,
      transformOriginStyle: '50% 50%'
    };
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        if (this.scale != 1) this.defalutscale = 1.1
        this.scale = 1
        this.transformOriginStyle = `50% 50%'`
        setTimeout(() => {
          this.defalutscale = 1
        }, 100)
      }
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    }
  },
  methods: {
    handleTouchStart (e) {
      if (this.disabled) return
      if (e.touches.length === 2) this.isScaling = true;
    },
    handleTouchMove: utils.throttle(function (e) {
      if (this.disabled) return
      if (this.isScaling && e.touches.length === 2) {
        const center = this.getTouchCenter(e.touches)
        this.transformOriginStyle = `${center.x}px ${center.y}px`;
      }
    }, 16),
    handleTouchEnd () {
      this.isScaling = false
    },
    onScale (e) {
      this.scale = e.detail.scale
      this.$emit('scale', e.detail)
    },

    getTouchCenter (touches) {
      const centerX = (touches[0].pageX + touches[1].pageX) / 2;
      const centerY = (touches[0].pageY + touches[1].pageY) / 2;
      return { x: centerX, y: centerY };
    },
  },
};
</script>

<style>
.zoom-pan-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.content {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.disabled {
  pointer-events: none;
}
</style>