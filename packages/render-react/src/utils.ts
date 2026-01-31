import { FormRule, ColorPickerProps } from 'antd'

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

export function isSameStringArray(arr1: string[], arr2: string[]) {
  return (
    arr1.length === arr2.length && arr1.every((item) => arr2.includes(item))
  )
}

export const nameRules: FormRule[] = [
  {
    required: true,
    message: '请输入名称',
  },
  {
    min: 1,
    max: 255,
    message: '名称长度必须在 1 到 255 个字符之间',
  },
  {
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '名称只能包含字母、数字和下划线',
  },
]

export const apiNameRules: FormRule[] = [
  {
    required: true,
    message: '请输入 API 名称',
  },
  {
    min: 1,
    max: 255,
    message: 'API 名称长度必须在 1 到 255 个字符之间',
  },
  {
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'API 名称只能包含字母、数字和下划线',
  },
]

export const labelRules: FormRule[] = [
  {
    required: true,
    message: '请输入名称',
  },
  {
    max: 100,
    message: '名称长度必须在 1 到 100 个字符之间',
  },
]

export const presetColors: ColorPickerProps['presets'] = [
  {
    label: '常用',
    colors: [
      // 红色
      '#FFF0F0',
      '#FFD6D6',
      '#FFBBB9',
      '#FFA39E',
      '#F5222D',
      '#CF1322',
      '#A8071A',
      '#5C0011',
      // 绿色
      '#F6FFED',
      '#D9F7BE',
      '#B7EB8F',
      '#95DE64',
      '#52C41A',
      '#389E0D',
      '#237804',
      '#092B00',
      // 蓝色
      '#E6F7FF',
      '#BAE7FF',
      '#91D5FF',
      '#69C0FF',
      '#1890FF',
      '#096DD9',
      '#0050B3',
      '#002766',
      // 紫色
      '#F9F0FF',
      '#EFDBFF',
      '#D3ADF7',
      '#B37FEB',
      '#722ED1',
      '#531DAB',
      '#391085',
      '#120338',
      // 灰色
      '#FFFFFF',
      '#F5F5F5',
      '#D9D9D9',
      '#8C8C8C',
      '#595959',
      '#434343',
      '#262626',
      '#000000',
    ],
  },
]
