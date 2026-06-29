export default {
  watch: {
    id: {
      immediate: true,
      handler (key) {
        try {
          if (!key || this.type == 'preview') return
          let { useCarConfig, moduleList, media } = this,
            array = useCarConfig ? moduleList : media
          let item = array.find(e => e.id == key),
            // value = this.receptionTrack[key]
            value = this.receptionTrack[key] ? { ...this.receptionTrack[key] } : null
          if (value) {
            value.openCount += 1
            value.entryTime = Date.now()
          } else {
            value = {
              openCount: 1,
              materialName: item.detailTitle || '',
              materialId: item.id,
              stayDuration: 0,
              entryTime: Date.now()
            }
          }
          this.$store.dispatch("setReceptionTrack", { key, value })
        } catch (error) {
          console.log(error)
        }
      }
    }
  },
  computed: {
    receptionTrack () {
      return this.$store.state.user.receptionTrack
    }
  },
  methods: {
    receptionTrackLeave (keyName = 'id') {
      if (this.type == 'preview') return
      let key = this[keyName],
      //   value = this.receptionTrack[key]
      // value.stayDuration += Number(Date.now() - value.entryTime)
      // this.$store.dispatch("setReceptionTrack", { key, value })
        value = this.receptionTrack[key] ? { ...this.receptionTrack[key] } : null
      if (value) {
        value.stayDuration += Number(Date.now() - value.entryTime)
        this.$store.dispatch("setReceptionTrack", { key, value })
      }
      if (keyName == 'id' && key == 1) { //轻改才会触发
        let [receptionRef] = this.$refs.media1
        receptionRef.previewLeave && receptionRef.previewLeave(receptionRef.currentItem)
      }
    }
  }
}