export function generateUUID(prefix = '') {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)

  // 设置版本位（第6字节为4表示版本4 UUID）
  array[6] = ((array[6] || 0) & 0x0f) | 0x40
  // 设置变体位（第8字节为8、9、A或B）
  array[8] = ((array[8] || 0) & 0x3f) | 0x80

  return [
    prefix,
    Array.from(array.slice(0, 4))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    Array.from(array.slice(4, 6))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    Array.from(array.slice(6, 8))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    Array.from(array.slice(8, 10))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    Array.from(array.slice(10, 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  ].join('')
}
