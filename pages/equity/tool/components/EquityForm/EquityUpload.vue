<template>
  <view
    class="upload-content"
    :key="viewKey"
  >
    <view class="upload-box">
      <view class="label">购车发票</view>
      <view class="upload-item">
        <template v-if="imgObj.invoice">
          <image
            class="img"
            :src="imgObj.invoice"
            @click="previewMedia(imgObj.invoice)"
          />
          <view class="del flex">
            <uni-icons
              type="closeempty"
              :size="10"
              color="#fff"
              @click="delImage('invoice')"
            ></uni-icons>
          </view>
        </template>
        <template v-else>
          <view
            class="upload-component"
            @click="chooseImage('invoice')"
          >
            <uni-icons
              type="plusempty"
              :size="22"
              color="#347BFF"
              class="icon"
            ></uni-icons>
            <view class="text">上传照片</view>
          </view>
        </template>
      </view>
    </view>
    <view class="upload-box">
      <view class="label">行驶证或车辆合格证</view>
      <view class="value flex">
        <view class="upload-item">
          <template v-if="imgObj.driveFront">
            <image
              class="img"
              :src="imgObj.driveFront"
              @click="previewMedia(imgObj.driveFront)"
            />
            <view class="del flex">
              <uni-icons
                type="closeempty"
                :size="10"
                color="#fff"
                @click="delImage('driveFront')"
              ></uni-icons>
            </view>
          </template>
          <template v-else>
            <view
              class="upload-component"
              @click="chooseImage('driveFront')"
            >
              <uni-icons
                type="plusempty"
                :size="22"
                color="#347BFF"
                class="icon"
              ></uni-icons>
              <view class="text">行驶证主页/车辆合格证</view>
            </view>
          </template>
        </view>
        <view class="upload-item">
          <template v-if="imgObj.driveBack">
            <image
              class="img"
              :src="imgObj.driveBack"
              @click="previewMedia(imgObj.driveBack)"
            />
            <view class="del flex">
              <uni-icons
                type="closeempty"
                :size="10"
                color="#fff"
                @click="delImage('driveBack')"
              ></uni-icons>
            </view>
          </template>
          <template v-else>
            <view
              class="upload-component"
              @click="chooseImage('driveBack')"
            >
              <uni-icons
                type="plusempty"
                :size="22"
                color="#347BFF"
                class="icon"
              ></uni-icons>
              <view class="text">行驶证副页/车辆合格证</view>
            </view>
          </template>

        </view>
      </view>
    </view>
    <view class="upload-box">
      <view class="label">合同购买时里程数</view>
      <view class="upload-item">
        <template v-if="imgObj.contract">
          <image
            class="img"
            :src="imgObj.contract"
            @click="previewMedia(imgObj.contract)"
          />
          <view class="del flex">
            <uni-icons
              type="closeempty"
              :size="10"
              color="#fff"
              @click="delImage('contract')"
            ></uni-icons>
          </view>
        </template>
        <template v-else>
          <view
            class="upload-component"
            @click="chooseImage('contract')"
          >
            <uni-icons
              type="plusempty"
              :size="22"
              color="#347BFF"
              class="icon"
            ></uni-icons>
            <view class="text">上传照片</view>
          </view>
        </template>
      </view>
    </view>
    <view class="upload-box">
      <view class="label">其他</view>
      <view class="value flex">
        <template v-if="imgObj.other.length < 9">
          <view
            class="upload-item"
            @click="chooseImage('other',true)"
          >
            <uni-icons
              type="plusempty"
              :size="22"
              color="#347BFF"
              class="icon"
            ></uni-icons>
            <view>上传照片最多9张</view>
          </view>
        </template>
        <template v-if="imgObj.other.length">
          <template v-for="(i,index) in imgObj.other">
            <view
              class="upload-item"
              :key="index"
            >
              <image
                class="img"
                :src="i"
                @click="previewMedia(imgObj.other,index)"
              />
              <view class="del flex">
                <uni-icons
                  type="closeempty"
                  :size="10"
                  color="#fff"
                  @click="delImage('other',index , true)"
                ></uni-icons>
              </view>
            </view>
          </template>
        </template>
      </view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import { uploadFile } from '@/utils/ossUpload.js'
import permision from '@/js_sdk/wa-permission/permission.js'
export default {
  name: 'EquityUpload',
  props: {
    externalData: null,
  },
  watch: {
    externalData: {
      handler (val) {
        let { imgObj } = val
        if(Object.keys(this.imgObj).length) return
        this.imgObj = {
          invoice: imgObj.invoice || '',
          driveFront: imgObj.driveFront || '',
          driveBack: imgObj.driveBack || '',
          contract: imgObj.contract || '',
          other: imgObj.other || []
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      viewKey: Date.now(),
      imgObj: { }
    }
  },
  mounted () {
  },
  methods: {
    previewMedia (urls, index = 0) {
      uni.previewImage({
        current: index,
        urls: Array.isArray(urls) ? urls : [urls],
      })
    },
    delImage (key, index, isArray) {
      if (isArray) this.imgObj[key].splice(index, 1)
      else this.imgObj[key] = ''
      this.viewKey = Date.now()
    },
    async chooseImage (key, isArray) {
      let _this = this
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
          count: 1,
          async success (res) {
            uni.showLoading({ title: '上传中...', mask: true })
            const url = await uploadFile(res.tempFiles[0], res.tempFilePaths[0])
            if (isArray) _this.imgObj[key].push(url)
            else _this.imgObj[key] = url
            _this.viewKey = Date.now()
            uni.hideLoading()
          },
          fail (err) {
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
        uni.hideLoading()
        return uni.showToast({
          title: error,
          icon: 'none'
        })
      }

    },
  }
}
</script>

<style scoped lang='scss'>
.upload-content {
  padding: 0 toRpx(32);
  .upload-box {
    display: flex;
    margin-bottom: toRpx(32);
    .label {
      width: toRpx(168);
      flex-shrink: 0;
      margin-right: toRpx(32);
    }
    .value {
      gap: toRpx(16);
      flex-wrap: wrap;
    }
    .upload-item {
      width: toRpx(192);
      height: toRpx(192);
      border-radius: toRpx(12);
      background: #f5f8ff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #999999;
      font-size: toRpx(20);
      position: relative;
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
      .upload-component {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .icon {
        font-weight: 700;
        margin-bottom: toRpx(22);
      }
      .img {
        width: 100%;
        height: 100%;
      }
      .text {
        width: 80%;
        text-align: center;
      }
    }
  }
}
</style>