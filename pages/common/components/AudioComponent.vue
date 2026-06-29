<template>
  <view class="audio-box flex">
    <view
      :class="['sprite-icon',`${paused? 'icon-play' : 'icon-pause'}`]"
      @click="play"
    ></view>
    <slider
      @change="sliderChange"
      backgroundColor="#D8D8D8"
      block-color="#2C66F7"
      block-size="5"
      class="progress-box"
      :max="innerAudioContext[audioKey].duration||10"
      :value="innerAudioContext[audioKey].currentTime||0"
    />
    <view class="duration">{{currentTime}}/{{duration}}</view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'AudioComponent',
  props: {
    src: String,
    auto: Boolean,
    audioKey: String
  },
  data () {
    return {
      innerAudioContext: {},
      currentTime: '00:00',
      duration: '00:00',
      paused: true,
      progress: ''
    }
  },
  watch: {
    src: {
      immediate: true,
      handler (newval) {
        if (newval) this.init(newval)
      }
    },
  },
  computed: {
  },
  destroyed () {
    this.innerAudioContext[this.audioKey].destroy()
  },
  mounted () {
  },
  methods: {
    init (src) {
      const innerAudioContext = uni.createInnerAudioContext(),
        { audioKey } = this
      innerAudioContext.src = src
      innerAudioContext.sessionCategory = 'soloAmbient'
      innerAudioContext.onCanplay(this.onCanplay)
      innerAudioContext.onPlay(() => this.paused = false)
      innerAudioContext.onPause(() => this.paused = true)
      innerAudioContext.onTimeUpdate(this.onTimeUpdate)
      this.innerAudioContext[audioKey] = innerAudioContext
    },
    onCanplay () {
      this.duration = this.formatTime(this.innerAudioContext[this.audioKey].duration)
    },
    onTimeUpdate () {
      const {
        duration,
        currentTime
      } = this.innerAudioContext[this.audioKey],
        mergedOffset = Math.ceil(currentTime)
      this.progress = mergedOffset / duration * 100
      this.currentTime = this.formatTime(currentTime)
    },
    formatTime (num) {
      num = Math.floor(num);
      let minutes = Math.floor(num / 60) || '0',
        seconds = num % 60 || '0'
      seconds = seconds < 10 ? `0${seconds}` : seconds
      return `${minutes}:${seconds}`
    },
    play () {
      if (this.paused) {
        if (this.auto) this.innerAudioContext[this.audioKey].play()
        this.$emit('onPlay')
      }
      else this.innerAudioContext[this.audioKey].pause()
    },
    stop () {
      this.currentTime = '00:00'
      this.innerAudioContext[this.audioKey].stop()
    },
    seek (e) {
      let query = uni.createSelectorQuery()
      query.select('.progress-box').boundingClientRect(data => {
        const seconds = (e.changedTouches[0].clientX - data.left) / data.width * this.innerAudioContext[this.audioKey].duration
        this.innerAudioContext[this.audioKey].seek(seconds)
      }).exec()
    },
    sliderChange (e) {
      this.innerAudioContext[this.audioKey].seek(e.detail.value)
    }
  }
}
</script>

<style scoped lang='scss'>
.audio-box {
  width: toRpx(1120);
  height: toRpx(80);
  background-image: url('@/assets/images/common/audio-bg.webp');
  background-size: 100%;
  margin-bottom: toRpx(24);
  box-sizing: border-box;
  padding: 0 toRpx(32);
  font-size: toRpx(28);
  color: #333333;
  .sprite-icon {
    margin-right: toRpx(16);
  }
  .progress-box {
    width: toRpx(796);
    margin: 0 !important;
    /deep/.uni-slider-track {
      background-image: linear-gradient(90deg, #2c66f7 0%, #75bcff 100%);
    }
    /deep/.uni-slider-thumb {
      &::after {
        width: toRpx(14);
        height: toRpx(14);
        border: toRpx(2) solid #f4f4f4;
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 100%;
        box-sizing: border-box;
      }
    }
  }
  .duration {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>