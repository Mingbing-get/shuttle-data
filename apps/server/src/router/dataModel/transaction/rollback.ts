import { Middleware } from '@koa/router'

import transactionManager from './manager'

const rollback: Middleware = async (ctx) => {
  const { transactionId } = ctx.request.body as {
    transactionId: string
  }

  transactionManager.rollback(transactionId)

  ctx.body = {}
}

export default rollback
