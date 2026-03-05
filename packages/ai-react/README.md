# `@shuttle-data/ai-react`

Web 端 AI 相关的 React 渲染库，提供了丰富的数据操作和管理工具。(运行在浏览器环境)

## 功能特性

- **CRUD 操作**：支持批量创建、条件更新、计数、创建、删除、查询、分组查询和更新记录
- **枚举操作**：支持创建、删除、获取详情和列表、更新枚举
- **模式操作**：支持创建、删除、获取详情和列表、更新表结构
- **React 渲染**：提供了直观的 React 组件用于数据操作和展示

## 安装

```bash
# 使用 npm
npm install @shuttle-data/ai-react

# 使用 yarn
yarn add @shuttle-data/ai-react

# 使用 pnpm
pnpm add @shuttle-data/ai-react
```

## 基本使用

### 导入所有工具

```typescript
import { allTool } from '@shuttle-data/ai-react'

// 获取所有工具
const tools = allTool()

// 或者自定义工具配置
const customTools = allTool({
  // 自定义工具配置
  findRecordsTool: {
    run: {
      defaultProps: {
        // 默认属性
      },
    },
  },
})
```

## 模块详情

### CRUD 模块

包含以下工具：

- `batchCreateRecordsTool`：批量创建记录
- `conditionUpdateRecordsTool`：条件更新记录
- `countTool`：计数记录
- `createRecordTool`：创建记录
- `deleteRecordTool`：删除记录
- `findRecordsTool`：查询记录
- `queryGroupByTool`：分组查询记录
- `updateRecordsTool`：更新记录

### 模式模块

包含以下工具：

- `createTableTool`：创建表
- `dropTableTool`：删除表
- `getTableDetailTool`：获取表详情
- `getTableListTool`：获取表列表
- `updateTableTool`：更新表

### 枚举模块

包含以下工具：

- `createEnumTool`：创建枚举
- `dropEnumTool`：删除枚举
- `getEnumDetailTool`：获取枚举详情
- `getEnumListTool`：获取枚举列表
- `updateEnumTool`：更新枚举

## 依赖

- @shuttle-data/client
- @shuttle-data/type
- @shuttle-data/render-react
- @shuttle-ai/type
- @shuttle-ai/client
- @shuttle-ai/render-react

## 许可证

MIT
