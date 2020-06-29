import getLastEvent  from '../utils/getLastEvent'
import getSelector  from '../utils/getSelector'
import tracker from '../utils/tracker'
import formatTime from '../utils/formatTime'

/**
 * 监控卡顿情况：响应用户交互的响应时间如果大于100ms,用户就会感觉卡顿
 * [entryTypes](https://w3c.github.io/timing-entrytypes-registry/#registry)
 */
export default function longTask() {
  new PerformanceObserver(list => {
    list
      .getEntries()
      .forEach(entry => {
        if (entry.duration <= 100) { return }
        const lastEvent = getLastEvent()
        window.requestIdleCallback(() => {
          tracker.send({
            kind: 'experience',
            type: 'longTask',
            eventType: lastEvent.type,
            // 卡顿开始时间
            startTime: formatTime(entry.startTime),
            // 卡顿持续时间
            duration: formatTime(entry.duration),
            selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
          })
        })
      }) 
  }).observe({ entryTypes: ['longtask'] })
}