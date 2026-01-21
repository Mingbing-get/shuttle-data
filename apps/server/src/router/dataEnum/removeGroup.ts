import { Middleware } from '@koa/router'

import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const removeGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { groupName, useApiName } = ctx.request.body as any as {
    groupName: string
    useApiName?: boolean
  }

  await dataModel.schema.enumManager.removeGroup(groupName, useApiName)
}

export default removeGroup
