import koaRouter from '@koa/router'

import commit from './commit'
import rollback from './rollback'
import start from './start'

const transactionRouter = new koaRouter()

transactionRouter.post('/start', start)
transactionRouter.post('/commit', commit)
transactionRouter.post('/rollback', rollback)

export default transactionRouter
