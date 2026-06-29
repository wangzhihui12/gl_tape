/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-16 14:48:27
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:23:49
 * @FilePath: /gl_tape/utils/recordManager/PathUtils.js
 */
/**
 * 路径处理工具类
 */
class PathUtils {
  static _basePath = null
  // 默认保存文件夹名称
  static SAVE_DIR_NAME = 'uniapp_save'
  // 默认文件保存路径 (相对于 _doc/)
  static DEFAULT_SAVE_PATH = `_doc/${this.SAVE_DIR_NAME}/`

  static CACHED_ROOT_PATH = null

  // 本地缓存键名
  static ROOT_PATH_CACHE_KEY = 'sqlite_root_path_cache'
  /**
   * 路径拼接工具
   * @param  {...string} args 路径片段
   * @returns {string}
   */
  static join(...args) {
    if (args.length === 0) return ''
    const parts = args.map((part, index) => {
      if (!part) return ''
      let str = String(part)
      if (index !== 0) {
        str = str.replace(/^\/+/, '') // 去除开头的斜杠
      }
      if (index !== args.length - 1) {
        str = str.replace(/\/+$/, '') // 去除结尾的斜杠
      }
      return str
    }).filter(p => p.length > 0)
    return parts.join('/')
  }

  /**
   * 获取基础保存路径 (带缓存)
   */
  static async getBasePath() {
    if (this._basePath) return this._basePath
    this._basePath = await this.getFileSaveFolderOnClient()
    return this._basePath
  }

  /**
   * 获取文件系统根目录的完整路径
   * @returns {Promise<string>}
   */
  static getFilePath() {
    // 1. 优先使用内存缓存，性能最高
    if (this.CACHED_ROOT_PATH) {
      uni.$logger?.local?.info(`[PathUtils] 命中内存缓存，根路径: ${this.CACHED_ROOT_PATH}`);
      return Promise.resolve(this.CACHED_ROOT_PATH);
    }

    // 2. 尝试读取持久化缓存
    // const storageCache = uni.getStorageSync(this.ROOT_PATH_CACHE_KEY);
    // if (storageCache) {
    //   uni.$logger?.local?.info(`[PathUtils] 命中本地缓存，根路径: ${storageCache}`);
    //   // 同步到内存缓存
    //   this.CACHED_ROOT_PATH = storageCache;
    //   return Promise.resolve(this.CACHED_ROOT_PATH);    
    // }

    // 3. 无缓存，请求原生文件系统API
    return new Promise((resolve, reject) => {
      if (!plus) {
        reject(new Error('plus runtime 未初始化'));
        return;
      }
      plus.io.requestFileSystem(
        plus.io.PRIVATE_DOC,
        (fs) => {
          const fullPath = fs.root.fullPath;
          uni.$logger?.local?.info(`[PathUtils] 请求原生API获取根路径: ${fullPath}`);
          // 写入两级缓存
          this.CACHED_ROOT_PATH = fullPath;
          uni.setStorageSync(this.ROOT_PATH_CACHE_KEY, fullPath); 
          resolve(fullPath);
        },
        (error) => {
          reject(new Error(`[PathUtils] 获取文件系统失败: ${JSON.stringify(error)}`));
        }
      );
    });
  }

  /**
   * 获取客户端文件保存基础路径
   */
  static async getFileSaveFolderOnClient() {
    const rootPath = await this.getFilePath()
    const path = this.join(rootPath, this.SAVE_DIR_NAME)
    return `file://${path}/`
  }

  /**
   * 获取音频文件基础路径
   */
  static async getAudioFilePath(path = '') {
    const rootPath = await this.getFilePath()
    const fullPath = this.join(rootPath, path)
    return `file://${fullPath}`
  }

  /**
   * 获取绝对路径
   * @param {string} relativePath 相对路径或文件名
   */
  static async getAbsolutePath(relativePath) {
    if (!relativePath) return ''
    if (relativePath.startsWith('file://') || relativePath.startsWith('/')) {
      return relativePath
    }
    const base = await this.getBasePath()
    // 避免重复斜杠
    if (base.endsWith('/') && relativePath.startsWith('/')) {
        return base + relativePath.substring(1)
    }
    if (!base.endsWith('/') && !relativePath.startsWith('/')) {
        return base + '/' + relativePath
    }
    return base + relativePath
  }

  /**
   * 确保目录存在 (递归创建)
   * @param {string} dirPath 目录路径
   */
  static ensureDir(dirPath) {
    return new Promise((resolve, reject) => {
      // #ifdef APP-PLUS
      plus.io.resolveLocalFileSystemURL(dirPath, entry => {
        resolve(entry.fullPath)
      }, () => {
        // 目录不存在，尝试创建
        // NativeRecorder 传的是 "_doc/uniapp_save/"
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
            const root = fs.root
            let path = dirPath
            if (path.startsWith('_doc/')) path = path.substring(5)
            
            const createDir = (entry, folders) => {
                if (folders.length === 0) {
                    resolve(entry.fullPath)
                    return
                }
                entry.getDirectory(folders[0], { create: true }, dirEntry => {
                    createDir(dirEntry, folders.slice(1))
                }, err => {
                    reject(new Error('创建目录失败: ' + err.message))
                })
            }
            
            createDir(root, path.split('/').filter(p => p))
        }, err => reject(err))
      })
      // #endif
      // #ifndef APP-PLUS
      resolve(dirPath)
      // #endif
    })
  }
}

export default PathUtils
