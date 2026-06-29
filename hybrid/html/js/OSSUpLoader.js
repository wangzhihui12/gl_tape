class OSSUpLoader {
  /**
   * yourRegion填写Bucket所在地域。以华东1（杭州）为例，yourRegion填写为oss-cn-hangzhou。
   */
  region = 'oss-cn-shenzhen'
  /**
   * 填写Bucket名称。
   */
  bucket = 'glsk-oss'
  /**
   * 文件的 MIME 类型
   */
  mime = 'audio/mp3'
  /**
   * 本地保存文件路径(待上传文件路径)
   */
  filePath
  /**
   * 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
   */
  accessKeyId
  /**
   * 从STS服务获取的安全令牌（SecurityToken）。
   */
  accessKeySecret
  /**
   * 从STS服务获取的安Token。
   */
  stsToken
  /**
   * OSS 文件上传实例
   */
  client = null
  /**
   * 同时上传的最大任务数
   */
  parallel = 4
  /**
   * 每个上传分片的大小（字节）。默认500kb。
   */
  partSize = 500
  /**
   * 最小文件大小
   */
  minPartSize = 100
  /**
   * 上传任务的超时时间（毫秒）:默认60
   */
  timeout = 60 * 1000
  // headers,
  /**
   * 自定义元数据，通过HeadObject接口可以获取Object的元数据。
   */
  meta = {}
  /**
   * 初始化重传次数
   */
  retryCount = 0
  /**
   * 上传失败时的最大重试次数
   */
  retryCountMax = 3
  /**
   * 上传失败时的重试间隔时间（毫秒）
   */
  retryInterval = 3 * 1000
  currentCheckpoint
  /**
   * OSS 存储桶中的目标文件夹路径
   */
  ossFolder = 'quality/'
  /**
   * 构造函数
   */
  constructor({ region = this.region, bucket = this.bucket, accessKeyId, accessKeySecret, stsToken, mime = this.mime, partSize = this.partSize, parallel = this.parallel, timeout = this.timeout, filePath, retryCountMax = this.retryCountMax, retryInterval = this.retryInterval, ossFolder = this.ossFolder }) {
    if (partSize < this.minPartSize) {
      throw new Error(common.constants.CODE.FILE_PART_SIZE_TOO_SMALL)
    }
    this.mime = mime
    this.partSize = partSize
    this.parallel = parallel
    this.timeout = timeout
    this.filePath = filePath
    this.retryCountMax = retryCountMax
    this.retryInterval = retryInterval
    this.ossFolder = ossFolder
    //实例化OSS
    this.client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      stsToken
    })
  }
  /**
   * 上传文件到指定的 OSS 存储空间
   * @param {string} fileName - 要上传的文件名
   * @param {Function} callback - 文件上传完成或失败后的回调函数
   * @throws {Error} 如果文件路径转换失败，将抛出错误
   */
  upload(fileName, callback) {
    this._pathToFile(
      this.filePath + fileName,
      function (result) {
        if (result.code === common.constants.CODE.FILE_PATH_TRANSFORM_SUCCESS) {
          this._upload(fileName, result.data.file, callback)
        } else {
          callback(result)
        }
      }.bind(this)
    )
  }

  /**
   * 将文件上传到对象存储服务（OSS）
   *
   * @param {string} fileName - 要上传的文件名（包括扩展名）
   * @param {File} file - 要上传的文件对象
   * @param {Function} callback - 上传完成或发生错误时调用的回调函数
   *
   * @throws {Error} 如果文件路径转换失败，将抛出错误
   */
  _upload(fileName, file, callback) {
     const partSize = this._getOptimalPartSize(file.size)
    this.client
      .multipartUpload(this.ossFolder + fileName, file, {
        // 获取分片上传进度、断点和返回值。
        progress: (p, checkpoint, res) => {
          console.log(p)
          this.currentCheckpoint = checkpoint
        },
        // 设置并发上传的分片数量。
        parallel: this.parallel,
        //分片大小(kb) 最小为100kb 默认500kb
        // partSize: 1024 * this.partSize,
        // 分片大小(bytes)
        partSize: partSize,
        timeout: this.timeout,
        mime: this.mime
      })
      .then(res => {
        // console.log(JSON.stringify(res),res.status,res.status==200)
        if (res.res.statusCode == 200) {
          // console.log('upload success: %j', JSON.stringify(res));
          this.currentCheckpoint = null
          this.retryCount = 0
          callback(
            common.genCallBacks('FILE_UPLOAD_OSS_SUCCESS', {
              oss: res
            })
          )
        } else {
          callback(
            common.genCallBacks('FILE_UPLOAD_OSS_FAIL', {
              errMsg: `OSS返回错误 状态码: ${res.status}`,
              oss: res
            })
          )
        }
      })
      .catch(err => {
        console.error(err)
        console.log(`err.name : ${err.name}`)
        console.log(`err.message : ${err.message}`)
        // if (err.name.toLowerCase().indexOf('connectiontimeout') !== -1) {
        // timeout retry
        if (this.retryCount < this.retryCountMax) {
          this.retryCount++
          console.error(`retryCount : ${this.retryCount}`)
          setTimeout(() => {
            this._upload(fileName, file, callback)
          }, this.retryInterval)
        } else {
          callback(
            common.genCallBacks('FILE_UPLOAD_OSS_TIMEOUT_OR_OTHER', {
              errMsg: err.message,
              err
            })
          )
        }
        // }
      })
  }

  
  /**
   * 根据文件大小计算最优分片大小
   * 策略：文件越大，分片越大，以减少分片数量和请求开销
   * @param {number} fileSize - 文件大小 (bytes)
   * @returns {number} 分片大小 (bytes)
   */
  _getOptimalPartSize(fileSize) {
    const MB = 1024 * 1024
    // 定义分片策略阶梯 (阈值 -> 分片大小)
    // 注意：顺序从大到小排列，匹配即止
    const strategies = [
      // 优化后的分片策略 (平衡网络开销与失败重试成本)
      // 1GB+: 10MB 分片 (约100+个请求，并发效率高)
      { threshold: 1 * 1024 * MB, size: 10 * MB },
      // 100MB+: 5MB 分片 (20-200个请求，适中)
      { threshold: 100 * MB, size: 5 * MB },
      // 50MB+: 2MB 分片 (25-50个请求)
      { threshold: 50 * MB, size: 2 * MB },
      // 10MB+: 1MB 分片 (10-50个请求)
      // 避免小文件分片过小导致 HTTP 握手开销占比过高
      { threshold: 10 * MB, size: 1 * MB }
      // <10MB: 使用默认 partSize (通常 1MB)
    ]

    for (const { threshold, size } of strategies) {
      if (fileSize > threshold) {
        return size
      }
    }

    // 默认回退到配置的基础大小
    return this.partSize * 1024
  }

  /**
   * 将文件路径转换为可下载的文件对象
   *
   * @param {string} filePath - 文件的路径
   * @param {Function} callback - 转换完成时调用的回调函数
   *
   * @throws {Error} 如果请求过程中发生错误，将抛出错误
   */
  _pathToFile(filePath, callback) {
    window.webkitURL = window.webkitURL || window.URL
    var xhr = new XMLHttpRequest()
    xhr.open('GET', filePath, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status == 200) {
        var file = this.response
        callback(
          common.genCallBacks('FILE_PATH_TRANSFORM_SUCCESS', {
            file
          })
        )
      } else {
        callback(common.genCallBacks('FILE_PATH_TRANSFORM_FAIL'))
      }
    }
    xhr.onerror = function (errType, errMsg) {
      callback(
        common.genCallBacks('FILE_PATH_REQUEST_FAIL', {
          errType,
          errMsg
        })
      )
    }
    xhr.send()
  }
  /**
   * 销毁当前实例对象，释放资源并重置状态
   * 该方法将重置上传器的重试次数为 0，并将客户端实例置为 null
   */
  destroy() {
    this.retryCount = 0
    this.client = null
  }
}

