import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import createTableService from '../../../service/dataModel/schema/createTable'
import { ResponseModel } from '../../../utils/responseModel'

const createTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const dataModelDefine = ctx.request.body as any as DataModel.Define

  await createTableService(dataModelDefine)
}

export default createTable
