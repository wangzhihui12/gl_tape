<template>
  <view class="previewList">
    <view class="previewList-box">
      <view class="common-title">合同列表</view>
      <view class="box">
        <scroll-view class="scroll-view" scroll-y="true">
          <view class="box-content">
            <view class="box-shell">
              <view class="flex align-item cell-item justify-between" v-for="item in list" :key="item.contractNo">
                <view>{{ item.goodName ? '合同:' + item.goodName : '合同' + item.label }}</view>
                <view class="flex align-item">
                  <view class="sprite-icon icon-preview" @click.stop="handlePreviewContract(item)"></view>
                  <view class="sprite-icon icon-previewDownLoad ml-36" @click.stop="handlePreviewContract(item, 'download')"></view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import utils from '@/utils/utils'

export default {
  name: 'PreviewList',

  props: {
    transmissionOfData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      list: []
    }
  },
  computed: {
    userInfo() {
      return uni.$storage.get('userInfo') || {}
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      console.log('initData', this.transmissionOfData)
      this.list = this.transmissionOfData.paramsData
    },
    handleDownload(url) {
      if (!url) {
        uni.showToast({ title: '没有合同', icon: 'none' })
        return
      }
      uni.downloadFile({
        url: url,
        success: res => {
          if (res.statusCode === 200) {
            uni.showToast({ title: '保存成功', icon: 'none' })
            var filePath = res.tempFilePath
            uni.openDocument({
              filePath: filePath,
              showMenu: true,
              success: function (res) {
                console.log('打开文档成功')
              }
            })
          }
        }
      })
    },
    handlePreviewContract(item, type) {
      let params = {
        contractNo: item.contractNo
      }
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
      uni.$api.equityApi
        .printContract(params)
        .then(res => {
          console.log(res)
          uni.hideLoading()
          const url = res.url || res
          if (type == 'download') {
            this.handleDownload(url)
          } else {
            const fileName = this.getFileNameFromUrl(res.url || res)
            const type = 3
            console.log(url, fileName, type)
            // 跳转到预览页面
            uni.navigateTo({
              url: `/pages/common/filePreview?fileUrl=${encodeURIComponent(url)}&fileType=${type}&fileName=${encodeURIComponent(fileName)}`
            })
          }
        })
        .catch(err => {
          uni.hideLoading()
        })
    },
    // 从URL获取文件名
    getFileNameFromUrl(url) {
      return url.split('/').pop().split('?')[0] || '未知文件'
    },
    getFileTypeFromUrl(url) {
      const ext = url.split('.').pop().toLowerCase()
      return ext === 'pdf' ? 'pdf' : 'image'
    }
  }
}
</script>

<style scoped lang="scss">
.previewList {
  height: 100%;
  position: relative;
  .previewList-box {
    height: 100%;
    position: relative;
  }
  .box {
    height: calc(100% - #{toRpx(120)});
    padding-bottom: toRpx(24);

    .scroll-view {
      height: 100%;

      .box-content {
        padding: 0 toRpx(48);
        .box-shell {
          width: 100%;
          border-radius: toRpx(16);
          background: #ffffff;
          padding: toRpx(32);
          margin-top: toRpx(16);
          .cell-item {
            padding: toRpx(28) 0;
            border-bottom: toRpx(1) solid #f7f7f6;
          }
        }
      }
    }
  }
  .btns {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 24rpx 128rpx;
    gap: 32rpx;
    .save {
      background: #3b73ff1a;
      color: #4673ff;
      font-size: 28rpx;
      font-weight: 500;
    }
  }
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: toRpx(1130);
    height: toRpx(80);
    color: #fff;
    border-radius: toRpx(48);
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  }
}
</style>
