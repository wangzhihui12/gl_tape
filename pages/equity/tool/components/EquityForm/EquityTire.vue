<template>
  <view class="equity-tire">
    <GlCell
      :formList="[formList]"
      :formData="tireObj"
      @handleLabelTips="handleLabelTips"
    >
      <template #tireHtml>
        <view class="tire-box">
          <template v-for="(i,index) in tireList">
            <view
              class="tire-item"
              :key="index"
            >
              <view class="label flex">
                {{i.name}}
                <template v-if="index == 0">
                  <view
                    class="tips"
                    @click="handleLabelTips(i)"
                  >位置示例</view>
                </template>
              </view>
              <view class="content">
                <GlCell
                  :formList="[i.list]"
                  :formData="tireObj"
                  :index="index"
                  :cellBoxStyle="cellBoxStyle"
                />
              </view>
            </view>
          </template>
        </view>

      </template>
    </GlCell>
  </view>
</template>

<script type='text/ecmascript-6'>

import { TIRE_FORM_LIST, TIRE_LIST } from './contant'
import utils from '@/utils/utils'
import GlCell from '@/components/Form/GlCell.vue'


export default {
  name: 'EquityTire',
  props: {
    externalData: null,
  },
  components: {
    GlCell,
  },
  data () {
    return {
      formList: utils.deepClone(TIRE_FORM_LIST),
      tireList: utils.deepClone(TIRE_LIST),
      cellBoxStyle: 'background: #f5f7fa;',
      tireObj: {}
    }
  },
  watch: {
    externalData: {
      handler (val) {
        if (Object.keys(this.tireObj).length) return
        const keyList = [
          'tireBrand', 'tireScale',
          'leftFrontDTO', 'leftFrontBatch',
          'rightFrontDTO', 'rightFrontBatch',
          'leftRearDTO', 'leftRearBatch',
          'rightRearDTO', 'rightRearBatch'
        ]
        keyList.map(key => {
          this.tireObj[key] = val[key]
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    handleLabelTips (item) {
      let { tipsUrl } = item
      uni.previewImage({
        urls: [tipsUrl]
      })
    },
  }
}
</script>

<style scoped lang='scss'>
.tire-box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 toRpx(32);
  gap: toRpx(16) toRpx(32);
  .tire-item {
    .label {
      height: toRpx(68);
      color: #999999;
      font-size: toRpx(26);
      .tips {
        color: #4673ff;
        font-size: toRpx(24);
        margin-left: toRpx(8);
      }
    }
    .content {
      border-radius: toRpx(16);
    }
  }
}
</style>