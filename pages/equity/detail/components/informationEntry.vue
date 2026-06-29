<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-07 14:54:28
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-04-18 11:24:22
-->
<template>
  <view
    class="information-entry"
    v-if="showPayPage"
  >
    <view class="nav-bar">
      <view
        class="back"
        @click="$emit('update:showPayPage', false)"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
      <view class="title">信息录入</view>
    </view>
    <view class="information-tips">建议同步采集凭证，若接待工作繁忙可在提单环节再进行补充。</view>
    <view class="information-box">
      <view
        class="information-item"
        v-for="(item, index) in infoList"
        :key="item.title"
      >
        <view
          class="upload-img"
          v-if="item.imgUrl"
        >
          <image
            class="img"
            :src="item.imgUrl"
            mode="aspectFill"
            @click="preview(index)"
          />
          <view
            class="upload-close"
            @click="close(index)"
          ><glsx-image
              src="detail/icon-close.png"
              mode="scaleToFill"
            /></view>
          <!-- <uni-icons
            class="upload-close"
            type="clear"
            :size="20"
            @click="close(index)"
          ></uni-icons> -->
        </view>
        <view
          v-else
          class="icon"
          @tap="choose(index)"
        >
          <view class="icon-upload sprite-icon icon-icon-upload"></view>
        </view>
        <view class="information-title">{{ item.title }} </view>
      </view>
    </view>
    <view
      class="information-done"
      @click="$emit('finish')"
    >完成接待</view>
    <!-- <uni-popup ref="preview" type="center" border-radius="10px 10px 0 0">
      <image class="preview-img" :src="previewImg" mode="aspectFit" />
    </uni-popup> -->
  </view>
</template>
<script>
import { uploadFile } from "@/utils/ossUploadFile/uploadFile.js";
import utils from "@/utils/utils";
import permision from '@/js_sdk/wa-permission/permission.js'
const INFO_LIST = [
  {
    id: 1,
    title: "客户付款凭证",
  },
  {
    id: 2,

    title: "客户购车发票",
  },
  {
    id: 3,
    title: "客户延保合同",
  },
];
import { mapMutations } from "vuex";
export default {
  props: {
    showPayPage: Boolean
  },
  data () {
    return {
      infoList: JSON.parse(JSON.stringify(INFO_LIST)),
      previewImg: "",
      isPreview: false,
    };
  },
  watch: {
    watchBooksList: {
      immediate: true,
      handler (newValue) {
        if (newValue.length) this.infoList = newValue
        else this.infoList = JSON.parse(JSON.stringify(INFO_LIST))
      },
    }
  },
  computed: {
    watchBooksList () {
      return this.$store.state.audio.booksList
    }
  },
  methods: {
    ...mapMutations("audio", ["setBooks"]),
    // 上传图
    async choose (index) {
      const result = await permision.requestAndroidPermission(
        "android.permission.CAMERA"
      );
      if (result !== 1) {
        uni.showToast({
          title: "为了访问您的相机和图库，请打开相机权限",
          icon: "none",
        });
        return;
      }
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          // await upload(res.tempFilePath)
          let url = await uploadFile(res.tempFilePaths[0])
          uni.$logger.local.info(`上传付款凭证：${res.tempFilePaths[0]}`)
          // this.$set(
          //   this.infoList[index],
          //   "imgUrl",
          //   url
          // );
          this.infoList[index].imgUrl = url
          this.setBooks(utils.deepClone(this.infoList))
        },
        fail: (err) => {
          uni.$logger.local.error(`上传付款凭证失败：${typeof err == 'string' ? err : err.toString()}`)
          console.log(err);
        },
      });
    },
    // 删除图
    close (index) {
      // this.$set(this.infoList[index], "imgUrl");
      this.infoList[index].imgUrl = ''
      this.setBooks(utils.deepClone(this.infoList))
    },
    // 预览图片
    preview (index) {
      this.isPreview = true;
      this.previewImg = this.infoList[index].imgUrl;
      uni.previewImage({
        urls: [this.infoList[index].imgUrl],
        longPressActions: {
          // itemList: ['发送给朋友', '保存图片', '收藏'],
          success: function (data) {
            console.log(
              "选中了第" +
              (data.tapIndex + 1) +
              "个按钮,第" +
              (data.index + 1) +
              "张图片"
            );
          },
          fail: function (err) {
            console.log(err.errMsg);
          },
        },
      });
      // this.$refs.preview.open("center");
    },
  },
};
</script>
<style lang="scss" scoped>
.information-entry {
  position: fixed;
  // position: relative;
  background-color: #fff;
  width: 100vw;
  height: 100vh;
  z-index: 998;
  box-sizing: border-box;
  padding-top: toRpx(144);
  left: 0;
  top: 0;
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 9;
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 700;
      font-size: toRpx(32);
      color: #1a1a1a;
    }
  }
  .information-tips {
    background: rgba(44, 102, 247, 0.1);
    color: #2c66f7;
    padding: toRpx(32) 0 toRpx(24) toRpx(80);
    font-size: toRpx(28);
  }
  .information-box {
    display: flex;
    padding: toRpx(40) toRpx(80);
    .information-item {
      display: flex;
      flex-direction: column;
      width: toRpx(264);
      margin-right: toRpx(48);
      .icon {
        background-color: #f4f5f7;
        border: toRpx(2) solid #eff0f2;
        border-radius: toRpx(16);
        .icon-upload {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: toRpx(128);
          height: toRpx(128);
        }
      }
      .icon,
      .upload-img {
        position: relative;
        width: toRpx(264);
        height: toRpx(264);
      }
      .upload-img {
        .img {
          border-radius: toRpx(16);
          width: 100%;
          height: 100%;
        }
        .upload-close {
          position: absolute;
          right: 0;
          top: 0;
          width: toRpx(40);
          height: toRpx(40);
          // transform: translate(50%, -50%);
          // text-align: center;
          // font-size: 36rpx;
          // line-height: toRpx(40);
          // display: flex;
          // align-items: center;
          // justify-content: center;
          // background-color: #fff;
          // border-radius: 50%;
          // padding: 0;
        }
      }
      .information-title {
        margin-top: toRpx(24);
        font-weight: 500;
        font-size: toRpx(28);
        color: #222222;
        letter-spacing: 0;
        line-height: toRpx(48);
        text-align: center;
      }
    }
  }
}
.information-done {
  position: absolute;
  bottom: toRpx(30);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - #{toRpx(240)});
  height: toRpx(80);
  font-weight: 500;
  font-size: toRpx(32);
  color: #ffffff;
  text-align: center;
  line-height: toRpx(80);
  background-color: #2c66f7;
  border-radius: toRpx(40);
}

.preview-img {
  height: toRpx(1300);
}
</style>
