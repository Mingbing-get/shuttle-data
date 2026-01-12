import knex from 'knex'
import dotenv from 'dotenv'
import { DataModelSchema, DataEnumManager } from '@shuttle-data/schema'
import { DataModel, DataEnum, DataCRUD } from '@shuttle-data/type'

import { SnowFlake, CRUD } from '../'

dotenv.config()

type TestEnum = '_active' | '_inactive' | '_unknown'
type TestEnumWithApiName = 'active' | 'inactive' | 'unknown'

interface TestDataModel extends DataCRUD.BaseRecord {
  _yesOrNo: boolean
  _title: string
  _content: string
  _num: number
  _double: number
  _datetime: string | Date
  _date: string
  _lookup: DataCRUD.LookupInRecord
  _multiLookup: DataCRUD.LookupInRecord[]
  _status: TestEnum
  _multiStatus: TestEnum[]
}
interface TestDataModelWithApiName extends DataCRUD.BaseRecord {
  yesOrNo: boolean
  title: string
  content: string
  num: number
  double: number
  datetime: string
  date: string
  lookup: DataCRUD.LookupInRecord
  multiLookup: DataCRUD.LookupInRecord[]
  status: TestEnumWithApiName
  multiStatus: TestEnumWithApiName[]
}

describe('crud', () => {
  const snowFlake = new SnowFlake(1, new Date('2026-01-01').getTime())
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
  const enumManager = new DataEnumManager({
    groupTableConfig: {
      knex: db,
      tableName: 'enum_group',
      itemTableConfig: {
        tableName: 'enum_item',
      },
    },
  })
  const dataModelSchema = new DataModelSchema({
    knex: db,
    enumSourceConfig: {
      groupTableConfig: {
        tableName: 'enum_group',
        itemTableConfig: {
          tableName: 'enum_item',
        },
      },
    },
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

  const enumGroup: DataEnum.Group = {
    name: '_status',
    apiName: 'status',
    label: '状态',
    items: [
      {
        name: '_active',
        apiName: 'active',
        label: '活跃',
      },
      {
        name: '_inactive',
        apiName: 'inactive',
        label: '不活跃',
      },
      {
        name: '_unknown',
        apiName: 'unknown',
        label: '未知',
      },
    ],
  }

  const userModel: DataModel.Define = {
    dataSourceName: 'main',
    name: '_user',
    apiName: 'user',
    label: '用户',
    displayField: 'name',
    isSystem: false,
    fields: [
      {
        name: 'name',
        apiName: 'name',
        label: '姓名',
        type: 'string',
        isSystem: true,
      },
      {
        name: 'email',
        apiName: 'email',
        label: '邮箱',
        type: 'string',
        isSystem: true,
      },
      {
        name: 'phone',
        apiName: 'phone',
        label: '手机号',
        type: 'string',
        isSystem: true,
      },
    ],
  }
  const admin = {
    _id: '1',
    name: 'admin',
    email: 'admin@example.com',
    phone: '13800000000',
    _createdBy: '1',
    _updatedBy: '1',
    _createdAt: new Date(),
    _updatedAt: new Date(),
  }

  const dataModel: DataModel.Define = {
    dataSourceName: 'main',
    name: '_data',
    apiName: 'data',
    label: '数据表',
    displayField: '_title',
    fields: [
      {
        name: '_yesOrNo',
        apiName: 'yesOrNo',
        label: '是或否',
        type: 'boolean',
      },
      {
        name: '_title',
        apiName: 'title',
        label: '标题',
        type: 'string',
      },
      {
        name: '_content',
        apiName: 'content',
        label: '内容',
        type: 'text',
      },
      {
        name: '_num',
        apiName: 'num',
        label: '数字',
        type: 'number',
      },
      {
        name: '_double',
        apiName: 'double',
        label: '双精度浮点数',
        type: 'double',
      },
      {
        name: '_datetime',
        apiName: 'datetime',
        label: '日期时间',
        type: 'datetime',
      },
      {
        name: '_date',
        apiName: 'date',
        label: '日期',
        type: 'date',
      },
      {
        name: '_status',
        apiName: 'status',
        label: '状态',
        type: 'enum',
        extra: {
          groupName: enumGroup.name,
        },
      },
      {
        name: '_multiStatus',
        apiName: 'multiStatus',
        label: '多状态',
        type: 'enum',
        extra: {
          groupName: enumGroup.name,
          multiple: true,
        },
      },
      {
        name: '_lookup',
        apiName: 'lookup',
        label: '关联表',
        type: 'lookup',
        extra: {
          modalName: userModel.name,
        },
      },
      {
        name: '_multiLookup',
        apiName: 'multiLookup',
        label: '多关联表',
        type: 'lookup',
        extra: {
          modalName: userModel.name,
          multiple: true,
        },
      },
    ],
  }

  beforeAll(async () => {
    const hasEnumGroup = await enumManager.hasGroup(enumGroup.name)
    if (!hasEnumGroup) {
      await enumManager.addGroup(enumGroup)
    }
    const hasUserModel = await dataModelSchema.hasTable(userModel.name)
    if (!hasUserModel) {
      await dataModelSchema.createTable(userModel)
    }
    const hasDataModel = await dataModelSchema.hasTable(dataModel.name)
    if (!hasDataModel) {
      await dataModelSchema.createTable(dataModel)
    }

    // 给用户表插入一条数据
    await db(userModel.name).insert(admin)
  })

  afterAll(async () => {
    await dataModelSchema.dropTable(dataModel.name)
    await dataModelSchema.dropTable(userModel.name)
    await enumManager.removeGroup(enumGroup.name)
    await db('enum_group').where({ name: enumGroup.name }).del()
    await db('enum_item').where({ group: enumGroup.name }).del()
    await db('model_schema')
      .whereIn('name', [userModel.name, dataModel.name])
      .del()
    await db('model_schema_field')
      .whereIn('model', [userModel.name, dataModel.name])
      .del()
  })

  describe('find', () => {
    it('should find all records in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const records = await crud.find()
      expect(records).toBeInstanceOf(Array)
      expect(records.length).toBeGreaterThan(0)
    })

    it('should find record by id in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.find({
        condition: {
          key: '_id',
          op: 'eq',
          value: admin._id,
        },
      })
      expect(record).toBeTruthy()
      expect(record[0]._id).toEqual(admin._id)
      expect(record[0].name).toEqual(admin.name)
    })

    it('should find records by where condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const records = await crud.find({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toBeGreaterThan(0)
      expect(records[0].name).toEqual('admin')
    })

    it('should find records with pagination in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 先插入几条测试数据
      const testUsers = [
        {
          name: 'test1',
          email: 'test1@example.com',
          phone: '13800000001',
        },
        {
          name: 'test2',
          email: 'test2@example.com',
          phone: '13800000002',
        },
        {
          name: 'test3',
          email: 'test3@example.com',
          phone: '13800000003',
        },
      ]

      await db(userModel.name).insert(
        testUsers.map((item) => ({
          ...item,
          _id: snowFlake.next(),
          _createdAt: new Date(),
          _updatedAt: new Date(),
          _createdBy: admin._id,
          _updatedBy: admin._id,
        })),
      )

      // 测试分页
      const page1 = await crud.find({
        offset: 0,
        limit: 2,
      })

      expect(page1).toBeInstanceOf(Array)
      expect(page1.length).toEqual(2)

      const page2 = await crud.find({
        offset: 2,
        limit: 2,
      })

      expect(page2).toBeInstanceOf(Array)
      expect(page2.length).toBeGreaterThan(0)
    })

    it('should find records with sorting in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 插入测试数据
      const testUsers = [
        {
          name: 'zebra',
          email: 'zebra@example.com',
          phone: '13800000004',
        },
        {
          name: 'apple',
          email: 'apple@example.com',
          phone: '13800000005',
        },
        {
          name: 'banana',
          email: 'banana@example.com',
          phone: '13800000006',
        },
      ]

      await db(userModel.name).insert(
        testUsers.map((item) => ({
          ...item,
          _id: snowFlake.next(),
          _createdAt: new Date(),
          _updatedAt: new Date(),
          _createdBy: admin._id,
          _updatedBy: admin._id,
        })),
      )

      // 测试升序排序
      const ascendingRecords = await crud.find({
        orders: [
          {
            key: 'name',
            desc: false,
          },
        ],
      })

      expect(ascendingRecords).toBeInstanceOf(Array)
      expect(ascendingRecords.length).toBeGreaterThan(0)

      // 验证排序是否正确
      const sortedNames = ascendingRecords.map((record) => record.name).sort()
      expect(ascendingRecords.map((record) => record.name)).toEqual(sortedNames)

      // 测试降序排序
      const descendingRecords = await crud.find({
        orders: [
          {
            key: 'name',
            desc: true,
          },
        ],
      })

      expect(descendingRecords).toBeInstanceOf(Array)
      expect(descendingRecords.length).toBeGreaterThan(0)

      // 验证排序是否正确
      const reverseSortedNames = sortedNames.reverse()
      expect(descendingRecords.map((record) => record.name)).toEqual(
        reverseSortedNames,
      )
    })

    it('should find records with multiple where conditions in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 插入测试数据
      const testUser = {
        name: 'test user',
        email: 'testuser@example.com',
        phone: '13800000007',
      }

      await db(userModel.name).insert({
        ...testUser,
        _id: snowFlake.next(),
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _createdBy: admin._id,
        _updatedBy: admin._id,
      })

      // 测试多条件查询
      const records = await crud.find({
        condition: {
          op: 'and',
          subCondition: [
            {
              key: 'name',
              op: 'eq',
              value: 'test user',
            },
            {
              key: 'email',
              op: 'eq',
              value: 'testuser@example.com',
            },
          ],
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toEqual(1)
      expect(records[0].name).toEqual(testUser.name)
      expect(records[0].email).toEqual(testUser.email)
    })

    it('should find records with like condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 测试模糊查询
      const records = await crud.find({
        condition: {
          key: 'name',
          op: 'like',
          value: 'test',
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toBeGreaterThan(0)

      // 验证所有匹配的记录都包含 'test' 关键字
      records.forEach((record) => {
        expect(record.name.toLowerCase()).toContain('test')
      })
    })

    it('should find records with range conditions in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 先查询所有记录
      const allRecords = await crud.find()
      expect(allRecords.length).toBeGreaterThan(0)

      // 测试范围查询（假设_createdAt字段可以用于范围查询）
      const earliestDate = allRecords.reduce((min, record) => {
        return new Date(record._createdAt) < new Date(min._createdAt)
          ? record
          : min
      }, allRecords[0])

      const records = await crud.find({
        condition: {
          key: '_createdAt',
          op: 'gte',
          value: earliestDate._createdAt as any,
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toBeGreaterThan(0)
    })

    it('should find records using api name in user model', async () => {
      const crud = new CRUD<any>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.apiName,
        context: {
          user: admin,
        },
        useApiName: true,
      })

      // 测试使用api名称查询
      const records = await crud.find({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toBeGreaterThan(0)
      expect(records[0].name).toEqual('admin')
    })

    it('should handle find with invalid id in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 查询不存在的ID
      const record = await crud.find({
        condition: {
          key: '_id',
          op: 'eq',
          value: '1111222222',
        },
      })
      expect(record.length).toBe(0)
    })

    it('should handle find with no matching records in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 查询不存在的用户
      const records = await crud.find({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'non_existent_user',
        },
      })

      expect(records).toBeInstanceOf(Array)
      expect(records.length).toEqual(0)
    })
  })

  describe('create', () => {
    it('insert a record to data model', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.create({
        _yesOrNo: true,
        _title: 'test',
        _content: 'test content',
        _num: 100,
        _double: 100.2,
        _datetime: new Date(),
        _date: '2026-01-01',
        _status: '_active',
        _multiStatus: ['_active', '_inactive'],
        _lookup: admin,
        _multiLookup: [admin],
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: record._id })
        .first()
      expect(recordInDb).toBeTruthy()
    })

    it('batch insert records to data model', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      const records = await crud.create([
        {
          _yesOrNo: true,
          _title: 'test',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: new Date(),
          _date: '2026-01-01',
          _status: '_active',
          _multiStatus: ['_active', '_inactive'],
          _lookup: admin,
          _multiLookup: [admin],
        },
        {
          _yesOrNo: false,
          _title: 'test 2',
          _content: 'test content 2',
          _num: 200,
          _double: 200.2,
          _datetime: new Date(),
          _date: '2026-01-02',
          _status: '_inactive',
          _multiStatus: ['_inactive'],
          _lookup: admin,
          _multiLookup: [admin],
        },
      ])

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: records[0]._id })
        .first()
      expect(recordInDb).toBeTruthy()
    })

    it('insert a record to data model use apiname', async () => {
      const crud = new CRUD<TestDataModelWithApiName>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.apiName,
        context: {
          user: admin,
        },
        useApiName: true,
      })

      const record = await crud.create({
        yesOrNo: true,
        title: 'test',
        content: 'test content',
        num: 100,
        double: 100.2,
        datetime: new Date(),
        date: '2026-01-01',
        status: 'active',
        multiStatus: ['active', 'inactive'],
        lookup: admin,
        multiLookup: [admin],
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: record._id })
        .first()
      expect(recordInDb).toBeTruthy()
    })

    it('batch insert records to data model use apiname', async () => {
      const crud = new CRUD<TestDataModelWithApiName>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.apiName,
        context: {
          user: admin,
        },
        useApiName: true,
      })

      const records = await crud.create([
        {
          yesOrNo: true,
          title: 'test',
          content: 'test content',
          num: 100,
          double: 100.2,
          datetime: new Date(),
          date: '2026-01-01',
          status: 'active',
          multiStatus: ['active', 'inactive'],
          lookup: admin,
          multiLookup: [admin],
        },
        {
          yesOrNo: false,
          title: 'test 2',
          content: 'test content 2',
          num: 200,
          double: 200.2,
          datetime: new Date(),
          date: '2026-01-02',
          status: 'inactive',
          multiStatus: ['inactive'],
          lookup: admin,
          multiLookup: [admin],
        },
      ])

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: records[0]._id })
        .first()
      expect(recordInDb).toBeTruthy()
    })

    it('should throw error when create empty data', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(crud.create([])).rejects.toThrow(
        'Create data can not be empty',
      )
    })

    it('should throw error when create record with invalid field', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.create({
          ...{
            _yesOrNo: true,
            _title: 'test',
            _content: 'test content',
            _num: 100,
            _double: 100.2,
            _datetime: new Date(),
            _date: '2026-01-01',
            _status: '_active',
            _multiStatus: ['_active', '_inactive'],
            _lookup: admin,
            _multiLookup: [admin],
          },
          invalidField: 'invalid value',
        }),
      ).rejects.toThrow()
    })

    it('should throw error when create record with invalid enum value', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.create({
          _yesOrNo: true,
          _title: 'test',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: new Date(),
          _date: '2026-01-01',
          _status: 'invalid_enum_value',
          _multiStatus: ['_active', '_inactive'],
          _lookup: admin,
          _multiLookup: [admin],
        }),
      ).rejects.toThrow()
    })

    it('should throw error when create record with invalid lookup data', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.create({
          _yesOrNo: true,
          _title: 'test',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: new Date(),
          _date: '2026-01-01',
          _status: '_active',
          _multiStatus: ['_active', '_inactive'],
          _lookup: { _id: 'invalid_user_id', name: 'invalid user' },
          _multiLookup: [admin],
        }),
      ).rejects.toThrow()
    })

    it('should throw error when create record with type mismatch data', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.create({
          _yesOrNo: 'not_boolean',
          _title: 'test',
          _content: 'test content',
          _num: 'not_number',
          _double: 'not_double',
          _datetime: 'not_datetime',
          _date: '2026-01-01',
          _status: '_active',
          _multiStatus: ['_active', '_inactive'],
          _lookup: admin,
          _multiLookup: [admin],
        }),
      ).rejects.toThrow()
    })

    it('should handle record creation with missing optional fields', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.create({
        _yesOrNo: true,
        _title: 'test',
        _content: 'test content',
        _num: 100,
        _double: 100.2,
        _datetime: new Date(),
        _date: '2026-01-01',
        _status: '_active',
      })

      expect(record).toBeTruthy()
      expect(record._id).toBeTruthy()
    })

    it('should throw error when create record with invalid date format', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.create({
          _yesOrNo: true,
          _title: 'test',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: 'invalid_date_format',
          _date: 'invalid_date',
          _status: '_active',
          _multiStatus: ['_active', '_inactive'],
          _lookup: admin,
          _multiLookup: [admin],
        }),
      ).rejects.toThrow()
    })
  })
})
