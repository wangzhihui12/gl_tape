<!-- MediaResource.vue -->
<template>
  <div class="media-resource">
    <image v-if="mediaType === 'image'" :src="localUrl" :alt="alt" v-bind="$attrs" @error="handleError" @load="handleLoad" />
    <video v-else-if="mediaType === 'video'" :src="localUrl" :controls="controls" :autoplay="autoplay" :loop="loop" :muted="muted" v-bind="$attrs" @error="handleError" @loadeddata="handleLoad" />
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script>
import mediaResourceManager from '@/utils/mediaResourceManager/mediaResourceManager.js'

export default {
  name: 'MediaResource',
  props: {
    src: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      default: 'image',
      validator: value => ['image', 'video'].includes(value)
    },
    alt: {
      type: String,
      default: ''
    },
    controls: {
      type: Boolean,
      default: true
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    // 高优先级加载
    immediate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localUrl: '',
      loading: false
    }
  },
  // 禁止自动继承属性，因为我们手动绑定 $attrs
  inheritAttrs: false,
  watch: {
    src: {
      handler(newSrc) {
        console.log('src change', newSrc)
        this.processResource(newSrc)
      },
      immediate: true
    }
  },
  methods: {
    async processResource(url) {
      // 检查全局缓存中是否存在有效资源
      const cached = mediaResourceManager.getCache(url)
      if (cached) {
        this.localUrl = cached.url
        return
      }

      // 如果没有缓存，则下载资源
      this.loading = true
      try {
        const localPath = await mediaResourceManager.getResource(url, this.immediate)
        this.localUrl = localPath
      } catch (error) {
        console.error('资源获取失败:', error)
        // 失败时回退到原始URL
        this.localUrl = url
        this.$emit('error', error)
      } finally {
        this.loading = false
      }
    },

    handleError(event) {
      this.loading = false
      this.$emit('error', event)
    },

    handleLoad(event) {
      this.loading = false
      this.$emit('load', event)
    }
  }
}
</script>

<style scoped>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
