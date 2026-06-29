<template>
  <view>
    <MediaInfo :imageInfo="imageData" />
  </view>
</template>
<script>
import MediaInfo from './MediaInfo'

export default {
  name: 'imageInfo',
  components: {
    MediaInfo
  },
  props: {
    imageData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  }
}
</script>
<style scoped lang="scss"></style>
