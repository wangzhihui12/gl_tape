import io from '@/uni_modules/hyoga-uni-socket_io/uni-socket.io.js'
import { WsTyps } from '../utils/common'
import CommandFactory from './CommandFactory'
import config from '@/config.js'
import { serializeIfObject,deepClone } from '@/utils/utils.js'

// const WsTyps = common.constants.WsTyps
export class Ws {
  wsAddress
  loginAddress
  token
  deviceId
  onMessage
  ws
  constructor() {
    this.wsAddress = config.SOCKET_SERVER
    this.loginAddress =`${config.HTTP_SERVER}/login`
  }
  async connect() {  
    const { code, data, o } = await this.login()
    if (code == 200) {
      this.deviceId = data.id
      this.token = data.token 
      this.ws = io(this.wsAddress, {
		    path:'/websocket/',
        auth: { token: this.token, deviceId: this.deviceId },
        transports: ['websocket'],  
        timeout: 5000
      })
      this.subscribe()
    } else {
      uni.$logger.local.error(`登录失败 -> ${serializeIfObject({ code, data, o })}`)
    }
  }
  async login(retryCount = 3, retryDelay = 2000) {
    const tryLogin = async (attemptCount) => {
      try {
        const sysInfo = uni.getSystemInfoSync()
        if (!sysInfo?.deviceId) {
          throw new Error('未获取到系统设备信息')
        }
        // sysInfo.deviceId = '4DF8801064461802495A2452CCD04EE4'
        uni.$logger.local.info(`========WS,用户登录(第${attemptCount}次尝试) ${JSON.stringify({deviceId:sysInfo.deviceId})}========`)
        
        return new Promise((resolve, reject) => {
          uni.request({
            url: this.loginAddress,
            data: { sn: sysInfo.deviceId },
            method: 'POST',
            dataType: 'json',
            success(response) {
              resolve(response.data)
            },
            fail(err) {
              reject(err)
            }
          })
        })
      } catch (error) {
        throw error
      }
    }

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        return await tryLogin(attempt)
      } catch (err) {
        if (attempt === retryCount) {
          uni.$logger.local.error(`登录失败(已重试${retryCount}次), 请检查网络或联系管理员! err->${serializeIfObject(err)}`)
          throw err
        }
        uni.$logger.local.warn(`登录失败(第${attempt}次), ${retryDelay/1000}秒后重试... err->${serializeIfObject(err)}`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  subscribe() {
    this.ws.on(WsTyps.Connected, () => {
      uni.$logger.local.warn('========WebSocket 连接成功========')
    })
    this.ws.on(
      WsTyps.MessageTypes.Private,
      function (data) {
        uni.$logger.local.info(`WebSocket 收到消息 -> ${JSON.stringify(data)}`)
        if (data.errorCode && data.errorCode == 907) {
          uni.$logger.local.warn('WebSocket Token过期，尝试重连...')
          return this.connect()
        }
        const _data = deepClone(data)
        const worker = CommandFactory.getInstance().dispatch(_data.command)
        worker.work(this.deviceId, _data, this)
        this.onMessage && this.onMessage(_data)
      }.bind(this)
    )
    // this.ws.on(WsTyps.MessageTypes.System, function (data) {
      // uni.$logger.local.info(`========WebSocket 收到系统消息 ${serializeIfObject(data)}========`)
    // })
    this.ws.on(WsTyps.Disconnected, () => {
      CommandFactory.getInstance().clear()
      uni.$logger.local.warn(`========WebSocket 断开连接 device_id->${this.deviceId}========`)
    })
    this.ws.on(WsTyps.Eroor, msg => {
      CommandFactory.getInstance().clear()
      uni.$logger.error(`========WebSocket 异常 device_id->${this.deviceId} msg ->${serializeIfObject(msg)}========`)
    })
  }
  send(data, type = WsTyps.MessageTypes.Private) {
    this.ws.emit(type, { device_id: this.deviceId, ...data })
  }
}
