import { Middleware } from '@koa/router'
import { DataModel } from '@shuttle-data/type'

import dataModel from '../../../config/dataModel'
import { ResponseModel } from '../../../utils/responseModel'

const getTableList: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const tableInfo = await dataModel.schema.all()

  const tableList: Omit<DataModel.Define, 'fields'>[] = []
  for (const key in tableInfo.modelMap) {
    const { fields, ...rest } = tableInfo.modelMap[key]
    tableList.push(rest)
  }

  resModel.setData(tableList)
}

export default getTableList
