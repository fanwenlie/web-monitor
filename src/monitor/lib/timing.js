import tracker from '../utils/tracker'
import onload from '../utils/onload'
import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'
import formatTime from '../utils/formatTime'

/**
 * 根据window.performance来计算一些用户体验、性能监控等指标
 */
export default function timing() {
  /**
   * 这些指标不是随便定义的，chrome控制台->performance会显示这些指标
   * FMP: First Meaningful Paint(首次有意义绘制)。页面有意义的内容渲染的时间
   * LCP: (Largest Contentful Paint)(最大内容渲染). 代表在viewport中最大的页面元素加载的时间
   * FP: First Paint(首次绘制). 包括了任何用户自定义的背景绘制，它是首先将像素绘制到屏幕的时刻
   * FCP: First Content Paint(首次内容绘制). 是浏览器将第一个 DOM 渲染到屏幕的时间,可能是文本、图像、SVG等,这其实就是白屏时间
   */
  let FMP, LCP, FP, FCP

  if (PerformanceObserver) {
    // 想要触发PerformanceObserver，html页面中的元素需要设置elementtiming属性
    new PerformanceObserver((entryList, observer) => {
      const perfEntries = entryList.getEntries()
      FMP = perfEntries[0]
      // debugger
      // 停止观察
      observer.disconnect()
    }).observe({ entryTypes: ['element'] })

    new PerformanceObserver((entryList, observer) => {
      const perfEntries = entryList.getEntries()
      LCP = perfEntries[0]
      observer.disconnect()
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    /**
     * 监控首次输入延迟时间。是用户首次和页面交互(单击链接，点击按钮等)到页面响应交互的时间
     * TIPS: 千万不要对下面代码中的input产生误解，并不是有输入框才会触发PerformanceObserver，
     * 只要你点击页面就会触发。
     */
    new PerformanceObserver((entryList, observer) => {
      const lastEvent = getLastEvent();
      const firstInput = entryList.getEntries()[0]
      if (firstInput) {
        /**
         * processingStart：开始处理输入的时间
         * startTime: 点击的时间
         * 差值就是开始处理的延迟时间
         */
        let inputDelay = firstInput.processingStart - firstInput.startTime;
        let duration = firstInput.duration
        if (inputDelay > 0 || duration > 0) {
          tracker.send({
            kind: 'experience',
            // 首次输入延迟
            type: 'firstInputDelay',
            inputDelay: inputDelay ? formatTime(inputDelay) : 0,
            duration: duration ? formatTime(duration) : 0,
            startTime: firstInput.startTime,
            selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
          })
        }
      } 
      observer.disconnect()
    }).observe({ type: 'first-input', buffered: true })
  }

  function handler() {
    // 发送performance.timing相关监控数据
    function timingData() {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart
      } = window.performance.timing

      tracker.send({
        // 用户体验指标
        kind: 'experience',
        // 统计每个阶段的时间
        type: 'timing',
        // TCP连接耗时
        connectTime: connectEnd - connectStart,
        // TTFB, 首字节响应耗时
        TTFBTime: responseStart - requestStart,
        // 响应耗时
        responseTime: responseEnd - responseStart,
        // DOM解析耗时
        parseDOMTime: loadEventStart - domLoading,
        // DOMContentLoaded事件耗时
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart,
        // 首次可交互时间
        timeToInteractive: domInteractive - fetchStart,
        // 页面完全加载时间
        loadTime: loadEventStart - fetchStart,
      })
    }

    // 发送FMP, LCP, FP, FCP相关数据
    function paintData() {
      FP = performance.getEntriesByName('first-paint')[0]
      FCP = performance.getEntriesByName('first-contentful-paint')[0]

      // console.log('FP', FP)
      // console.log('FCP', FCP)
      // console.log('FMP', FMP)
      // console.log('LCP', LCP)

      tracker.send({
        // 用户体验指标
        kind: 'experience',
        // 页面绘制相关指标
        type: 'paint',
        firstPaint: FP ? formatTime(FP.startTime) : 0,
        firstContentPaint: FCP ? formatTime(FCP.startTime) : 0,
        firstMeaningfulPaint: FMP ? formatTime(FMP.startTime) : 0,
        largestContentfulPaint: LCP ? formatTime(LCP.renderTime || LCP.loadTime) : 0
      })
    }
    
    // 延迟3s执行，统计更加准确
    setTimeout(function sendData() {
      timingData()
      paintData()
    }, 3000);
  }

  onload(handler)
}