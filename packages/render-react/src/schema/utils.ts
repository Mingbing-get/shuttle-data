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
