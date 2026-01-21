import { Middleware } from '@koa/router'

import transactionManager from './manager'
import { ResponseModel } from '../../../utils/responseModel'

const rollback: Middleware = async (ctx) => {
  const resModel = new ResponseModel()
  ctx.body = resModel.getResult()

  const { transactionId } = ctx.request.body as {
    transactionId: string
  }

  transactionManager.rollback(transactionId)
}

export default rollback
