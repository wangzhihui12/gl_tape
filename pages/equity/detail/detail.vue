<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: limin
 * @LastEditTime: 2026-01-07 19:23:33
-->
<template>
  <view
    class="detail-box"
    :key="dateilKey"
  >
    <view
      class="nav-bar"
      :style="{ 'z-index': backZindex }"
    >
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
    </view>
    <template v-for="(item, index) in renderList">
      <!-- 极端性能优化：只渲染当前页及其左右邻居的空壳容器，更远的直接移除 DOM -->
      <view
        v-if="shouldRender(index)"
        :class="['view', { showView: id == item.id }, modeName]"
        :key="item.id"
        :style="getViewStyle(item.id)"
        @touchstart.stop="touchStart"
        @touchmove.stop="touchMove"
        @touchend.stop="touchEnd"
      >
        <view class="component-wrapper">
          <!-- 核心内容：只有在 isComponentLoaded 为 true 时才真正渲染子组件 -->
          <!-- 并且增加 v-if="shouldRenderContent(index)" 双重保险，确保非邻居页的重组件彻底销毁 -->
          <component
            class="fade-in-component"
            v-if="isComponentLoaded(index) && shouldRenderContent(index)"
            @full="handleFull"
            :detail="item"
            :is="item.componentName"
            :views="item.receptionSourceDetailList || []"
            :penSwitch="penSwitch"
            :show="id == item.id"
            :ref="'media' + item.id"
            :title="item.detailTitle || ''"
            :madiaId="item.id"
            @scale="scale"
            :ulList="item.ulList"
            :screenList="item.screenList"
            @onProductModel="productModelStatus = $event"
            :isPreview="isPreview"
            :isByd="isByd"
            :hasCarBrand="item.hasCarBrand"
            :aitoCarModelIds="aitoCarModelIds"
          />
        </view>
      </view>
    </template>
    <template v-if="type != 'preview'">
      <template v-if="backZindex">
        <tool-box
          ref="toolRef"
          :data="pageToolList"
          :type="type"
          @choose="choose"
          @finish="open"
          :id="id"
          @toPay="toPay"
          :showPayBtn="watchPayInfo"
        />
        <view
          class="pen-box"
          @click="drawStatus = !drawStatus"
        >
          <view :class="['sprite-icon', `${!drawStatus ? 'icon-pen' : 'icon-pen-active'}`]"></view>
        </view>
      </template>
    </template>
    <pay-pop
      ref="pay"
      @jumpPay="showPayPage = true"
    ></pay-pop>
    <finish-step
      ref="stepRef"
      @submit="done"
      :titleTips="finishTips"
    />
    <informationEntry
      :showPayPage.sync="showPayPage"
      @finish="open"
    />
  </view>
