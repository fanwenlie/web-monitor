const userAgent = require('user-agent')

// 阿里云SLS服务实例，免费的
const project = 'webmonitor'
const logstore = 'webmonitor-store'
const host = 'cn-beijing.log.aliyuncs.com'

// 添加额外自定义数据
function getExtraData() {
  return {
    title: document.title,
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(window.navigator.userAgent).full,
  }
}

class SendTracker {
  constructor() {
    // 上报路径
    this.url = `http://${project}.${host}/logstores/${logstore}/track`
    this.xhr = new XMLHttpRequest()
  }

  send(data = {}) {
    let extraData = getExtraData()
    let logData = { ...extraData, ...data }
    console.log('log', logData)
    return
    // 阿里云规定：对象的值不能是数字
    for (const key in logData) {
      if (
        Object.prototype.hasOwnProperty.call(logData, key) && 
        (typeof logData[key] === 'number')
      ) {   
        logData[key] = `${logData[key]}`
      }
    }
    const body = JSON.stringify({
      __logs__: [logData]
    })
    this.xhr.open('POST', this.url, true)
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length)
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0')
    // this.xhr.setRequestHeader('x-log-compresstype', 'lz4')
    this.xhr.setRequestHeader('Content-Type', 'application/json')
    this.xhr.send(body)
    this.xhr.onload = () => {
      // console.log(this.xhr.response)
    }
    this.xhr.onerror = function(error) {
      // console.log(error)
    }
  }
}

export default new SendTracker()