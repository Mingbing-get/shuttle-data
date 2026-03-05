# `@shuttle-data/schema`

数据模型表结构管理与字段类型插件系统（运行于 Node.js 环境）。

## 功能特性

- **数据模型 Schema 管理**：创建和管理数据模型表结构，自动添加系统字段（`_id`, `_createdAt`, `_updatedAt`, `_createdBy`, `_updatedBy`）
- **字段类型插件系统**：支持多种字段类型，包括 string、text、number、double、boolean、date、datetime、enum、lookup、json
- **枚举管理**：完整的数据枚举管理功能，支持枚举组和枚举项的 CRUD 操作

## 安装

```bash
npm install @shuttle-data/schema
```

## 快速开始

```typescript
import { DataModelSchema } from '@shuttle-data/schema'

const schema = new DataModelSchema({
  knex: knexInstance,
  userDbName: '_user',
  modelTableConfig: {
    tableName: '_data_model',
    fieldConfig: {
      tableName: '_data_model_field',
    },
  },
})

// 创建数据模型
await schema.createTable({
  name: 'user',
  apiName: 'user',
  label: '用户',
  displayField: 'name',
  fields: [
    {
      name: '_id',
      apiName: 'id',
      label: 'ID',
      type: 'number',
      required: true,
      isSystem: true,
    },
    {
      name: 'name',
      apiName: 'name',
      label: '名称',
      type: 'string',
      required: true,
    },
    { name: 'email', apiName: 'email', label: '邮箱', type: 'string' },
    { name: 'age', apiName: 'age', label: '年龄', type: 'number' },
  ],
})
```

## 字段类型

| 类型       | 说明         |
| ---------- | ------------ |
| `string`   | 字符串字段   |
| `text`     | 长文本字段   |
| `number`   | 数字字段     |
| `double`   | 浮点数字段   |
| `boolean`  | 布尔字段     |
| `date`     | 日期字段     |
| `datetime` | 日期时间字段 |
| `enum`     | 枚举字段     |
| `lookup`   | 关联字段     |
| `json`     | JSON 字段    |

## API

### Schema

- `createTable(model: DataModel.Define)` - 创建数据模型表
- `updateTable(model: DataModel.Define)` - 更新数据模型表结构
- `deleteTable(name: string)` - 删除数据模型表
- `getTable(name: string)` - 获取数据模型定义
- `all()` - 获取所有数据模型

### DataEnumManager

- `addGroup(group: DataEnum.Group)` - 添加枚举组
- `updateGroup(group: DataEnum.Group)` - 更新枚举组
- `deleteGroup(name: string)` - 删除枚举组
- `getGroup(name: string)` - 获取枚举组
- `all()` - 获取所有枚举组

### 字段插件管理器

```typescript
import { schemaFieldPluginManager } from '@shuttle-data/schema'

// 注册自定义字段插件
schemaFieldPluginManager.use(customPlugin)
```

## 依赖

- `@shuttle-data/type` - 类型定义和基础的插件包
