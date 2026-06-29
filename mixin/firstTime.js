export default {
  data() {
    return {
      times: 0,
      interval: null
    }
  },
  mounted() {
    this.start()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    handleTouch() {
      this.times = 0
    },
    close() {
      this.back()
      this.$store.dispatch('setTab', 0)
    },
    start() {
      this.interval = setInterval(() => {
        this.times++
        if (this.times == 60) {
          this.close()
          clearInterval(this.interval)
        }
      }, 1000)
    }
  }
}
