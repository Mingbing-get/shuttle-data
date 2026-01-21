import { Middleware } from '@koa/router'

import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const getTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { tableName, useApiName } = ctx.request.query as any as {
    tableName: string
    useApiName?: boolean
  }

  const model = await dataModel.schema.getTable(tableName, useApiName)

  if (!model) {
    resModel.setError(
      ResponseModel.CODE.NOT_FOUND,
      `table ${tableName} not found`,
    )
  } else {
    resModel.setData(model)
  }
}

export default getTable
