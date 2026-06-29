<template>
  <view class="layout">
    <view class="bg"></view>
    <wnCanvas
      :canvasId="`c-${madiaId}`"
      :drawStatus="penSwitch"
      custom
      :scaleSwitch="false"
      ref="caseCanvas"
    >
      <template slot="customContent">
        <view class="layout-content">

          <view class="box">
            <view class="input-box">
              <input
                type="text"
                class="input"
                v-model="name"
                maxlength="50"
                @blur="input($event)"
                @focus="focus"
              />
              <view
                class="input-tips"
                v-if="!isSearch && !name"
              >搜索图片/视频名称<uni-icons
                  type="search"
                  class="icon"
                  color="#999"
                  size="20"
                ></uni-icons></view>
              <uni-icons
                v-if="name"
                type="closeempty"
                class="close"
                color="#999"
                @click="handleClear"
                size="20"
              ></uni-icons>
            </view>
            <view class="content-box">
              <scroll-view
                class="scroll-box"
                scroll-x
                enable-flex
              >
                <view class="classif-box flex">
                  <template v-for="(i,index) in caseMaterials">
                    <view
                      :class="['first-item classif-item flex',{'classif-active':carModelName == i.label}]"
                      :key="index"
                      @click="carModelName = i.label"
                    >
                      {{i.label}}
                    </view>
                  </template>
                </view>
              </scroll-view>
              <scroll-view
                class="scroll-box"
                enable-flex
                scroll-x
              >
                <view class="classif-box flex">
                  <template v-for="(i,index) in secondClassifList">
                    <view
                      :class="['second-item classif-item flex',{'classif-active second-ative':category == i}]"
                      :key="index"
                      @click="category = i"
                    >
                      {{i}}
                    </view>
                  </template>
                </view>
              </scroll-view>
              <scroll-view
                class="record-box"
                scroll-y
              >
                <view class="list">
                  <template v-if="list.length">
                    <template v-for="item in list">
                      <view
                        class="item"
                        :key="item.id"
                      >
                        <view
                          class="item-autio"
                          @click="playVideo(item)"
                        >
                          <image
                            :src="item.thumbnailUrl"
                            class="cover-box"
                          ></image>
                          <image
                            v-if="item.materialFormat == 1"
                            src="../../assets/images/boutique/play.png"
                            class="play-box"
                          ></image>
                        </view>
                        <view class="item-desc">{{ item.name }}</view>
                      </view>
                    </template>
                  </template>
                  <template v-else>
                    <view class="nothing flex">
                      <image
                        class="icon"
                        src="../../assets/images/home/nothing.webp"
                      />
                      暂无数据
                    </view>
                  </template>
                </view>
                <view class="list-bottom-mask"></view>
              </scroll-view>
            </view>
          </view>
        </view>
      </template>
    </wnCanvas>
    <view
      class="popup-box"
      v-if="popupShow"
    >
      <view class="nav-bar">
        <view
          class="back"
          @click="back"
        >
          <uni-icons
            type="left"
            :size="24"
            color="#fff"
          ></uni-icons>
        </view>
        <view class="title">{{ title }}</view>
      </view>
      <view class="popup-body">
        <video
          ref="videoPlayer"
          :src="videoSrc"
          controls
        ></video>
      </view>
    </view>

  </view>
