import tracker from '../utils/tracker'

export default function pv() {
  const { connection } = window.navigator
  const { width, height } = window.screen
  tracker.send({
    kind: 'business',
    type: 'pv',
    // 网络环境
    effectiveType: connection.effectiveType, 
    // RTT(Round Trip Time): 一个连接的往返时间，即数据发送时刻到接收到确认的时刻的差值
    rtt: connection.rtt,
    // 设备分辨率
    screen: `${width}x${height}`,
  })

  const startTime = Date.now()
  window.addEventListener('unload', () => {
    let stayTime = Date.now() - startTime
    tracker.send({
        kind: 'business',
        type: 'stayTime',
        stayTime
    })
  }, false)
}