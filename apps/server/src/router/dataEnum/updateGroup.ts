import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import updateGroupService from '../../service/dataEnum/updateGroup'
import { ResponseModel } from '../../utils/responseModel'

const updateGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const group = ctx.request.body as any as DataEnum.Group
  await updateGroupService(group)
}

export default updateGroup
