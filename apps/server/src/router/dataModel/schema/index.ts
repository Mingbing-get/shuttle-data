import koaRouter from '@koa/router'

import createTable from './createTable'
import updateTable from './updateTable'
import dropTable from './dropTable'
import getTableList from './getTableList'
import getTable from './getTable'
import addField from './addField'
import updateField from './updateField'
import dropField from './dropField'

const schemaRouter = new koaRouter()

schemaRouter.post('/createTable', createTable)
schemaRouter.post('/updateTable', updateTable)
schemaRouter.post('/dropTable', dropTable)
schemaRouter.get('/getTableList', getTableList)
schemaRouter.get('/getTable', getTable)
schemaRouter.post('/addField', addField)
schemaRouter.post('/updateField', updateField)
schemaRouter.post('/dropField', dropField)

export default schemaRouter
