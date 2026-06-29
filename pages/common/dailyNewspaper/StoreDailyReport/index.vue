<template>
  <view class="report-content ">
    <view :class="['report-component', { 'opacity': showNegotiationList }, { 'show': showReport }]">
      <template v-if="!isToday || ReportStatus == 1">
        <Detail :templateData="templateData" />
      </template>
      <template v-else>
        <Edit :templateData="templateData" @showNegotiationList="changeComponent(true)" @saveReport="saveReport"
          @submitReport="submitReport" :reportDate="currentDate" :ReportStatus="ReportStatus"
          @getSaveBtnStatus="saveBtnStatus = $event" />
      </template>
    </view>

    <template v-if="showNegotiationList">
      <NegotiationList :currentDate="currentDate" @back="changeComponent(false)" />
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
import mixins from '../mixins'
import Detail from './detail'
import Edit from './edit'
import NegotiationList from './negotiationList'

export default {
  components: { Detail, Edit, NegotiationList },
  mixins: [mixins],
  name: 'StoreDailyReport',
  data() {
    return {
      showNegotiationList: false,
      showReport: true
    }
  },

  computed: {

  },
  watch: {
    currentDate: {
      handler(val) {
        if (val) {
          this.showNegotiationList = false
          this.$emit('changeComponent', { title: '', icon: '' })
        }
      },
      immediate: true,
      deep: true
    },
    ReportStatus: {
      handler(val) {
        this.saveBtnStatus = val !== 1
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    changeComponent(val) {
      if (!val) {

        setTimeout(() => { this.showNegotiationList = false }, 450)
      }
      else this.showNegotiationList = true
      this.showReport = !val
      this.$emit('changeComponent', {
        title: val ? '洽谈明细表' : '',
        icon: val ? 'negotiation-detail' : ''
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.report-content,
.report-component {
  height: 100%;
  position: relative;
  transition: all 0.5s ease-in-out;
}

.opacity {
  left: -100%;
}

.show {
  left: 0;
}
</style>