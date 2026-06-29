<template>
  <view class="step-3">
    <view class="upload-box box">
      <view class="title">交付照片</view>
      <view class="img-list flex">
        <template v-for="(i, index) in detail.imgList">
          <view class="img-item" :key="index">
            <image :src="getImageDisplayUrl(i)" class="img" mode="aspectFill" @click="previewMedia(i, 1)" />
          </view>
        </template>
      </view>
    </view>
    <view class="remark-box box">
      <view class="title">交付备注</view>
      <view class="remark">
        <rich-text :nodes="detail.remark || '-'"></rich-text>
      </view>
    </view>
    <view class="btn-box box flex">
      <view class="sprite-icon icon-delivery-step-2"></view>
      <view class="info">
        客户提车确认
        <view class="des">提车时间：{{ detail.pickUpTime }}</view>
      </view>
      <view class="btn flex">已提车</view>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import { getImageDisplayUrl as rawGetImageDisplayUrl } from '@/utils/ossImageProcess.js'
export default {
  name: '',
  props: {
    step: [String, Number],
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    getImageDisplayUrl (url) {
      return rawGetImageDisplayUrl(url)
    },
    previewMedia (media, type) {
      const url = `/pages/boutique/preview?tabName=预览&sourceType=${type}&detailUrl=${media}`
      uni.navigateTo({
        url: `${url}`
      })
    }
  }
}
</script>

<style scoped lang="scss">
.step-3 {
  margin: 0 toRpx(48);
  .box {
    border-radius: toRpx(16);
    background: #ffffff;
    margin-bottom: toRpx(24);
    padding: 0 toRpx(32);
    .title {
      color: #333333;
      font-size: toRpx(28);
      font-weight: 500;
      display: flex;
      line-height: toRpx(40);
      padding-top: toRpx(28);
    }
  }
  .upload-box {
    padding-bottom: toRpx(28);
    .title {
      margin-bottom: toRpx(28);
    }
    .img-list {
      flex-wrap: wrap;
      gap: toRpx(24);
      .img-item {
        width: toRpx(224);
        height: toRpx(224);
        border-radius: toRpx(12);
        position: relative;
        overflow: hidden;
        .img {
          width: 100%;
          height: 100%;
        }
        .del {
          position: absolute;
          width: toRpx(32);
          height: toRpx(32);
          background: #00000080;
          border-radius: 100%;
          top: toRpx(8);
          right: toRpx(4);
          justify-content: center;
        }
      }
    }
    .img-tips {
      color: #999999;
      font-size: toRpx(24);
      padding: toRpx(16) 0 toRpx(28);
      line-height: toRpx(36);
    }
  }
  .remark-box {
    padding-bottom: toRpx(28);
    .remark {
      margin-top: toRpx(24);
      max-height: toRpx(220);
      box-sizing: border-box;
      color: #333333;
      font-size: toRpx(28);
      overflow-y: auto;
      line-height: toRpx(44);
      word-break: break-all;
    }
    .placeholder {
      color: #999999;
      font-size: toRpx(28);
    }
  }
  .btn-box {
    box-sizing: border-box;
    height: toRpx(144);
    margin-bottom: 0;
    .info {
      margin-left: toRpx(24);
      color: #333333;
      font-size: toRpx(28);
      font-weight: 500;
      line-height: toRpx(40);
      .des {
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
        line-height: toRpx(36);
        margin-top: toRpx(4);
      }
    }
    .btn {
      margin-left: auto;
      width: toRpx(192);
      height: toRpx(64);
      border-radius: toRpx(48);
      color: #999ea8;
      background: #f0f1f5;
      font-size: toRpx(28);
      font-weight: 500;
      justify-content: center;
    }
    .disabled {
      opacity: 0.5;
    }
  }
}
</style>
