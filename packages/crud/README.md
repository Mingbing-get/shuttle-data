# `@shuttle-data/crud`

数据模型 CRUD 操作库，提供完整的增删改查功能，支持条件构建、字段插件和事务管理。(运行于nodejs环境)

## 特性

- 完整的 CRUD 操作支持
- 灵活的条件构建系统
- 多种字段类型插件
- 事务支持
- 雪花ID生成
- 权限检查集成
- 事件触发机制

## 安装

```bash
npm install @shuttle-data/crud

# 或使用 yarn
yarn add @shuttle-data/crud
```

## 基本用法

### 初始化 CRUD 实例

```typescript
import { CRUD } from '@shuttle-data/crud'

const crud = new CRUD({
  modelName: 'users',
  useApiName: false,
  schema: schemaInstance,
  generateId: () => generateId(),
  getKnex: (dataSourceName) => getKnexInstance(dataSourceName),
  context: {
    user: {
      _id: 'user123',
    },
  },
  onCheckPermission: async (options) => {
    // 权限检查逻辑
    return {
      condition: {
        /* 权限条件 */
      },
    }
  },
  onCreate: async (getRecords) => {
    const records = await getRecords()
    // 处理创建后的逻辑
  },
  onUpdate: async (getUpdatedRecords) => {
    const updatedRecords = await getUpdatedRecords()
    // 处理更新后的逻辑
  },
  onDelete: async (getRecords) => {
    const records = await getRecords()
    // 处理删除后的逻辑
  },
})
```

### 操作示例

#### 查询数据

```typescript
// 查询单个记录
const user = await crud.findOne({
  condition: {
    op: 'eq',
    key: 'email',
    value: 'user@example.com',
  },
  fields: ['_id', 'name', 'email'],
})

// 查询多个记录
const users = await crud.find({
  condition: {
    op: 'gt',
    key: 'age',
    value: 18,
  },
  orders: [{ key: 'createdAt', desc: true }],
  limit: 10,
  offset: 0,
})

// 统计记录数
const count = await crud.count({
  condition: {
    op: 'eq',
    key: 'status',
    value: 'active',
  },
})
```

#### 创建数据

```typescript
// 创建单个记录
const userId = await crud.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  },
})

// 批量创建记录
const userIds = await crud.batchCreate({
  data: [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ],
})
```

#### 更新数据

```typescript
// 根据条件更新
const updatedIds = await crud.update({
  condition: {
    op: 'eq',
    key: 'status',
    value: 'inactive',
  },
  data: {
    status: 'active',
  },
})

// 根据 ID 更新
const updatedIds = await crud.update({
  data: [
    { _id: '1', name: 'Updated Name' },
    { _id: '2', name: 'Another Updated Name' },
  ],
})
```

#### 删除数据

```typescript
const deletedIds = await crud.del({
  condition: {
    op: 'eq',
    key: 'status',
    value: 'inactive',
  },
})
```

#### 分组查询

```typescript
const result = await crud.queryGroupBy({
  aggFunction: 'count',
  aggField: 'age',
  groupByFields: ['status'],
  condition: {
    op: 'gt',
    key: 'age',
    value: 18,
  },
  orders: [{ key: 'count', desc: true }],
})
```

## API 文档

### CRUD 类

#### 构造函数

```typescript
new CRUD(options: DataCRUD.Server.Options)
```

**参数**：

- `options` - CRUD 配置选项
  - `modelName` - 模型名称
  - `useApiName` - 是否使用 API 名称
  - `schema` - Schema 实例
  - `generateId` - ID 生成函数
  - `getKnex` - 获取 Knex 实例的函数
  - `context` - 上下文信息
  - `onCheckPermission` - 权限检查函数
  - `onCreate` - 创建后回调
  - `onUpdate` - 更新后回调
  - `onDelete` - 删除后回调

#### 方法

##### `findOne(option?: DataCRUD.FineOneOption<M>): Promise<M | undefined>`

查询单个记录。

**参数**：

- `option` - 查询选项
  - `condition` - 查询条件
  - `fields` - 要返回的字段

**返回**：

- 找到的记录或 `undefined`

##### `find(option?: DataCRUD.FindOption<M>): Promise<M[]>`

查询多个记录。

**参数**：

