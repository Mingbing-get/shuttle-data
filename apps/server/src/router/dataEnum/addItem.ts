import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import { generateName } from '../../utils'
import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const addItem: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { item, groupName, useApiName } = ctx.request.body as any as {
    item: DataEnum.Item
    groupName: string
    useApiName?: boolean
  }

  item.name = generateName('item')

  await dataModel.schema.enumManager.addItem(groupName, item, useApiName)
}

export default addItem
