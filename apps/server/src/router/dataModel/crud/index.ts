import koaRouter from '@koa/router'

import find from './find'
import findOne from './findOne'
import count from './count'
import queryGroupBy from './queryGroupBy'
import update from './update'
import del from './del'
import create from './create'
import batchCreate from './batchCreate'

const crudRouter = new koaRouter()

crudRouter.post('/find', find)
crudRouter.post('/findOne', findOne)
crudRouter.post('/count', count)
crudRouter.post('/queryGroupBy', queryGroupBy)
crudRouter.post('/update', update)
crudRouter.post('/del', del)
crudRouter.post('/create', create)
crudRouter.post('/batchCreate', batchCreate)

export default crudRouter
