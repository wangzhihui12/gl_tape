import config from './ossUploadFile/config.js'
import base64 from './ossUploadFile/base64.js'
import Hmac from './ossUploadFile/hmac.js'
import Sha1 from './ossUploadFile/sha1.js'
import Crypto from './ossUploadFile/crypto.js'
/**
 * 上传文件到阿里云oss
 * @param {string} file 图片信息
 * @param {string} dir 表示要传到哪个目录下
 * @return 完整的图片地址
 */
const uploadFile = function (file, filePath) {
  console.log('上传文件到阿里云oss', file, filePath)
  return new Promise(async (resolve, reject) => {
    // 添加文件大小限制检查
    if (file && file.size) {
      // 定义文件类型和大小限制
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
      const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']

      // 提取文件后缀
      const fileExtension = file ? (file.name ? file.name.split('.').pop().toLowerCase() : file.path.split('.').pop().toLowerCase()) : filePath.split('.').pop().toLowerCase()

      // 检查文件大小
      const fileSizeMB = file.size / (1024 * 1024) // 转换为MB

      // 图片文件大小限制10MB
      if (imageTypes.includes(fileExtension) && fileSizeMB > 10) {
        uni.showToast({
          title: '图片上传最大10MB',
          icon: 'none'
        })
        reject(new Error('图片上传最大10MB'))
        return
      }

      // 视频文件大小限制100MB
      if (videoTypes.includes(fileExtension) && fileSizeMB > 100) {
        uni.showToast({
          title: '视频上传最大100MB',
          icon: 'none'
        })
        reject(new Error('视频上传最大100MB'))
        return
      }
    }

    // 提取文件后缀
    const fileExtension = file ? (file.name ? file.name.split('.').pop().toLowerCase() : file.path.split('.').pop().toLowerCase()) : filePath.split('.').pop().toLowerCase()
    // 生成随机数（使用时间戳+随机字符串）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 10)
    const randomNum = timestamp + '_' + randomStr
    let aliyunFileKey = config.folder + randomNum + '.' + fileExtension
    console.log(aliyunFileKey, 'aliyunFileKey')
    const aliyunServerURL = config.uploadUrl // OSS地址
    const policyBase64 = getPolicyBase64()
    const { signature, securityToken, lsaccessKeyId } = await getSignature(policyBase64) // 获取签名

    uni.uploadFile({
      url: aliyunServerURL, // 开发者服务器url
      filePath: filePath, // 要上传文件资源的路径
      name: 'file', // 必须填file
      formData: {
        key: aliyunFileKey,
        policy: policyBase64,
        OSSAccessKeyId: lsaccessKeyId,
        success_action_status: '200', // 让服务端返回200, 不然默认会返回204
        signature: signature,
        'x-oss-security-token': securityToken // 使用STS签名时必传。
      },
      success: function (res) {
        console.log(res, 444)
        if (res.statusCode != 200) {
          reject(
            new Error(
              '上传错误:' +
                JSON.stringify({
                  statusCode: res.statusCode,
                  file: file,
                  key: aliyunFileKey,
                  policy: policyBase64,
                  OSSAccessKeyId: lsaccessKeyId,
                  signature: signature,
                  'x-oss-security-token': securityToken
                })
            )
          )
        } else {
          uni.removeSavedFile({
            file: file,
            complete: function (res) {
              console.log(res)
            }
          })
        }
        resolve(aliyunServerURL + aliyunFileKey)
      },
      fail: function (err) {
        console.log(err, 555)
        err.domainName = aliyunServerURL
        reject(err)
      }
    })
  })
}
const getPolicyBase64 = function () {
  let date = new Date()
  date.setHours(date.getHours() + config.timeout)
  let srcT = date.toISOString()

  const policyText = {
    expiration: srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    conditions: [
      ['content-length-range', 0, 1024 * 1024 * 1024] // 设置上传文件的大小限制(5m)
    ]
  }
  const policyBase64 = base64.encode(JSON.stringify(policyText))
  return policyBase64
}
const getOssToken = async function () {
  console.log('getOssToken')
  const { lsaccessKeySecret, securityToken, lsaccessKeyId } = await uni.$api.commonApi.getToken({})
  return {
    lsaccessKeySecret,
    securityToken,
    lsaccessKeyId
  }
}
// 生成签名
const getSignature = function (policyBase64) {
  return new Promise(async reslove => {
    const result = uni.$api.commonApi.getToken({}).then(res => {
      const { lsaccessKeySecret, securityToken, lsaccessKeyId } = res
      const bytes = Crypto.HmacSHA1(policyBase64, lsaccessKeySecret)
      const signature = Crypto.enc.Base64.stringify(bytes)
      reslove({
        signature,
        securityToken,
        lsaccessKeyId
      })
    })
  })
}
module.exports = { uploadFile }
