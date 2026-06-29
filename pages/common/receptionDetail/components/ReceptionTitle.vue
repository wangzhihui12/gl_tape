<template>
  <div class="title flex">
    <div :class="['sprite-icon',`icon-${icon}`]"></div>
    {{title}}
  </div>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    title: String,
    icon: String
  },
  name: '',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang='scss'>
.title {
  padding: toRpx(24) 0;
  color: #333333;
  font-size: toRpx(32);
  font-weight: 500;
  line-height: toRpx(40);
  .sprite-icon {
    margin-right: toRpx(12);
  }
}
</style>