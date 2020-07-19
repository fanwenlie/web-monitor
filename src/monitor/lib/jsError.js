
import getLastEvent  from '../utils/getLastEvent'
import getSelector  from '../utils/getSelector'
import tracker from '../utils/tracker'

export default function injectJsError() {
  window.addEventListener('error', jsErrorHandler, true)
  window.addEventListener('unhandledrejection', promiseErrorHandler, true)

  function jsErrorHandler(evt) {
    // console.log(evt)
    // 最后一个交互事件
    const lastEvent = getLastEvent()
     // console.log(lastEvent)
    const {
      target,
      message,
      filename,
      lineno,
      colno,
      error,
    } = evt

    // 判断是否是资源加载错误
    const isResource = target && (target.src || target.href)
    if (isResource) {
      // 资源加载错误上报
      tracker.send({
        kind: 'stability',
        type: 'error',
        errorType: 'resourceError',
        url: '',
        message: '资源加载失败',
        filename: target.src || target.href,
        tagName: target.tagName,
        selector: getSelector(evt.target),
      })
      return
    }

    // js error上报
    tracker.send({
      kind: 'stability',
      type: 'error',
      errorType: 'jsError',
      url: '',
      message,
      filename,
      position: `${lineno || 0}:${colno || 0}`,
      stack: getLines(error.stack),
      selector: lastEvent ? getSelector(lastEvent.path) : '',
    })
  }

  function promiseErrorHandler(evt) {
    // console.log(evt)
    const lastEvent = getLastEvent()
    const { reason } = evt
    let message
    let filename = ''
    let line = 0
    let column = 0
    let stack = ''
    
    switch (reason) {
      case 'string':
        message = reason
        break;
      case 'object':
        if (reason instanceof Error) {
          let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
          filename = matchResult[1]
          line = matchResult[2]
          column = matchResult[3]
          stack = getLines(reason.stack)
          message = reason.message
        }
        break;
      default:
        break;
    }

    tracker.send({
      kind: 'stability',
      type: 'error',
      errorType: 'promiseError',
      url: '',
      message,
      filename,
      position: `${line}:${column}`,
      stack,
      selector: lastEvent ? getSelector(lastEvent.path) : '',
    })
  }
}

/**
 * 美化错误栈信息，去掉空白和at字符
 * @param {*} stack
 */
function getLines(stack) {
  if (!stack) { return '' }
  return stack
    .split('\n')
    .slice(1)
    .map(str => str.replace(/^\s+at\s+/g, ''))
    .join('^')
}