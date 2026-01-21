import { Middleware } from '@koa/router'

import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const updateItemDisable: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { itemName, groupName, useApiName, disabled } = ctx.request
    .body as any as {
    itemName: string
    groupName: string
    useApiName?: boolean
    disabled?: boolean
  }

  await dataModel.schema.enumManager.updateItemDisable(
    groupName,
    itemName,
    useApiName,
    disabled,
  )
}

export default updateItemDisable
