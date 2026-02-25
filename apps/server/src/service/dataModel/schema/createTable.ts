import { DataModel } from '@shuttle-data/type'

import { generateName } from '../../../utils'
import dataModel from '../../../config/dataModel'

export default async function createTable(dataModelDefine: DataModel.Define) {
  const systemFields = dataModel.schema.getSystemFields()
  dataModelDefine.dataSourceName = 'main'
  dataModelDefine.name = generateName('model')
  dataModelDefine.fields.reduce((total: DataModel.Field[], field) => {
    const innerSystemField = systemFields.find(
      (systemField) => systemField.name === field.name,
    )

    if (innerSystemField) {
      return [...total, { ...innerSystemField, order: field.order }]
    }

    const fieldName = generateName('field')

    if (
      dataModelDefine.displayField === field.name ||
      dataModelDefine.displayField === field.apiName
    ) {
      dataModelDefine.displayField = fieldName
    }

    field.name = fieldName

    return [...total, field]
  }, [])

  await dataModel.schema.createTable(dataModelDefine)
}