const common = {
  constants: {
    CODE: {
      FILE_PATH_TRANSFORM_SUCCESS: 0,
      FILE_PATH_REQUEST_FAIL: 1,
      FILE_PATH_TRANSFORM_FAIL: 2,
      FILE_UPLOAD_OSS_SUCCESS: 0,
      FILE_UPLOAD_OSS_FAIL: 3,
      FILE_UPLOAD_OSS_TIMEOUT_OR_OTHER: 4
    },
    MESSAGE: {
      FILE_PATH_TRANSFORM_SUCCESS: '文件转换成功',
      FILE_PATH_REQUEST_FAIL: '文件转换请求失败',
      FILE_PATH_TRANSFORM_FAIL: '文件转换失败',
      FILE_UPLOAD_OSS_SUCCESS: '文件上传至OSS成功',
      FILE_UPLOAD_OSS_FAIL: '文件上传至OSS失败',
      FILE_UPLOAD_OSS_TIMEOUT_OR_OTHER: '文件上传至OSS超时或其他错误',
      FILE_PART_SIZE_TOO_SMALL: '分片大小不能小于100kb'
    }
  },
  /**
   * 生成回调对象
   *
   * @param {string} key -回调键值
   * @param {Object} data - 回调数据对象
   * @return {Object} 回调对象
   */
  genCallBacks(key, data = {}) {
    const { CODE, MESSAGE } = common.constants
    return {
      code: CODE[key],
      message: MESSAGE[key],
      data
    }
  }
}
