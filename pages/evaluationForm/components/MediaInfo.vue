<template>
  <view>
    <!-- 车辆图片 -->
    <view>
      <view v-for="item in imageData.carImageList" :key="item.id" @click.stop="previewImage(item.url)" class="flex">
        <view>{{ item.alt }}</view>
        <MediaResource :src="item.url" media-type="image" class="car-image" />
      </view>
    </view>
    <!-- 证件资料 -->
    <!-- <view>
      <view>
        <view>左前45度</view>
        <MediaResource v-for="item in mediaList" :key="item.id" :src="item.url" media-type="image" />
      </view>
    </view> -->
    <!-- 车辆视频 -->
    <view>
      <view v-for="item in imageData.carVideoList" :key="item.id">
        <view>{{ item.alt }}</view>
        <MediaResource :src="item.url" media-type="video" />
      </view>
    </view>
  </view>
</template>
<script>
import MediaResource from './MediaResource'

export default {
  name: 'MediaInfo',
  components: {
    MediaResource
  },
  props: {
    imageData: {
      type: Object,
      default: () => ({})
    },
    alt: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  methods: {
    previewImage(url) {
      console.log(url)
      uni.previewImage({
        urls: [url]
      })
    }
  }
}
</script>
<style scoped lang="scss">
.car-image {
  width: toRpx(360);
  height: toRpx(260);
  ::v-deep uni-image {
    width: 100%;
    height: 100%;
  }
}
</style>
