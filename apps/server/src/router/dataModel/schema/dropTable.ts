import { Middleware } from '@koa/router'

import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const dropTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { tableName, useApiName } = ctx.request.body as {
    tableName: string
    useApiName?: boolean
  }

  await dataModel.schema.dropTable(tableName, useApiName)
}

export default dropTable
