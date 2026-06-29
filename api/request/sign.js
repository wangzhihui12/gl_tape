import {sha1,qs} from '../../lib/index'
const sign = (params, secret, noSignAttr = []) => {
  delete params.sign
  var objStr =  qs.stringify(params, {
    arrayFormat: 'indices',
    allowDots: true,
    encodeValuesOnly: true
  })
  var objVal = objStr.split('&')
  var realObj = {}
  objVal.forEach(item => {
    const idx = item.indexOf('=')
    realObj[item.split('=')[0]] = decodeURIComponent(item.slice(idx + 1))
  })

  const keys = Object.keys(realObj).sort()
  var str = []
  var obj = null
  for (const key in realObj) {
    obj = realObj[key]
    if (obj === null) {
      obj = ''
    } else if (typeof obj === 'object') {
      obj = JSON.stringify(obj)
    }
    realObj[key] = obj
  }
  keys.forEach(e => {
    !noSignAttr.includes(e) && str.push(e + realObj[e])
  })
  realObj.sign = sha1(secret + str.join('') + secret).toUpperCase()
  return realObj
}
export default sign