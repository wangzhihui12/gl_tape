<template>
  <view
    class="picture"
    v-show="!!detailUrl"
  >
    <template v-if="isLoading">
      <div class="loadding">
        <image
          class="gif"
          src="../../../assets/images/boutique/loadding.gif"
        />
        资源加载中
      </div>
    </template>
    <image
      class="detail-img"
      :src="detailUrl"
      mode="widthFix"
      @load="load"
    />
  </view>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'Picture',
  props: {
    imgUrl: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      detailUrl: '',
      isLoading: true
    }
  },
  watch: {
    imgUrl (val) {
      this.detailUrl = val
      this.isLoading = true
    }
  },
  methods: {
    load(e) {
      this.isLoading = false
    }
  },
}
</script>
<style scoped lang="scss">
.picture {
  font-size: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 998;
  min-height: 100vh;
  background-color: #fff;
}
.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 9;
  display: flex;
  align-items: center;
  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
  }
  .title {
    width: 100%;
    text-align: center;
  }
}
.detail-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
.loadding {
  font-size: 12px;
  color: #999;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  .gif {
    width: toRpx(64);
    height: toRpx(64);
    margin-bottom: toRpx(32);
  }
}
</style>