import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import { generateName } from '../../../utils'
import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const updateTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const dataModelDefine = ctx.request.body as any as DataModel.Define
  const oldModel = await dataModel.schema.getTable(dataModelDefine.name)
  if (!oldModel) {
    resModel.setError(
      ResponseModel.CODE.VALIDATE_ERROR,
      `Table ${dataModelDefine.name} not found`,
    )
    return
  }

  dataModelDefine.fields.forEach((field) => {
    const oldField = oldModel.fields.find((f) => f.name === field.name)
    if (oldField) return

    const fieldName = generateName('field')

    if (dataModelDefine.displayField === field.name) {
      dataModelDefine.displayField = fieldName
    }

    field.name = fieldName
  })

  await dataModel.schema.updateTable(dataModelDefine)
}

export default updateTable