</template>
<script type="text/ecmascript-6">
import dayjs from 'dayjs'
export default {
  name: 'case',
  data () {
    return {
      name: '',
      list: [],
      popupShow: false,
      isSearch: false,
      videoSrc: '',
      isSelect: false,
      userInfo: {},
      carModelName: '',
      category: '',
      caseMaterials: []
    }
  },
  props: {
    show: Boolean,
    madiaId: Number,
    penSwitch: Boolean,
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    secondClassifList () {
      let { caseMaterials, carModelName } = this,
        item = {}
      if (caseMaterials.length) item = caseMaterials.find(e => e.label == (!carModelName ? caseMaterials[0].label : carModelName))
      return item?.cases || []
    }
  },
  watch: {
    show: {
      handler (newValue) {
        if (newValue) {
          this.init()
          this.getCaseTags()
        } else this.handleLeavePage()
      },
      immediate: true
    },
    carModelName: {
      handler (val) {
        let { caseMaterials } = this
        if (caseMaterials.length && val) {
          this.category = this.secondClassifList[0]
        }
      },
      immediate: true
    },
    category: {
      handler (val) {
        if (val) this.getCaseList()
      },
      immediate: true
    },
  },
  mounted () {
    const userInfo = uni.$storage.get("userInfo")
    this.userInfo = userInfo
    this.init()
  },
  methods: {
    // 离开页面时上传埋点并清空缓存
    async handleLeavePage () {
      try {
        const caseInfo = uni.$storage.get("caseInfo")
        if (caseInfo && caseInfo.length > 0) {
          await this.uploadData(caseInfo)
          uni.$storage.rm("caseInfo")
        }
      } catch (e) {
        // 可选：错误处理
      } finally {
      }
    },
    // 埋点
    async sendData (params) {
      const { shopMerchantId, sceneType, uuid, name } = this.userInfo
      const default_params = {
        merchantId: shopMerchantId,
        businessScene: sceneType,
        staffUuid: uuid,
        staffName: name,
        materialType: 'case',
      }
      const _params = {
        ...default_params,
        ...params
      }

      // 获取本地缓存的caseInfo
      let caseInfo = uni.$storage.get("caseInfo") || []

      // 查找是否有相同素材（id相同）
      const idx = caseInfo.findIndex(item => item.materialId === params.materialId)
      if (idx !== -1) {
        // 已存在，openCount+1
        caseInfo[idx].openCount = (caseInfo[idx].openCount || 1) + 1
      } else {
        // 不存在，push新对象
        caseInfo.push({
          ..._params,
          openCount: 1,
        })
      }
      // 更新缓存
      uni.$storage.set("caseInfo", caseInfo)
    },
    // 上传埋点
    async uploadData (caseInfo) {
      // const caseInfo = uni.$storage.get("caseInfo")
      if (caseInfo && caseInfo.length > 0) {
        await uni.$api.boutiqueApi.caseVideoCenter({ receptionCustomerMaterialPointList: caseInfo })
      }
    },
    playVideo (item) {
      this.$emit('preview', item)
      const params = {
        materialId: item.id,
        materialName: item.name,
        receptionDate: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      this.sendData(params)
    },
    focus () {
      this.isSearch = true
    },
    init () {
      this.name = '';
      this.searchValue = ''
      this.isSelect = false
    },
    handleClear () {
      this.name = ''
      this.searchValue = ''
      this.isSearch = false
      this.getCaseTags()
      this.clearCanvas()
    },
    input (e) {
      let { value } = e.detail
      this.isSearch = false
      if (this.searchValue == value) return
      this.searchValue = value
      this.getCaseTags()
      this.clearCanvas()
    },
    async getCaseList () {
      try {
        uni.showLoading({
          mask: true
        })
        this.list = []
        let { searchValue, carModelName, category } = this
        const userInfo = uni.$storage.get("userInfo"),
          { shopMerchantId } = userInfo; // 44217687
        const params = {
          merchantId: shopMerchantId,
          carModelName: carModelName,
          category: category
        }
        if (searchValue) params.materialName = searchValue
        const { list } = await uni.$api.boutiqueApi.getCaseList(params)
        uni.hideLoading()
        if (list && list.length) this.list = list
      } catch (error) {
        uni.hideLoading()
      }
    },
    async getCaseTags () {
      this.carModelName = ''
      this.category = ''
      let { searchValue } = this
      const userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo; // 44217687
      const params = { merchantId: shopMerchantId }
      if (searchValue) params.materialName = searchValue
      const { list } = await uni.$api.boutiqueApi.getCaseList(params)
      if (list && list.length) {
        let arr = Array.from(new Set([...list.map((e) => e.carModelName)])),
          caseMaterials = []
        arr.map((e, index) => {
          caseMaterials.push({
            label: e,
            cases: []
          })
          let secondClassifList = new Array(arr.length).fill([])
          list.map(i => {
            if (e == i.carModelName) secondClassifList[index].push(i.category)
          })
          caseMaterials[index].cases = Array.from(new Set([...secondClassifList[index]]))
        })
        this.caseMaterials = caseMaterials
        let [item] = list
        this.carModelName = item.carModelName
        this.category = item.category
      } else {
        this.caseMaterials = []
        this.list = []
      }

    },
    clearCanvas () {
      this.$refs.caseCanvas.clearBoard()
    },
  },
}
</script>
<style scoped lang="scss">
.layout {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(180deg, #f1f5ff 0%, #f3f6ff 100%);
  overflow: hidden;
  &-content {
    margin: $margin;
    height: 100%;
    position: relative;
  }
  .bg {
    width: 100%;
    height: toRpx(800);
    position: absolute;
    left: 0;
    background-image: url('../../assets/images/boutique/record-bg.webp');
    background-size: 100% 100%;
    top: 0;
  }
  .box {
    padding-top: toRpx(168);
    position: relative;
    .select-box {
      position: absolute;
      right: toRpx(24);
      top: toRpx(64);
      z-index: 1;
      .select {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: toRpx(8);
      }
      .arrow-bottom {
        width: toRpx(48);
        height: toRpx(48);
      }
      .pop-box {
        width: toRpx(368);
        background: #ffffff;
        border-radius: toRpx(16);
        padding: toRpx(16) 0;
        animation: show-view-opacity 0.15s forwards;
        .type-item {
          padding: 0 toRpx(24);
          margin-bottom: toRpx(8);
          height: toRpx(48);
          line-height: toRpx(48);
          &:last-child {
            margin-bottom: 0;
          }
          &.active {
            background-color: #ecf1ff;
          }
        }
      }
    }
    .input-box {
      position: relative;
      margin: 0 toRpx(64);
      .input {
        padding-left: toRpx(30);
        text-align: center;
        height: toRpx(80);
        background: #ffffff;
        border: toRpx(3) solid #a8c1ff;
        border-radius: toRpx(16);
        width: 100%;
        line-height: toRpx(80);
        z-index: 1;
      }
      .input-tips {
        color: #999999;
        position: absolute;
        left: 0;
        top: 0;
        height: toRpx(80);
        width: 100%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        .icon {
          margin-left: toRpx(12);
        }
      }
      .close {
        position: absolute;
        right: 0;
        top: 0;
        width: toRpx(120);
        height: toRpx(80);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .content-box {
      height: calc(100vh - #{toRpx(272)});
      margin: toRpx(24) 44rpx 0;
      border-radius: 48rpx 48rpx 0 0;
      background: #ffffff;
      backdrop-filter: blur(16rpx);
      box-shadow: inset 0 0 16rpx 0 #ffffff;
      padding-top: 24rpx;
      box-sizing: border-box;
      .scroll-box {
        width: calc(100% - 88rpx);
        margin: 16rpx 44rpx 0;
        height: 80rpx;
        .classif-box {
          width: 100%;
          gap: toRpx(24);
          flex-wrap: nowrap;
        }
      }
      .classif-item {
        height: 80rpx;
        padding: 0 32rpx;
        color: #666666;
        width: fit-content;
        flex-shrink: 0;
      }
      .first-item {
        font-size: 32rpx;
      }
      .classif-active {
        color: #2d66f7;
        font-weight: 500;
      }
      .second-item {
        font-size: 28rpx;
        border-radius: 16rpx;
        background: #f2f2f2;
      }
      .second-ative {
        background: #2d66f71a;
      }
    }
    .record-box {
      margin-top: 40rpx;
      height: calc(100% - #{toRpx(232)});
    }
    .list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: toRpx(48) toRpx(38);
      margin: 0 toRpx(44);
      .item {
        height: toRpx(536);
        background: #ffffff;
        border-radius: toRpx(48);
        box-shadow: 0 toRpx(8) toRpx(24) 0 #4673ff1a;
        .item-autio {
          height: toRpx(404);
          position: relative;

          .cover-box {
            width: 100%;
            height: 100%;
            border-radius: toRpx(48) toRpx(48) 0 toRpx(48);
          }
          .play-box {
            width: toRpx(48);
            height: toRpx(48);
            position: absolute;
            left: toRpx(32);
            bottom: toRpx(32);
          }
        }
        .item-desc {
          // height: toRpx(140);
          padding: toRpx(24) toRpx(28);
          font-size: toRpx(32);
          color: #333333;
          border-radius: toRpx(48);
          text-align: center;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2; // 控制多行的行数
          -webkit-box-orient: vertical;
          padding-bottom: 0;
        }
      }
    }
    .list-bottom-mask {
      height: 100rpx;
      width: 100%;
    }
  }
}
.popup-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  padding: toRpx(100) 0;
  z-index: 100;
  .nav-bar {
    width: 100%;
    height: toRpx(96);
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
      color: #ffffff;
    }
  }
  .popup-body {
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
    }
  }
}
.nothing {
  width: 100vw;
  flex-direction: column;
  margin-top: toRpx(112);
  font-size: toRpx(28);
  color: #999999;
  .icon {
    width: toRpx(676);
    height: toRpx(284);
    margin-bottom: toRpx(24);
  }
}
</style>
