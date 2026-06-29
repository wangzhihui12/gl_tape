# 文档

## 属性说明
| 属性名 | 类型 | 默认值 | 说明 |
| ----- | ---- | ------ |:-------------:|
| viewerId | String | 随机字符串 | 容器id |
| url | String | '' | 文件访问地址 |
| fileType | String | '' | 文件类型，可选值包括：docx、xlsx、pdf，可以不传，组件会自动从url中推导文件类型 |

## 注意事项
* 本组件是基于renderjs技术，所以不支持小程序
* url 文件访问地址必须是无访问限制的线上地址，不支持本地地址
* 需要安装以下依赖包
```
npm install core-js @js-preview/docx @js-preview/excel @js-preview/pdf
```
* 按装依赖包后，需要在App.vue中添加以下引入插件样式的代码，否则会导致docx、xlsx文件显示不全
```
@import '@js-preview/docx/lib/index.css';
@import '@js-preview/excel/lib/index.css';
```

## 示例代码
```
<template>
  <lk-preview-office :url="url" :file-type="fileType" v-if="url"></lk-preview-office>
</template>

<script>
  export default {
    data() {
      return {
        url: 'https://static-mp-4b5404ae-3773-4f5e-bc20-1912bf5fa489.next.bspapp.com/static/文字文稿.docx',
        fileType: ''
      };
    }
  }
</script>
```
