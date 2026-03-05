# `@shuttle-data/ai-server`

数据模型相关的AI提示词和工具定义，为AI代理提供数据操作能力。（运行在Node.js环境）

## 📦 安装

```bash
# 使用 npm
npm install @shuttle-data/ai-server

# 使用 yarn
yarn add @shuttle-data/ai-server

# 使用 pnpm
pnpm add @shuttle-data/ai-server
```

## 🚀 功能特性

- **CRUD 操作工具**：提供完整的数据增删改查能力
- **枚举管理工具**：支持枚举组的创建、查询、更新和删除
- **Schema 管理工具**：支持数据表的创建、查询、更新和删除
- **系统提示词**：为AI代理提供专业的系统提示
- **类型定义**：提供完整的TypeScript类型支持

## 🛠️ 工具列表

### CRUD 工具

| 工具名称                     | 功能描述     |
| ---------------------------- | ------------ |
| `batchCreateRecordsTool`     | 批量创建记录 |
| `conditionUpdateRecordsTool` | 条件更新记录 |
| `countTool`                  | 统计记录数量 |
| `createRecordTool`           | 创建单条记录 |
| `deleteRecordsTool`          | 删除记录     |
| `findRecordsTool`            | 查询记录     |
| `getConditionDefineTool`     | 获取条件定义 |
| `queryGroupByTool`           | 分组查询     |
| `updateRecordsTool`          | 更新记录     |

### 枚举工具

| 工具名称             | 功能描述       |
| -------------------- | -------------- |
| `addGroupTool`       | 添加枚举组     |
| `getGroupDetailTool` | 获取枚举组详情 |
| `getGroupListTool`   | 获取枚举组列表 |
| `removeGroupTool`    | 删除枚举组     |
| `updateGroupTool`    | 更新枚举组     |

### Schema 工具

| 工具名称             | 功能描述       |
| -------------------- | -------------- |
| `createTableTool`    | 创建数据表     |
| `dropTableTool`      | 删除数据表     |
| `getTableDetailTool` | 获取数据表详情 |
| `getTableListTool`   | 获取数据表列表 |
| `updateTableTool`    | 更新数据表     |

## 📖 使用示例

### 导入工具

```typescript
import {
  // CRUD 工具
  batchCreateRecordsTool,
  conditionUpdateRecordsTool,
  countTool,
  createRecordTool,
  deleteRecordsTool,
  findRecordsTool,
  getConditionDefineTool,
  queryGroupByTool,
  updateRecordsTool,
  // 枚举工具
  addGroupTool,
  getGroupDetailTool,
  getGroupListTool,
  removeGroupTool,
  updateGroupTool,
  // Schema 工具
  createTableTool,
  dropTableTool,
  getTableDetailTool,
  getTableListTool,
  updateTableTool,
  // 系统提示词
  shuttleDataAgentSystemPrompt,
} from '@shuttle-data/ai-server'
```

### 使用系统提示词

```typescript
import { shuttleDataAgentSystemPrompt } from '@shuttle-data/ai-server'

// 将系统提示词用于AI代理
const agent = createAgent({
  systemPrompt: shuttleDataAgentSystemPrompt,
  // 其他配置...
})
```

## 📚 依赖

- `@shuttle-data/type` - 类型定义
- `@shuttle-data/schema` - 数据模型定义
- `@shuttle-data/crud` - CRUD操作
- `zod` - 数据验证
- `@shuttle-ai/type` - AI类型定义
- `@shuttle-ai/agent` - AI代理实现

## 📄 许可证

MIT
