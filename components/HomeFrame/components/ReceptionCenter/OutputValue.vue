<template>
  <view class="output-value-box">
    <view class="output-value-title">本月产值</view>
    <view class="output-value">
      <view class="value">
        {{formattedNumber('actualProduction')}}<view class="unit">万</view>
      </view>
      <view class="sub-value flex">
        个人产值<view class="num">{{formattedNumber('personalProduction')}}万</view>
      </view>
    </view>
    <view class="output-canvas">
      <qiun-data-charts
        type="arcbar"
        :opts="opts"
        :chartData="chartData"
        :tooltipShow="false"
      />
    </view>
    <view class="output-view flex">
      <view class="item flex">目标<view class="num">{{formattedNumber('targetProduction')}}万</view>
      </view>
      <view class="item flex">达成比例<view class="num">{{formattedNumber('achievementRatio','%')}}</view>
      </view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import NP from 'number-precision'
export default {
  name: '',
  props: {
    pageData: {
      type: Object,
      default: () => { }
    },
    dataShow: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    dataShow: {
      immediate: true,
      handler (newval) {
        if (Object.keys(this.chartData).length) this.getServerData()
      }
    },
    pageData: {
      immediate: true,
      handler (newval) {
        this.getServerData()
      }
    }
  },
  data () {
    return {
      chartData: {},
      opts: {
        padding: undefined,
        title: {
          name: "产值贡献",
          fontSize: 12,
          color: "#333"
        },
        subtitle: {
          fontSize: 14,
          color: "#4673FF"
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 11,
            backgroundColor: "#4673ff1a",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2,
            linearType: 'custom',
            customColor: ['#2C66F7', '#389FFF']
          }
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    getServerData () {
      let { dataShow } = this,
        data = this.pageData.productionContribution
      this.opts.subtitle.name = data == null ? '--' : `${this.pageData.productionContribution}%`
      this.chartData = {
        series: [
          {
            hideData: !dataShow,
            data: NP.divide(data || 0, 100)
          }
        ]
      }
    },
    formattedNumber (key, unit) {
      let { dataShow, pageData } = this,
        num = pageData[key]
      if (unit && num) num += unit
      if (!dataShow || num == null) num = '--'
      return num
    }
  }
}
</script>

<style scoped lang='scss'>
.output-value-box {
  height: toRpx(366);
  position: relative;
  .output-value-title {
    font-size: toRpx(28);
    font-weight: 500;
    padding: toRpx(24) toRpx(32) 0;
  }
  .output-value {
    padding: toRpx(54) 0 0 toRpx(52);
    .value {
      display: flex;
      align-items: baseline;
      color: #4673ff;
      font-size: toRpx(40);
      line-height: toRpx(48);
      font-weight: 700;
      margin-bottom: toRpx(14);
      .unit {
        color: #333333;
        font-size: toRpx(26);
        font-weight: 400;
        margin-left: toRpx(4);
        line-height: toRpx(36);
      }
    }
    .sub-value {
      color: #333333;
      font-size: toRpx(24);
      .num {
        color: #4673ff;
        font-size: toRpx(28);
        font-weight: 700;
        margin-left: toRpx(8);
      }
    }
  }
  .output-canvas {
    position: absolute;
    right: toRpx(40);
    top: toRpx(60);
    width: toRpx(200);
    height: toRpx(200);
  }

  .output-view {
    position: absolute;
    left: 50%;
    bottom: toRpx(32);
    transform: translateX(-50%);
    width: toRpx(528);
    height: toRpx(58);
    border-radius: toRpx(450);
    background: #4673ff0d;
    color: #333333;
    font-size: toRpx(24);
    &::after {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      content: '';
      width: toRpx(2);
      height: toRpx(28);
      background: #cfd4e3;
    }
    .item {
      justify-content: center;
      width: 50%;
      flex-shrink: 0;
      .num {
        margin-left: toRpx(8);
        color: #4673ff;
        font-size: toRpx(28);
        font-weight: 700;
      }
    }
  }
}
</style>