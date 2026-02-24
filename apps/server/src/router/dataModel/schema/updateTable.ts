import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import updateTableService from '../../../service/dataModel/schema/updateTable'
import { ResponseModel } from '../../../utils/responseModel'

const updateTable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const dataModelDefine = ctx.request.body as any as DataModel.Define
  await updateTableService(dataModelDefine)
}

export default updateTable
