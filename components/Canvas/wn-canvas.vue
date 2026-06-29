<template>
  <view class="wn-canvas">
    <zoom-pan
      :class="['canvas-box',{fill:custom}]"
      :disabled="carBrandOpenStatus || drawStatus || !scaleSwitch"
      :scale-max="3"
      :scale-min="1"
      @scale="scale"
    >
      <template slot="content">
        <canvas
          :class="['board-canvas',{'draw-canvas':drawStatus}]"
          :canvas-id="canvasId"
          :disable-scroll="drawStatus"
          @touchstart="touchStart"
          @touchmove="touchMove"
          @touchend="touchEnd"
        ></canvas>
        <template v-if="custom">
          <slot name="customContent"></slot>
        </template>
        <template v-else>
          <!-- 		<image :src="drawImage" class="under-image" mode=""   v-if="isUnderBkg"></image> -->
          <template v-if="aspectRatio">
            <view
              class="under-image"
              :style="{backgroundImage:`URL(${drawImage})`,aspectRatio:aspectRatio}"
            >
            </view>
          </template>
          <template v-else>
            <view class="skeleton-box"></view>
          </template>
        </template>
      </template>
    </zoom-pan>
  </view>
</template>

<script>
import color from "./color.vue"
import utils from "@/utils/utils.js";
import zoomPan from './zoom-pan.vue';
export default {
  name: "wn-canvas",
  components: {
    color,
    zoomPan
  },
  data () {
    return {
      colorShow: false, //显示颜色
      drawContext: null, //画板对象
      historyList: [], //路径历史
      startX: 0, //起始坐标
      startY: 0,
      lastX: 0,
      lastY: 0,
      mode: "pen", //操作模式
      currentColor: "red", //当前画笔颜色
      bgColor: "#fff", //画板背景颜色
      lineWidth: 2, //画笔粗细 px
      lastRect: {}, //运动轨迹最后一个方形
      lastCircle: {}, //运动轨迹最后一个圆形
      //工具箱
      tools: [{
        title: "清空",
        key: "clear",
        url: require("./img/clear.png"),
        activeUrl: require("./img/clear.png")
      },
      {
        title: "撤回",
        key: "back",
        url: require("./img/back.png"),
        activeUrl: require("./img/back.png")
      },
      // {
      // 	title: "橡皮",
      // 	key: "eraser",
      // 	url: require("./img/eraser.png"),
      // 	activeUrl: require("./img/eraser-active.png")
      // },
      {
        title: "颜色",
        key: "color",
        url: require("./img/color.png"),
        activeUrl: require("./img/color-active.png")
      },
      {
        title: "画笔",
        key: "pen",
        url: require("./img/pen.png"),
        activeUrl: require("./img/pen-active.png"),
        active: true
      },
      {
        title: "粗细",
        key: "line",
        url: require("./img/line.png"),
        activeUrl: require("./img/line-active.png")
      },
        // {
        // 	title: "圆形",
        // 	key: "circle",
        // 	url: require("./img/circle.png"),
        // 	activeUrl: require("./img/circle-active.png")
        // },
        // {
        // 	title: "方形",
        // 	key: "rect",
        // 	url: require("./img/rect.png"),
        // 	activeUrl: require("./img/rect-active.png")
        // },
        // {
        // 	title: "实圆",
        // 	key: "circle-fill",
        // 	url: require("./img/circle-fill.png"),
        // 	activeUrl: require("./img/circle-fill-active.png")
        // },
        // {
        // 	title: "实方",
        // 	key: "rect-fill",
        // 	url: require("./img/rect-fill.png"),
        // 	activeUrl: require("./img/rect-fill-active.png")
        // },
        // {
        // 	title: "下载",
        // 	key: "download",
        // 	url: require("./img/download.png"),
        // 	activeUrl: require("./img/download.png")
        // },
        // {
        // 	title: "分享",
        // 	key: "share",
        // 	url: require("./img/share.png"),
        // 	activeUrl: require("./img/share.png")
        // }
      ],
      toolsShow: true,
      isLandScape: false, //是否横屏
      aspectRatio: null,//图片宽高比
      showPenBox: false,
      height: null,
      scaleValue: 1,
      defaultScaleValue: 1,
      viewX: 0,
      viewY: 0,
      touchX: 0,
      touchY: 0
    };
  },
  props: {
    showSave: { //是否显示保存按钮
      type: Boolean,
      default: false
    },
    drawImage: { //背景图片
      type: String,
      default: ""
    },
    saveImageType: { //保存图片的类型 1、保存地址 2、保存到本地图片 3、既保存地址 又保存图片
      type: String,
      default: "1"
    },
    drawStatus: Boolean,
    canvasId: {
      type: String,
      default: 'drawCanvas'
    },
    custom: Boolean, //自定义
    scaleSwitch:{
      type: Boolean,
      default: true
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    carBrandOpenStatus () {
      return this.$store.state.user.carBrandOpenStatus
    },
  },
  mounted (opt) {
    this.drawContext = uni.createCanvasContext(this.canvasId, this);
    this.initBoard();
  },
  watch: {
    'drawImage' (n) {
      if (n) this.initBoard()
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        if (newval) this.clearBoard()
      }
    },
  },
  methods: {
    colorShowHandel () {
      this.colorShow = !this.colorShow;
    },
    chooseTools (item) {
      // console.log(item);
      this.colorShow = false;
      if (item.key == "back") {
        //撤回
        this.backHandle()
        return;
      }
      if (item.key == "clear") {
        //清空
        this.clearBoard()
        return
      }

      if (item.key == "eraser") {
        this.drawContext.strokeStyle = this.bgColor;
      }

      if (item.key == "color") {
        //选择颜色

        this.colorShowHandel()
      }
      if (item.key == 'line') {
        this.showPenBox = !this.showPenBox
      }
      if (item.key == "download") {
        //下载
        this.downloadHandle()
        return;

      }
      this.mode = item.key;
      this.tools.forEach((i, j) => {
        i.active = false
        if (item.key == i.key) {
          i.active = true;
        }
      })
    },
    showTools () {
      this.toolsShow = !this.toolsShow
    },
    penWidthChange (e) {
      if (e?.detail?.value) this.lineWidth = e.detail.value;
      this.drawContext.setLineWidth(this.lineWidth);
    },
    //开始绘制曲线
    penBegin (x, y) {
      x = x / this.scaleValue
      y = y / this.scaleValue
      this.begin = true;
      this.drawContext.beginPath()
      this.drawContext.setStrokeStyle(this.currentColor);
      this.startX = x;
      this.startY = y;
      this.drawContext.moveTo(this.startX / this.scaleValue, this.startY / this.scaleValue)
      this.drawPen(x, y);
    },
    // 绘制线条中间添加点
    drawPen (x, y) {
      this.drawContext.moveTo(this.startX, this.startY)
      this.drawContext.lineTo(x, y);
      this.drawContext.stroke();
      this.startX = x;
      this.startY = y;
    },
    // 开始绘制线条 (直线)
    lineBegin (x, y) {
      this.begin = true;
      this.startX = x;
      this.startY = y;
    },
    //画直线
    lineDraw (x, y) {
      this.drawContext.beginPath()
      this.drawContext.moveTo(this.startX, this.startY)
      this.drawContext.lineTo(x, y);
      this.drawContext.stroke();
      this.drawContext.draw(true);
    },
    // 绘制线条结束
    lineEnd (x, y) {
      if (this.startX == x && this.startY == y && !this.lastX && !this.lastY) {
        this.drawContext.beginPath()
        this.drawContext.moveTo(this.startX - 1, this.startY - 1)
        this.drawContext.lineTo(x + 1, y + 1);
        this.drawContext.stroke();
        this.drawContext.draw(true);
      }
      this.lastX = ''
      this.lastY = ''
      this.drawContext.closePath();
      this.begin = false;
    },
    //实心方形开始绘制
    rectFillBegin (x, y) {
      this.begin = true;
      this.drawContext.beginPath()
      this.startX = x;
      this.startY = y;
    },
    //方形开始绘制
    rectBegin (x, y) {
      this.begin = true;
      this.drawContext.beginPath()
      this.startX = x;
      this.startY = y;
    },
    //实心圆形开始绘制
    circleFillBegin (x, y) {
      this.begin = true;
      this.drawContext.beginPath()
      this.startX = x;
      this.startY = y;
    },
    //圆形开始绘制
    circleBegin (x, y) {
      this.begin = true;
      this.drawContext.beginPath()
      this.startX = x;
      this.startY = y;
    },
    /**
     * 这里是画实体矩形
     */
    drawRectFill (x, y, isReverse = true) {
      let width = (x - this.startX) ? (x - this.startX) : (this.startX - x);
      let height = (y - this.startY) ? (y - this.startY) : (this.startY - y);
      this.drawContext.rect(this.startX, this.startY, width, height);
      this.drawContext.setFillStyle(this.currentColor);
      this.drawContext.fill();
      this.draw(isReverse);
    },
    /**
     * 这里是画空心矩形
     * 方法是根据四个坐标点画
     * 四条线进行连接
     */
    drawRect (x, y, isReverse = true) {
      let pointLT = {};
      let pointRB = {};
      let pointRT = {};
      let pointLB = {};
      let center = {};

      pointLT.X = (this.startX <= x) ? this.startX : x;
      pointLT.Y = (this.startY <= y) ? this.startY : y;

      pointRB.X = (this.startX >= x) ? this.startX : x;
      pointRB.Y = (this.startY >= y) ? this.startY : y;

      pointRT.X = pointRB.X;
      pointRT.Y = pointLT.Y;


      pointLB.X = pointLT.X;
      pointLB.Y = pointRB.Y;

      let width = (x - this.startX) ? (x - this.startX) : (this.startX - x);
      let height = (y - this.startY) ? (y - this.startY) : (this.startY - y);
      this.drawContext.rect(this.startX, this.startY, width, height);
      this.drawContext.setStrokeStyle(this.currentColor);
      this.drawContext.stroke();
      this.draw(isReverse);

      this.lastRect = {
        x: this.startX,
        y: this.startY,
        width: Math.abs(width),
        height: Math.abs(height),
        pointLT: pointLT
      }
      this.clearLastRect()
    },

    clearLastRect () {
      this.drawContext.clearRect(this.lastRect.pointLT.X + this.lineWidth / 2, this.lastRect.pointLT
        .Y + this
          .lineWidth / 2, this.lastRect.width - this.lineWidth, this.lastRect.height - this
            .lineWidth);
    },
    clearLastCircle (x, y, r, cxt) {
      //(x,y)为要清除的圆的圆心，r为半径，cxt为context
      var stepClear = 1; //别忘记这一步  
      clearArc(x, y, r);

      function clearArc (x, y, radius) {
        var calcWidth = radius - stepClear;
        var calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);

        var posX = x - calcWidth;
        var posY = y - calcHeight;

        var widthX = 2 * calcWidth;
        var heightY = 2 * calcHeight;

        if (stepClear <= radius) {
          cxt.clearRect(posX, posY, widthX, heightY);
          stepClear += 1;
          clearArc(x, y, radius);
        }
      }
    },
    /**
     * 这里是画
     * 实心圆
     */
    drawCircleFill (x, y, isReverse = true) {
      let pointLT = {};
      let pointRB = {};
      let pointRT = {};
      let pointLB = {};
      let center = {};

      pointLT.X = (this.startX <= x) ? this.startX : x;
      pointLT.Y = (this.startY <= y) ? this.startY : y;

      pointRB.X = (this.startX >= x) ? this.startX : x;
      pointRB.Y = (this.startY >= y) ? this.startY : y;

      pointRT.X = pointRB.X;
      pointRT.Y = pointLT.Y;

      pointLB.X = pointLT.X;
      pointLB.Y = pointRB.Y;

      center.X = (pointRB.X + pointLT.X) / 2;
      center.Y = (pointRB.Y + pointLT.Y) / 2;

      let dx = pointRB.X - pointLT.X;
      let dy = pointRB.Y - pointLT.Y;
      let r = Math.sqrt(dx * dx + dy * dy) / 2;

      this.drawContext.arc(center.X, center.Y, r, 0, 2 * Math.PI);
      this.drawContext.setFillStyle(this.currentColor);
      this.drawContext.fill();
      this.draw(isReverse);
    },
    /**
     * 这里是画
     * 空心圆
     */
    drawCircle (x, y, isReverse = true) {
      let pointLT = {};
      let pointRB = {};
      let center = {};

      pointLT.X = (this.startX <= x) ? this.startX : x;
      pointLT.Y = (this.startY <= y) ? this.startY : y;

      pointRB.X = (this.startX >= x) ? this.startX : x;
      pointRB.Y = (this.startY >= y) ? this.startY : y;

      center.X = (pointRB.X + pointLT.X) / 2;
      center.Y = (pointRB.Y + pointLT.Y) / 2;

      let dx = pointRB.X - pointLT.X;
      let dy = pointRB.Y - pointLT.Y;
      let r = Math.sqrt(dx * dx + dy * dy) / 2;

      this.drawContext.arc(center.X, center.Y, r, 0, 2 * Math.PI);

      this.drawContext.stroke();

      this.drawContext.beginPath();
      this.drawContext.arc(center.X, center.Y, r - this.lineWidth / 2, 0, 2 * Math.PI);
      this.drawContext.setFillStyle(this.bgColor);
      this.drawContext.fill();
      this.draw(isReverse);
      this.clearLastCircle(center.X, center.Y, r - this.lineWidth / 2, this.drawContext);
    },
    //开始touch
    touchStart (e) {
      if (!this.drawStatus) return
      console.log(e)
      this.drawContext.setLineWidth(this.lineWidth)
      let {
        x,
        y
      } = e.touches[0]
      // console.log("开始touch");
      switch (this.mode) {
        case "pen":
          this.penBegin(x, y)
          break;
        case "eraser":
          this.penBegin(x, y)
          break;
        case "rect":
          this.rectBegin(x, y)
          break;
        case "circle":
          this.circleBegin(x, y)
          break;
        case "rect-fill":
          this.rectFillBegin(x, y)
          break;
        case "circle-fill":
          this.circleFillBegin(x, y)
          break;
      }
      //新增一次历史轨迹
      this.historyList.push({
        style: {
          color: this.currentColor,
          width: this.lineWidth
        },
        coordinates: [{
          type: e.type,
          mode: this.mode,
          x: e.touches[0].x,
          y: e.touches[0].y
        }]
      })
    },
    //touch移动
    touchMove (e) {
      if (!this.drawStatus) return
      this.drawContext.setLineWidth(this.lineWidth)
      let {
        x,
        y
      } = e.touches[0]
      x = x / this.scaleValue
      y = y / this.scaleValue
      this.lastX = x;
      this.lastY = y;
      // console.log("touch移动");
      switch (this.mode) {
        case "pen":
          this.drawPen(x, y)
          this.draw(true);
          break;
        case "eraser":
          this.drawPen(x, y)
          this.draw(true);
          break;
        case "rect":
          this.drawRect(x, y)
          break;
        case "circle":
          this.drawCircle(x, y)
          break;
        case "rect-fill":
          this.drawRectFill(x, y)
          break;
        case "circle-fill":
          this.drawCircleFill(x, y)
          break;
      }

      //最后一次历史中新增运动轨迹
      this.historyList[this.historyList.length - 1].coordinates.push({
        type: e.type,
        mode: this.mode,
        x,
        y
      })
    },
    //touch结束
    touchEnd (e) {
      if (!this.drawStatus) return
      this.drawContext.setLineWidth(this.lineWidth)
      let {
        x,
        y
      } = e.changedTouches[0]
      // console.log("touch结束");
      switch (this.mode) {
        case "pen":
          this.lineEnd(x, y)
          break;
        case "eraser":
          this.drawContext.setFillStyle(this.currentColor)
          this.lineEnd(x, y)
          break;
        case "rect":
          this.drawRect(x, y, true);
          break;
        case "circle":
          this.drawCircle(x, y)
          break;
        case "rect-fill":
          this.drawRectFill(x, y)
          break;
        case "circle-fill":
          this.drawCircleFill(x, y)
          break;
      }
    },
    //撤回
    backHandle () {
      this.drawContext.draw()
      this.historyList.pop(); //删除最后一步
      this.drawHistory();
    },
    drawHistory () {
      //遍历历史轨迹重新绘制
      this.historyList.forEach((item, index) => {
        this.drawContext.beginPath()
        this.drawContext.setLineCap('round')
        this.drawContext.setStrokeStyle(item.style.color)
        this.drawContext.setLineWidth(item.style.width)
        item.coordinates.forEach(it => {
          if (it.type == 'touchstart') {
            this.switchModeToLine(it.mode, 1, it.x, it.y)
          } else {
            this.switchModeToLine(it.mode, 2, it.x, it.y)
          }
        })
        this.drawContext.stroke()
      })
      this.drawContext.draw(true)
    },
    //重新绘制历史画面 mode:操作模式  type:touch类型（1:开始touch、2:touch中或结束touch）
    switchModeToLine (mode, type, x, y) {
      this.drawContext.setFillStyle(this.currentColor)
      if (mode == "pen") {
        if (type == "1") {
          this.drawContext.moveTo(x, y)
        } else {
          this.drawContext.lineTo(x, y)
        }
      } else if (mode == "eraser") {
        this.drawContext.setFillStyle(this.bgColor)
        if (type == "1") {
          this.startX = x
          this.startY = y
        } else {
          this.lineDraw(x, y, true)
        }
      } else if (mode == "rect") {
        if (type == "1") {
          this.startX = x
          this.startY = y
        } else {
          this.drawRect(x, y, true)
        }
      } else if (mode == "circle") {
        if (type == "1") {
          this.startX = x
          this.startY = y
        } else {
          this.drawCircle(x, y, true)
        }
      } else if (mode == "rect-fill") {
        if (type == "1") {
          this.startX = x
          this.startY = y
        } else {
          this.drawRectFill(x, y, true)
        }

      } else if (mode == "circle-fill") {
        if (type == "1") {
          this.startX = x
          this.startY = y
        } else {
          this.drawCircleFill(x, y, true)
        }
      }
    },

    //选择画笔颜色
    colorPickTapHandler (obj) {
      // console.log('我点击的颜色:' + JSON.stringify(obj));
      this.colorShow = false;
      this.tools.forEach(item => {
        item.active = false;
        if (item.key === 'pen') {
          this.mode = 'pen'
          item.active = true;
        }
      })

      this.currentColor = obj.color;
      this.drawContext.strokeStyle = obj.color;
    },
    //下载图片
    downloadHandle () {
      let that = this;
      if (this.saveImageType == 1 || this.saveImageType == 3) {
        this.saveImage()
      }
      if (this.saveImageType == 2 || this.saveImageType == 3) {
        uni.canvasToTempFilePath({
          canvasId: this.canvasId,
          success: function (res) {
            // console.log('回调参数:' + JSON.stringify(res));
            // 在H5平台下，tempFilePath 为 base64
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                // console.log('成功回调参数:' + JSON.stringify(res));
                that.$emit("dowmloadSuc", JSON.stringify(res))
              },
              fail: function (res) {
                // console.log('失败回调参数:' + JSON.stringify(res));
                that.$emit("dowmloadErr", JSON.stringify(res))
              }
            });
          }
        }, this)
      }
    },
    //返回图片地址  @filePath
    saveImage () {
      let that = this
      if (this.isUnderBkg) {
        that.saveImageUrl()
      } else {
        uni.canvasToTempFilePath({
          canvasId: this.canvasId,
          success: function (res) {
            // console.log(res);
            that.$emit("saveImage", res.tempFilePath)
          }
        }, this)
      }

    },
    saveImageUrl () {
      const query = uni.createSelectorQuery().in(this);
      let that = this;
      query.select('.canvas-box').boundingClientRect(data => {
        this.drawContext.setFillStyle(this.bgColor);
        this.drawContext.fillRect(0, 0, data.width, data.height); //TODO context的宽和高待定
        this.drawContext.fill();
        this.drawContext.drawImage(this.drawImage, 0, 0, data.width, data.height);
        this.drawContext.draw();
        this.drawHistory()
        uni.canvasToTempFilePath({
          canvasId: this.canvasId,
          success: function (res) {
            that.$emit("saveImage", res.tempFilePath)
          }
        }, this)

      }).exec();

    },
    // canvas设置背景颜色
    fillBackground () {
      const query = uni.createSelectorQuery().in(this);
      query.select('.canvas-box').boundingClientRect(data => {
        this.drawContext.setFillStyle(this.bgColor);
        this.drawContext.fillRect(0, 0, data.width, data.height); //TODO context的宽和高待定
        this.drawContext.fill();
        if (this.drawImage && !this.isUnderBkg) {
          this.drawContext.drawImage(this.drawImage, 0, 0, data.width, data.height);
        }
        this.drawContext.draw();
      }).exec();
    },
    // 绘制canvas
    // isReverse: 是否保留之前的像素
    draw (isReverse = false, cb) {
      this.drawContext.draw(isReverse, () => {
        if (cb && typeof (cb) == "function") {
          cb();
        }
      });
    },
    setBoardMode (key) {
      this.tools.forEach(i => {
        i.active = false;
        if (i.key == key) {
          i.active = true;
          this.mode = key
        }
      })
    },
    //清空画板
    clearBoard () {
      this.historyList = [];
      this.drawContext?.draw()
    },
    async initBoard () {
      try {
        const systemInfo = uni.getSystemInfoSync();
        if (systemInfo.screenWidth > systemInfo.screenHeight) {
          this.isLandScape = true
        } else {
          this.isLandScape = false
        }
        if (this.drawImage) {
          let imageInfoObj = (await uni.getImageInfo({
            src: this.drawImage
          }))[1] || {};


          this.aspectRatio = imageInfoObj.width / imageInfoObj.height;
          this.height = `${imageInfoObj.height * (systemInfo.windowWidth / imageInfoObj.width)}px`
        }
        if (this.isUnderBkg) {
          this.bgColor = "rgba(0,0,0,0)"
        } else {
          this.bgColor = "rgba(255,255,255,0)"
        }
        this.drawContext.setLineCap('round') // 让线条圆润
        this.drawContext.strokeStyle = this.currentColor; //设置画笔颜色
        this.drawContext.setLineWidth(this.lineWidth); //设置画笔粗细
        this.$nextTick(() => {
          this.drawContext.setLineWidth(this.lineWidth)
          // this.fillBackground();
        })
      } catch (error) {
        console.log(error)
      }
    },
    /**缩放 */
    scale (e) {
      this.scaleValue = e.scale
      this.$emit('scale', e.scale)
    }
  }
}
</script>

