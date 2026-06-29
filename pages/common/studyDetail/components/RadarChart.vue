<template>
  <view >
    <template v-if="hasData">
      <qiun-data-charts type="radar" :opts="opts" :tooltipShow="false" :chartData="chartData" :class="['charts-box', heightClass]" />
    </template>
    <template v-else>
      <view class="nothing flex" :class="['big-height']">
          <image class="icon" src="../../../../assets/images/boutique/nothing.webp" />
          暂无数据
        </view>
    </template>
  </view>
</template>
<script>
export default {
  name: 'RadarChart',
  props: {
    chartData: {
      type: Object,
      default: () => ({})
    },
    heightClass: {
      type: String
    },
    labelColors: {
      type: Array,
      default: () => ['#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666']
    }
  },
  computed: {
    hasData () {
      const c = this.chartData && Array.isArray(this.chartData.categories) ? this.chartData.categories : []
      const s0 = this.chartData && Array.isArray(this.chartData.series) ? this.chartData.series[0] : null
      const d = s0 && Array.isArray(s0.data) ? s0.data : []
      return c.length > 0 && d.length > 0
    }
  },
  watch: {
    labelColors: {
      handler(newVal) {
        console.log(newVal, 'newVal')
        if (Array.isArray(newVal) && newVal.length) {
          this.opts.labelColors = newVal
        } else {
          const len = (this.chartData && Array.isArray(this.chartData.categories)) ? this.chartData.categories.length : 0
          this.opts.labelColors = len ? Array.from({ length: len }, () => '#666666') : []
        }
      },
    }
  },
  data() {
    return {
      opts: {
        color: ["#3B73FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
        padding: [0, 5, 0, 5],
        dataLabel: false,
        enableScroll: false,
        // labelColors: ['#666666', '#666666', '#666666', '#666666', '#666666', '#EB4E4E', '#666666', '#EB4E4E', '#666666'],
        fontSize: 12,
        legend: {
          show: false
        },
        extra: {
          radar: {
            gridType: "radar",
            gridColor: "#dae8fd",
            gridCount: 3,
            opacity: 0.2,
            max: 3,
            labelShow: true,
            dataPointShape: false,
            axisLabelTofix: 1, // 保留一位小数
            labelFormatter: function (val) {
              // 精确到小数点后一位
              return typeof val === 'number' ? val.toFixed(1) : val;
            }
          }
        }
      },
    }
  },
  mounted() {
    console.log(this.chartData, ' 详情')
    // 首次进入时父组件可能还没算出 labelColors，这里做一次兜底
    if (!Array.isArray(this.opts.labelColors) || !this.opts.labelColors.length) {
      const len = (this.chartData && Array.isArray(this.chartData.categories)) ? this.chartData.categories.length : 0
      if (len) this.opts.labelColors = Array.from({ length: len }, () => '#666666')
    }
  }
}
</script>
<style lang="scss" scoped>
.charts-box {
  width: 100%;
  height: toRpx(272);
  &.big-height {
    height: toRpx(300);
  }
}
.nothing {
  width: 100%;
  height: toRpx(228);
  flex-direction: column;
  margin-top: toRpx(76);
  font-size: toRpx(24);
  color: #999999;
  box-sizing: border-box;
  &.big-height {
    height: toRpx(234);
  }

  .icon {
    width: toRpx(288);
    height: toRpx(144);
    margin-bottom: toRpx(4);
  }
}

</style>