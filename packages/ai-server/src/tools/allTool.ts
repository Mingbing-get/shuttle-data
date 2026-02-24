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
  ]
}
