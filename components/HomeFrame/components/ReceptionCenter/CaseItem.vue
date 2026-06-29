<template>
  <view
    class="case-item-component"
    @click="jumpDetail(item)"
  >
    <image
      class="img"
      :src="item.cover || 'https://img02.glsx.com.cn/weapp/resource/app-tape/common/default-cover.webp'"
      :style="imgStyle"
      mode="aspectFill"
    ></image>
    <view class="case-info">
      <view class="case-name text-hide">{{ item.title }}</view>
      <template v-for="(j, ind) in caseInfo">
        <view
          class="case-text flex"
          :key="ind"
        >
          <view class="case-label">{{ j.label }}：</view>
          <view :class="['case-value', j.class]">
            <template v-if="j.format">
              {{ j.format(item) }}
            </template>
            <template v-else>
              {{ item[j.key] || '--' }}
            </template>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CaseItem',
  props: {
    item: Object,
    source: {
      type: Number,
      default: 1
    },
    visitsId: [Number, String],
    imgStyle: String
  },
  data () {
    return {
      caseInfo: [
        {
          label: '业务场景',
          class: 'text-hide',
          format: (val) => {
            // 业务场景：0-会员权益/升级；1-精品升级；2-次新车转化；3-售后众筹；4-积分商城
            return val ? {
              0: '会员权益/升级',
              1: '精品升级',
              2: '次新车转化',
              3: '售后众筹',
              4: '积分商城'
            }[val.scene] : '--'
          }
        },
        {
          label: '客户标签',
          key: 'tags',
          class: 'text-hide'
        },
        {
          label: '适用套餐',
          key: 'goods',
          class: 'text-two-line'
        },
      ],
    }
  },
  mounted () {
  },
  methods: {
    jumpDetail (item) {
      const { source, visitsId } = this
      let params = `id=${item.id}&source=${source}`
      if (visitsId) params += `&visitsId=${visitsId}`
      // 类型：0-图片；1-视频；2-pdf；3-富文本
      let url = `/pages/common/caseDetail?${params}`
      if (item.type != 3) {
        let fileUrl = item?.detailInfos[0]?.image
        if (item.type == 2) url = `/pages/common/webview?fileUrl=${fileUrl}&title=${item.title}&${params}`
        if (item.type == 1 || item.type == 0) url = `/pages/boutique/preview?tabName=${item.title}&sourceType=${item.type == 1 ? 2 : 1}&detailUrl=${fileUrl}&${params}`
      }
      uni.navigateTo({
        url: `${url}`
      })
    },
  }
}
</script>

<style scoped lang='scss'>
.case-item-component {
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 toRpx(8) toRpx(24) 0 #2c66f71a;
  border-radius: toRpx(16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .img {
    width: 100%;
    height: toRpx(324);
  }
  .case-name {
    font-weight: 500;
    font-size: toRpx(28);
    color: #333333;
    line-height: toRpx(48);
    padding: toRpx(16) toRpx(32) toRpx(8);
  }
  .case-text {
    align-items: flex-start;
    font-size: toRpx(24);
    color: #666666;
    line-height: toRpx(40);
    padding: 0 toRpx(32);
    margin-bottom: toRpx(4);
  }
  .case-label {
    width: toRpx(120);
    flex-shrink: 0;
  }
}
</style>