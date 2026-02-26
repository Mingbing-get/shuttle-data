import {
  getTableListTool,
  getTableDetailTool,
  createTableTool,
  dropTableTool,
  updateTableTool,
} from './schema'
import {
  addGroupTool,
  updateGroupTool,
  removeGroupTool,
  getGroupDetailTool,
  getGroupListTool,
} from './enum'
import {
  createRecordTool, 
  batchCreateRecordsTool, 
  updateRecordsTool, 
  conditionUpdateRecordsTool, 
  findRecordsTool, 
  recordCountTool,
  deleteRecordsTool,
  queryGroupByTool,
  getConditionDefineTool
} from './crud'

export default function allTool() {
  return [
    getTableListTool,
    getTableDetailTool,
    createTableTool,
    dropTableTool,
    updateTableTool,
    addGroupTool,
    updateGroupTool,
    removeGroupTool,
    getGroupDetailTool,
    getGroupListTool,
    createRecordTool,
    batchCreateRecordsTool,
    updateRecordsTool,
    conditionUpdateRecordsTool,
    findRecordsTool,
    recordCountTool,
    deleteRecordsTool,
    queryGroupByTool,
    getConditionDefineTool
  ]
}
