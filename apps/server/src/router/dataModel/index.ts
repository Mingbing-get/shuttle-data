import koaRouter from '@koa/router'

import transactionRouter from './transaction'
import schemaRouter from './schema'
import crudRouter from './crud'

const dataModelRouter = new koaRouter()

dataModelRouter.use('/transaction', transactionRouter.routes())
dataModelRouter.use('/schema', schemaRouter.routes())
dataModelRouter.use('/crud', crudRouter.routes())

export default dataModelRouter