</template>
<script>
import ToolBox from '@/components/ToolBox.vue'
import Reception from './components/Reception.vue'
import CaseCenter from './components/CaseCenter.vue'
import MediaComponent from './components/MediaComponent.vue'
import History from './components/History.vue'
import ThreeGuarantees from './components/ThreeGuarantees.vue'
import payPop from './components/payPop.vue'
import FinishStep from '@/components/FinishStep.vue'
import { mapMutations } from 'vuex'
import informationEntry from './components/informationEntry.vue'
import insurance from '@/components/Insurance/Insurance.vue'
import { receptionTrackMixin } from '@/mixin/index.js'
export default {
  components: {
    ToolBox,
    Reception,
    MediaComponent,
    payPop,
    CaseCenter,
    FinishStep,
    History,
    ThreeGuarantees,
    informationEntry,
    insurance
  },
  props: {
    id: [String, Number],
    media: Array,
    type: {
      type: String,
      default: 'preview'
    },
    toolList: Array,
    aitoCarModelIds: Array,
    mediaId: [String, Number]
  },
  mixins: [receptionTrackMixin],
  data () {
    return {
      backZindex: 9,
      drawStatus: false,
      startX: null,
      startY: null,
      screenWidth: null,
      scaleValueObject: {},
      showPayPage: false,
      productModelStatus: false,
      modeName: '',
      pageToolList: [],
      moduleList: [],
      useCarConfig: false,
      dateilKey: Date.now(),
      currentMediaId: '',
      touchDiffX: 0,
      isTouching: false,
      loadedIndexes: [] // 记录已加载组件的索引
    }
  },
  computed: {
    channelType () {
      const { channelType } = uni.$storage.get('userInfo')
      return channelType
    },
    shopMerchantId () {
      const { shopMerchantId } = uni.$storage.get('userInfo')
      return shopMerchantId
    },
    sceneType () {
      const { sceneType } = uni.$storage.get('userInfo')
      return sceneType
    },
    currentCarInfo () {
      return this.$store.state.user.currentCarInfo
    },
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    penSwitch () {
      return !this.isPreview && this.drawStatus
    },
    watchPayInfo () {
      return this.$store.state.user.paymentType.length ? true : false
    },
    title () {
      let { id } = this,
        name = this.media.find(e => e.id == id)?.detailTitle || ''
      return name
    },
    finishTips () {
      let text = ''
      if (this.channelType == 3) text = '检测到“汽车保险告知书”中未填写客户档案，请填写后再完成接待。'
      return text
    },
    isByd () {
      return this.channelType == 2
    },
    isPreview () {
      return this.type == 'preview'
    },
    customerInfo () {
      return this.$store.state.user.customerInfo
    },
    viewKey () {
      return this.$store.state.user.viewKey
    },
    // 缓存当前渲染列表，避免在 template 中重复计算三元表达式
    renderList() {
      return this.useCarConfig ? this.moduleList : this.media
    },
    // 缓存当前 ID 的索引，避免在 v-if 中重复查找
    currentIndex() {
      // 优化查找性能，如果列表很大，findIndex 可能会慢
      // 但由于我们已经按需渲染了，这里通常不会是瓶颈
      // 为了极致性能，可以考虑维护一个 map 或直接缓存 index
      if (!this.renderList || !this.renderList.length) return -1
      return this.renderList.findIndex(i => i.id == this.id)
    },
    carBrandOpenStatus () {
      return this.$store.state.user.carBrandOpenStatus
    },
  },
  watch: {
    // 监听 currentIndex 变化，处理预加载逻辑
    currentIndex: {
      immediate: true,
      handler(newVal) {
        if (newVal === -1) return
        
        // 1. 立即加载当前页
        this.addLoadedIndex(newVal)
        
        // 2. 延迟预加载前后页（防抖处理）
        if (this.preloadTimer) {
          clearTimeout(this.preloadTimer)
          this.preloadTimer = null
        }
        
        // 只有当用户停止滑动 300ms 后才开始预加载，避免滑动过程中的无效计算
        this.preloadTimer = setTimeout(() => {
           if (this._isDestroyed) return // 增加销毁判断
           if (!this.renderList) return
           
           const len = this.renderList.length
           if (len === 0) return
           
           const prev = newVal === 0 ? len - 1 : newVal - 1
           const next = newVal === len - 1 ? 0 : newVal + 1
           
           // 使用 requestAnimationFrame 或 $nextTick 分批执行，降低主线程压力
           this.$nextTick(() => {
             this.addLoadedIndex(prev)
             this.$nextTick(() => {
               this.addLoadedIndex(next)
             })
           })
        }, 300)
      }
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        if (newval) {
          this.useCarConfig = false
          this.dateilKey = Date.now()
          this.pageToolList = this.toolList
          this.currentMediaId = this.mediaId
          this.drawStatus = false
        }
      }
    },
    viewKey: {
      immediate: true,
      handler (newval) {
        if (this.id) this.setPageData()
      }
    },
    id: {
      immediate: true,
      handler (newval) {
        if(!this.pageToolList.length) this.pageToolList = this.toolList
      }
    }
    // toolList: {
    //   immediate: true,
    //   handler (newval) {
    //     this.setPageToolList()
    //   }
    // },
  },
  mounted () {
    const systemInfo = uni.getSystemInfoSync()
    this.screenWidth = systemInfo.screenWidth
  },
  beforeDestroy() {
    // 1. 清理所有定时器
    if (this.preloadTimer) clearTimeout(this.preloadTimer)
    if (this.rafId) clearTimeout(this.rafId) // 兼容 raf
    
    // 2. 深度清理数据引用，帮助 GC 快速回收
    // 将大对象置为 null，切断引用链
    this.moduleList = null
    this.pageToolList = null
    this.scaleValueObject = null
    this.loadedIndexes = null
    
    // 3. 手动触发组件销毁（虽然 Vue 会自动做，但显式重置有助于避免闭包内存泄漏）
    this.currentMediaId = null
  },
  methods: {
    ...mapMutations('audio', ['setReceptionStatus']),
    open () {
      this.$refs.stepRef.open()
    },
    handleFull (val) {
      this.backZindex = val ? 0 : 9
    },
    /**切换素材 */
    choose (e) {
      Object.keys(this.$refs).map(refKey => {
        let ref = this.$refs[refKey]
        if (ref) {
          if (Array.isArray(ref)) ref = ref[0]
          ref && ref.closeAllPopup && ref.closeAllPopup()
        }
      })
      this.receptionTrackLeave()
      this.$emit('update:id', e.id)
      uni.$logger.local.info(`预览${e.title}`)
    },
    back () {
      this.$refs?.toolRef?.hide()
      this.$emit('back')
    },
    done (e) {
      this.showPayPage = false
      this.$refs.toolRef.hide()
      this.$refs.stepRef.close()
      this.receptionTrackLeave()
      this.$emit('done', e)
    },
    toPay () {
      this.$refs.pay.show()
    },
    // dbClick () {
    //   if (!this.isPreview) this.drawStatus = !this.drawStatus
    // },
    getViewStyle(itemId) {
      if (this.id !== itemId) return {}
      
      // 回弹动画
      if (!this.isTouching && this.touchDiffX !== 0) {
        return {
          transform: `translateX(0px)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' // 丝滑回弹
        }
      }

      // 拖动中
      if (this.isTouching) {
        // 增加阻尼感：滑动距离越大，阻力越大
        // 使用 log 函数或衰减系数来模拟阻尼
        // 调整阻尼系数，让滑动更轻松
        // 1.0 = 1:1 跟手，没有任何阻力，感觉最轻盈
        const damping = 1.0 // 0.8 -> 1.0，完全跟手
        const dampedX = this.touchDiffX * damping
        return {
          transform: `translateX(${dampedX}px)`,
          transition: 'none'
        }
      }
      
      return {}
    },
    touchStart (e) {
      if(this.carBrandOpenStatus) return
      if (!this.drawStatus && e.changedTouches?.length) {
        this.startX = e.changedTouches[0].pageX
        this.startY = e.changedTouches[0].pageY
        this.isTouching = true
        this.touchDiffX = 0
        this.startTime = Date.now()
      }
    },
    touchMove (e) {
       if(this.carBrandOpenStatus) return
      if (!this.isTouching || this.drawStatus) return
      
      // 使用 requestAnimationFrame 优化滑动性能
      // 注意：uniapp 环境下可能需要使用 wxs 或者模拟 raf
      if (this.rafId) return
      
      this.rafId = setTimeout(() => {
         const touch = e.changedTouches[0]
         // 垂直滑动不触发水平拖动
         if (Math.abs(touch.pageY - this.startY) > Math.abs(touch.pageX - this.startX)) {
            this.rafId = null
            return
         }
         this.touchDiffX = touch.pageX - this.startX
         this.rafId = null
      }, 1000 / 60) // 限制在 60fps
    },
    touchEnd (e) {
      this.isTouching = false
       if(this.carBrandOpenStatus) return
      if (this.modeName) return
      try {
        let { pageToolList, drawStatus, startX, screenWidth, id, scaleValueObject, productModelStatus } = this
        
        // 如果没有触摸事件数据，重置并返回
        if (!e || !e.changedTouches || drawStatus || pageToolList.length == 0 || e.changedTouches.length === 0) {
           // 这里不需要手动重置 touchDiffX 为 0，因为 isTouching=false 后，getViewStyle 会自动处理回弹
           // 只需要在动画结束后清理状态即可
           setTimeout(() => { this.touchDiffX = 0 }, 400)
           return
        }
        
        const touch = e.changedTouches[0]
        const endX = touch.pageX
        const diffX = endX - startX
        
        // 垂直滑动距离过大
        if (Math.abs(this.startY - touch.pageY) > 100) {
          // 触发回弹
          setTimeout(() => { this.touchDiffX = 0 }, 400)
          return
        }
        
        // 滑动距离阈值
        // 降低阈值：screenWidth / 6 -> screenWidth / 8
        // 让用户不需要滑太远就能触发切换
        const isDistanceSignificant = Math.abs(diffX) > screenWidth / 8
        const index = pageToolList.findIndex(item => item.id == id)

        if (!scaleValueObject[id]) scaleValueObject[id] = 1
        
        if (isDistanceSignificant && index != -1 && scaleValueObject[id] == 1 && !productModelStatus) {
          const { nextId, modeName, title } = this.getNextId(index, pageToolList, diffX)
          
          this.modeName = modeName
          this.receptionTrackLeave()
          this.$emit('update:id', nextId)
          uni.$logger.local.info(`预览${title}`)
          
          // 切换成功，不需要回弹动画，直接重置
          this.touchDiffX = 0 
          setTimeout(() => {
            this.modeName = ''
          }, 500)
        } else {
          // 未触发切换，触发回弹
          // getViewStyle 会处理回弹动画
          // 动画结束后重置数据
          setTimeout(() => {
             this.touchDiffX = 0
          }, 400)
        }
      } catch (error) {
        console.log(error)
        this.touchDiffX = 0
      }
    },
    getNextId (index, pageToolList, diffX) {
      let nextItem = {},
        modeName = ''
      
      if (diffX < 0) {
        // 向左滑动 (diffX < 0)，表示想看右边的内容（下一个）
        // 动画效果应该是内容从右边进来 (to-right) 或者当前内容向左移出
        // 假设 to-right 是新页面从右侧滑入
        nextItem = index === pageToolList.length - 1 ? pageToolList[0] : pageToolList[index + 1]
        modeName = 'to-right' 
      } else {
        // 向右滑动 (diffX > 0)，表示想看左边的内容（上一个）
        // 动画效果应该是内容从左边进来 (to-left)
        nextItem = index === 0 ? pageToolList[pageToolList.length - 1] : pageToolList[index - 1]
        modeName = 'to-left'
      }
      return {
        nextId: nextItem.id,
        modeName,
        title: nextItem.title
      }
    },
    scale (e) {
      let { id } = this
      this.scaleValueObject[id] = e
    },
    // setPageToolList () {
    //   if (this.channelType == 1) {
    //     let { carModelId } = this.customerInfo
    //     const isAito = this.aitoCarModelIds?.findIndex(e => e == carModelId)
    //     if (carModelId && isAito == -1) {
    //       this.pageToolList = this.toolList.filter(e => !e.isAito)
    //     } else this.pageToolList = this.toolList
    //   } else this.pageToolList = this.toolList
    // },

    async setPageData () {
      const { shopMerchantId, sceneType, currentCarInfo } = this,
        { carBrandId, carChildsBrandId } = currentCarInfo,
        params = {
          brandId: carBrandId,
          subBrandId: carChildsBrandId
        }
      let storageName = `source_${sceneType}_${shopMerchantId}_${carBrandId}_${carChildsBrandId}`
      let data = uni.getStorageSync(storageName)
      try {
        let requestData = await uni.$api.systemApi.getSoureData(shopMerchantId, sceneType, params)
        if (requestData) this.setViewInfo(requestData)
      } catch (error) {
        if (data) this.setViewInfo(data)
      }
    },
    setViewInfo (data) {
      let { currentMediaId, id: pageId } = this,
        { id, moduleList, toolList } = data
      let { useCarConfig, moduleList: pageModuleList, media: pageMedia } = this,
        array = useCarConfig ? pageModuleList : pageMedia,
        { detailTitle } = array.find(item => item.id == pageId) || {} // 防止未找到报错
      this.receptionTrackLeave()
      // 使用 Object.freeze 冻结大对象，提升性能
      this.moduleList = Object.freeze(moduleList)
      this.pageToolList = Object.freeze(toolList)
      this.useCarConfig = true
      if (id != currentMediaId) {
        let jumpItem = moduleList.find(e => e.detailTitle == detailTitle)
        this.$emit('update:id', jumpItem ? jumpItem.id : moduleList[0].id)
      }
      this.currentMediaId = id
    },
    shouldRender(index) {
      const len = this.renderList.length
      const current = this.currentIndex
      
      // 异常情况保护：如果找不到当前索引，或者列表为空，默认渲染第一项或全部
      if (current === -1 || len === 0) return index === 0
      
      // 基础范围：当前页的前后一页
      if (Math.abs(index - current) <= 1) return true
      
      // 循环边界处理
      if (current === 0 && index === len - 1) return true
      if (current === len - 1 && index === 0) return true
      
      return false
    },
    // 进一步限制内容渲染范围：只保留当前页和左右各1页的内容
    // 即使 loadedIndexes 里有，如果距离太远，也要销毁内容以释放内存
    shouldRenderContent(index) {
      const current = this.currentIndex
      const len = this.renderList.length
      
      // 基础范围：当前页的前后一页
      if (Math.abs(index - current) <= 1) return true
      
      // 循环边界处理
      if (current === 0 && index === len - 1) return true
      if (current === len - 1 && index === 0) return true
      
      return false
    },
    // 判断组件是否应该实际渲染（配合 v-if）
    isComponentLoaded(index) {
      return this.loadedIndexes.includes(index)
    },
    addLoadedIndex(index) {
      if (!this.loadedIndexes.includes(index)) {
        this.loadedIndexes.push(index)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.detail-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
}
.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 9;
  pointer-events: none;
  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }
}
.pen-box {
  position: fixed;
  right: toRpx(40);
  top: 5%;
  width: toRpx(120);
  height: toRpx(120);
  z-index: 10;
  box-shadow: 0 toRpx(4) toRpx(12) 0 #00000033;
  border-radius: toRpx(16);
  overflow: hidden;
  image {
    width: 100%;
    height: 100%;
  }
}
.view {
    position: absolute; //验证
    width: 100%;
    height: 100%;
    z-index: -1;
    top: 0;
    left: 0;
    visibility: hidden;
    will-change: transform; // 提前告知浏览器该元素会变化，优化渲染
  }
  .component-wrapper {
    width: 100%;
    height: 100%;
    // 强制开启硬件加速，避免组件渲染引起的重排
    transform: translateZ(0); 
  }
.showView {
  position: absolute;
  z-index: 1;
  visibility: visible;
}
.to-left {
  animation: to-left 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.to-right {
  animation: to-right 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes to-left {
  0% {
    transform: translateX(-100%) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
@keyframes to-right {
  0% {
    transform: translateX(100%) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
.fade-in-component {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
