<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: huyue
 * @LastEditTime: 2024-05-31 16:07:23
-->
<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
      <view
        class="title"
        v-if="id != 1"
      >{{ title }}</view>
    </view>
    <template v-for="(item, index) in media">
      <view
        :class="['view', { showView: id == item.id }]"
        :key="index"
      >
        <component
          :is="item.componentName"
          :views="item.receptionSourceDetailList || []"
          :ref="'media' + item.id"
          :title="item.detailTitle || ''"
          :madiaId="item.id"
          :customerType="customerType"
          @jumpPage="jumpPage"
          :show="id == item.id"
          @reception="reception"
          :tabId="tabId"
          :propCarId="currentCarId"
          :type="type"
          :popupImg="item.popupImg"
          @preview="onPreview"
          :penSwitch="penSwitch"
        />
      </view>
    </template>
    <template v-if="showTool()">
      <tool-box
        ref="toolRef"
        :data="toolList"
        :type="type"
        @choose="choose"
        @finish="open"
        :id="id"
        toolStyle="top:calc(50% - 24rpx);"
      />
    </template>
    <template v-if="!isPreview">
      <view
        class="pen-box"
        @click="drawStatus = !drawStatus"
      >
        <view :class="['sprite-icon', `${!drawStatus ? 'icon-pen' : 'icon-pen-active'}`]"> </view>
      </view>
    </template>
    <finish-step
      ref="stepRef"
      @submit="done"
      :sceneType="1"
      :customerType="customerType"
      @back="backInvitation"
    />
    <picture-box :imgUrl="currentImgUrl($refs.media1)" />
    <preview
      ref="preview"
      isComponents
      :show.sync="showPreview"
      :mediaObject="mediaObject"
      @previewBack="onPreviewBack"
    />
  </view>
