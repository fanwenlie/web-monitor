
/**
 * 值类似 203.02999997511506，只要整数部分
 * @param {number} time 
 * @return {string}
 */
export default function formatTime(time) {
  return `${time}`.split(".")[0]
}