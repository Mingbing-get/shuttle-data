import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import addGroupService from '../../service/dataEnum/addGroup'
import { ResponseModel } from '../../utils/responseModel'

const addGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const group = ctx.request.body as any as DataEnum.Group

  await addGroupService(group)
}

export default addGroup
