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
      typeCast: function (field: any, next: any) {
        if (field.type === 'TINY' && field.length === 1) {
          return field.string() === '1'
        }
        return next()
      },
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

  // 在每个测试前清理表
  beforeEach(async () => {
    // 检查并删除测试表（包括可能存在但未在模型中记录的表）
    const hasTableInDb = await dataModelSchema.hasTable(testModel.name)
    if (hasTableInDb) {
      await dataModelSchema.dropTable(testModel.name)
    }

    if (await db.schema.hasTable('model_schema')) {
      await db('model_schema').where('name', testModel.name).delete()
    }
    if (await db.schema.hasTable('model_schema_field')) {
      await db('model_schema_field').where('model', testModel.name).delete()
    }
  })

  // 在所有测试后确保清理
  afterAll(async () => {
    await db.destroy()
  })

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

    // 去数据库中实际检查表是否存在
    const hasTableInDb = await db.schema.hasTable(testModel.name)
    expect(hasTableInDb).toBe(true)
    // 检查表的字段是否正确
    const fields = table?.fields || []
    for (const field of fields) {
      const hasColumn = await db.schema.hasColumn(testModel.name, field.name)
      expect(hasColumn).toBe(true)
    }

    // 验证是否将数据保存到了数据库中
    const modelInDb = await db('model_schema')
      .where('name', testModel.name)
      .first()
    expect(modelInDb).toBeDefined()
    expect(modelInDb?.apiName).toBe(testModel.apiName)
    expect(modelInDb?.displayField).toBe(testModel.displayField)
    expect(modelInDb?.label).toBe(testModel.label)
    // 验证是否将字段数据保存到了数据库中
    const fieldsInDb = await db('model_schema_field')
      .where('model', testModel.name)
      .select()
    expect(fieldsInDb.length).toBe(table?.fields.length)
    for (const field of fieldsInDb) {
      expect(field.apiName).toBe(
        table?.fields.find((f) => f.name === field.name)?.apiName,
      )
      expect(field.label).toBe(
        table?.fields.find((f) => f.name === field.name)?.label,
      )
      expect(!!field.required).toBe(
        !!table?.fields.find((f) => f.name === field.name)?.required,
      )
      expect(field.type).toBe(
        table?.fields.find((f) => f.name === field.name)?.type,
      )
      expect(!!field.isSystem).toBe(
        !!table?.fields.find((f) => f.name === field.name)?.isSystem,
      )
    }
  })

  it('update table', async () => {
    await dataModelSchema.createTable(testModel)

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

    // 去数据库中验证表的修改
    const modelInDb = await db('model_schema')
      .where('name', newTable.name)
      .first()
    expect(modelInDb).toBeDefined()
    expect(modelInDb?.label).toBe(newTable.label)

    // 验证字段是否正确更新到数据库
    const fieldsInDb = await db('model_schema_field')
      .where('model', newTable.name)
      .andWhere('isDelete', false)
      .select()
    expect(fieldsInDb.length).toBe(table?.fields.length)

    for (const field of fieldsInDb) {
      const tableField = table?.fields.find((f) => f.name === field.name)
      expect(tableField).toBeDefined()
      expect(field.apiName).toBe(tableField?.apiName)
      expect(field.label).toBe(tableField?.label)
      expect(!!field.required).toBe(!!tableField?.required)
      expect(field.type).toBe(tableField?.type)
      expect(!!field.isSystem).toBe(!!tableField?.isSystem)
    }

    // 验证数据库表结构是否匹配
    const hasTableInDb = await db.schema.hasTable(newTable.name)
    expect(hasTableInDb).toBe(true)

    const fields = table?.fields || []
    for (const field of fields) {
      const hasColumn = await db.schema.hasColumn(newTable.name, field.name)
      expect(hasColumn).toBe(true)
    }
  })

  it('drop table', async () => {
    await dataModelSchema.createTable(testModel)
    await dataModelSchema.dropTable(testModel.name)

    const hasTable = await dataModelSchema.hasTable(testModel.name)
    expect(hasTable).toBe(false)

    // 去数据库中验证表是否实际被删除
    const hasTableInDb = await db.schema.hasTable(testModel.name)
    expect(hasTableInDb).toBe(false)

    // 验证数据库中是否不再有该模型的记录
    const modelInDb = await db('model_schema')
      .where('name', testModel.name)
      .first()
    expect(!!modelInDb?.isDelete).toBe(true)

    const fieldsInDb = await db('model_schema_field')
      .where('model', testModel.name)
      .select()
    const hasNotDeleteField = fieldsInDb.some((field) => !field.isDelete)
    expect(hasNotDeleteField).toBe(false)
  })

  it('create field', async () => {
    // 先创建表
    await dataModelSchema.createTable(testModel)

    const newField: DataModel.Field = {
      name: 'newly_added_field',
      apiName: 'newly_added_field',
      label: '新添加的字段',
      required: false,
      type: 'text',
    }

    await dataModelSchema.addField(testModel.name, newField)

    const updatedTable = await dataModelSchema.getTable(testModel.name)
    const addedField = updatedTable?.fields.find(
      (field) => field.name === newField.name,
    )

    expect(addedField).toBeDefined()
    expect(addedField?.name).toBe(newField.name)
    expect(addedField?.apiName).toBe(newField.apiName)
    expect(addedField?.label).toBe(newField.label)
    expect(addedField?.required).toBe(newField.required)
    expect(addedField?.type).toBe(newField.type)

    // 去数据库中验证字段是否实际添加
    const hasColumn = await db.schema.hasColumn(testModel.name, newField.name)
    expect(hasColumn).toBe(true)

    const fieldInDb = await db('model_schema_field')
      .where('model', testModel.name)
      .where('name', newField.name)
      .first()
    expect(fieldInDb).toBeDefined()
    expect(fieldInDb?.apiName).toBe(newField.apiName)
    expect(fieldInDb?.label).toBe(newField.label)
    expect(!!fieldInDb?.required).toBe(!!newField.required)
    expect(fieldInDb?.type).toBe(newField.type)
    expect(fieldInDb?.isSystem).toBe(false)
  })

  it('update field', async () => {
    await dataModelSchema.createTable(testModel)

    const fieldToUpdate: DataModel.Field = {
      name: 'string_field',
      apiName: 'updated_string_field',
      label: '更新后的字符串字段',
      required: false,
      type: 'string',
    }

    await dataModelSchema.updateField(testModel.name, fieldToUpdate)

    const updatedTable = await dataModelSchema.getTable(testModel.name)
    const updatedField = updatedTable?.fields.find(
      (field) => field.name === fieldToUpdate.name,
    )

    expect(updatedField).toBeDefined()
    expect(updatedField?.apiName).toBe(fieldToUpdate.apiName)
    expect(updatedField?.label).toBe(fieldToUpdate.label)
    expect(updatedField?.required).toBe(fieldToUpdate.required)
    expect(updatedField?.type).toBe(fieldToUpdate.type)

    // 去数据库中验证字段修改
    const fieldInDb = await db('model_schema_field')
      .where('model', testModel.name)
      .where('name', fieldToUpdate.name)
      .first()
    expect(fieldInDb).toBeDefined()
    expect(fieldInDb?.apiName).toBe(fieldToUpdate.apiName)
    expect(fieldInDb?.label).toBe(fieldToUpdate.label)
    expect(!!fieldInDb?.required).toBe(!!fieldToUpdate.required)
    expect(fieldInDb?.type).toBe(fieldToUpdate.type)
  })

  it('drop field', async () => {
    await dataModelSchema.createTable(testModel)

    const newField: DataModel.Field = {
      name: 'field_to_drop',
      apiName: 'field_to_drop',
      label: '要删除的字段',
      required: false,
      type: 'text',
    }

    await dataModelSchema.addField(testModel.name, newField)
    await dataModelSchema.dropField(testModel.name, newField.name)

    const updatedTable = await dataModelSchema.getTable(testModel.name)
    const droppedField = updatedTable?.fields.find(
      (field) => field.name === newField.name,
    )

    expect(droppedField).toBeUndefined()

    // 去数据库中验证字段是否实际删除
    const hasColumn = await db.schema.hasColumn(testModel.name, newField.name)
    expect(hasColumn).toBe(false)

    const fieldInDb = await db('model_schema_field')
      .where('model', testModel.name)
      .where('name', newField.name)
      .first()
    expect(fieldInDb?.isDelete).toBe(true)
  })

  it('hasTable method should check if table exists', async () => {
    await dataModelSchema.createTable(testModel)

    const hasTestTable = await dataModelSchema.hasTable(testModel.name)
    expect(hasTestTable).toBe(true)

    const hasNonExistentTable =
      await dataModelSchema.hasTable('non_existent_table')
    expect(hasNonExistentTable).toBe(false)

    const hasTableByApiName = await dataModelSchema.hasTable(
      testModel.apiName,
      true,
    )
    expect(hasTableByApiName).toBe(true)
  })

  it('getTable method should retrieve table information', async () => {
    await dataModelSchema.createTable(testModel)

    const tableByName = await dataModelSchema.getTable(testModel.name)
    expect(tableByName).toBeDefined()
    expect(tableByName?.name).toBe(testModel.name)

    const tableByApiName = await dataModelSchema.getTable(
      testModel.apiName,
      true,
    )
    expect(tableByApiName).toBeDefined()
    expect(tableByApiName?.apiName).toBe(testModel.apiName)

    const nonExistentTable =
      await dataModelSchema.getTable('non_existent_table')
    expect(nonExistentTable).toBeUndefined()
  })

  it('should throw error when creating existing table', async () => {
    await dataModelSchema.createTable(testModel)
    await expect(dataModelSchema.createTable(testModel)).rejects.toThrow()
  })

  it('should throw error when creating field with existing name', async () => {
    await dataModelSchema.createTable(testModel)

    const existingField: DataModel.Field = {
      name: 'string_field',
      apiName: 'duplicate_field',
      label: '重复字段',
      required: false,
      type: 'string',
    }

    await expect(
      dataModelSchema.addField(testModel.name, existingField),
    ).rejects.toThrow()
  })

  it('should throw error when updating non-existent field', async () => {
    await dataModelSchema.createTable(testModel)

    const nonExistentField: DataModel.Field = {
      name: 'non_existent_field',
      apiName: 'non_existent_field',
      label: '不存在的字段',
      required: false,
      type: 'string',
    }

    await expect(
      dataModelSchema.updateField(testModel.name, nonExistentField),
    ).rejects.toThrow()
  })

  it('should throw error when dropping non-existent field', async () => {
    await dataModelSchema.createTable(testModel)

    await expect(
      dataModelSchema.dropField(testModel.name, 'non_existent_field'),
    ).rejects.toThrow()
  })

  it('should preserve system fields when modifying table', async () => {
    await dataModelSchema.createTable(testModel)

    const updatedModel: DataModel.Define = {
      ...testModel,
      label: '更新后的模型',
      fields: [
        ...testModel.fields.slice(0, 1),
        {
          name: 'additional_field',
          apiName: 'additional_field',
          label: '额外字段',
          required: false,
          type: 'number',
        },
      ],
    }

    await dataModelSchema.updateTable(updatedModel)

    const table = await dataModelSchema.getTable(testModel.name)
    const systemFields = dataModelSchema.getSystemFields()

    systemFields.forEach((systemField) => {
      const fieldExists = table?.fields.find(
        (field) => field.name === systemField.name,
      )
      expect(fieldExists).toBeDefined()
      expect(fieldExists?.isSystem).toBe(true)
    })
  })

  it('should handle different field types', async () => {
    const complexModel: DataModel.Define = {
      dataSourceName: 'main',
      name: 'complex_model',
      apiName: 'complex_model',
      displayField: '_id',
      label: '复杂数据模型',
      fields: [
        {
          name: 'text_field',
          apiName: 'text_field',
          label: '文本字段',
          required: false,
          type: 'text',
        },
        {
          name: 'date_field',
          apiName: 'date_field',
          label: '日期字段',
          required: false,
          type: 'date',
        },
        {
          name: 'datetime_field',
          apiName: 'datetime_field',
          label: '日期时间字段',
          required: false,
          type: 'datetime',
        },
        {
          name: 'double_field',
          apiName: 'double_field',
          label: '双精度字段',
          required: false,
          type: 'double',
        },
        {
          name: 'json_field',
          apiName: 'json_field',
          label: 'JSON字段',
          required: false,
          type: 'json',
        },
      ],
    }

    // 确保 complex_model 表不存在
    if (await dataModelSchema.hasTable(complexModel.name)) {
      await dataModelSchema.dropTable(complexModel.name)
    }

    await dataModelSchema.createTable(complexModel)
    const createdTable = await dataModelSchema.getTable(complexModel.name)

    expect(createdTable).toBeDefined()
    expect(createdTable?.name).toBe(complexModel.name)

    complexModel.fields.forEach((field) => {
      const createdField = createdTable?.fields.find(
        (f) => f.name === field.name,
      )
      expect(createdField).toBeDefined()
      expect(createdField?.type).toBe(field.type)
    })

    await dataModelSchema.dropTable(complexModel.name)
    expect(await dataModelSchema.hasTable(complexModel.name)).toBe(false)

    // 清空数据库中的 complex_model 表记录
    await db('model_schema').where('name', complexModel.name).delete()
    await db('model_schema_field').where('model', complexModel.name).delete()
  })

  it('should support updating table properties', async () => {
    await dataModelSchema.createTable(testModel)

    const updatedModel: DataModel.Define = {
      ...testModel,
      apiName: 'updated_test_model',
      label: '更新后的测试模型',
      displayField: 'string_field',
    }

    await dataModelSchema.updateTable(updatedModel)

    const table = await dataModelSchema.getTable(testModel.name)
    expect(table?.apiName).toBe(updatedModel.apiName)
    expect(table?.label).toBe(updatedModel.label)
    expect(table?.displayField).toBe(updatedModel.displayField)
  })

  it('hasField and getField methods should work correctly', async () => {
    await dataModelSchema.createTable(testModel)

    // 测试 hasField
    const hasStringField = await dataModelSchema.hasField(
      testModel.name,
      'string_field',
    )
    expect(hasStringField).toBe(true)

    const hasNonExistentField = await dataModelSchema.hasField(
      testModel.name,
      'non_existent_field',
    )
    expect(hasNonExistentField).toBe(false)

    const hasFieldByApiName = await dataModelSchema.hasField(
      testModel.name,
      'string_field',
      true,
    )
    expect(hasFieldByApiName).toBe(true)

    // 测试 getField
    const stringField = await dataModelSchema.getField(
      testModel.name,
      'string_field',
    )
    expect(stringField).toBeDefined()
    expect(stringField?.name).toBe('string_field')

    const nonExistentField = await dataModelSchema.getField(
      testModel.name,
      'non_existent_field',
    )
    expect(nonExistentField).toBeUndefined()

    const fieldByApiName = await dataModelSchema.getField(
      testModel.name,
      'string_field',
      true,
    )
    expect(fieldByApiName).toBeDefined()
    expect(fieldByApiName?.apiName).toBe('string_field')
  })

  it('should not allow dropping display field', async () => {
    await dataModelSchema.createTable(testModel)

    await expect(
      dataModelSchema.dropField(testModel.name, testModel.displayField),
    ).rejects.toThrow()
  })

  it('should not allow updating or dropping system fields', async () => {
    await dataModelSchema.createTable(testModel)

    // 尝试更新系统字段
    await expect(
      dataModelSchema.updateField(testModel.name, {
        name: '_id',
        apiName: 'updated_id',
        label: 'Updated ID',
        required: true,
        type: 'string',
        isSystem: true,
      }),
    ).rejects.toThrow()

    // 尝试删除系统字段
    await expect(
      dataModelSchema.dropField(testModel.name, '_id'),
    ).rejects.toThrow()

    await expect(
      dataModelSchema.dropField(testModel.name, '_createdAt'),
    ).rejects.toThrow()
  })

  it('should check for field API name conflict when updating', async () => {
    await dataModelSchema.createTable(testModel)

    const conflictingField: DataModel.Field = {
      name: 'boolean_field',
      apiName: 'string_field', // 与现有字段的 API 名称冲突
      label: '冲突字段',
      required: false,
      type: 'boolean',
    }

    await expect(
      dataModelSchema.updateField(testModel.name, conflictingField),
    ).rejects.toThrow()
  })

  it('should handle unsupported field type', async () => {
    const invalidModel: DataModel.Define = {
      dataSourceName: 'main',
      name: 'invalid_model',
      apiName: 'invalid_model',
      displayField: '_id',
      label: '无效字段类型模型',
      fields: [
        {
          name: 'invalid_field',
          apiName: 'invalid_field',
          label: '无效字段',
          required: false,
          type: 'invalid_type' as any,
        },
      ],
    }

    await expect(dataModelSchema.createTable(invalidModel)).rejects.toThrow()

    // 确保表不存在
    if (await dataModelSchema.hasTable(invalidModel.name)) {
      await dataModelSchema.dropTable(invalidModel.name)
    }
  })

  it('should support operations with API name', async () => {
    await dataModelSchema.createTable(testModel)

    // 使用 API 名称获取表
    const tableByApiName = await dataModelSchema.getTable(
      testModel.apiName,
      true,
    )
    expect(tableByApiName).toBeDefined()
    expect(tableByApiName?.name).toBe(testModel.name)

    // 使用 API 名称添加字段
    const newField: DataModel.Field = {
      name: 'api_field',
      apiName: 'api_field',
      label: 'API 字段',
      required: false,
      type: 'text',
    }

    await dataModelSchema.addField(testModel.apiName, newField, true)

    const updatedTable = await dataModelSchema.getTable(testModel.name)
    expect(
      updatedTable?.fields.find((f) => f.name === newField.name),
    ).toBeDefined()

    // 使用 API 名称删除字段
    await dataModelSchema.dropField(testModel.apiName, newField.apiName, true)
    const tableAfterDrop = await dataModelSchema.getTable(testModel.name)
    expect(
      tableAfterDrop?.fields.find((f) => f.name === newField.name),
    ).toBeUndefined()
  })

  it('should validate model before creating', async () => {
    // 缺少 displayField 的模型
    const invalidModel: DataModel.Define = {
      dataSourceName: 'main',
      name: 'invalid_model_2',
      apiName: 'invalid_model_2',
      displayField: 'non_existent_field', // 不存在的字段作为显示字段
      label: '无效模型',
      fields: [
        {
          name: 'valid_field',
          apiName: 'valid_field',
          label: '有效字段',
          required: false,
          type: 'string',
        },
      ],
    }

    await expect(dataModelSchema.createTable(invalidModel)).rejects.toThrow()

    // 确保表不存在
    if (await dataModelSchema.hasTable(invalidModel.name)) {
      await dataModelSchema.dropTable(invalidModel.name)
    }
  })
})