- `option` - 查询选项
  - `condition` - 查询条件
  - `fields` - 要返回的字段
  - `orders` - 排序规则
  - `limit` - 限制数量
  - `offset` - 偏移量

**返回**：

- 记录数组

##### `count(option?: DataCRUD.CountOption<M>): Promise<number>`

统计记录数。

**参数**：

- `option` - 统计选项
  - `condition` - 查询条件

**返回**：

- 记录数量

##### `create(option: DataCRUD.CreateOption<M>): Promise<string>`

创建单个记录。

**参数**：

- `option` - 创建选项
  - `data` - 记录数据

**返回**：

- 创建的记录 ID

##### `batchCreate(option: DataCRUD.BatchCreateOption<M>): Promise<string[]>`

批量创建记录。

**参数**：

- `option` - 批量创建选项
  - `data` - 记录数据数组

**返回**：

- 创建的记录 ID 数组

##### `update(option: DataCRUD.UpdateOption<M> | DataCRUD.UpdateWithIdOption<M>): Promise<string[]>`

更新记录。

**参数**：

- `option` - 更新选项
  - 方式 1：根据条件更新
    - `condition` - 查询条件
    - `data` - 更新数据
  - 方式 2：根据 ID 更新
    - `data` - 更新数据数组，每个对象包含 `_id` 字段

**返回**：

- 更新的记录 ID 数组

##### `del(option?: DataCRUD.DelOption<M>): Promise<string[]>`

删除记录。

**参数**：

- `option` - 删除选项
  - `condition` - 查询条件

**返回**：

- 删除的记录 ID 数组

##### `queryGroupBy<T extends DataCRUD.SelectField<M>>({ aggFunction, aggField, groupByFields, condition, orders, limit, offset }: DataCRUD.QueryGroupByOption<M, T>): Promise<DataCRUD.StrOrObjKeyToNumber<T, M>[]>`

分组查询。

**参数**：

- `aggFunction` - 聚合函数：`count`、`avg`、`min`、`max`、`sum`
- `aggField` - 聚合字段
- `groupByFields` - 分组字段
- `condition` - 查询条件
- `orders` - 排序规则
- `limit` - 限制数量
- `offset` - 偏移量

**返回**：

- 分组查询结果

## 条件构建

支持多种条件操作符：

- `eq` - 等于
- `neq` - 不等于
- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于
- `in` - 在数组中
- `notIn` - 不在数组中
- `like` - 模糊匹配
- `notLike` - 不模糊匹配
- `isNull` - 为空
- `isNotNull` - 不为空
- `isTrue` - 为真
- `isNotTrue` - 不为真
- `contains` - 包含
- `notContains` - 不包含
- `hasAnyOf` - 有任何一个
- `notAnyOf` - 没有任何一个

**示例**：

```typescript
const condition = {
  op: 'and',
  subCondition: [
    {
      op: 'eq',
      key: 'status',
      value: 'active',
    },
    {
      op: 'gt',
      key: 'age',
      value: 18,
    },
  ],
}
```

## 字段插件

支持多种字段类型插件：

- `booleanFieldPlugin` - 布尔字段
- `dateFieldPlugin` - 日期字段
- `datetimeFieldPlugin` - 日期时间字段
- `doubleFieldPlugin` - 双精度浮点数字段
- `enumFieldPlugin` - 枚举字段
- `jsonFieldPlugin` - JSON 字段
- `lookupFieldPlugin` - 关联字段
- `numberFieldPlugin` - 数字字段
- `stringFieldPlugin` - 字符串字段
- `textFieldPlugin` - 文本字段

## 事务支持

```typescript
import { transaction } from '@shuttle-data/crud'

await transaction(async (trx) => {
  // 在事务中执行操作
  const userId = await crud.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  })

  // 可以执行多个操作
  await crud.update({
    condition: {
      op: 'eq',
      key: '_id',
      value: userId,
    },
    data: {
      status: 'active',
    },
  })
})
```

## 雪花 ID 生成

```typescript
import { SnowFlake } from '@shuttle-data/crud'

const snowflake = new SnowFlake(1, 1)
const id = snowflake.nextId()
```

## 依赖

- `knex` - SQL 查询构建器
- `@shuttle-data/type` - 类型定义
- `@shuttle-data/schema` - 数据模型 schema 管理

## 许可证

MIT
