import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import { generateName } from '../../utils'
import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const addGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const group = ctx.request.body as any as DataEnum.Group

  group.name = generateName('group')
  group.items.forEach((item) => {
    item.name = generateName('item')
  })

  await dataModel.schema.enumManager.addGroup(group)
}

export default addGroup
