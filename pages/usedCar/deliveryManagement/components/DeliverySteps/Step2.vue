<template>
  <view class="step-2">
    <view class="upload-box box">
      <view class="title">
        交付照片
        <view class="required">*</view>
      </view>
      <view class="tips">完成交付图片上传，拍摄需包含车辆图片（铭牌、45%角)、提车人照片，及提车人身份证照片。</view>
      <view class="img-list flex">
        <template v-if="imgList.length < 10">
          <view class="img-item upload flex" @click="chooseImage">
            <uni-icons type="plusempty" :size="22" color="#347BFF" class="icon"></uni-icons>
            {{ imgList.length }}/10
          </view>
        </template>
        <view
          class="img-item"
          v-for="(i, index) in imgList"
          :key="index"
        >
          <!-- 缩略图展示时为图片拼接 OSS 预览参数，存储与提交依然使用原始 URL -->
          <image :src="getImageDisplayUrl(i)" class="img" mode="aspectFill" @click="previewMedia(i, 1)" />
          <view class="del flex">
            <uni-icons type="closeempty" :size="10" color="#fff" @click="delImage(index)"></uni-icons>
          </view>
        </view>
      </view>
      <view class="img-tips">单个文件不超过10M，最多可上传10张。</view>
    </view>
    <view class="remark-box box">
      <view class="title">交付备注</view>
      <view class="remark">
        <textarea placeholder="请描述交付过程备注信息" placeholder-class="placeholder" :value="remark" @input="remark = $event.detail.value" :maxlength="200" class="textarea"></textarea>
        <view class="limit">{{ remark.length }}/200</view>
      </view>
    </view>
    <view class="btn-box box flex">
      <view class="sprite-icon icon-delivery-step-2"></view>
      <view class="info">
        客户提车确认
        <view class="des">请让客户在拍卖小程序完成交割单签署，签署完成后才可点击确认提车。</view>
      </view>
      <view :class="['btn flex', { disabled: !imgList.length }]" @click="comfirm">确认提车</view>
    </view>
    <view class="block"></view>
  </view>
</template>

<script type="text/ecmascript-6">
import { uploadFile } from '@/utils/ossUpload.js'
import permision from '@/js_sdk/wa-permission/permission.js'
import { getImageDisplayUrl as rawGetImageDisplayUrl } from '@/utils/ossImageProcess.js'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024, // 图片最大10MB
  MAX_IMG_COUNT = 10 // 最大图片数量
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
  data() {
    return {
      imgList: [],
      remark: ''
    }
  },
  mounted() {
  },
  methods: {
    getImageDisplayUrl(url) {
      return rawGetImageDisplayUrl(url)
    },
    delImage(index) {
      this.imgList.splice(index, 1)
    },
    async chooseImage() {
      const { imgList } = this,
        _this = this
      try {
        // #ifdef APP-PLUS
        const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
        const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
        const isOnline = await uni.$isNetWork()
        if (photoLibrary != 1) throw '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限'
        if (camera != 1) throw '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限'
        if (!isOnline) throw '当前无网络连接，请连接网络后重试'
        // #endif
        uni.chooseImage({
          count: MAX_IMG_COUNT - imgList.length,
          async success(res) {
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                return uni.showToast({
                  title: '图片上传最大10MB',
                  icon: 'none'
                })
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              _this.imgList.push(url)
            }
            if (_this.imgList.length >= res.tempFilePaths.length) uni.hideLoading()
          },
          fail(err) {
            console.log(err)
            uni.hideLoading()
            if (err.errMsg.indexOf('cancel') === -1) {
              return uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              })
            }


          },
        })
      } catch (error) {
        console.log(error)
        uni.hideLoading()
        return uni.showToast({
          title: error,
          icon: 'none'
        })
      }

    },
    async comfirm() {
      try {
        let { imgList, step, remark, detail } = this,
          { deliveryOrderId } = detail,
          confirmImages = ''
        if (!imgList.length) return
        confirmImages = imgList.join(',')
        uni.showLoading({ title: '提交中...', mask: true })
        uni.$track.add({
          eventCode: 'app_delivery_submit_detail'
        })
        const { data: { code, msg } } = await uni.$api.usedCarApi.confirmDelivery({
          deliveryOrderId,
          confirmImages,
          remark
        })
        uni.hideLoading()
        if (code == 0) {
          this.$emit('comfirm', step)
          this.$emit('refreshLog')
        }
        else throw msg
      } catch (error) {
        console.log(error)
        uni.hideLoading()
        if (error) this.$emit('openError', error)
      }
    },
    previewMedia(media, type) {
      const url = `/pages/boutique/preview?tabName=预览&sourceType=${type}&detailUrl=${media}`
      uni.navigateTo({
        url: `${url}`
      })
    }
  }
}
</script>

<style scoped lang="scss">
.step-2 {
  position: relative;
  z-index: 2;
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

      .required {
        color: #f24724;
        font-size: toRpx(28);
        margin-left: toRpx(8);
      }
    }
  }

  .upload-box {
    .tips {
      margin: toRpx(4) 0 toRpx(28);
      color: #999999;
      font-size: toRpx(26);
      line-height: toRpx(36);
    }

    .img-list {
      flex-wrap: wrap;
      gap: toRpx(24);

      .upload {
        background: #f5f8ff;
        flex-direction: column;
        justify-content: center;
        color: #999999;
        font-size: toRpx(26);

        .icon {
          font-weight: 700;
          margin-bottom: toRpx(22);
        }
      }

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

    .title {
      padding-bottom: toRpx(24);
    }

    .remark {
      height: toRpx(200);
      border-radius: toRpx(16);
      background: #fafafa;
      box-sizing: border-box;
      padding: toRpx(24) 0 toRpx(24) toRpx(24);
      position: relative;

      .textarea {
        height: toRpx(132);
        width: 100%;
        color: #333333;
        font-size: toRpx(28);
      }

      .limit {
        position: absolute;
        bottom: toRpx(8);
        right: toRpx(8);
        color: #999999;
        font-size: toRpx(28);
        line-height: toRpx(44);
      }
    }

    .placeholder {
      color: #999999;
      font-size: toRpx(28);
    }
  }

  .btn-box {
    box-sizing: border-box;
    height: toRpx(144);

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
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      font-size: toRpx(28);
      font-weight: 500;
      justify-content: center;
    }

    .disabled {
      opacity: 0.5;
    }
  }

  .block {
    width: 100%;
    height: toRpx(24);
  }
}
</style>
