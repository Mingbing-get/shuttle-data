import { DataModel } from '@shuttle-data/type'

interface Options {
  dataSourceName: string
  userTableName?: string
}

export function getInitDataModel(options: Options): DataModel.Define {
  const { dataSourceName, userTableName = '_user' } = options

  return {
    dataSourceName,
    name: '',
    apiName: '',
    displayField: '_id',
    isSystem: false,
    fields: [
      {
        name: '_id',
        apiName: '_id',
        type: 'string',
        label: 'ID',
        isSystem: true,
      },
      {
        name: '_createdBy',
        apiName: '_createdBy',
        type: 'lookup',
        label: '创建人',
        isSystem: true,
        extra: {
          modalName: userTableName,
        },
      },
      {
        name: '_createdAt',
        apiName: '_createdAt',
        type: 'datetime',
        label: '创建时间',
        isSystem: true,
      },
      {
        name: '_updatedBy',
        apiName: '_updatedBy',
        type: 'lookup',
        label: '更新人',
        isSystem: true,
        extra: {
          modalName: userTableName,
        },
      },
      {
        name: '_updatedAt',
        apiName: '_updatedAt',
        type: 'datetime',
        label: '更新时间',
        isSystem: true,
      },
    ],
  }
}

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
