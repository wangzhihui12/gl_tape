/*
 * @Author: cen
 * @Date: 2026-04-01 15:45:43
 * @Description: 
 * @FilePath: /gl_tape/ws/constants.js
 * @LastEditTime: 2026-04-08 15:30:05
 * @LastEditors: cenchengwei@foreverht.com
 * 可以输入预定的版权声明、个性签名、空行等
 */
const Command = {
  GetLog: 'getLog',
  GetStorage: 'getStorage',
  Message: 'message',
  GetLogList: 'getLogList',
  RemoveLog: 'removeLog',
  RemoveRecord: 'removeRecord',
  StopPolling: 'stopPolling',
  StartPolling: 'startPolling',
  SetPollingInterval: 'setPollingInterval',
  Records: 'records',
  TempRecords: 'tempRecords',
  RemoveTempRecord: 'removeTempRecord',
  AddTempRecord: 'addTempRecord',
  AddRecord: 'addRecord',
  ExecuteSql: 'executeSql',
  LiveLog: 'liveLog',
  FileExplorer: 'fileExplorer',
  UploadFile: 'uploadFile'
}
export { Command }
