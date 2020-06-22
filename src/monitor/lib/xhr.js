import tracker from '../utils/tracker'

/**
 * 接口数据上报：通过拦截XMLHttpRequest原型方法来实现
 */
export default function injectXHR() {
  let oldXHR = window.XMLHttpRequest

  let oldOpen = oldXHR.prototype.open
  oldXHR.prototype.open = function (method, url, async) {
    if (tracker.url !== url) {
      this.logData = {
        method,
        url,
        async,
      }
    }
    
    return oldOpen.apply(this, arguments)
  }

  let oldSend = oldXHR.prototype.send
  oldXHR.prototype.send = function (body) {
    if (this.logData) {
      // 发送请求前记录开始发送时间
      const startTime = Date.now()
      const handler = type => evt => {
        const duration = Date.now() - startTime
        // 比如 500
        const status = this.status
        // internal error
        const statusText = this.statusText

        tracker.send({
          kind: 'stability',
          type: 'xhr',
          // load、error、abort
          eventType: type,
          // 请求路径
          pathname: this.logData.url,
          status: `${status}-${statusText}`,
          duration,
          // 响应体
          response: this.response ? JSON.stringify(this.response) : '',
          // 请求参数
          params: body || ''
        })
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oldSend.apply(this, arguments)
  }
}