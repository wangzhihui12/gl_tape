<template>
  <image
    :src="imagePath"
    :mode="mode"
  />
</template>

<script>
import {
  systemApi
} from '../api/index'
import { IMG_URL } from '../utils/cache/constantData'
export default {
  props: {
    mode: {
      type: String,
      default: 'scaleToFill'
    },
    src: {
      type: null,
      default: ''
    },
  },
  name: 'GlsxImage',
  data () {
    return {
      isWebp: false,
      imagePath: ''
    }
  },
  watch: {
    src (n) {
      if (n) this.init(n)
    }
  },
  async mounted () {
    if (this.src) this.init(this.src)
  },
  methods: {
    async init (url) {
      this.isWebp = url.includes('webp')
      let checkList = ['https://', 'http://'],
        isFullAdd = checkList.map(item => url.includes(item)).some(item => item),
        isBASE64 = url.includes('data:image'),
        v = await systemApi.getImageVersion()
      this.imagePath = `${isFullAdd || isBASE64 ? '' : IMG_URL}${url}` + (isBASE64 ? '' : `?v=${v}`)
    }
  }
}
</script>

<style scoped lang='scss'>
image{
  width: 100%;
  height: 100%;
  vertical-align: top;
}
</style>