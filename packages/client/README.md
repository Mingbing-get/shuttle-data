# `@shuttle-data/client`

客户端操作数据的库，提供完整的CRUD操作、事务支持、Schema管理和Enum管理功能。(运行于浏览器环境)

## 特性

- 🚀 完整的CRUD操作支持
- 📋 事务处理能力
- 📊 Schema管理
- 🔢 Enum管理
- 🌐 HTTP传输支持
- 📦 类型安全（TypeScript）

## 安装

```bash
# 使用 npm
npm install @shuttle-data/client

# 使用 yarn
yarn add @shuttle-data/client

# 使用 pnpm
pnpm add @shuttle-data/client
```

## 快速开始

### 基本使用

```typescript
import { DataModel, CRUDHttpTransporter } from '@shuttle-data/client'

// 创建HTTP传输器
const transporter = new CRUDHttpTransporter({
  baseURL: 'http://localhost:3000/api',
})

// 创建DataModel实例
const dataModel = new DataModel(
  { transporter },
  {
    /* schema选项 */
  },
  {
    /* enum选项 */
  },
)

// 获取CRUD实例
const userCRUD = dataModel.crud({ modelName: 'User' })

// 执行CRUD操作
async function example() {
  // 创建数据
  const userId = await userCRUD.create({ data: { name: 'John', age: 30 } })

  // 查询单个数据
  const user = await userCRUD.findOne({ filter: { _id: userId } })

  // 查询多个数据
  const users = await userCRUD.find({ filter: { age: { $gt: 25 } } })

  // 更新数据
  await userCRUD.update({
    filter: { _id: userId },
    data: { name: 'John Doe' },
  })

  // 删除数据
  await userCRUD.del({ filter: { _id: userId } })

  // 统计数据
  const count = await userCRUD.count({ filter: { age: { $gt: 25 } } })
}
```

### 事务使用

```typescript
// 使用回调方式
try {
  await dataModel.transaction('default', async (trx) => {
    // 在事务中执行操作
    const userId = await trx.create({
      modelName: 'User',
      data: { name: 'John', age: 30 },
    })

    await trx.create({
      modelName: 'Order',
      data: { userId, amount: 100 },
    })
  })
  // 事务成功提交
} catch (error) {
  // 事务自动回滚
  console.error('Transaction failed:', error)
}

// 使用手动方式
const trx = await dataModel.transaction('default')
try {
  await trx.create({ modelName: 'User', data: { name: 'John' } })
  await trx.commit()
} catch (error) {
  await trx.rollback()
  throw error
}
```

## 核心功能

### DataModel

`DataModel`是库的核心类，负责管理Schema、Enum和提供CRUD操作。

#### 构造函数

```typescript
new DataModel(
  options: { transporter: Transporter },
  schemaOptions: SchemaOptions,
  enumOptions: EnumOptions
)
```

#### 方法

- `transaction(dataSourceName: string, cb?: (trx: Transaction) => Promise<void>): Promise<void | Transaction>` - 创建事务
- `crud<M>(options: ModelConfig): CRUD<M>` - 获取CRUD实例

### CRUD操作

`CRUD`类提供了完整的数据操作方法：

- `findOne(option?: FindOneOption<M>): Promise<M | undefined>` - 查询单个数据
- `find(option?: FindOption<M>): Promise<M[]>` - 查询多个数据
- `count(option?: CountOption<M>): Promise<number>` - 统计数据
- `create(option: CreateOption<M>): Promise<string>` - 创建数据
- `batchCreate(option: BatchCreateOption<M>): Promise<string[]>` - 批量创建数据
- `update(option: UpdateOption<M> | UpdateWithIdOption<M>): Promise<string[]>` - 更新数据
- `del(option?: DelOption<M>): Promise<string[]>` - 删除数据
- `queryGroupBy<T extends SelectField<M>>(option: QueryGroupByOption<M, T>): Promise<StrOrObjKeyToNumber<T, M>[]>` - 分组查询

### 事务

`Transaction`类提供了事务操作：

- `start(dataSourceName: string): Promise<void>` - 开始事务
- `commit(): Promise<void>` - 提交事务
- `rollback(): Promise<void>` - 回滚事务
- 支持所有CRUD操作方法

### 传输器

目前支持HTTP传输器：

```typescript
new CRUDHttpTransporter({
  baseURL: string,
  headers?: Record<string, string>,
  // 其他axios配置
});
```

## API参考

### CRUD操作选项

#### FindOneOption

- `condition`: 过滤条件
- `select`: 选择字段
- `sort`: 排序

#### FindOption

- `condition`: 过滤条件
- `select`: 选择字段
- `sort`: 排序
- `offset`: 跳过数量
- `limit`: 限制数量

#### CreateOption

- `data`: 创建数据

#### BatchCreateOption

- `data`: 批量创建数据数组

#### UpdateOption

- `condition`: 过滤条件
- `data`: 更新数据

#### UpdateWithIdOption

- `id`: 数据ID
- `data`: 更新数据

#### DelOption

- `condition`: 过滤条件

#### QueryGroupByOption

- `aggField`: 选择字段
- `groupByFields`: 分组字段
- `condition`: 过滤条件

## 示例

### 高级查询

```typescript
// 复杂查询
const users = await userCRUD.find({
  condition: {
    op: 'and',
    subConditions: [
      { key: 'age', op: 'gt', value: 25 },
      { key: 'age', op: 'lt', value: 40 },
      { key: 'name', op: 'like', value: 'John' },
      { key: 'status', op: 'in', value: ['active', 'pending'] },
    ],
  },
  offset: 0,
  limit: 10,
  select: ['_id', 'name', 'age'],
})

// 分组查询
const ageGroups = await userCRUD.queryGroupBy({
  aggField: 'age',
  groupByFields: ['status'],
})
```

### 批量操作

```typescript
// 批量创建
const userIds = await userCRUD.batchCreate({
  data: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Bob', age: 35 },
  ],
})

// 批量更新
await userCRUD.update({
  condition: { key: 'age', op: 'lt', value: 30 },
  data: { status: 'young' },
})
```

## 类型定义

库提供了完整的TypeScript类型定义，确保类型安全：

```typescript
// 定义模型类型
interface User {
  _id: string
  name: string
  age: number
  email: string
  createdAt: Date
  updatedAt: Date
}

// 使用类型
const userCRUD = dataModel.crud<User>({ modelName: 'User' })

// 类型安全的操作
const user = await userCRUD.findOne({
  condition: { key: '_id', op: 'eq', value: '123' },
})
// user 的类型是 User | undefined
```

## 错误处理

```typescript
try {
  const user = await userCRUD.findOne({
    condition: { key: '_id', op: 'eq', value: 'non-existent' },
  })
  if (!user) {
    console.log('User not found')
  }
} catch (error) {
  console.error('Error:', error)
}
```

## 许可证

MIT
