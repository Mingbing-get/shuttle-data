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
      dateStrings: true,
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

  describe('findOne', () => {
    it('should find one record by id in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.findOne({
        condition: {
          key: '_id',
          op: 'eq',
          value: admin._id,
        },
      })

      expect(record).toBeTruthy()
      expect(record!._id).toEqual(admin._id)
      expect(record!.name).toEqual(admin.name)
    })

    it('should find one record by where condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.findOne({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(record).toBeTruthy()
      expect(record!.name).toEqual('admin')
    })

    it('should find one record using api name in user model', async () => {
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

      const record = await crud.findOne({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(record).toBeTruthy()
      expect(record!.name).toEqual('admin')
    })

    it('should return undefined when no record found in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.findOne({
        condition: {
          key: '_id',
          op: 'eq',
          value: '1111222233333',
        },
      })

      expect(record).toBeUndefined()
    })

    it('should find one record with select fields in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const record = await crud.findOne({
        condition: {
          key: '_id',
          op: 'eq',
          value: admin._id,
        },
        fields: ['name', 'email'],
      })

      expect(record).toBeTruthy()
      expect(record!._id).toBeDefined()
      expect(record!.name).toEqual(admin.name)
      expect(record!.email).toEqual(admin.email)
      expect(record!.phone).toBeUndefined()
    })
  })

  describe('count', () => {
    it('should count all records in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const count = await crud.count()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThan(0)
    })

    it('should count records by where condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const count = await crud.count({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(typeof count).toBe('number')
      expect(count).toEqual(1)
    })

    it('should count records with like condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const count = await crud.count({
        condition: {
          key: 'name',
          op: 'like',
          value: 'test',
        },
      })

      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThan(0)
    })

    it('should count records using api name in user model', async () => {
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

      const count = await crud.count({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'admin',
        },
      })

      expect(typeof count).toBe('number')
      expect(count).toEqual(1)
    })

    it('should return 0 when no records match condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const count = await crud.count({
        condition: {
          key: 'name',
          op: 'eq',
          value: 'non_existent_user',
        },
      })

      expect(typeof count).toBe('number')
      expect(count).toEqual(0)
    })

    it('should count records with multiple conditions in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      const count = await crud.count({
        condition: {
          op: 'and',
          subCondition: [
            {
              key: 'name',
              op: 'like',
              value: 'test',
            },
            {
              key: 'email',
              op: 'like',
              value: 'example.com',
            },
          ],
        },
      })

      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThan(0)
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

      const recordId = await crud.create({
        data: {
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
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: recordId })
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

      const recordIds = await crud.batchCreate({
        data: [
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
        ],
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: recordIds[0] })
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

      const recordId = await crud.create({
        data: {
          yesOrNo: true,
          title: 'test',
          content: 'test content',
          num: 100,
          double: 100.2,
          datetime: new Date() as any,
          date: '2026-01-01',
          status: 'active',
          multiStatus: ['active', 'inactive'],
          lookup: admin,
          multiLookup: [admin],
        },
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: recordId })
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

      const recordIds = await crud.batchCreate({
        data: [
          {
            yesOrNo: true,
            title: 'test',
            content: 'test content',
            num: 100,
            double: 100.2,
            datetime: new Date() as any,
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
            datetime: new Date() as any,
            date: '2026-01-02',
            status: 'inactive',
            multiStatus: ['inactive'],
            lookup: admin,
            multiLookup: [admin],
          },
        ],
      })

      // 检查记录是否存在
      const recordInDb = await db(dataModel.name)
        .where({ _id: recordIds[0] })
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

      await expect(crud.batchCreate({ data: [] })).rejects.toThrow(
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
          data: {
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
          } as any,
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
          data: {
            _yesOrNo: true,
            _title: 'test',
            _content: 'test content',
            _num: 100,
            _double: 100.2,
            _datetime: new Date(),
            _date: '2026-01-01',
            _status: 'invalid_enum_value' as any,
            _multiStatus: ['_active', '_inactive'],
            _lookup: admin,
            _multiLookup: [admin],
          },
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
          data: {
            _yesOrNo: true,
            _title: 'test',
            _content: 'test content',
            _num: 100,
            _double: 100.2,
            _datetime: new Date(),
            _date: '2026-01-01',
            _status: '_active',
            _multiStatus: ['_active', '_inactive'],
            _lookup: { _id: 'invalid_user_id' },
            _multiLookup: [admin],
          },
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
          data: {
            _yesOrNo: 'not_boolean' as any,
            _title: 'test',
            _content: 'test content',
            _num: 'not_number' as any,
            _double: 'not_double' as any,
            _datetime: 'not_datetime',
            _date: '2026-01-01',
            _status: '_active',
            _multiStatus: ['_active', '_inactive'],
            _lookup: admin,
            _multiLookup: [admin],
          },
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

      const recordId = await crud.create({
        data: {
          _yesOrNo: true,
          _title: 'test',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: new Date(),
          _date: '2026-01-01',
          _status: '_active',
        } as any,
      })

      expect(recordId).toBeTruthy()
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
          data: {
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
          },
        }),
      ).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should update a record in data model', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条记录
      const recordId = await crud.create({
        data: {
          _yesOrNo: true,
          _title: 'test update',
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
      })

      // 更新记录
      await crud.update({
        data: {
          _yesOrNo: false,
          _title: 'updated title',
          _num: 200,
        },
        condition: {
          key: '_id',
          op: 'eq',
          value: recordId,
        },
      })

      // 验证记录是否更新成功
      const updatedRecord = await db(dataModel.name)
        .where({ _id: recordId })
        .first()
      expect(updatedRecord).toBeTruthy()
      expect(updatedRecord._yesOrNo).toBe(false)
      expect(updatedRecord._title).toEqual('updated title')
      expect(updatedRecord._num).toEqual(200)
    })

    it('should update a record using api name in data model', async () => {
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

      // 先创建一条记录
      const recordId = await crud.create({
        data: {
          yesOrNo: true,
          title: 'test update api',
          content: 'test content',
          num: 100,
          double: 100.2,
          datetime: new Date() as any,
          date: '2026-01-01',
          status: 'active',
          multiStatus: ['active', 'inactive'],
          lookup: admin,
          multiLookup: [admin],
        },
      })

      // 使用API名称更新记录
      await crud.update({
        data: {
          yesOrNo: false,
          title: 'updated api title',
          num: 200,
        },
        condition: {
          key: '_id',
          op: 'eq',
          value: recordId,
        },
      })

      // 验证记录是否更新成功
      const updatedRecord = await db(dataModel.name)
        .where({ _id: recordId })
        .first()
      expect(updatedRecord).toBeTruthy()
      expect(updatedRecord._yesOrNo).toBe(false)
      expect(updatedRecord._title).toEqual('updated api title')
      expect(updatedRecord._num).toEqual(200)
    })

    it('should update a record with where condition in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条测试用户
      const recordId = snowFlake.next()
      await db(userModel.name).insert({
        _id: recordId,
        name: 'update test user',
        email: 'update@example.com',
        phone: '13800000008',
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _createdBy: admin._id,
        _updatedBy: admin._id,
      })

      // 使用条件更新记录
      await crud.update({
        data: {
          email: 'updated@example.com',
          phone: '13800000009',
        },
        condition: {
          key: 'name',
          op: 'eq',
          value: 'update test user',
        },
      })

      // 验证更新结果
      const updatedUser = await db(userModel.name)
        .where({ _id: recordId })
        .first()
      expect(updatedUser.email).toEqual('updated@example.com')
      expect(updatedUser.phone).toEqual('13800000009')
    })

    it('should handle update when record not found', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 更新不存在的记录
      const updatedIds = await crud.update({
        data: {
          email: 'nonexistent@example.com',
        },
        condition: {
          key: '_id',
          op: 'eq',
          value: '11122223333',
        },
      })

      expect(updatedIds.length).toEqual(0)
    })

    it('should throw error when update record with invalid field', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      await expect(
        crud.update({
          data: {
            invalidField: 'invalid_value',
          } as any,
          condition: {
            key: '_id',
            op: 'eq',
            value: admin._id,
          },
        }),
      ).rejects.toThrow()
    })

    it('should update record with enum and lookup fields', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条记录
      const recordId = await crud.create({
        data: {
          _yesOrNo: true,
          _title: 'test enum update',
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
      })

      // 更新枚举和关联字段
      await crud.update({
        data: {
          _status: '_inactive',
          _multiStatus: ['_inactive', '_unknown'],
        },
        condition: {
          key: '_id',
          op: 'eq',
          value: recordId,
        },
      })

      // 验证更新结果
      const updatedRecord = await db(dataModel.name)
        .where({ _id: recordId })
        .first()
      expect(updatedRecord._status).toEqual('_inactive')
    })

    it('should update record with date and datetime fields', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条记录
      const recordId = await crud.create({
        data: {
          _yesOrNo: true,
          _title: 'test date update',
          _content: 'test content',
          _num: 100,
          _double: 100.2,
          _datetime: new Date('2026-01-01'),
          _date: '2026-01-01',
          _status: '_active',
          _multiStatus: ['_active'],
          _lookup: admin,
          _multiLookup: [admin],
        },
      })

      // 更新日期字段
      const newDate = '2026-12-31'
      const newDateTime = new Date('2026-12-31 23:59:59')
      await crud.update({
        data: {
          _date: newDate,
          _datetime: newDateTime,
        },
        condition: {
          key: '_id',
          op: 'eq',
          value: recordId,
        },
      })

      // 验证更新结果
      const updatedRecord = await db(dataModel.name)
        .where({ _id: recordId })
        .first()
      expect(updatedRecord._date).toEqual(newDate)
    })

    it('should update record with multiple where conditions', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条测试用户
      const testUserId = snowFlake.next()
      await db(userModel.name).insert({
        _id: testUserId,
        name: 'multi condition test',
        email: 'multi@example.com',
        phone: '13800000010',
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _createdBy: admin._id,
        _updatedBy: admin._id,
      })

      // 使用多个条件更新记录
      await crud.update({
        data: {
          phone: '13800000011',
        },
        condition: {
          op: 'and',
          subCondition: [
            {
              key: 'name',
              op: 'eq',
              value: 'multi condition test',
            },
            {
              key: 'email',
              op: 'eq',
              value: 'multi@example.com',
            },
          ],
        },
      })

      // 验证更新结果
      const updatedUser = await db(userModel.name)
        .where({ _id: testUserId })
        .first()
      expect(updatedUser.phone).toEqual('13800000011')
    })

    it('should update record by id', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 先创建一条记录
      const recordIds = await crud.batchCreate({
        data: [
          {
            _yesOrNo: true,
            _title: 'test update by id',
            _content: 'test content',
            _num: 100,
            _double: 100.2,
            _datetime: new Date(),
            _date: '2026-01-01',
            _status: '_active',
            _multiStatus: ['_active'],
            _lookup: admin,
            _multiLookup: [admin],
          },
          {
            _yesOrNo: false,
            _title: 'test update by id 2',
            _content: 'test content 2',
            _num: 200,
            _double: 200.2,
            _datetime: new Date(),
            _date: '2026-01-02',
            _status: '_active',
            _multiStatus: ['_active'],
            _lookup: admin,
            _multiLookup: [admin],
          },
        ],
      })

      // 更新记录
      await crud.update({
        data: [
          {
            _id: recordIds[0],
            _title: 'updated title',
            _num: 1000,
          },
          {
            _id: recordIds[1],
            _content: 'updated content 2',
            _num: 2000,
          },
        ],
      })

      // 验证更新结果
      const updatedRecord1 = await db(dataModel.name)
        .where({ _id: recordIds[0] })
        .first()
      expect(updatedRecord1._title).toEqual('updated title')
      expect(updatedRecord1._num).toEqual(1000)

      const updatedRecord2 = await db(dataModel.name)
        .where({ _id: recordIds[1] })
        .first()
      expect(updatedRecord2._content).toEqual('updated content 2')
      expect(updatedRecord2._num).toEqual(2000)
    })
  })

  describe('del', () => {
    it('should delete a single record by id in user model', async () => {
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
        name: 'delete_test_user',
        email: 'delete_test_user@example.com',
        phone: '13800000010',
      }
      const insertedId = snowFlake.next()
      await db(userModel.name).insert({
        ...testUser,
        _id: insertedId,
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _createdBy: admin._id,
        _updatedBy: admin._id,
      })

      // 删除记录
      const deletedIds = await crud.del({
        condition: {
          key: '_id',
          op: 'eq',
          value: insertedId,
        },
      })

      // 验证删除结果
      expect(deletedIds).toBeInstanceOf(Array)
      expect(deletedIds.length).toBe(1)
      expect(deletedIds[0]).toEqual(insertedId)

      // 验证记录已删除
      const remainingRecords = await db(userModel.name)
        .where({ _id: insertedId })
        .select()
      expect(remainingRecords.length).toBe(0)
    })

    it('should delete multiple records by condition in user model', async () => {
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
          name: 'multi_delete_test_1',
          email: 'multi_delete_test_1@example.com',
          phone: '13800000011',
        },
        {
          name: 'multi_delete_test_2',
          email: 'multi_delete_test_2@example.com',
          phone: '13800000012',
        },
        {
          name: 'multi_delete_test_3',
          email: 'multi_delete_test_3@example.com',
          phone: '13800000013',
        },
      ]

      const insertedIds = testUsers.map(() => snowFlake.next())
      await db(userModel.name).insert(
        testUsers.map((user, index) => ({
          ...user,
          _id: insertedIds[index],
          _createdAt: new Date(),
          _updatedAt: new Date(),
          _createdBy: admin._id,
          _updatedBy: admin._id,
        })),
      )

      // 删除记录
      const deletedRecords = await crud.del({
        condition: {
          key: '_id',
          op: 'in',
          value: insertedIds,
        },
      })

      // 验证删除结果
      expect(deletedRecords).toBeInstanceOf(Array)
      expect(deletedRecords.length).toBe(testUsers.length)

      // 验证所有记录已删除
      const remainingRecords = await db(userModel.name)
        .whereIn('_id', insertedIds)
        .select()
      expect(remainingRecords.length).toBe(0)
    })

    it('should delete records using api name in user model', async () => {
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

      // 插入测试数据
      const testUser = {
        name: 'api_delete_test_user',
        email: 'api_delete_test_user@example.com',
        phone: '13800000014',
      }
      const insertedId = snowFlake.next()
      await db(userModel.name).insert({
        ...testUser,
        _id: insertedId,
        _createdAt: new Date(),
        _updatedAt: new Date(),
        _createdBy: admin._id,
        _updatedBy: admin._id,
      })

      // 删除记录
      const deletedIds = await crud.del({
        condition: {
          key: 'name',
          op: 'eq',
          value: testUser.name,
        },
      })

      // 验证删除结果
      expect(deletedIds).toBeInstanceOf(Array)
      expect(deletedIds.length).toBe(1)
      expect(deletedIds[0]).toEqual(insertedId)

      // 验证记录已删除
      const remainingRecords = await db(userModel.name)
        .where({ _id: insertedId })
        .select()
      expect(remainingRecords.length).toBe(0)
    })

    it('should handle delete with non-existent records in user model', async () => {
      const crud = new CRUD<typeof admin>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: userModel.name,
        context: {
          user: admin,
        },
      })

      // 尝试删除不存在的记录
      const deletedRecords = await crud.del({
        condition: {
          key: '_id',
          op: 'eq',
          value: 'nonexistent_id_12345',
        },
      })

      // 验证没有记录被删除
      expect(deletedRecords).toBeInstanceOf(Array)
      expect(deletedRecords.length).toBe(0)
    })

    it('should delete records by complex conditions in user model', async () => {
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
          name: 'complex_delete_test_1',
          email: 'complex_delete_1@example.com',
          phone: '13800000015',
        },
        {
          name: 'complex_delete_test_2',
          email: 'complex_delete_2@example.com',
          phone: '13800000016',
        },
        {
          name: 'keep_this_user',
          email: 'keep_this@example.com',
          phone: '13800000017',
        },
      ]

      const insertedIds = testUsers.map(() => snowFlake.next())
      await db(userModel.name).insert(
        testUsers.map((user, index) => ({
          ...user,
          _id: insertedIds[index],
          _createdAt: new Date(),
          _updatedAt: new Date(),
          _createdBy: admin._id,
          _updatedBy: admin._id,
        })),
      )

      // 删除符合复杂条件的记录
      const deletedIds = await crud.del({
        condition: {
          op: 'and',
          subCondition: [
            {
              key: 'name',
              op: 'like',
              value: 'complex_delete',
            },
            {
              key: 'email',
              op: 'like',
              value: '@example.com',
            },
          ],
        },
      })

      // 验证删除结果
      expect(deletedIds).toBeInstanceOf(Array)
      expect(deletedIds.length).toBe(2)

      // 验证被删除的记录符合条件
      deletedIds.forEach((id) => {
        expect(id).toBeDefined()
      })

      // 验证剩余记录
      const remainingRecords = await db(userModel.name)
        .where({ name: 'keep_this_user' })
        .select()
      expect(remainingRecords.length).toBe(1)
    })
  })

  describe('queryGroupBy', () => {
    beforeAll(async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })
      await crud.del()
    })

    it('should group by status and count records', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 先插入测试数据
      await crud.batchCreate({
        data: [
          {
            _yesOrNo: true,
            _title: 'test1',
            _content: 'test content 1',
            _num: 100,
            _double: 100.2,
            _datetime: new Date(),
            _date: '2026-01-01',
            _status: '_active',
            _multiStatus: ['_active'],
            _lookup: admin,
            _multiLookup: [admin],
          },
          {
            _yesOrNo: false,
            _title: 'test2',
            _content: 'test content 2',
            _num: 200,
            _double: 200.2,
            _datetime: new Date(),
            _date: '2026-01-02',
            _status: '_active',
            _multiStatus: ['_active'],
            _lookup: admin,
            _multiLookup: [admin],
          },
          {
            _yesOrNo: true,
            _title: 'test3',
            _content: 'test content 3',
            _num: 300,
            _double: 300.2,
            _datetime: new Date(),
            _date: '2026-01-03',
            _status: '_inactive',
            _multiStatus: ['_inactive'],
            _lookup: admin,
            _multiLookup: [admin],
          },
        ],
      })

      // 测试分组查询
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: {
          _id: 'count',
        },
        groupByFields: ['_status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      // 验证结果
      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?.count).toEqual(2)
      expect(inactiveGroup?.count).toEqual(1)
    })

    it('should group by status with sum aggregation', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试sum聚合
      const result = await crud.queryGroupBy({
        aggFunction: 'sum',
        aggField: '_num',
        groupByFields: ['_status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._num).toEqual(300) // 100 + 200
      expect(inactiveGroup?._num).toEqual(300)
    })

    it('should group by status with avg aggregation', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试avg聚合
      const result = await crud.queryGroupBy({
        aggFunction: 'avg',
        aggField: '_double',
        groupByFields: ['_status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._double).toEqual(150.2) // (100.2 + 200.2) / 2
      expect(inactiveGroup?._double).toEqual(300.2)
    })

    it('should group by status with min aggregation', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试min聚合
      const result = await crud.queryGroupBy({
        aggFunction: 'min',
        aggField: '_num',
        groupByFields: ['_status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._num).toEqual(100)
      expect(inactiveGroup?._num).toEqual(300)
    })

    it('should group by status with max aggregation', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试max聚合
      const result = await crud.queryGroupBy({
        aggFunction: 'max',
        aggField: '_num',
        groupByFields: ['_status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._num).toEqual(200)
      expect(inactiveGroup?._num).toEqual(300)
    })

    it('should group by status with condition', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试带条件的分组查询
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: '_id',
        groupByFields: ['_status'],
        condition: {
          key: '_num',
          op: 'gte',
          value: 200,
        },
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      // 应该只有符合条件的记录被分组
      const activeGroup = result.find((item) => item._status === '_active')
      const inactiveGroup = result.find((item) => item._status === '_inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._id).toEqual(1) // 只有_num >= 200的active记录
      expect(inactiveGroup?._id).toEqual(1) // 只有_num >= 200的inactive记录
    })

    it('should group by status with order', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试带排序的分组查询
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: '_id',
        groupByFields: ['_status'],
        orders: [
          {
            key: '_status',
            desc: true,
          },
        ],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      // 验证排序是否正确
      expect(result[0]._status).toEqual('_inactive')
      expect(result[1]._status).toEqual('_active')
    })

    it('should group by status with limit and offset', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试带分页的分组查询
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: '_id',
        groupByFields: ['_status'],
        limit: 1,
        offset: 1,
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toEqual(1)
    })

    it('should group by multiple fields', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试多字段分组
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: '_id',
        groupByFields: ['_status', '_yesOrNo'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      // 验证多字段分组结果
      const activeTrueGroup = result.find(
        (item) => item._status === '_active' && item._yesOrNo === true,
      )
      const activeFalseGroup = result.find(
        (item) => item._status === '_active' && item._yesOrNo === false,
      )
      const inactiveTrueGroup = result.find(
        (item) => item._status === '_inactive' && item._yesOrNo === true,
      )

      expect(activeTrueGroup).toBeTruthy()
      expect(activeFalseGroup).toBeTruthy()
      expect(inactiveTrueGroup).toBeTruthy()

      expect(activeTrueGroup?._id).toEqual(1)
      expect(activeFalseGroup?._id).toEqual(1)
      expect(inactiveTrueGroup?._id).toEqual(1)
    })

    it('should throw error when group by fields is empty', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试分组字段为空的情况
      await expect(
        crud.queryGroupBy({
          aggFunction: 'count',
          aggField: '_id',
          groupByFields: [],
        }),
      ).rejects.toThrow('Group by fields can not be empty')
    })

    it('should throw error when agg field is also group by field', async () => {
      const crud = new CRUD<TestDataModel>({
        schema: dataModelSchema,
        generateId: () => snowFlake.next(),
        getKnex: () => db,
        modelName: dataModel.name,
        context: {
          user: admin,
        },
      })

      // 测试聚合字段也是分组字段的情况
      await expect(
        crud.queryGroupBy({
          aggFunction: 'count',
          aggField: '_status',
          groupByFields: ['_status'],
        }),
      ).rejects.toThrow('Agg field _status can not be group by field')
    })

    it('should group by using api name', async () => {
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

      // 测试使用API名称的分组查询
      const result = await crud.queryGroupBy({
        aggFunction: 'count',
        aggField: '_id',
        groupByFields: ['status'],
      })

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const activeGroup = result.find((item) => item.status === 'active')
      const inactiveGroup = result.find((item) => item.status === 'inactive')

      expect(activeGroup).toBeTruthy()
      expect(inactiveGroup).toBeTruthy()
      expect(activeGroup?._id).toEqual(2)
      expect(inactiveGroup?._id).toEqual(1)
    })
  })
})
