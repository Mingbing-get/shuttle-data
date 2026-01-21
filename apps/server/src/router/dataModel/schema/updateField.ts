import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const updateField: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const body = ctx.request.body as any as {
    field: DataModel.Field
    tableName: string
    useApiName?: boolean
  }

  await dataModel.schema.updateField(
    body.tableName,
    body.field,
    body.useApiName,
  )
}

export default updateField
