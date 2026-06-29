/**
 *获取各种时间格式
 * @style 1. hh:mm:ss 时:分:秒
 *        2.YYYY-MM-DD 年-月-日
 *        3.YYYYMMDD 年月日
 *        4.YYYY-MM-DD hh:mm:ss 年-月-日 时:分:秒
 *        5.YYYYMMDDhhmmss 年月日时分秒
 *        6.DD 日
 *        7.getDay 获取当前星期几
 *        8.hhmmss 时分秒
 * */
const getTime = style => {
  let time = new Date()
  let times = ''
  //获取年月日
  let yyyy = time.getFullYear()
  let mm = time.getMonth()
  mm = mm >= 9 ? mm + 1 : '0' + (mm + 1)
  let dd = time.getDate()
  dd = dd >= 10 ? dd : '0' + dd

  //获取时分秒
  let h = time.getHours()
  h = h >= 10 ? h : '0' + h
  let m = time.getMinutes()
  m = m >= 10 ? m : '0' + m
  let s = time.getSeconds()
  s = s >= 10 ? s : '0' + s
  // 获取星期
  let z = time.getDay()
  z = '0' + z

  if (style === 'YYYY-MM-DD') {
    times = yyyy + '-' + mm + '-' + dd
  }

  if (style === 'hh:mm:ss') {
    times = h + ':' + m + ':' + s
  }

  if (style === 'YYYYMMDD') {
    times = yyyy + '' + mm + '' + dd
  }
  if (style === 'YYYY') {
    times = yyyy + ''
  }
  if (style === 'MM') {
    times = mm + ''
  }
  if (style === 'DD') {
    times = dd + ''
  }

  if (style === 'YYYY-MM-DD hh:mm:ss' || !style) {
    times = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + m + ':' + s
  }
  if (style === 'YYYYMMDDhhmmss') {
    times = yyyy + '' + mm + '' + dd + '' + h + '' + m + '' + s
  }
  if (style === 'DD') {
    times = dd + ''
  }
  if (style === 'getDay') {
    times = z + ''
  }
  return times
}
const getIp = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://api.ipify.org', // 这是一个提供获取客户端公网IP服务的简单API
      method: 'GET',
      success: res => {
        const ip = res.data
        resolve(ip)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

const withinSpliter = (dateStr) => {
  return dateStr.replace(/[-\/]/g, '')
}
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = (end - start) / (1000 * 60 * 60 * 24) 
  return Math.floor(days)
}
export { getTime, getIp, withinSpliter, daysBetween }
