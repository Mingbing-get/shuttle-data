import koaRouter from '@koa/router'

import getGroupList from './getGroupList'
import getGroup from './getGroup'

import addGroup from './addGroup'
import addItem from './addItem'
import updateItem from './updateItem'
import updateItemDisable from './updateItemDisable'
import updateGroup from './updateGroup'
import removeGroup from './removeGroup'

const dataEnumRouter = new koaRouter()

dataEnumRouter.get('/getGroupList', getGroupList)
dataEnumRouter.get('/getGroup', getGroup)

dataEnumRouter.post('/addGroup', addGroup)
dataEnumRouter.post('/addItem', addItem)
dataEnumRouter.post('/updateItem', updateItem)
dataEnumRouter.post('/updateItemDisable', updateItemDisable)
dataEnumRouter.post('/updateGroup', updateGroup)
dataEnumRouter.post('/removeGroup', removeGroup)

export default dataEnumRouter
