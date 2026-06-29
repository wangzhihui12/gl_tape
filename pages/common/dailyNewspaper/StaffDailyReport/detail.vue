<template>
  <view class="daily-report">
    <view class="common-title">
      基础信息
    </view>
    <view class="content">
      <template v-if="loadComplete">
        <template v-if="list.length">
          <template v-for="(item, index) in list">
            <template v-if="item.type == 'group'">
              <view
                v-if="itemShow(item)"
                class="group-box"
                :key="`group-${index}`"
              >
                <view class="group-title">{{ item.label }}</view>
                <view class="group-list">
                  <template v-for="(child, childIndex) in item.children">
                    <view
                      class="item"
                      :key="`child-${childIndex}`"
                    >
                      <view class="label">{{ child.label }}</view>
                      <view class="value"><text>{{ formatValue(child.value) }}</text></view>
                    </view>
                  </template>
                </view>

              </view>
            </template>
            <template v-else>
              <view
                v-if="itemShow(item)"
                :class="['item',{ 'before-divider': isFollowedByGroup(index)},{'frist': index === 0}]"
                :key="`item-${index}`"
              >
                <view class="label">{{ item.label }}</view>
                <view class="value">
                  <text>{{  formatValue(item.value)  }}</text>
                   <template v-if="item.unit  && formatValue(item.value) != '-'">
                    <text class="unit">{{ item.unit }}</text>
                  </template>
                </view>
              </view>
            </template>
          </template>
        </template>
        <nothing v-else />
      </template>
    </view>

  </view>
</template>

<script type='text/ecmascript-6'>
import Nothing from '../components/Nothing'
import utils from '@/utils/utils'

export default {
  components: { Nothing },
  name: 'detail',
  props: {
    templateData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loadComplete: false,
      list: []
    }
  },
  watch: {
    templateData: {
      handler (newVal) {
        if (newVal.length) this.formatData(newVal)
        else {
          this.list = []
          this.loadComplete = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
  },
  mounted () {

  },
  methods: {
    itemShow (i) {
      if (i.rules) {
        let { keys, result } = i.rules,
          { list } = this
        if (keys && result) {
          let params = keys.map((c, index) => `val${index + 1}`),
            // 将 new Function 改为 eval 方式
            func = eval(`(function(${params.join(',')}) { return ${result}; })`),
            value = []
          keys.map(key => {
            let item = list.find(i => i.key == key)
            if (item) value.push(item.value || null)
          })
          let show = func(...value)
          i.show = show
          return show
        } else {
          i.show = true
          return true
        }
      } else {
        i.show = true
        return true
      }
    },
    isFollowedByGroup (index) {
      const prevItem = this.list[index + 1];
      return prevItem && prevItem.type === 'group';
    },
    formatValue (value) {
      return value !== null && value !== undefined && value !== '' ? value : '-'
    },
    formatData (list) {
      this.list = utils.deepClone(list)
      this.loadComplete = true
    }
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  position: relative;
  .content {
    height: calc(100% - #{toRpx(120)});
    overflow-y: auto;
    padding: 0 48rpx 32rpx;
    box-sizing: border-box;
  }
  .divider {
    color: #333333;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 48rpx;
    margin-bottom: 24rpx;
    padding-top: 16rpx;
  }
  .item {
    display: flex;
    align-items: flex-start;
    gap: 32rpx;
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 32rpx 16rpx;
    font-size: 28rpx;
    font-weight: 400;
    color: #333333;
    .label,
    .value {
      width: calc(50% - #{toRpx(16)});
      word-break: break-all;
    }
    .label {
      color: #999999;
    }
  }
  .item.before-divider {
    padding-bottom: 28rpx;
    border-radius: 0 0 16rpx 16rpx;
  }
  .frist {
    padding-top: 28rpx;
    border-radius: 16rpx 16rpx 0 0;
  }
  .group-box {
    width: 100%;
    margin-top: 16rpx;
    .group-title {
      font-size: 32rpx;
      font-weight: 600;
      line-height: 44rpx;
      padding: 16rpx 0 24rpx;
    }
    .group-list {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      border-radius: 16rpx;
      background: #fff;
      padding: 28rpx 32rpx;
      .item {
        padding: 0;
      }
    }
  }
}
</style>