import LogsWorker from './workers/LogsWorker'
import CommonWorker from './workers/CommonWorker'
import MessageWorker from './workers/MessageWorker'
import StorageWorker from './workers/StorageWorker'
import RecordsWorker from './workers/RecordsWorker'
import RemoveLogWorker from './workers/RemoveLogWorker'
import GetLogListWorker from './workers/GetLogListWorker'
import StopPollingWorker from './workers/StopPollingWorker'
import RemoveRecordWorker from './workers/RemoveRecordWorker'
import StartPollingWorker from './workers/StartPollingWorker'
import SetPollingIntervalWorker from './workers/SetPollingIntervalWorker'
import TempRecordsWorker from './workers/TempRecordsWorker'
import RemoveTempRecordWorker from './workers/RemoveTempRecordWorker'
import AddTempRecordWorker from './workers/AddTempRecordWorker'
import AddRecordWorker from './workers/AddRecordWorker'
import { Command } from './constants'
const Workers = {
  [Command.GetLog]: LogsWorker,
  [Command.Records]: RecordsWorker,
  [Command.Message]: MessageWorker,
  [Command.RemoveLog]: RemoveLogWorker,
  [Command.GetStorage]: StorageWorker,
  [Command.GetLogList]: GetLogListWorker,
  [Command.StopPolling]: StopPollingWorker,
  [Command.RemoveRecord]: RemoveRecordWorker,
  [Command.StartPolling]: StartPollingWorker,
  [Command.SetPollingInterval]: SetPollingIntervalWorker,
  [Command.TempRecords]: TempRecordsWorker,
  [Command.RemoveTempRecord]: RemoveTempRecordWorker,
  [Command.AddTempRecord]: AddTempRecordWorker,
  [Command.AddRecord]: AddRecordWorker
}
export default {
  create: cmd => Workers[cmd] || CommonWorker
}
