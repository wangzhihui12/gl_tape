module.exports = {
  // 请求域名 格式：https://xxx.xxx.com
  HTTP_REQUEST_URL: 'http://127.0.0.1:8000/api',

  // 阿里云oss域名 格式：https://xxx.oss-cn-xxx.aliyuncs.com
  OSS_DOMAIN: 'https://your-bucket.oss-cn-shenzhen.aliyuncs.com',

  // 文件直传到阿里云oss时需用到（复制本文件为 config.js 后填写真实值）
  ACCESSKEYID: 'YOUR_ACCESS_KEY_ID',
  ACCESSKEYSECRET: 'YOUR_ACCESS_KEY_SECRET',
  BUKET_NAME: 'your-bucket-name',
  FOLDER: 'quality/',
  // 与后端约定的token字段名
  TOKEN_NAME: 'glsk-oss',
  HTTP_SERVER: 'http://app-admin-server.glsx.com.cn',
  SOCKET_SERVER: 'http://app-admin-server.glsx.com.cn',
  FILE_UPLOAD_URL: 'file/upload'
}
