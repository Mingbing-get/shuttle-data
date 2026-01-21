import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import { generateName } from '../../utils'
import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const updateGroup: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const group = ctx.request.body as any as DataEnum.Group
  const oldGroup = await dataModel.schema.enumManager.getGroup(group.name)
  if (!oldGroup) {
    resModel.setError(
      ResponseModel.CODE.NOT_FOUND,
      `group ${group.name} not found`,
    )
    return
  }

  group.items.forEach((item) => {
    const oldItem = oldGroup.items.find((i) => i.name === item.name)
    if (oldItem) return

    item.name = generateName('item')
  })

  await dataModel.schema.enumManager.updateGroup(group)
}

export default updateGroup
