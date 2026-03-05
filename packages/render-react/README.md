# `@shuttle-data/render-react`

Web端数据模型React渲染库，提供丰富的UI组件和数据处理功能，用于快速构建数据驱动的React应用。(运行于浏览器环境)

## 安装

```bash
# 使用npm
npm install @shuttle-data/render-react

# 使用yarn
yarn add @shuttle-data/render-react

# 使用pnpm
pnpm add @shuttle-data/render-react
```

## 核心功能

### 1. 数据表格

- 支持排序、筛选、分页
- 可定制列配置
- 支持拖拽排序
- 集成条件查询

### 2. 表单组件

- 支持多种字段类型
- 自动表单验证
- 动态表单配置

### 3. 条件查询

- 支持复杂逻辑条件组合
- 拖拽调整条件顺序
- 可视化条件配置

### 4. 字段插件系统

- 内置多种字段类型插件
- 支持自定义字段插件
- 统一的字段渲染接口

### 5. 数据枚举管理

- 枚举分组管理
- 枚举项选择器
- 枚举编辑器

## 使用示例

### 基本表格

```tsx
import React from 'react'
import { DataModel } from '@shuttle-data/client'
import { DataTable } from '@shuttle-data/render-react'

const dataMoel = new DataModel()

const App = () => {
  return <DataTable dataModel={dataModel} />
}

export default App
```

### 条件查询

```tsx
import React from 'react';
import { DataModel } from '@shuttle-data/client'
import { DataCondition } from '@shuttle-data/render-react';

const dataMoel = new DataModel()

const App = () => {
  const [conditions, setConditions] = React.useState([]);

  return (
    <DataCondition
      conditions={conditions}
      dataModel={dataModel}
      fields={[...]} // 可用字段列表
    />
  );
};

export default App;
```

### 表单

```tsx
import React from 'react'
import { DataModel } from '@shuttle-data/client'
import { DataForm } from '@shuttle-data/render-react'

const dataMoel = new DataModel()

const App = () => {
  const [formData, setFormData] = React.useState({})

  return (
    <DataForm
      dataModel={dataModel}
      tableName={当前编辑的数据模型名称}
      value={editRecord || editId}
    />
  )
}

export default App
```

## 依赖

- @shuttle-data/type
- @shuttle-data/client

## 许可证

MIT License
