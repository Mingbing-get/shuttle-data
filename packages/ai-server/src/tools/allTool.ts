import {
  getTableListTool,
  getTableDetailTool,
  createTableTool,
  dropTableTool,
  updateTableTool,
} from './schema'

export default function allTool() {
  return [
    getTableListTool,
    getTableDetailTool,
    createTableTool,
    dropTableTool,
    updateTableTool,
  ]
}
