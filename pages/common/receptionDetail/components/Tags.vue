<template>
  <div class="tags-box">
    <reception-title
      title="话术标签"
      icon="reception-1"
    />
    <div class="tags-flex flex">
      <template v-for="(i ,index) in tags">
        <div
          :key="index"
          class="tag flex"
        >{{i}}</div>
      </template>
    </div>
  </div>
</template>

<script type='text/ecmascript-6'>
import ReceptionTitle from './ReceptionTitle.vue'
export default {
  components: {
    ReceptionTitle
  },
  data () {
    return {
      tags: []
    }
  },
  props: {
    batchId: [String, Number]
  },
  watch: {
    batchId: {
      handler (val) {
        if (val) this.getTags(val)
      },
      immediate: true
    }
  },
  mounted () {
  },
  methods: {
    async getTags (batchId) {
      const res = await uni.$api.receptionApi.findRecordingTagByBatchId({
        batchId
      })
      let tags = []
      res.map(e =>{
        tags.push(`${e.tagGroupName}-${e.tagName}`)
      })
      this.tags = tags
    }
  }
}
</script>

<style scoped lang='scss'>
.tags-box {
  padding-bottom: toRpx(24);
  .tags-flex {
    gap: toRpx(20);
    flex-wrap: wrap;
    .tag {
      height: toRpx(64);
      border-radius: toRpx(16);
      background: #edf3ff;
      padding: 0 toRpx(20);
      color: #4673ff;
      font-size: toRpx(28);
    }
  }
}
</style>