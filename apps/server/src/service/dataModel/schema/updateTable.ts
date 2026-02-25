import { DataModel } from '@shuttle-data/type'

import { generateName } from '../../../utils'
import dataModel from '../../../config/dataModel'

export default async function updateTable(dataModelDefine: DataModel.Define) {
  const oldModel = await dataModel.schema.getTable(dataModelDefine.name)
  if (!oldModel) {
    throw new Error(`Table ${dataModelDefine.name} not found`)
  }

  dataModelDefine.fields.forEach((field) => {
    const oldField = oldModel.fields.find((f) => f.name === field.name)
    if (oldField) return

    const fieldName = generateName('field')

    if (
      dataModelDefine.displayField === field.name ||
      dataModelDefine.displayField === field.apiName
    ) {
      dataModelDefine.displayField = fieldName
    }

    field.name = fieldName
  })

  await dataModel.schema.updateTable(dataModelDefine)
}
