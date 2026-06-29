const UPLOAD_STATUS = {
  // 上传状态
  success: 1,
  fail: 2,
};
let wv, getResult;
import { uploadFile, getOssToken } from "@/utils/ossUploadFile/uploadFile.js";
import config from "@/config.js";
export default {
  onLoad() {},
  mounted() {
	// console.log(JSON.stringify(this))
    var currentWebview = this.$parent.$scope.$getAppWebview(); //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效
    setTimeout(function () {
      wv = currentWebview.children()[0];
      wv.setStyle({ top: "100%", height: 300 });
    }, 1000); //如果是页面初始化调用时，需要延时一下
    // console.log(88);
    // // this.checkRecord();
    // setTimeout(() => {
    //   this.checkRecord();
    // }, 1000 * 6);
  },
  methods: {
    handlerMessage(result) {
      console.log(result);
      getResult = result;
    },
    checkRecord() {
      uni.$isNetWork().then(async (res) => {
        let recordList = JSON.parse(uni.$storage.get("recordList") || "[]");
        for (let i = 0; i < recordList.length; i++) {
          try {
            await this.handleRerord(recordList[i]);
          } catch (error) {
            continue;
          }
        }
      });
    },
    getFilePath() {
      return new Promise((resolve) => {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function (fs) {
          resolve(fs.root.fullPath);
        });
      });
    },
    setTimeoutResult() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(getResult);
        }, 1000);
      });
    },
    /**上传记录*/
    async handleRerord(val) {
      let recordUrlList = val.recordUrlList;
      // 上传失败的记录
      for (let i of recordUrlList) {
        console.log(i.status == UPLOAD_STATUS.fail);
        if (i.status == UPLOAD_STATUS.fail) {
          const filePath = i.file.split("/").pop();
          const { lsaccessKeySecret, securityToken, lsaccessKeyId } =
            await getOssToken();
          console.log(lsaccessKeySecret, securityToken, lsaccessKeyId);
          const rootPath = await this.getFilePath();
          wv.evalJS(
            `msgFromUniapp('${lsaccessKeyId}','${lsaccessKeySecret}','${securityToken}','${filePath}','file://${rootPath}uniapp_save/')`
          );
          for (let k = 0; k < 100; k++) {
            const result = await this.setTimeoutResult();
            if (result) {
              if (result.detail.data[0].code == 0) {
                uni.removeSavedFile({
                  filePath: i.file,
                  complete: function (res) {
                    console.log(res);
                  },
                });
                i.status = UPLOAD_STATUS.success;
                i.file = config.OSS_DOMAIN + "/" + config.FOLDER + filePath;
              } else {
                this.sendSentry(result.detail.data[0].error);
                throw "上传失败";
              }
              getResult = "";
              break;
            }
          }
          // const result = await this.checkFileUpload(filePath);
          // if (!(result instanceof Error)) {
          //   i.status = UPLOAD_STATUS.success;
          //   i.file = result;
          // }
        }
      }
      //目前处于保存中
      if (uni.$lock) {
        return;
      }
      // 判断是否全部上传成功
      if (recordUrlList.every((i) => i.status == UPLOAD_STATUS.success)) {
        val.recordUrlList = val.recordUrlList.map((i) => i.file);
        try {
          await uni.$api.commonApi.saveRecCustomer(val).then((res) => {
            console.log(res);
          });
          let recordList = JSON.parse(uni.$storage.get("recordList") || "[]");
          let idx = recordList.findIndex(
            (item) => item.receptionStartTime == val.receptionStartTime
          );
          recordList.splice(idx, 1);
          uni.$storage.set("recordList", JSON.stringify(recordList));
        } catch (err) {
          Promise.reject(error);
        }
      }
    },
    sendSentry(msg) {
      const { customerName, phoneNumber, carModel, staffName } =
        this.$store.state.user.customerInfo;
      const { name } = uni.$storage.get("userInfo");
      this.$sendSentry(
        `上传失败:手机号-${phoneNumber} 姓名-${customerName} 销售-${staffName} 车型-${carModel} 员工-${name},失败原因-${msg}`
      );
    },
    async checkFileUpload(tempFilePath) {
      console.log(tempFilePath);
      let attempt = 0;
      let errorMsg = "";
      while (attempt < 2) {
        try {
          const result = await uploadFile(tempFilePath);
          // 上传成功
          return result;
        } catch (error) {
          errorMsg = error;
          attempt++;
          // 等待一段时间后重试
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 3秒后重试
        }
      }
      // 达到最大尝试次数后，如果上传仍然失败，可以进行相应的处理
      console.error("上传失败，达到最大尝试次数");
      // 返回一个错误或者进行其他操作
      return new Error(errorMsg);
    },
  },
};
