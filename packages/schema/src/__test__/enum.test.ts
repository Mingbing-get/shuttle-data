import knex from 'knex'
import dotenv from 'dotenv'
import { DataEnum } from '@shuttle-data/type'

import DataEnumManager from '../enum'

dotenv.config()

describe('DataEnumManager', () => {
  // 基础测试数据
  const testGroup1: DataEnum.Group = {
    name: 'testGroup1',
    apiName: 'test_group_1',
    label: '测试分组1',
    isSystem: false,
    items: [
      { name: 'item1', apiName: 'item_1', label: '选项1', isDisabled: false },
      { name: 'item2', apiName: 'item_2', label: '选项2', isDisabled: false },
    ],
  }

  const testGroup2: DataEnum.Group = {
    name: 'testGroup2',
    apiName: 'test_group_2',
    label: '测试分组2',
    isSystem: false,
    items: [
      { name: 'item3', apiName: 'item_3', label: '选项3', isDisabled: false },
      { name: 'item4', apiName: 'item_4', label: '选项4', isDisabled: true },
    ],
  }

  const systemGroup: DataEnum.Group = {
    name: 'systemGroup',
    apiName: 'system_group',
    label: '系统分组',
    isSystem: true,
    items: [
      {
        name: 'systemItem',
        apiName: 'system_item',
        label: '系统选项',
        isDisabled: false,
      },
    ],
  }

  describe('构造函数和基础方法', () => {
    it('应该能够使用enumGroup选项创建实例', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const allGroups = await manager.all()
      expect(allGroups.groupMap[testGroup1.name]).toEqual(testGroup1)
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toEqual(
        testGroup1.name,
      )
    })

    it('应该能够检查分组是否存在', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      expect(await manager.hasGroup(testGroup1.name)).toBe(true)
      expect(await manager.hasGroup('nonexistent')).toBe(false)
      expect(await manager.hasGroup(testGroup1.apiName, true)).toBe(true)
      expect(await manager.hasGroup('nonexistent_api', true)).toBe(false)
    })

    it('应该能够通过名称或API名称获取分组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const groupByName = await manager.getGroup(testGroup1.name)
      expect(groupByName).toEqual(testGroup1)

      const groupByApiName = await manager.getGroup(testGroup1.apiName, true)
      expect(groupByApiName).toEqual(testGroup1)

      expect(await manager.getGroup('nonexistent')).toBeUndefined()
    })
  })

  describe('分组管理', () => {
    it('应该能够添加新分组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      await manager.addGroup(testGroup1)

      const allGroups = await manager.all()
      expect(allGroups.groupMap[testGroup1.name]).toEqual(testGroup1)
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toEqual(
        testGroup1.name,
      )
    })

    it('添加已存在的分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      await expect(manager.addGroup(testGroup1)).rejects.toThrow(
        `group ${testGroup1.name} already exists`,
      )
    })

    it('添加API名称已存在的分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const duplicateApiNameGroup = {
        ...testGroup2,
        apiName: testGroup1.apiName,
      }

      await expect(manager.addGroup(duplicateApiNameGroup)).rejects.toThrow(
        `group api name ${testGroup1.apiName} already exists`,
      )
    })

    it('应该能够更新分组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const updatedGroup = {
        ...testGroup1,
        label: '更新后的测试分组1',
        items: [
          ...testGroup1.items,
          {
            name: 'item3',
            apiName: 'item_3',
            label: '新增选项',
            isDisabled: false,
          },
        ],
      }

      await manager.updateGroup(updatedGroup)

      const retrievedGroup = await manager.getGroup(testGroup1.name)
      expect(retrievedGroup?.label).toEqual('更新后的测试分组1')
      expect(retrievedGroup?.items.length).toBe(3)
    })

    it('更新不存在的分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      await expect(manager.updateGroup(testGroup1)).rejects.toThrow(
        `group ${testGroup1.name} not exists`,
      )
    })

    it('更新系统分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [systemGroup],
      })

      const updatedSystemGroup = {
        ...systemGroup,
        label: '更新后的系统分组',
      }

      await expect(manager.updateGroup(updatedSystemGroup)).rejects.toThrow(
        `system group ${systemGroup.name} cannot be updated`,
      )
    })

    it('应该能够删除分组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      await manager.removeGroup(testGroup1.name)

      const allGroups = await manager.all()
      expect(allGroups.groupMap[testGroup1.name]).toBeUndefined()
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toBeUndefined()
    })

    it('删除不存在的分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      await expect(manager.removeGroup('nonexistent')).rejects.toThrow(
        `group nonexistent not found`,
      )
    })

    it('删除系统分组应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [systemGroup],
      })

      await expect(manager.removeGroup(systemGroup.name)).rejects.toThrow(
        `system group ${systemGroup.name} can not be removed`,
      )
    })
  })

  describe('枚举项管理', () => {
    it('应该能够添加新的枚举项', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const newItem = {
        name: 'item3',
        apiName: 'item_3',
        label: '新增选项3',
        isDisabled: false,
      }

      await manager.addItem(testGroup1.name, newItem)

      const group = await manager.getGroup(testGroup1.name)
      expect(group?.items.find((item) => item.name === newItem.name)).toEqual(
        newItem,
      )
    })

    it('向不存在的分组添加项应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      const newItem = {
        name: 'item3',
        apiName: 'item_3',
        label: '新增选项3',
        isDisabled: false,
      }

      await expect(manager.addItem('nonexistent', newItem)).rejects.toThrow(
        `group nonexistent not found`,
      )
    })

    it('向系统分组添加项应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [systemGroup],
      })

      const newItem = {
        name: 'newSystemItem',
        apiName: 'new_system_item',
        label: '新系统选项',
        isDisabled: false,
      }

      await expect(manager.addItem(systemGroup.name, newItem)).rejects.toThrow(
        `system group ${systemGroup.name} can not be disabled`,
      )
    })

    it('应该能够更新枚举项', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const updatedItem = {
        ...testGroup1.items[0],
        label: '更新后的选项1',
        isDisabled: true,
      }

      await manager.updateItem(testGroup1.name, updatedItem)

      const group = await manager.getGroup(testGroup1.name)
      const item = group?.items.find((item) => item.name === updatedItem.name)
      expect(item?.label).toEqual('更新后的选项1')
      expect(item?.isDisabled).toBe(true)
    })

    it('更新不存在的项应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const nonexistentItem = {
        name: 'nonexistent',
        apiName: 'nonexistent',
        label: '不存在的选项',
        isDisabled: false,
      }

      await expect(
        manager.updateItem(testGroup1.name, nonexistentItem),
      ).rejects.toThrow(`item nonexistent not found`)
    })

    it('更新系统分组的项应该抛出错误', async () => {
      const manager = new DataEnumManager({
        enumGroup: [systemGroup],
      })

      const updatedItem = {
        ...systemGroup.items[0],
        label: '更新后的系统选项',
      }

      await expect(
        manager.updateItem(systemGroup.name, updatedItem),
      ).rejects.toThrow(`system group ${systemGroup.name} can not be disabled`)
    })

    it('应该能够禁用和启用枚举项', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      await manager.disabledItem(testGroup1.name, testGroup1.items[0].name)
      let item = (await manager.getGroup(testGroup1.name))?.items.find(
        (i) => i.name === testGroup1.items[0].name,
      )
      expect(item?.isDisabled).toBe(true)

      await manager.enabledItem(testGroup1.name, testGroup1.items[0].name)
      item = (await manager.getGroup(testGroup1.name))?.items.find(
        (i) => i.name === testGroup1.items[0].name,
      )
      expect(item?.isDisabled).toBe(false)
    })

    it('应该能够检查枚举项是否存在', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      expect(
        await manager.hasItem(testGroup1.name, testGroup1.items[0].name),
      ).toBe(true)
      expect(await manager.hasItem(testGroup1.name, 'nonexistent')).toBe(false)
      expect(
        await manager.hasItem(
          testGroup1.apiName,
          testGroup1.items[0].apiName,
          true,
        ),
      ).toBe(true)
    })

    it('应该能够获取枚举项', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1],
      })

      const itemByName = await manager.getItem(
        testGroup1.name,
        testGroup1.items[0].name,
      )
      expect(itemByName).toEqual(testGroup1.items[0])

      const itemByApiName = await manager.getItem(
        testGroup1.apiName,
        testGroup1.items[0].apiName,
        true,
      )
      expect(itemByApiName).toEqual(testGroup1.items[0])

      expect(
        await manager.getItem(testGroup1.name, 'nonexistent'),
      ).toBeUndefined()
    })
  })

  describe('数据验证', () => {
    it('checkGroup应该验证分组数据的完整性', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      const invalidGroup: any = {
        name: 'invalidGroup',
      }

      await expect(manager.checkGroup(invalidGroup)).rejects.toThrow()
    })

    it('checkItem应该验证枚举项数据的完整性', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      const invalidItem: any = {
        name: 'invalidItem',
      }

      await expect(manager['checkItem'](invalidItem)).rejects.toThrow()
    })
  })

  describe('边界情况处理', () => {
    it('应该处理空分组数组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [],
      })

      const allGroups = await manager.all()
      expect(Object.keys(allGroups.groupMap)).toEqual([])
      expect(Object.keys(allGroups.apiNameReflexName)).toEqual([])
    })

    it('应该处理包含禁用项的分组', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup2],
      })

      const group = await manager.getGroup(testGroup2.name)
      expect(group?.items.some((item) => item.isDisabled)).toBe(true)
    })

    it('应该正确处理API名称和名称的映射', async () => {
      const manager = new DataEnumManager({
        enumGroup: [testGroup1, testGroup2],
      })

      const allGroups = await manager.all()
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toEqual(
        testGroup1.name,
      )
      expect(allGroups.apiNameReflexName[testGroup2.apiName]).toEqual(
        testGroup2.name,
      )
    })
  })

  describe('使用数据库的操作', () => {
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

    const manager = new DataEnumManager({
      groupTableConfig: {
        knex: db,
        tableName: 'enum_group',
        itemTableConfig: {
          tableName: 'enum_item',
        },
      },
    })

    beforeEach(async () => {
      const allEnumGroup = await manager.all()
      for (const name in allEnumGroup.groupMap) {
        await manager.removeGroup(name)
      }

      if (await db.schema.hasTable('enum_group')) {
        await db('enum_group').delete()
      }
      if (await db.schema.hasTable('enum_item')) {
        await db('enum_item').delete()
      }
    })

    afterAll(async () => {
      await db.destroy()
    })

    it('应该能够添加新分组', async () => {
      await manager.addGroup(testGroup1)

      const allGroups = await manager.all()
      expect(allGroups.groupMap[testGroup1.name]).toEqual(testGroup1)
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toEqual(
        testGroup1.name,
      )

      // 检查数据库内是否真的有新增的分组
      const dbGroup = await db('enum_group')
        .where('name', testGroup1.name)
        .first()
      expect(dbGroup).toBeDefined()
      expect(dbGroup.name).toEqual(testGroup1.name)
      expect(dbGroup.apiName).toEqual(testGroup1.apiName)
      expect(dbGroup.label).toEqual(testGroup1.label)
      expect(dbGroup.isSystem).toEqual(testGroup1.isSystem)
      // 检查数据库内是否真的有新增的枚举项
      const dbItems = await db('enum_item')
        .where('group', testGroup1.name)
        .select()

      expect(dbItems.length).toBe(testGroup1.items.length)
      dbItems.forEach((item, index) => {
        expect(item.name).toEqual(testGroup1.items[index].name)
        expect(item.apiName).toEqual(testGroup1.items[index].apiName)
        expect(item.label).toEqual(testGroup1.items[index].label)
        expect(item.isDisabled).toEqual(testGroup1.items[index].isDisabled)
      })
    })

    it('应该能够更新分组', async () => {
      await manager.addGroup(testGroup1)

      const updatedGroup = {
        ...testGroup1,
        label: '更新后的测试分组1',
        items: [
          ...testGroup1.items,
          {
            name: 'item3',
            apiName: 'item_3',
            label: '新增选项',
            isDisabled: false,
          },
        ],
      }

      await manager.updateGroup(updatedGroup)

      const retrievedGroup = await manager.getGroup(testGroup1.name)
      expect(retrievedGroup?.label).toEqual('更新后的测试分组1')
      expect(retrievedGroup?.items.length).toBe(3)

      // 检查数据库内是否真的有更新后的分组
      const dbGroup = await db('enum_group')
        .where('name', testGroup1.name)
        .first()
      expect(dbGroup).toBeDefined()
      expect(dbGroup.label).toEqual('更新后的测试分组1')

      // 检查数据库内是否真的有新增的枚举项
      const dbItems = await db('enum_item')
        .where('group', testGroup1.name)
        .select()

      expect(dbItems.length).toBe(updatedGroup.items.length)
      dbItems.forEach((item, index) => {
        expect(item.name).toEqual(updatedGroup.items[index].name)
        expect(item.apiName).toEqual(updatedGroup.items[index].apiName)
        expect(item.label).toEqual(updatedGroup.items[index].label)
        expect(item.isDisabled).toEqual(updatedGroup.items[index].isDisabled)
      })
    })

    it('应该能够删除分组', async () => {
      await manager.addGroup(testGroup1)

      await manager.removeGroup(testGroup1.name)

      const allGroups = await manager.all()
      expect(allGroups.groupMap[testGroup1.name]).toBeUndefined()
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toBeUndefined()

      // 检查数据库内是否真的删除了分组
      const dbGroup = await db('enum_group')
        .where('name', testGroup1.name)
        .first()
      expect(dbGroup.isDelete).toBe(true)

      // 检查数据库内是否真的删除了枚举项
      const dbItems = await db('enum_item')
        .where('group', testGroup1.name)
        .select()

      const hasNotDeleteItem = dbItems.some((item) => !item.isDelete)
      expect(hasNotDeleteItem).toBe(false)
    })

    it('应该能够添加新的枚举项', async () => {
      await manager.addGroup(testGroup1)

      const newItem = {
        name: 'item3',
        apiName: 'item_3',
        label: '新增选项3',
        isDisabled: false,
      }

      await manager.addItem(testGroup1.name, newItem)

      const group = await manager.getGroup(testGroup1.name)
      expect(group?.items.find((item) => item.name === newItem.name)).toEqual(
        newItem,
      )

      // 检查数据库内是否真的有新增的枚举项
      const dbItem = await db('enum_item')
        .where('group', testGroup1.name)
        .where('name', newItem.name)
        .first()
      expect(dbItem).toBeDefined()
      expect(dbItem.apiName).toEqual(newItem.apiName)
      expect(dbItem.label).toEqual(newItem.label)
      expect(dbItem.isDisabled).toEqual(newItem.isDisabled)
    })

    it('应该能够更新枚举项', async () => {
      await manager.addGroup(testGroup1)

      const updatedItem = {
        ...testGroup1.items[0],
        label: '更新后的选项1',
        isDisabled: true,
      }

      await manager.updateItem(testGroup1.name, updatedItem)

      const group = await manager.getGroup(testGroup1.name)
      const item = group?.items.find((item) => item.name === updatedItem.name)
      expect(item?.label).toEqual('更新后的选项1')
      expect(item?.isDisabled).toBe(true)

      // 检查数据库内是否真的有更新后的枚举项
      const dbItem = await db('enum_item')
        .where('group', testGroup1.name)
        .where('name', updatedItem.name)
        .first()
      expect(dbItem).toBeDefined()
      expect(dbItem.label).toEqual('更新后的选项1')
      expect(dbItem.isDisabled).toBe(true)
    })

    it('应该能够禁用和启用枚举项', async () => {
      await manager.addGroup(testGroup1)

      await manager.disabledItem(testGroup1.name, testGroup1.items[0].name)
      let item = (await manager.getGroup(testGroup1.name))?.items.find(
        (i) => i.name === testGroup1.items[0].name,
      )
      expect(item?.isDisabled).toBe(true)

      // 检查数据库内是否真的禁用了枚举项
      let dbItem = await db('enum_item')
        .where('group', testGroup1.name)
        .where('name', testGroup1.items[0].name)
        .first()
      expect(dbItem?.isDisabled).toBe(true)

      await manager.enabledItem(testGroup1.name, testGroup1.items[0].name)
      item = (await manager.getGroup(testGroup1.name))?.items.find(
        (i) => i.name === testGroup1.items[0].name,
      )
      expect(item?.isDisabled).toBe(false)

      // 检查数据库内是否真的启用了枚举项
      dbItem = await db('enum_item')
        .where('group', testGroup1.name)
        .where('name', testGroup1.items[0].name)
        .first()
      expect(dbItem?.isDisabled).toBe(false)
    })

    it('应该能够检查分组和枚举项是否存在', async () => {
      await manager.addGroup(testGroup1)

      expect(await manager.hasGroup(testGroup1.name)).toBe(true)
      expect(await manager.hasGroup('nonexistent')).toBe(false)
      expect(await manager.hasGroup(testGroup1.apiName, true)).toBe(true)

      expect(
        await manager.hasItem(testGroup1.name, testGroup1.items[0].name),
      ).toBe(true)
      expect(await manager.hasItem(testGroup1.name, 'nonexistent')).toBe(false)
      expect(
        await manager.hasItem(
          testGroup1.apiName,
          testGroup1.items[0].apiName,
          true,
        ),
      ).toBe(true)
    })

    it('应该能够通过API名称获取分组和枚举项', async () => {
      await manager.addGroup(testGroup1)

      const groupByApiName = await manager.getGroup(testGroup1.apiName, true)
      expect(groupByApiName).toEqual(testGroup1)

      const itemByApiName = await manager.getItem(
        testGroup1.apiName,
        testGroup1.items[0].apiName,
        true,
      )
      expect(itemByApiName).toEqual(testGroup1.items[0])
    })

    it('应该正确处理包含禁用项的分组', async () => {
      await manager.addGroup(testGroup2)

      const group = await manager.getGroup(testGroup2.name)
      expect(group?.items.some((item) => item.isDisabled)).toBe(true)
    })

    it('应该正确处理API名称和名称的映射', async () => {
      await manager.addGroup(testGroup1)
      await manager.addGroup(testGroup2)

      const allGroups = await manager.all()
      expect(allGroups.apiNameReflexName[testGroup1.apiName]).toEqual(
        testGroup1.name,
      )
      expect(allGroups.apiNameReflexName[testGroup2.apiName]).toEqual(
        testGroup2.name,
      )
    })

    it('添加已存在的分组应该抛出错误', async () => {
      await manager.addGroup(testGroup1)

      await expect(manager.addGroup(testGroup1)).rejects.toThrow(
        `group ${testGroup1.name} already exists`,
      )
    })

    it('更新不存在的分组应该抛出错误', async () => {
      await expect(manager.updateGroup(testGroup1)).rejects.toThrow(
        `group ${testGroup1.name} not exists`,
      )
    })

    it('删除不存在的分组应该抛出错误', async () => {
      await expect(manager.removeGroup('nonexistent')).rejects.toThrow(
        `group nonexistent not found`,
      )
    })

    it('向不存在的分组添加项应该抛出错误', async () => {
      const newItem = {
        name: 'item3',
        apiName: 'item_3',
        label: '新增选项3',
        isDisabled: false,
      }

      await expect(manager.addItem('nonexistent', newItem)).rejects.toThrow(
        `group nonexistent not found`,
      )
    })

    it('更新不存在的项应该抛出错误', async () => {
      await manager.addGroup(testGroup1)

      const nonexistentItem = {
        name: 'nonexistent',
        apiName: 'nonexistent',
        label: '不存在的选项',
        isDisabled: false,
      }

      await expect(
        manager.updateItem(testGroup1.name, nonexistentItem),
      ).rejects.toThrow(`item nonexistent not found`)
    })
  })
})
