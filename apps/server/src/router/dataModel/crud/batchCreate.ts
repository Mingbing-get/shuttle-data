import { Middleware } from '@koa/router'
import { DataCRUD } from '@shuttle-data/type'

import { ResponseModel } from '../../../utils/responseModel'
import baseCrud from './base'

const batchCreate: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { modelName, transactionId, useApiName, ...options } = ctx.request
    .body as any as DataCRUD.BatchCreateOption<any> & {
    modelName: string
    transactionId?: string
    useApiName?: boolean
  }

  const result = await baseCrud({
    options,
    method: 'batchCreate',
    context: {
      user: ctx.state.user,
    },
    modelName,
    transactionId,
    useApiName,
  })
  resModel.setData(result)
}

export default batchCreate
