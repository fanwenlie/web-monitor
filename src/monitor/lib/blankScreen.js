import tracker from '../utils/tracker'
import onload from '../utils/onload'

function getSelector(element) {
  if (!element) { return '' }
  const { id, className, nodeName } = element
  if (id) {
    return `#${id}`
  }
  if (className) {
    return `.${className.split(' ').filter(cls => !!cls).join('.')}`
  }
  return nodeName.toLowerCase()
}

/**
 * 判断元素是否是容器元素
 * @param {*} element 
 */
// 假设如果是以下元素或者标签，则是空白元素, 值并不固定，由个人需求添加
const wrapperElements = ['html', 'body', '.container', '.content']
let emptyPoints = 0
function isWrapper(element) {
  let selector = getSelector(element)
  if (wrapperElements.indexOf(selector) !== -1) {
    emptyPoints++
  }
}

/**
 * TIPS: 这种方式白屏检测貌似有问题，还需要完善。比如，页面什么元素都没有，但emptyPoints为10，显然是有问题的
 * 判断页面是否是白屏
 * 1. 通过把页面划分成x轴和y轴，分别取x轴和y轴上的十个点
 * 2. 判断这20个点是否是容器元素，如果都是，则是白屏
 * 3. 该方法得在页面完全load情况执行
 */
export default function blankScreen() {
  onload(function blankScreenHanlder() {
    const screenInnerWidth = window.innerWidth
    const screenInnerHeight = window.innerHeight
    for (let i = 1; i <= 10; i++) {
      const xElem = document.elementsFromPoint(screenInnerWidth * i / 10, screenInnerHeight / 2)
      const yElem = document.elementsFromPoint(screenInnerWidth / 2, screenInnerHeight * i / 2)
      isWrapper(xElem[0])
      isWrapper(yElem[0])
    }
    // 不一定非得20个，亦可设置18或者16，按照个人需求来写
    if (emptyPoints >= 20) {
      // 取页面x轴和y轴中心点
      const centerElem = document.elementsFromPoint(screenInnerWidth / 2, screenInnerHeight / 2)
      tracker.send({
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: `${window.screen.width}X${window.screen.height}`,
        viewPoint: `${screenInnerWidth}X${screenInnerHeight}`,
        selector: getSelector(centerElem[0])
      })
    }
  })
}

