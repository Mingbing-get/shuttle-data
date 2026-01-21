import { Middleware } from '@koa/router'
import { DataEnum } from '@shuttle-data/type'

import dataModel from '../../config/dataModel'
import { ResponseModel } from '../../utils/responseModel'

const getGroupList: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const enumGroupInfo = await dataModel.schema.enumManager.all()

  const groupList: Omit<DataEnum.Group, 'items'>[] = []
  for (const key in enumGroupInfo.groupMap) {
    const { items, ...group } = enumGroupInfo.groupMap[key]
    groupList.push(group)
  }

  resModel.setData(groupList)
}

export default getGroupList
