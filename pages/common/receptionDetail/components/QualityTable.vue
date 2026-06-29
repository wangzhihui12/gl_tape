<template>
  <div class="quality-table-box">
    <reception-title
      title="质检明细"
      icon="reception-2"
    />
    <div class="quality-table">
      <view class="quality-title-box flex">
        <template v-for="(i,index) in qualityTitle">
          <view
            :class="['title-item flex',`row-${index + 1}`]"
            :key="index"
          >{{i}}</view>
        </template>
      </view>
      <view class="quality-content">
        <scroll-view
          class="table"
          scroll-y
        >
          <template v-if="flag">
            <template v-for="(i,index) in qualityData">
              <view
                class="quality-item"
                :key="index"
              >
                <template v-for="(key,ind) in keyList">
                  <div
                    :key="`${index}-${ind}`"
                    :class="['flex item',`row-${ind + 1}`]"
                  >
                    <template v-if="key == 'hitTextList'">
                      <view class="text-two-line">
                        <template v-if="i[key] && i[key].length">
                          <template v-for="(k,kindex) in i[key]">
                            <rich-text
                              @click="open(i)"
                              :key="`text_${index}_${kindex}`"
                              :nodes="k"
                            ></rich-text>
                          </template>
                        </template>
                        <template v-else>暂无命中文本</template>
                      </view>
                    </template>
                    <template v-else>
                      {{i[key]}}
                    </template>
                  </div>
                </template>
              </view>
            </template>
          </template>
        </scroll-view>
      </view>
    </div>

    <uni-popup
      ref="popup"
      type="bottom"
    >
      <view class="detail-box">
        <view
          class="close-box flex"
          @click="close"
        >
          <uni-icons
            type="clear"
            :size="28"
            color="#76787f"
          ></uni-icons>
        </view>
        <view class="title">{{hitTextDetail.tagGroupName}} {{hitTextDetail.formatScore}}</view>
        <view class="content">
          <template v-for="(k,kindex) in hitTextDetail.hitTextList">
            <rich-text
              :key="`text_${kindex}`"
              :nodes="k"
            ></rich-text>
          </template>
        </view>
      </view>
    </uni-popup>
  </div>
</template>

<script type='text/ecmascript-6'>
import ReceptionTitle from './ReceptionTitle.vue'

export default {
  components: {
    ReceptionTitle
  },
  name: '',
  props: {
    qualityData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      qualityTitle: Object.freeze(['一级分类', '质检得分', '命中文本']),
      flag: true,
      qualityList: [],
      keyList: Object.freeze(['tagGroupName', 'formatScore', 'hitTextList']),
      hitTextDetail: []
    }
  },
  mounted () {
  },
  methods: {
    open (hitTextDetail) {
      this.hitTextDetail = hitTextDetail
      this.$refs.popup.open("center");
    },
    close () {
      this.$refs.popup.close()
    }
  }
}
</script>

<style scoped lang='scss'>
.quality-table-box {
  height: calc(100% - #{toRpx(268)});
  .quality-table {
    height: calc(100% - #{toRpx(136)});
    width: 100%;
    box-sizing: border-box;
    border-radius: toRpx(16);
    overflow: hidden;
    .quality-title-box {
      height: toRpx(88);
      background: #edf3ff;
      border-radius: toRpx(16) toRpx(16) 0 0;
      font-size: toRpx(26);
      line-height: toRpx(40);
      .title-item {
        height: toRpx(88);
        justify-content: center;
        box-sizing: border-box;
        flex-shrink: 0;
        color: #000;
      }
    }
    .row-1 {
      width: toRpx(272);
    }
    .row-2 {
      width: toRpx(248);
      border-right: toRpx(4) solid #fff;
      border-left: toRpx(4) solid #fff;
    }
    .row-3 {
      width: calc(100% - #{toRpx(520)});
    }
    .quality-content {
      height: calc(100% - #{toRpx(88)});
      display: flex;
      box-sizing: border-box;
      border-top: toRpx(4) solid #ffffff;
      .table {
        height: 100%;

        .quality-item {
          display: flex;
          border-bottom: toRpx(4) solid #ffffff;
          color: #333;
          .item {
            min-height: toRpx(84);
            background: #f7f8fa;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            box-sizing: border-box;
          }
          .row-3 {
            padding: toRpx(24) toRpx(48);
            justify-content: flex-start;
          }
        }
      }
    }
  }
}

.detail-box {
  position: relative;
  width: toRpx(1020);
  max-height: toRpx(640);
  border-radius: toRpx(40);
  padding: 0 toRpx(64) toRpx(88);
  box-sizing: border-box;
  overflow: hidden;
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: toRpx(240);
    background-image: linear-gradient(180deg, #e5edfe 0%, #ffffff 100%);
    content: '';
    z-index: -1;
  }
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    content: '';
    background-color: #fff;
    z-index: -2;
  }
  .icon-bao {
    position: absolute;
    top: toRpx(48);
    right: toRpx(68);
  }
  .close-box {
    position: absolute;
    width: toRpx(136);
    height: toRpx(136);
    top: 0;
    right: 0;
    justify-content: center;
    z-index: 2;
  }
  .title {
    font-weight: 500;
    font-size: toRpx(40);
    color: #292d33;
    line-height: toRpx(64);
    padding: toRpx(24) 0;
  }
  .content {
    max-height: toRpx(400);
    font-size: toRpx(30);
    color: #292d33;
    line-height: toRpx(48);
    overflow-y: auto;
    word-break: break-all;
  }
}
</style>