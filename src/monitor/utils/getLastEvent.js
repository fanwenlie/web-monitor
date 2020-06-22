const events = [
  'click',
  'touchstart',
  'mousedown',
  'keydown',
  'mouseover',
]
let lastEvent

events.forEach(evtType => {
  document.addEventListener(evtType, evt => {
    lastEvent = evt

  }, { capture: true, passive: true })
})

export default function() {
  return lastEvent
}