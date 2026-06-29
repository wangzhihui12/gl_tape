<template>
  <view class="line-bar-box">
    <view class="tabs">
      <page-tabs
        :list="tabList"
        @changeTab="changeTab"
        size="small"
      />
    </view>
    <view class="canvas">
      <qiun-data-charts
        type="bar"
        :opts="opts"
        :chartData="chartData"
        :tooltipShow="false"
      />
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import PageTabs from '@/components/PageTabs.vue'
const rateList = {
  excellentStoreAvgDealRate: '优秀门店均值',
  thisStoreDealRate: '本门店',
  personalDealRate: '个人'
},
  priceList = {
    excellentStoreAvgDeal: '优秀门店均值',
    thisStoreKdj: '本门店',
    personalKdj: '个人'
  }
export default {
  components: {
    PageTabs
  },
  props: {
    pageData: {
      type: Object,
      default: () => { }
    },
    dataShow: {
      type: Boolean,
      default: true
    },
    sceneType: Number,
    isHarmony: Boolean, // 是否为鸿蒙
    bussinessType: Number
  },
  watch: {
    dataShow: {
      immediate: true,
      handler (newval) {
        this.getServerData()
      }
    }
  },
  name: '',
  data () {
    return {
      tabIndex: 0,
      tabList: ['本月交付成交率', '本月交付客单价'],
      chartData: {},
      //您可以通过修改 config-ucharts.js 文件中下标为 ['bar'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      opts: Object.freeze({
        fontColor: '#333',
        fontSize: 12,
        color: ["#2C66F7"],
        padding: [20, 80, 0, 0],
        enableScroll: false,
        legend: {
          show: false
        },
        xAxis: {
          disabled: true,
          gridColor: '#fff',
        },
        yAxis: {
          axisLineColor: '#cfd4e3'
        },
        extra: {
          bar: {
            type: "group",
            width: 6,
            barColorList: [
              ['#389FFF', '#2C66F7'],
              ['#708DFF', '#6858F5'],
              ['#94CBFF', '#3283FB']
            ],
            linearType: 'custom',
            barBorderCircle: true,
          }
        }
      })
    }
  },
  mounted () {
  },
  methods: {
    getServerData () {
      let { dataShow, tabIndex, pageData, sceneType, isHarmony, bussinessType } = this
      /** 
       * (sceneType 0: 2.1场景， 1：1.1场景) (bussinessType 1:延保， 3：权益)
       * 2.1场景 鸿蒙---问界/鸿蒙 [本月交付客单价] 改成 [整车延保成交数]
       * 2.1场景 非鸿蒙---选延保  [本月交付客单价] 改成 [整车延保成交数] 
       * 2.1场景 非鸿蒙---权益 [本月交付成交率] 改为 [广联权益渗透率]; [本月交付客单价] 改成 [广联权益成交数]
       */
      if (sceneType == 0) {
        if (isHarmony) {
          this.tabList[1] = '整车延保成交数'
        } else {
          if (bussinessType == 1) this.tabList[1] = '整车延保成交数'
          else this.tabList = ['广联权益渗透率', '广联权益成交数']
        }
      }
      let list = [],
        categories = [],
        data = [],
        defaultList = []
      if (tabIndex == 0) Object.keys(rateList).map(key => {
        list.push({
          text: rateList[key],
          value: pageData[key]
        })
      })
      else Object.keys(priceList).map(key => {
        list.push({
          text: priceList[key],
          value: pageData[key]
        })
      })
      list.sort((a, b) => b.value - a.value)
      list.map(e => {
        categories.push(e.text)
        data.push(e.value || 0)
        defaultList.push(e.value == null)
      })
      let series = [{
        defaultList,
        hideData: !dataShow,
        textSize: 14,
        textColor: '#333',
        data
      }]
      if (tabIndex == 0) series[0].afterUnit = '%'
      if (sceneType == 1 && tabIndex == 1) series[0].beforeUnit = '¥' //轻改
      this.chartData = {
        categories,
        series,
      }
    },
    changeTab (index) {
      this.tabIndex = index
      this.getServerData()
    }
  }
}
</script>

<style scoped lang="scss">
.line-bar-box {
  height: toRpx(388);
  box-sizing: border-box;
  padding: toRpx(24);
  .tabs {
    width: toRpx(544);
    height: toRpx(64);
  }
  .canvas {
    height: toRpx(260);
  }
}
</style>
