<template>
  <view class="ai-box">
    <view class="ai-welcome">
      <view class="sprite-icon icon-ai-bazaar"></view>
      <view class="welcome-title">欢迎使用广联AI集市</view>
    </view>
    <view class="ai-content">
      <view
        class="list-box"
        v-for="item in list"
        :key="item.id"
      >
        <view class="list-title">{{ item.preEntryName }}</view>
        <view class="item-box">
          <view
            class="item"
            @click="jump(i)"
            v-for="i in item.agentList"
            :key="i.id"
          >
            <image
              class="item-img"
              :src="i.entryLogoUrl"
              mode="scaleToFill"
            />
            <view class="text">{{ i.entryName }}</view>
            <view
              v-if="i.tipShowFlag == 1"
              class="red-dot"
            ></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script type="text/ecmascript-6">
export default {
  name: 'AIBazaar',
  props: {
    isPermissionFunction: null
  },
  data () {
    return {
      list: []
    }
  },
  created () {
    uni.$on('pageBack', () => {
      this.getAiagentList()
    })
  },
  mounted () {
    this.getAiagentList()
  },
  methods: {
    async getAiagentList () {
      const { phone } = uni.$storage.get("userInfo")
      const params = {
        ownerShipType: 1,  // 驻店
        accountPhone: phone
      }
      const res = await uni.$api.commonApi.getAiagentList(params)
      console.log(res)
      this.list = res
    },
    async jump (data) {
      let { agentUrl, domainName, presuppositionProblem, taskStatus, checkDate, agentCode } = data
      if (agentCode == 'AI7') {
        const isPermision = await this.isPermissionFunction('请打开麦克风权限')
        if (!isPermision) return
      }
      if (!agentUrl) {
        return uni.showToast({
          title: '待开放',
          icon: 'none'
        })
      }
      let url = `/pages/common/aiWebview?url=${agentUrl}&domain=${domainName}&presuppositionProblem=${presuppositionProblem}`
      const { phone } = uni.$storage.get("userInfo")
      url += `&practice_status=${taskStatus}&date=${checkDate}`
      const res = await uni.$api.commonApi.updateSopAiAgentMessageStatus({
        staffPhone: phone
      })
      uni.navigateTo({ url })
    }
  }
}
</script>
<style scoped lang="scss">
.ai-box {
  box-sizing: border-box;
  height: calc(100vh - #{toRpx(160)});
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 0 16px 0 rgb(255, 255, 255);
  margin-top: toRpx(80);
  margin-right: toRpx(66);
  border-radius: toRpx(48);
  .ai-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: toRpx(120);
    .welcome-title {
      margin-top: toRpx(48);
      font-size: toRpx(48);
      font-weight: 500;
      background: linear-gradient(90deg, #369eff, #2c66f7);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .ai-content {
    margin: toRpx(64);
  }
  .list-box {
    border-radius: toRpx(16);
    background-color: #fff;
    padding: toRpx(48);
    margin-bottom: toRpx(40);
    .list-title {
      position: relative;
      margin-left: toRpx(24);
      font-size: toRpx(32);
      font-weight: 500;
      color: #333;
      &::before {
        content: '';
        display: inline-block;
        position: absolute;
        top: 50%;
        left: toRpx(-24);
        transform: translateY(-50%);
        width: toRpx(8);
        height: toRpx(36);
        background: linear-gradient(158deg, #4facfe, #00f2fe);
        border-radius: 0 toRpx(8) toRpx(8) 0;
      }
    }
    .item-box {
      display: flex;
      flex-wrap: wrap;
      margin-top: toRpx(40);
      gap: toRpx(48);
      .item {
        display: inline-flex;
        align-items: center;
        width: toRpx(412);
        box-sizing: border-box;
        font-size: toRpx(30);
        color: #333;
        border-radius: toRpx(16);
        box-shadow: 0 toRpx(8) toRpx(24) 0 #2c66f71a;
        padding: toRpx(16) toRpx(32);
        // margin-right: toRpx(50);
        margin-bottom: toRpx(30);
        &:nth-child(5n) {
          margin-right: 0;
        }
        .text {
          margin-left: toRpx(15);
          // width: toRpx(160);
        }
        &-img {
          width: toRpx(96);
          height: toRpx(96);
          // margin-left: toRpx(20);
        }
        .red-dot {
          background-color: #f24724;
          width: toRpx(16);
          height: toRpx(16);
          border-radius: 50%;
          margin-left: toRpx(8);
        }
      }
    }
  }
}
</style>
