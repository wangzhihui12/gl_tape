/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-06-28 17:12:39
 * @LastEditors: limin
 * @LastEditTime: 2025-03-11 18:07:04
 * @FilePath: \gl_tape\utils\recordManager\index.js
 */
// import { singleton } from '../utils.js'
import AudioManager from './AudioManager.js'
import DBRecord from './dbRecord.js'
// import Record from './Record.js'
import RecordDto from './RecordDto.js'
import TempRecord from './TempRecord.js'
import helpler from './helpler.js'
// const SingleDBTempRecord = singleton(TempRecord)
module.exports = { AudioManager, DBRecord, RecordDto, TempRecord, helpler }
