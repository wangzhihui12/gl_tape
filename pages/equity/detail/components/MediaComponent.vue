<!--
 * @Author: yangming@didihu.com.cn yangming@didihu.com.cn
 * @Date: 2024-11-22 20:45:03
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-19 15:15:22
 * @FilePath: \gl-tape\pages\equity\detail\components\MediaComponent.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view :class="['layout', { 'byd-layout': isByd }]">
    <wnCanvas
      :drawStatus="penSwitch"
      :canvasId="`c-${madiaId}`"
      custom
      @scale="$emit('scale', $event)"
      ref="canvasRef"
    >
      <template slot="customContent">
        <view class="layout-content">
          <page-title
            :title="title"
            :hasCarBrand="hasCarBrand"
            :show="show"
          />
          <template v-if="hasCarBrand">
            <image
              :key="viewKey"
              class="content"
              :src="views[customerInfo.carModelId] || require('@/assets/images/media/nothing.webp')"
            />
          </template>
          <template v-else>
            <template v-if="views">
              <image
                v-if="views.detailUrl"
                class="content"
                :src="views.detailUrl"
              />
              <!-- <image
                v-if="views.bgUrl"
                class="bg"
                :src="views.bgUrl"
              /> -->
            </template>
          </template>
        </view>
      </template>
    </wnCanvas>
  </view>
</template>

<script type="text/ecmascript-6">
import PageTitle from './PageTitle.vue'
export default {
  props: {
    views: [Array, Object],
    penSwitch: Boolean,
    title: String,
    madiaId: Number,
    isByd: Boolean,
    show: Boolean,
    hasCarBrand: Boolean
  },
  components: {
    PageTitle
  },
  name: 'MediaComponent',
  data () {
    return {
    }
  },
  watch: {
  },
  computed: {
    customerInfo () {
      return this.$store.state.user.customerInfo
    },
    viewKey () {
      return this.$store.state.user.viewKey
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  &-content {
    height: 100%;
    position: relative;
    margin: $margin;
  }
  .content {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .bg {
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
  }
}
</style>
