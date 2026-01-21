import { Middleware } from '@koa/router'

import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const getGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { groupName, useApiName } = ctx.request.query as any as {
    groupName: string
    useApiName?: boolean
  }

  const group = await dataModel.schema.enumManager.getGroup(
    groupName,
    useApiName,
  )

  if (!group) {
    resModel.setError(
      ResponseModel.CODE.NOT_FOUND,
      `group ${groupName} not found`,
    )
    return
  }
  resModel.setData(group)
}

export default getGroup
