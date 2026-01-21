import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import { generateName } from '../../../utils'
import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const addField: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const body = ctx.request.body as any as {
    field: DataModel.Field
    tableName: string
    useApiName?: boolean
  }

  body.field.name = generateName('field')

  await dataModel.schema.addField(body.tableName, body.field, body.useApiName)
}

export default addField