<style lang="scss">
.wn-canvas {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  .draw-logo {
    width: 1.8rem;
    height: 1.8rem;
    box-sizing: border-box;
    position: absolute;
    right: 0.1rem;
    top: 0.5rem;
    z-index: 10;
  }

  .pen-box {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 3rem;
    z-index: 2;
    width: 100%;
    .pen {
      width: 3rem;
      border-radius: 0.2rem;
    }

    .pen-slider {
      width: 60%;
    }

    .pen-txt {
      font-size: 1.2rem;
    }
  }

  .tools-box {
    .tools {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: white;
      border-radius: 0.2rem 0 0 0.2rem;
      .tools-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;

        .tools-icon {
          width: 1.2rem;
          height: 1.2rem;
        }

        text {
          width: 2rem;
        }
      }
    }
  }

  .btn-box {
    position: fixed;
    bottom: 1.2rem;
    margin: 0 auto;
    width: 33%;
    left: 0;
    right: 0;
  }
}
.under-image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: -1;
  will-change: transform;
}

/* 竖屏 */
@media screen and (orientation: portrait) {
  .tools-box {
    .tools {
      height: 3rem;
      flex-wrap: wrap;

      .tools-item {
        width: 8%;
      }
    }
  }

  .canvas-box {
    width: 100vw;
    position: relative;

    .board-canvas {
      height: 100%;
      width: 100%;
      position: absolute;
      background: rgba(0, 0, 0, 0);
    }
  }
}

/* 横屏 */
@media screen and (orientation: landscape) {
  .tools-box {
    position: absolute;
    height: 80vh;
    z-index: 10;
    overflow: auto;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    .tools {
      width: 1.8rem;
      flex-direction: column;

      .tools-item {
        width: 100%;
        margin: 0.4rem 0;
      }
    }
  }

  .canvas-box {
    //width: calc(100% - 2rem);
    width: 100%;
    //margin-right: 2.2rem;
    position: relative;
    // height: 100vh;
    z-index: 99;
    .canvas-view {
      height: 100%;
      width: 100%;
    }
    .board-canvas {
      height: 100%;
      width: 100%;
      position: absolute;
      background: rgba(0, 0, 0, 0);
      pointer-events: none;
      z-index: 99;
    }
    .draw-canvas {
      pointer-events: auto;
    }
  }
  .fill {
    height: 100% !important;
  }
}
</style>
