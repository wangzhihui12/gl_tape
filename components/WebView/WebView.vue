<template>
  <cover-view class="webview-container">
    <web-view
      @message="handlerMessage"
      ref="webview"
      src="/hybrid/html/index.html"
    ></web-view>
  </cover-view>
</template>
<script>
export default {
  data() {
    return {};
  },
};
</script>
<style></style>
