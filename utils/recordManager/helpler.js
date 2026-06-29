/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-06 14:07:42
 * @LastEditors: limin
 * @LastEditTime: 2026-01-22 15:47:34
 * @FilePath: \gl_tape\utils\recordManager\helpler.js
 */
import utils from '../utils'
import PathUtils from './PathUtils'
/**
 * 内部方法，用于获取完整的音频文件路径
 *
 * 此函数调用 `getAudioPathName` 获取文件名，并通过 `getAudioPath` 获取完整路径。
 * @param {string} excludePath - 需要排除的文件路径（完整路径）
 */
async function getLatestAudioFilePath(excludePath = '') {
  try {
    // 从完整路径中提取文件名，用于底层过滤
    let excludeName = ''
    if (excludePath) {
      excludeName = excludePath.split('/').pop()
    }
    
    const pathName = await __getAudioPathName(excludeName)
    if (!pathName) return ''
    return await __getAudioPath(pathName)
  } catch (error) {
    uni.$logger.local.warn('〖接待记录Record〗 == 获取最新录音路径异常: ' + error.message)
    return ''
  }
}
/**
 * 异步获取音频文件路径名称
 *
 * 此函数用于查找特定目录中所有以 'uniapp_temp' 开头的文件，并返回修改时间最晚的文件名。
 * 如果没有找到符合条件的文件，则返回一个空字符串或抛出错误。
 * @param {string} excludeName - 需要排除的文件名
 */
async function __getAudioPathName(excludeName = '') {
  const path = await PathUtils.getAudioFilePath()
  return __getLatestFileName(path, 'uniapp_temp', excludeName)
}
/**
 * 异步获取指定名称的音频文件路径
 *
 * 此函数用于根据给定的文件名查找其完整路径，并返回修改时间最晚的文件路径。
 * 如果没有找到符合条件的文件，则返回一个空字符串或抛出错误。
 * @param {string} name - 文件名（不包含扩展名）
 */
async function __getAudioPath(name) {
  const path = await PathUtils.getAudioFilePath(name + '/recorder')
  return __getLatestFilePath(path)
}
/**
 * 获取指定目录中修改时间最晚的文件名
 *
 * @param {string} directoryPath - 目录路径
 * @param {string} prefix - 文件名前缀（可选）
 * @param {string} excludeName - 需要排除的文件名（可选）
 * @returns {Promise<string>} - 修改时间最晚的文件名
 */
async function __getLatestFileName(directoryPath, prefix = '', excludeName = '') {
  const latestFile = await __getLatestFile(directoryPath, prefix, excludeName)
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
 * 获取文件的元数据
 *
 * @param {object} fileEntry - 文件条目
 * @returns {Promise<object>} - 文件元数据
 */
function __getFileMetadata(fileEntry) {
  return new Promise(resolve => {
    fileEntry.getMetadata(
      metadata => {
        resolve({
          name: fileEntry.name,
          modificationTime: metadata.modificationTime.getTime()
        })
      },
      e => {
        uni.$logger.local.warn(`〖接待记录Record〗 == 获取文件元数据失败: ${fileEntry.name} ${e.message}`)
        resolve({
          name: fileEntry.name,
          modificationTime: 0
        })
      }
    )
  })
}
/**
 * 获取指定目录中修改时间最晚的文件信息
 *
 * @param {string} directoryPath - 目录路径
 * @param {string} prefix - 文件名前缀（可选）
 * @param {string} excludeName - 需要排除的文件名（可选）
 * @returns {Promise<object|null>} - 文件对象 {name, modificationTime} 或 null
 */
async function __getLatestFile(directoryPath, prefix = '', excludeName = '') {
  return new Promise((resolve, reject) => {
    // [测试注入] 模拟系统异常：劫持 API 强制失败
    // const originalResolve = plus.io.resolveLocalFileSystemURL
    // plus.io.resolveLocalFileSystemURL = function (path, success, fail) {
    //   uni.$logger.local.info(`〖接待记录Record〗 == [测试模拟] 拦截目录读取: ${path}`)
    //   setTimeout(() => {
    //     fail && fail({ code: 12, message: 'Simulated Path Not Found' })
    //     // 恢复 API，避免影响全局
    //     plus.io.resolveLocalFileSystemURL = originalResolve
    //   }, 0)
    // }
    plus.io.resolveLocalFileSystemURL(
      directoryPath,
      e => {
        const dirR = e.createReader()
        dirR.readEntries(
          async entries => {
            try {
              // 先根据前缀和排除名单进行过滤
              const files = entries.filter(item => {
                if (prefix && !item.name.startsWith(prefix)) return false
                if (excludeName && item.name === excludeName) return false
                return true
              })
              const filePromises = files.map(item => __getFileMetadata(item))
              const results = await Promise.all(filePromises)
              const latest = results.reduce((acc, current) => {
                // 优先尝试从文件名解析时间戳 (假设文件名是时间戳或包含时间戳)
                // 例如: 1767921591256.mp3 -> 1767921591256
                const getTimestamp = (name) => {
                  if (!name) return 0
                  const match = name.match(/(\d{13})/) // 匹配13位毫秒时间戳
                  return match ? parseInt(match[1]) : 0
                }

                const accTs = getTimestamp(acc.name)
                const currTs = getTimestamp(current.name)

                if (accTs > 0 && currTs > 0) {
                  return currTs > accTs ? current : acc
                }
                
                // 回退到修改时间
                return (current.modificationTime > acc.modificationTime ? current : acc)
              }, { name: '', modificationTime: 0 })
              resolve(latest.name ? latest : null)
            } catch (error) {
              uni.$logger.local.error(`〖接待记录Record〗 == 处理目录项异常: ${error.message}`)
              resolve(null)
            }
          },
          err => {
            uni.$logger.local.warn(`〖接待记录Record〗 == 读取目录项失败: ${directoryPath}, err: ${JSON.stringify(err)} ${err.message}`)
            resolve(null)
          }
        )
      },
      err => {
        // 目录不存在或无法访问，视为无文件
        uni.$logger.local.warn(`〖接待记录Record〗 == 目录不存在或无法访问: ${directoryPath}  err: ${JSON.stringify(err)} ${err.message}`)
        resolve(null)
      }
    )
  })
}
async function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export default {
  getLatestAudioFilePath,
  sleep
}