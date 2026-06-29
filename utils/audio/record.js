class RecorderManager {
  constructor(options) {
    const { duration, callback, isEndCallback } = options || {};
    this.recorderManager = uni.getRecorderManager();
    this.start(duration);
    this.isEndCallback = isEndCallback;
    this.recorderManager.onStop((res) => {
      console.log("结束录音", res);
      callback(res.tempFilePath);
      const isEnd = this.isEndCallback(); // 获取最新的 isEnd 值
      if (!isEnd) {
        this.start(); // 重新开始录音
      }
    });
  }
  start(duration = 60000) {
    console.log("开始录音");
    this.recorderManager.start({
      duration,
      sampleRate: 16000,
      numberOfChannels: 1,
    });
  }
  stop() {
    this.recorderManager.stop();
  }
}
