<template>
  <uni-popup
    ref="popup"
    border-radius="20px"
    @maskClick="updateActivity"
  >
    <view class="activity-box">
      <view
        class="close flex"
        @click="clickClose"
      >
        <uni-icons
          type="closeempty"
          :size="18"
          color="#1A1A1A"
        ></uni-icons>
      </view>
      <image
        :src="bgUrl"
        class="bg"
      />
      <view class="content">
        <view class="title">{{ title }}</view>
        <view class="description">{{ description }}</view>
      </view>
      <view
        class="btn"
        @click="jump"
      ></view>
    </view>
  </uni-popup>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'ActivityPopup',
  data () {
    return {
      data: {}
    }
  },
  computed: {
    bgUrl () {
      let { type } = this.data
      return `https://img02.glsx.com.cn/weapp/resource/app-tape/common/activity-${type}.webp`
    },
    title () {
      return this.data.activityName || ''
    },
    description () {
      return {
        0: '新的销售竞赛活动已发布！请尽快查阅评选规则与奖励方案，力争上游！',
        1: '获奖名单已出炉！快来看看是谁斩获大奖，围观本期“销售之星”。'
      }[this.data.type]
    },
  },
  mounted () {
  },
  methods: {
    open (data) {
      this.data = data
      this.$refs.popup.open("center");
    },
    close () {
      this.$refs.popup.close()
    },
    clickClose () {
      this.close()
      this.updateActivity()
    },
    jump () {
      this.clickClose()
      this.$emit('JumpActivityCenter', this.data)
    },
    async updateActivity () {
      const { msgId } = this.data
      await uni.$api.activityApi.updateActivityMessagePopUpWindow({
        msgId
      })
    }
  }
}
</script>

<style scoped lang="scss">
.activity-box {
  position: relative;
  width: toRpx(1400);
  height: toRpx(928);
  // background: #ffffff;
  border-radius: toRpx(64);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .close {
    position: absolute;
    width: toRpx(160);
    height: toRpx(160);
    top: 0;
    right: 0;
    justify-content: center;
  }
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .content {
    position: absolute;
    top: toRpx(284);
    right: toRpx(100);
    width: toRpx(650);
    .title {
      color: #333333;
      font-size: toRpx(56);
      font-weight: 700;
      margin-bottom: toRpx(24);
      line-height: toRpx(80);
      display: -webkit-box;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .description {
      color: #999999;
      font-size: toRpx(34);
      line-height: toRpx(52);
    }
  }

  .btn {
    position: absolute;
    width: toRpx(516);
    height: toRpx(120);
    right: toRpx(266);
    bottom: toRpx(116);
  }
}
</style>
