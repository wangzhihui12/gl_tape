<template>
  <view
    class="material-item flex"
    @click="jump"
  >
    <!-- <view :class="['status', {'status-green':item.readStatus == 0}]">{{readStatusEnum[item.readStatus]}}</view> -->
    <view class="icon">
      <template v-if="item.cover">
        <image
          class="image"
          :src="item.cover"
        />
      </template>
      <template v-else>
        <image
          class="image"
          :src="imgUrl(item)"
        />
      </template>
      <view class="label">{{materialTypeEnum[item.type]}}</view>
    </view>
    <view class="text">
      <view class="title">{{item.title}}</view>
      <view class="tags">
        <template v-for="i in item.sceneMarketTagsList">
          <view
            class="tag"
            :key="i.id"
          >{{i.tagName}}</view>
        </template>
      </view>
      <view class="date">{{item.date||''}}</view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    item: Object,
    sceneMarketLevelTwoItem: Object
  },
  name: '',
  data () {
    return {
      materialTypeEnum: Object.freeze({
        0: '图片',
        1: '视频',
        2: 'PDF',
        3: '富文本',
        4: 'Excel',
        5: 'Word'
      }),
      // readStatusEnum: Object.freeze({
      //   0: '已查看',
      //   1: '未查看'
      // })
    }
  },
  mounted () {
  },
  methods: {
    imgUrl (item) {
      return `https://img02.glsx.com.cn/weapp/resource/dj-car-boutique-work-wechat/equity/material/material-${item.type}.png`
    },
    async jump () {
      let { item, sceneMarketLevelTwoItem } = this,
      params = `id=${item.id}&specialFlag=${sceneMarketLevelTwoItem.specialFlag}&directoryName=${sceneMarketLevelTwoItem.directoryName}`
      // 类型：0-图片；1-视频；2-pdf；3-富文本; 4-Excel; 5-Word
      let url = `/pages/common/caseDetail?${params}`
      uni.$track.add({ eventCode: 'scene_market', businessId: item.id })
      if (item.type != 3) {
        uni.showLoading({
          mask: true
        })
        const data = await uni.$api.customerApi.getMaterialDetail({
          id: item.id
        })
        uni.hideLoading()
        let fileUrl = data?.detailInfos[0]?.image
        if (item.type == 1 || item.type == 0) url = `/pages/boutique/preview?tabName=${item.title}&sourceType=${item.type == 1 ? 2 : 1}&detailUrl=${fileUrl}&${params}`
        else url = `/pages/common/materialDetail/index?fileUrl=${fileUrl}&title=${item.title}&${params}`
      }
      uni.navigateTo({
        url: `${url}`
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.material-item {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 toRpx(16);
  .status {
    position: absolute;
    right: 0;
    top: 0;
    height: toRpx(40);
    line-height: toRpx(40);
    width: fit-content;
    padding: 0 toRpx(12);
    font-size: toRpx(22);
    color: #999999;
    background: #9999991a;
    border-radius: toRpx(4);
  }

  .status-green {
    color: #35c376;
    background: #35c3761a;
  }

  .icon {
    width: toRpx(128);
    height: toRpx(128);
    margin-right: toRpx(16);
    flex-shrink: 0;
    position: relative;

    .image {
      width: 100%;
      height: 100%;
      border-radius: toRpx(8);
      overflow: hidden;
    }

    .label {
      display: flex;
      align-items: center;
      padding: 0 toRpx(6);
      position: absolute;
      width: fit-content;
      color: #ffffff;
      left: toRpx(8);
      top: toRpx(8);
      height: toRpx(28);
      background: #00000066;
      border-radius: toRpx(4);
      font-size: toRpx(20);
    }
  }

  .text {
    width: calc(100% - #{toRpx(144)});

    .title {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #333333;
      font-size: toRpx(30);
      font-weight: 700;
    }

    .tags {
      display: flex;
      align-items: center;
      gap: 0 toRpx(8);
      margin: toRpx(8) 0;
      .tag {
        display: flex;
        align-items: center;
        height: toRpx(40);
        background: #75bcff1a;
        padding: 0 toRpx(12);
        width: fit-content;
        color: #2d66f7;
        font-size: toRpx(22);
        border-radius: toRpx(4);
      }
    }

    .date {
      color: #999999;
      font-size: toRpx(24);
    }
  }
}
</style>