<template>
  <view class="report-content ">
    <template v-if="!isToday">
      <Detail :templateData="templateData" />
    </template>
    <template v-else>
      <Edit :templateData="templateData" @submitReport="submitReport" @getSaveBtnStatus="saveBtnStatus = $event" :ReportStatus="ReportStatus" />
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
import mixins from '../mixins'
import Detail from './detail'
import Edit from './edit'
export default {
  components: { Detail, Edit },
  mixins: [mixins],

  name: 'NegotiationDetail',
  data() {
    return {

    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style scoped lang='scss'>
.report-content {
  height: 100%;
  position: relative;
}
</style>