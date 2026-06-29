/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-07 17:09:51
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-04-10 15:08:59
 * @FilePath: \gl_tape\utils\ossUploadFile\uploadFile.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// base64,Hmac,Sha1,Crypto 相关算法
import config from './config.js'
import base64 from './base64.js'
import Hmac from './hmac.js'
import Sha1 from './sha1.js'
import Crypto from './crypto.js'
/**
 * 上传文件到阿里云oss
 * @param {string} filePath 图片的本地资源路径
 * @param {string} dir 表示要传到哪个目录下
 * @return 完整的图片地址
 */
const uploadFile = function (filePath) {
  console.log('上传文件到阿里云oss', filePath)
  return new Promise(async (resolve, reject) => {
    if (!filePath || filePath.length < 9) {
      uni.showModal({
        title: '文件错误',
        content: '请重试',
        showCancel: false
      })
      reject('文件错误')
    }
    // 获取上传的文件类型
    let fileTypeIndex = filePath.lastIndexOf('/')
    let fileType = filePath.substring(fileTypeIndex + 1)
    console.log(fileType, '获取上传的文件类型')
    let aliyunFileKey = config.folder + fileType
    const aliyunServerURL = config.uploadUrl // OSS地址
    const accessid = config.OSSAccessKeyId
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
                  filePath,
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
            filePath,
            complete: function (res) {
              console.log(res)
            }
          })
        }
        resolve(aliyunServerURL + aliyunFileKey)
      },
      fail: function (err) {
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
    // const result = await uni.request({
    // 	url: 'https://dj.test.glsx.com.cn/rop-dj-smartcarlife/router',
    // 	data: {
    // 		method: 'dj.api.mindworkplate.badge.getToken',
    // 		appKey: '48e5e13229b82c1b4e6e8c96151f0637',
    // 		timestamp: '1712487472621',
    // 		v: '1.0.0',
    // 		format: 'json',
    // 		locale: 'zh_CN',
    // 		sessionId: '98152bee-7533-41ed-bc94-60310f2df6f0',
    // 		sign: '238CE46892F88BBAD035BAEA73E27AC7C080F340'
    // 	},
    // 	success(res) {
    // 		const {
    // 			lsaccessKeySecret,
    // 			securityToken,
    // 			lsaccessKeyId
    // 		} = res.data.data;
    // 		const bytes = Crypto.HmacSHA1(policyBase64, lsaccessKeySecret);
    // 		const signature = Crypto.enc.Base64.stringify(bytes);
    // 		reslove({
    // 			signature,
    // 			securityToken,
    // 			lsaccessKeyId
    // 		})
    // 	}
    // })
  })
}

module.exports = { uploadFile, getOssToken }
