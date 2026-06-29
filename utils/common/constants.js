const WsTyps = {
  MessageTypes: {
    Private: 'private',
    System: 'system'
  },
  Connected:'connect',
  Eroor:'error',
  Disconnected:'disconnect'
}
const FileStatus = {
  Error:0,
  NoFile:1,
  Waiting:2,
  Uploading:3,
  NotExist:4,
  Uploaded:5,
  Completed:6 //状态4 的 完成状态
}
export {
  WsTyps,
  FileStatus
}

