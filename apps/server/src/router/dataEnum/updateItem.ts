import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const updateItem: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { item, groupName, useApiName } = ctx.request.body as any as {
    item: DataEnum.Item
    groupName: string
    useApiName?: boolean
  }

  await dataModel.schema.enumManager.updateItem(groupName, item, useApiName)
}

export default updateItem