</template>
<script>
import ToolBox from "@/components/ToolBox.vue";
import FinishStep from "@/components/FinishStep.vue";
import Reception from "./components/Reception.vue";
import { mapMutations } from "vuex";
import invitation from "./invitation.vue";
import Case from "./case.vue";
import history from "./history.vue";
import { receptionTrackMixin } from '@/mixin/index.js'
import PictureBox from './components/Picture.vue'
import preview from './preview.vue'
export default {
  components: {
    ToolBox,
    FinishStep,
    Reception,
    invitation,
    Case,
    history,
    PictureBox,
    preview
  },
  props: {
    id: [String, Number],
    media: Array,
    type: {
      type: String,
      default: "preview",
    },
    customerType: Number,
    toolList: Array,
    tabId: Number,
    currentCarId: [Number, String]
  },
  mixins: [receptionTrackMixin],
  data () {
    return {
      showPreview: false,
      mediaObject: null,
      drawStatus: false,
    };
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        if (newval) this.drawStatus = false
      }
    },
  },
  computed: {
    title () {
      let { id } = this,
        name = this.media.find((e) => e.id == id)?.detailTitle || "";
      return name;
    },
    watchStatus () {
      return this.$store.state.user.historyStatus;
    },
    receptionTrack () {
      return this.$store.state.user.receptionTrack
    },
    watchCustomerInfo () {
      return this.$store.state.user.customerInfo
    },
    penSwitch () {
      return !this.isPreview && this.drawStatus
    },
    isPreview () {
      return this.type == 'preview'
    }
  },
  mounted () {
  },
  methods: {
    ...mapMutations("audio", ["setReceptionStatus"]),
    open () {
      this.$refs.stepRef.open();
    },
    /**切换素材 */
    choose (e) {
      Object.keys(this.$refs).map(refKey => {
        let ref = this.$refs[refKey];
        if (ref) {
          if (Array.isArray(ref)) ref = ref[0]
          ref.closeAllPopup && ref.closeAllPopup()
        }
      })
      this.receptionTrackLeave()
      this.jumpPage({ id: e.id })
    },
    back () {
      this.$refs?.toolRef?.hide();
      this.$emit("back");
    },
    done (e) {
      this.$refs.toolRef.hide();
      this.$refs.stepRef.close();
      this.receptionTrackLeave()
      this.$emit("done", e);
      this.clearCustomerReceivedTimer()
    },
    jumpPage ({ id }) {
      this.$emit("update:id", Number(id));
    },
    /**回店客户 */
    async reception ({ item }) {
      // const result = await this.$permision.requestAndroidPermission(
      //   "android.permission.RECORD_AUDIO"
      // );
      // if (result !== 1) {
      //   uni.showToast({
      //     title: "为了记录语音通话，请打开录音权限",
      //     icon: "none",
      //   });
      //   return
      // }
      let customer = {
        customerName: item.customerName,
        carModel: item.carSeriesName || '',
        phoneNumber: item.customerPhone,
        salesUuid: item.userId,
        staffName: item.employeeName,
        receiveCouponDate: item.receiveCouponDate,
        customerCouponId: item.customerCouponId,
        carSeriesId: item.carSeriesId || '',
        carBrand: item.carChildsBrandName || '',
        carBrandId: item.carChildsBrandId || '',
        oneCarBrand: item.carBrand || '',
        oneCarBrandId: item.carBrandId || ''
      }
      let [reception] = this.$refs.media1
      reception?.clearCustomerReceivedTimer()
      this.$emit('reception', customer)
    },
    backInvitation () {
      this.jumpPage({ id: 3 })
      setTimeout(() => {
        uni.showToast({
          title: '请选择回店客户',
          icon: 'none'
        })
      }, 1e3)
    },
    clearCustomerReceivedTimer () {
      let [reception] = this.$refs.media1
      reception?.clearCustomerReceivedTimer()
      reception?.clearSkuState()
    },
    currentImgUrl (receptionRef) {
      return receptionRef ? receptionRef[0].currentImgUrl : ''
    },
    onPreview (item) {
      const { materialUrl, materialFormat, name, id, materialType } = item
      this.mediaObject = {
        ...item,
        tabName: name,
        sourceType: materialFormat == 1 ? 2 : 1,
        detailUrl: materialUrl
      }
      this.showPreview = true
      if (this.isPreview) return
      let key = `case-${materialFormat}-${id}`,
        value = this.receptionTrack[key]
      if (value) {
        value.openCount += 1
        value.entryTime = Date.now()
      } else {
        value = {
          openCount: 1,
          materialName: name,
          materialId: id,
          stayDuration: 0,
          entryTime: Date.now(),
          materialType
        }
      }
      this.$store.dispatch("setReceptionTrack", { key, value })
    },
    onPreviewBack () {
      this.showPreview = false
      if (this.isPreview) return this.mediaObject = null
      const { materialFormat, id } = this.mediaObject,
        key = `case-${materialFormat}-${id}`,
        value = this.receptionTrack[key]
      value.stayDuration += Number(Date.now() - value.entryTime)
      this.$store.dispatch("setReceptionTrack", { key, value })
      this.mediaObject = null
    },
    hidePicture () {
      let [receptionRef] = this.$refs.media1,
        flag = false
      if (this.id == 1 && receptionRef.currentImgUrl) {
        receptionRef.showPicture(false)
        flag = true
      }
      if (this.id == 4 && this.mediaObject) {
        this.onPreviewBack()
        flag = true
      }
      return flag
    },
    showTool () {
      let { type, watchCustomerInfo, customerType } = this
      let flag = false
      if (type != 'preview') {
        flag = true
        if (customerType == 0 && !watchCustomerInfo.phoneNumber) flag = false
      }
      return flag
    },
    // dbClick () {
    //   if (!this.isPreview) this.drawStatus = !this.drawStatus
    // },
  },
};
</script>
<style scoped lang="scss">
.detail-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
}
.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 999;
  pointer-events: none;
  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
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
.view {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
  top: 0;
  left: 0;
  visibility: hidden;
  // display: none;
}
.showView {
  position: absolute;
  z-index: 1;
  visibility: visible;
  // display: block;
  animation: show-content-left 0.15s forwards;
}
@keyframes show-content-left {
  0% {
    left: 100%;
  }
  100% {
    left: 0;
  }
}
.pen-box {
  position: fixed;
  right: toRpx(40);
  top: calc(50% - #{toRpx(160)});
  width: toRpx(120);
  height: toRpx(120);
  z-index: 10;
  box-shadow: 0 toRpx(8) toRpx(24) 0 #00000033;
  border-radius: toRpx(16);
  overflow: hidden;
  image {
    width: 100%;
    height: 100%;
  }
}
</style>
