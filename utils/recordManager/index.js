/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-06-28 17:12:39
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 03:31:12
 * @FilePath: \gl_tape\utils\recordManager\index.js
 */
// import { singleton } from '../utils.js'
import AudioManager from './AudioManager.js'
// import DBTempRecord from './dbTempRecord.js' // 已废弃
import DBRecord from './dbRecord.js'
import DBManager from './DBManager.js'
// import Record from './Record.js'
import RecordDto from './RecordDto.js'
import TempRecord from './TempRecord.js'
import helpler from './helpler.js'
import StrategyFactory from './strategies.js'
import RecordCacheManager from './RecordCacheManager.js'
import PathUtils from './PathUtils.js'
import UploadService from './UploadService.js'
import TimeoutService from './TimeoutService.js'
import RecordSaveService from './RecordSaveService.js'
import FileUploadManager from './FileUploadManager.js'
export { AudioManager, DBRecord, DBManager, RecordDto, TempRecord, helpler, StrategyFactory, RecordCacheManager, PathUtils, UploadService,TimeoutService, RecordSaveService, FileUploadManager }
export default { AudioManager, DBRecord, DBManager, RecordDto, TempRecord, helpler, StrategyFactory, RecordCacheManager, PathUtils, UploadService,TimeoutService, RecordSaveService, FileUploadManager }
