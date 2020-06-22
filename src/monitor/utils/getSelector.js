function makePaths(paths) {
  return paths
    .reverse()
    .filter(elem => {
      return elem !== document && elem !== window
    })
    .map(elem => {
      const {
        id,
        nodeName,
        className,
      } = elem
      if (id) {
        return `${nodeName.toLowerCase()}#${id}`
      }
      if (className && typeof className === 'string') {
        return `${nodeName.toLowerCase()}#${className}`
      }
      return nodeName.toLowerCase()
    })
    .join(' ')
}

/**
 * 可能是event.target也可能是event.path
 * @param {Arrary|Object} pathsOrTarget 
 */
export default function (pathsOrTarget) {
  if (!Array.isArray(pathsOrTarget)) { 
    let path = []
    while (pathsOrTarget) {
      path.push(pathsOrTarget)
      pathsOrTarget = pathsOrTarget.parentNode
    }
    return makePaths(path)
  }

  return makePaths(pathsOrTarget)
}