/**
 * 格式化ISO UTC时间字符串 2026-06-17T08:42:50.640Z
 * @param {string|null|undefined} isoStr 原始时间字符串
 * @param {boolean} onlyDate 是否只输出日期 YYYY-MM-DD
 * @returns {string} 本地北京时间 YYYY-MM-DD HH:mm:ss
 */
export function useFormatDate(isoStr, onlyDate = false) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  // 非法时间直接返回空
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (onlyDate) {
    return `${year}-${month}-${day}`
  }

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}