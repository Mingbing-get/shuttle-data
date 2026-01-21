import { Middleware } from '@koa/router'

import transactionManager from './manager'

const commit: Middleware = async (ctx) => {
  const { transactionId } = ctx.request.body as {
    transactionId: string
  }

  transactionManager.commit(transactionId)

  ctx.body = {}
}

export default commit
