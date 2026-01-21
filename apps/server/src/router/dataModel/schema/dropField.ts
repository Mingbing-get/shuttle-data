import { Middleware } from '@koa/router'

import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const dropField: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const body = ctx.request.body as any as {
    tableName: string
    fieldName: string
    useApiName?: boolean
  }

  await dataModel.schema.dropField(
    body.tableName,
    body.fieldName,
    body.useApiName,
  )
}

export default dropField
