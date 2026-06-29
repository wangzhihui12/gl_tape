<!-- Ofiice文件在线预览组件 -->
<template>
  <scroll-view style="width: 100%; height: 100%;" scroll-x scroll-y>
    <view class="office-content" :id="viewerId" :prop="prop" :change:prop="officeModule.initOffice"></view>
  </scroll-view>
</template>

<script>
  export default {
    name: 'lk-preview-office',
    data() {
      return {
        prop: null,
      }
    },
    props: {
      // 容器id
      viewerId: {
        type: String,
        default: Math.random().toString(16).substring(2, 15)
      },
      // 文件地址
      url: {
        type: String,
        default: ''
      },
      // 文件类型
      fileType: {
        type: String,
        default: ''
      },
    },
    mounted() {
      const url = this.url
      this.$nextTick(() => this.prop = {
        url,
        fileType: this.fileType || url.substring(url.lastIndexOf('.') + 1).toLowerCase(),
        viewerId: this.viewerId,
      })
    },
    methods: {
      getError(msg) {
        console.log(msg)
      },
    }
  }
</script>

<script module="officeModule" lang="renderjs">
  import jsPreviewDocx from '@js-preview/docx'
  import jsPreviewExcel from '@js-preview/excel'
  import jsPreviewPdf from '@js-preview/pdf'

  export default {
    methods: {
      initOffice(params) {
        if (!params) {
          return
        }
        const { url, fileType, viewerId } = params
        this.$nextTick(() => {
          const officeRef = document.getElementById(viewerId)
          if (officeRef) {
            let myOfficePreviewer;
            if (fileType === 'docx') {
              myOfficePreviewer = jsPreviewDocx.init(officeRef);
            } else if (fileType === 'xlsx') {
              myOfficePreviewer = jsPreviewExcel.init(officeRef);
            } else if (fileType === 'pdf') {
              myOfficePreviewer = jsPreviewPdf.init(officeRef);
            } else {
              this.$ownerInstance.callMethod('getError', '文件类型错误')
              return
            }
            myOfficePreviewer.preview(url).catch(e => {
              this.$ownerInstance.callMethod('getError', '预览失败：' + e.message)
            })
          } else {
            this.$ownerInstance.callMethod('getError', '无法找到预览容器元素')
          }
        })
      }
    },
  }
</script>

<style>
  .office-content {
    width: 100%;
    height: 100%;
    padding-top: var(--status-bar-height);
  }
</style>