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

export function fillSystemFields(
  mode: DataModel.Define,
  userTableName?: string,
) {
  const fields = getInitDataModel({
    dataSourceName: mode.dataSourceName,
    userTableName,
  }).fields

  mode.fields.forEach((field) => {
    const fieldExist = fields.find(
      (f) => f.name === field.name || f.apiName === field.apiName,
    )
    if (fieldExist) {
      fieldExist.order = field.order
    } else {
      fields.push(field)
    }
  })

  const newModel = {
    ...mode,
    fields,
  }

  if (!newModel.displayField) {
    newModel.displayField = '_id'
  }

  return newModel
}
