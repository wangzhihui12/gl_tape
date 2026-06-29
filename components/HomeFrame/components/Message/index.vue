<template>
  <view>
    <ServiceList type="out" :messageList="messageList" :topListProp="topList" @handleClick="handleClick" />
  </view>
</template>
<script>
import ServiceList from '../../../../pages/common/serviceDetail/components/ServiceList.vue';
import { getMessageSummary } from '../../../../api/module/common'
export default {
  name: 'MessageIndex',
  components: {
    ServiceList
  },
  data() {
    return {
      topList: [],
      messageList: []
    }
  },
  created() {
    uni.$on('messageBackHome', (topList) => {
      this.topList = topList
      this.getMessageSummary()
    })
  },
  mounted() {
    this.getMessageSummary()
  },
  methods: {
    // 获取服务中心列表
     async getMessageSummary() {
      const userInfo = uni.$storage.get('userInfo')
      const res = await getMessageSummary({businessType: userInfo.sceneType})
      this.messageList = res
    },
    handleClick(item) {
      const { moduleType } = item
      uni.$track.add({eventCode: 'app_service_center'})
      uni.navigateTo({
        url: `/pages/common/serviceDetail/index?moduleType=${moduleType}`
      })
    }
  }
}
</script>
<style scoped lang="scss">

</style>