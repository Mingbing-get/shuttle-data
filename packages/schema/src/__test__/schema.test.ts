import knex from 'knex'
import dotenv from 'dotenv'
import { DataModel } from '@shuttle-data/type'

import { DataModelSchema } from '../schema'

dotenv.config()

describe('schema', () => {
  const db = knex({
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
  })

  const dataModelSchema = new DataModelSchema({
    knex: db,
    modelTableConfig: {
      tableName: 'model_schema',
      fieldConfig: {
        tableName: 'model_schema_field',
      },
    },
    dataHistoryConfig: {
      tableName: 'data_history',
    },
  })

  const testModel: DataModel.Define = {
    dataSourceName: 'main',
    name: 'test',
    apiName: 'test',
    displayField: '_id',
    label: '测试模型',
    fields: [
      {
        name: 'new_field',
        apiName: 'new_field',
        label: '新增字段',
        required: false,
        type: 'number',
      },
      {
        name: 'string_field',
        apiName: 'string_field',
        label: '字符串字段',
        required: true,
        type: 'string',
      },
      {
        name: 'boolean_field',
        apiName: 'boolean_field',
        label: '布尔字段',
        required: false,
        type: 'boolean',
      },
    ],
  }

  it('create table', async () => {
    await dataModelSchema.createTable(testModel)

    const table = await dataModelSchema.getTable(testModel.name)
    expect(table?.name).toBe(testModel.name)
    expect(table?.apiName).toBe(testModel.apiName)
    expect(table?.displayField).toBe(testModel.displayField)
    expect(table?.label).toBe(testModel.label)
    expect(table?.fields?.map((field) => field.name).sort()).toEqual(
      [
        ...testModel.fields.map((field) => field.name),
        ...dataModelSchema.getSystemFields().map((field) => field.name),
      ].sort(),
    )
  })

  it('update table', async () => {
    const newTable: DataModel.Define = {
      ...testModel,
      label: '修改后_模型名称',
      fields: [
        {
          ...testModel.fields[0],
          required: true,
          label: '修改后',
          apiName: 'after_update',
        },
        ...testModel.fields.slice(2),
        {
          name: 'add_field',
          apiName: 'add_field',
          label: '新增字段',
          required: false,
          type: 'double',
        },
      ],
    }

    await dataModelSchema.updateTable(newTable)
    const table = await dataModelSchema.getTable(newTable.name)
    expect(table?.name).toBe(newTable.name)
    expect(table?.apiName).toBe(newTable.apiName)
    expect(table?.displayField).toBe(newTable.displayField)
    expect(table?.label).toBe(newTable.label)
    expect(table?.fields?.map((field) => field.name).sort()).toEqual(
      [
        ...newTable.fields.map((field) => field.name),
        ...dataModelSchema.getSystemFields().map((field) => field.name),
      ].sort(),
    )
  })

  it('drop table', async () => {
    await dataModelSchema.dropTable(testModel.name)

    const hasTable = await dataModelSchema.hasTable(testModel.name)
    expect(hasTable).toBe(false)
  })

  // it('create field', async () => {})

  // it('update field', async () => {})

  // it('drop field', async () => {})
})
