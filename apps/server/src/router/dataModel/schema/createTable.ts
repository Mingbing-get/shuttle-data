import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import { generateName } from '../../../utils'
import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const createTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const dataModelDefine = ctx.request.body as any as DataModel.Define

  const systemFields = dataModel.schema.getSystemFields()
  dataModelDefine.dataSourceName = 'main'
  dataModelDefine.name = generateName('model')
  dataModelDefine.fields.reduce((total: DataModel.Field[], field) => {
    const innerSystemField = systemFields.find(
      (systemField) => systemField.name === field.name,
    )

    if (innerSystemField) {
      return [...total, innerSystemField]
    }

    const fieldName = generateName('field')

    if (dataModelDefine.displayField === field.name) {
      dataModelDefine.displayField = fieldName
    }

    field.name = fieldName

    return [...total, field]
  }, [])

  await dataModel.schema.createTable(dataModelDefine)
}

export default createTable
