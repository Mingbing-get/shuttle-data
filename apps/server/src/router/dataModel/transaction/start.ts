import { Middleware } from '@koa/router'

import transactionManager from './manager'
import { ResponseModel } from '../../../utils/responseModel'

const start: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { dataSourceName } = ctx.request.body as {
    dataSourceName: string
  }

  const transactionId = await transactionManager.start(dataSourceName)

  resModel.setData({
    transactionId,
  })
}

export default start
