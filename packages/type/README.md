# `@shuttle-data/type`

## 简介

`@shuttle-data/type` 是 shuttle-data 生态系统的核心类型定义和基础插件包，提供了数据模型、条件、枚举等相关的类型定义和插件系统 (nodejs和浏览器环境均可使用)。

## 安装

```bash
npm install @shuttle-data/type
# 或
yarn add @shuttle-data/type
# 或
pnpm add @shuttle-data/type
```

## 核心功能

### 1. 数据模型 (DataModel)

提供了多种字段类型的插件，支持不同类型数据的定义和验证：

- 基础字段类型
- 布尔字段
- 日期字段
- 日期时间字段
- 双精度数字字段
- 枚举字段
- JSON字段
- 查找字段
- 数字字段
- 字符串字段
- 文本字段

### 2. 条件 (Condition)

提供了丰富的条件判断插件，用于构建查询条件：

- 等于条件
- 大于条件
- 大于等于条件
- 小于条件
- 小于等于条件
- 不等于条件
- 包含条件
- 不包含条件
- 类似条件
- 不类似条件
- 在列表中
- 不在列表中
- 有任意一个
- 没有任意一个
- 为空
- 不为空
- 为真
- 不为真

### 3. 枚举 (Enum)

提供枚举类型的定义和管理功能。

### 4. CRUD 操作

提供与 CRUD (创建、读取、更新、删除) 操作相关的类型定义。

### 5. 工具函数

提供各种辅助工具函数。

## 依赖

- [zod](https://github.com/colinhacks/zod) - 用于数据验证

## 使用示例

### 数据模型定义

```typescript
import { DataModel } from '@shuttle-data/type'

// 定义字段
const userFields: DataModel.Field[] = [
  {
    type: 'string',
    name: '用户名',
    apiName: 'name',
    required: true,
  },
  {
    type: 'string',
    name: '邮箱',
    apiName: 'email',
    required: true,
    extra: {
      maxLength: 255,
      unique: true,
    },
  },
  {
    type: 'boolean',
    name: '是否激活',
    apiName: 'active',
    extra: {
      trueText: '是',
      falseText: '否',
    },
  },
  {
    type: 'number',
    name: '年龄',
    apiName: 'age',
    extra: {
      min: 0,
      max: 150,
    },
  },
]

// 定义数据模型
const userModel: DataModel.Define = {
  dataSourceName: 'default',
  name: '用户',
  apiName: 'user',
  label: '用户',
  displayField: 'name',
  fields: userFields,
}
```

### 条件构建

```typescript
import { DataCondition } from '@shuttle-data/type'

// 简单条件：等于
const eqCondition: DataCondition.EqCondition<{ status: string }> = {
  op: 'eq',
  key: 'status',
  value: 'active',
}

// 简单条件：大于
const gtCondition: DataCondition.GtCondition<{ age: number }> = {
  op: 'gt',
  key: 'age',
  value: 18,
}

// 组合条件：and
const andCondition: DataCondition.AndCondition<{
  status: string
  age: number
}> = {
  op: 'and',
  subCondition: [eqCondition, gtCondition],
}

// 组合条件：or
const orCondition: DataCondition.OrCondition<{ status: string; age: number }> =
  {
    op: 'or',
    subCondition: [
      { op: 'eq', key: 'status', value: 'active' },
      { op: 'eq', key: 'status', value: 'pending' },
    ],
  }

// 包含条件
const containsCondition: DataCondition.ContainsCondition<{ name: string }> = {
  op: 'contains',
  key: 'name',
  value: 'John',
}

// 在列表中
const inCondition: DataCondition.InCondition<{ status: string }> = {
  op: 'in',
  key: 'status',
  value: ['active', 'pending', 'draft'],
}

// 为空
const isNullCondition: DataCondition.IsNullCondition<{ email: string }> = {
  op: 'isNull',
  key: 'email',
}
```

### CRUD 操作

```typescript
import { DataCRUD, DataCondition } from '@shuttle-data/type'

// 查询选项
const findOption: DataCRUD.FindOption<{ name: string; age: number }> = {
  fields: ['name', 'age'],
  condition: {
    op: 'and',
    subCondition: [
      { op: 'eq', key: 'name', value: '张三' },
      { op: 'gte', key: 'age', value: 18 },
    ],
  },
  orders: [{ key: 'createdAt', desc: true }],
  limit: 10,
  offset: 0,
}

// 创建选项
const createOption: DataCRUD.CreateOption<{ name: string; email: string }> = {
  data: {
    name: '张三',
    email: 'zhangsan@example.com',
  },
}

// 更新选项
const updateOption: DataCRUD.UpdateOption<{ name: string; age: number }> = {
  condition: { op: 'eq', key: 'name', value: '张三' },
  data: { age: 20 },
}

// 删除选项
const delOption: DataCRUD.DelOption<{ status: string }> = {
  condition: { op: 'eq', key: 'status', value: 'deleted' },
}
```

## 项目结构

```
src/
├── condition/         # 条件相关插件和类型
│   ├── plugin/        # 各种条件插件
│   ├── index.ts       # 导出条件相关功能
│   └── type.ts        # 条件类型定义
├── dataModel/         # 数据模型相关插件和类型
│   ├── fieldPlugin/   # 各种字段插件
│   ├── index.ts       # 导出数据模型相关功能
│   ├── manager.ts     # 数据模型管理器
│   └── type.ts        # 数据模型类型定义
├── enum/              # 枚举相关类型和管理器
│   ├── index.ts       # 导出枚举相关功能
│   ├── manager.ts     # 枚举管理器
│   └── type.ts        # 枚举类型定义
├── crud.ts            # CRUD 相关类型
├── index.ts           # 主导出文件
└── utils.ts           # 工具函数
```

## 许可证

MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个包。

## 作者

Mingbing-get <1508850533@qq.com>
