import { Middleware } from '@koa/router'

import transactionManager from './manager'

const start: Middleware = async (ctx) => {
  const { dataSourceName } = ctx.request.body as {
    dataSourceName: string
  }

  const transactionId = await transactionManager.start(dataSourceName)

  ctx.body = {
    transactionId,
  }
}

export default start
