import utils from '../utils'
/**
 * 内部方法，用于获取完整的音频文件路径
 *
 * 此函数调用 `getAudioPathName` 获取文件名，并通过 `getAudioPath` 获取完整路径。
 */
async function getLatestAudioFilePath() {
  const pathName = await __getAudioPathName()
  return __getAudioPath(pathName)
}

/**
 * 异步获取音频文件路径名称
 *
 * 此函数用于查找特定目录中所有以 'uniapp_temp' 开头的文件，并返回修改时间最晚的文件名。
 * 如果没有找到符合条件的文件，则返回一个空字符串或抛出错误。
 */
async function __getAudioPathName() {
  const path = await utils.getAudioFilePath()
  return __getLatestFileName(path, 'uniapp_temp')
}

/**
 * 异步获取指定名称的音频文件路径
 *
 * 此函数用于根据给定的文件名查找其完整路径，并返回修改时间最晚的文件路径。
 * 如果没有找到符合条件的文件，则返回一个空字符串或抛出错误。
 * @param {string} name - 文件名（不包含扩展名）
 */
async function __getAudioPath(name) {
  const path = await utils.getAudioFilePath(name + '/recorder')
  return __getLatestFilePath(path)
}

/**
 * 获取指定目录中修改时间最晚的文件名
 *
 * @param {string} directoryPath - 目录路径
 * @param {string} prefix - 文件名前缀（可选）
 * @returns {Promise<string>} - 修改时间最晚的文件名
 */
async function __getLatestFileName(directoryPath, prefix = '') {
  const latestFile = await __getLatestFile(directoryPath, prefix)
  return latestFile ? latestFile.name : ''
}

/**
 * 获取指定目录中修改时间最晚的文件路径
 *
 * @param {string} directoryPath - 目录路径
 * @returns {Promise<string>} - 修改时间最晚的文件路径
 */
async function __getLatestFilePath(directoryPath) {
  const latestFile = await __getLatestFile(directoryPath)
  return latestFile ? directoryPath + '/' + latestFile.name : ''
}

/**
 * 获取指定目录中修改时间最晚的文件
 *
 * @param {string} directoryPath - 目录路径
 * @param {string} prefix - 文件名前缀（可选）
 * @returns {Promise<object|null>} - 修改时间最晚的文件对象或 null
 */
async function __getLatestFile(directoryPath, prefix = '') {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      directoryPath,
      e => {
        const dirR = e.createReader()
        dirR.readEntries(
          async entries => {
            const files = entries.filter(item => (prefix ? item.name.startsWith(prefix) : true))
            const filePromises = files.map(item => __getFileMetadata(item))
            const results = await Promise.all(filePromises)
            const latest = results.reduce((acc, current) => (current.modificationTime > acc.modificationTime ? current : acc), { modificationTime: 0 })
            resolve(latest.name ? latest : null)
          },
          err => reject(err)
        )
      },
      err => reject(err)
    )
  })
}

/**
 * 获取文件的元数据
 *
 * @param {object} fileEntry - 文件条目
 * @returns {Promise<object>} - 文件元数据
 */
async function __getFileMetadata(fileEntry) {
  return new Promise((resolve, reject) => {
    fileEntry.getMetadata(
      metadata => {
        resolve({
          name: fileEntry.name,
          modificationTime: new Date(metadata.modificationTime).getTime()
        })
      },
      err => reject(err)
    )
  })
}
async function sleep(time){
  return new Promise(resolve => setTimeout(resolve, time))
}
export default {
  getLatestAudioFilePath,
  sleep
}
