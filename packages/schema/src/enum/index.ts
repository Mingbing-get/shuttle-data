import {
  DataEnumManager as _DataEnumManager,
  DataEnum,
} from '@shuttle-data/type'
import './type'

export default class DataEnumManager extends _DataEnumManager {
  private enumCache:
    | Promise<{
        apiNameReflexName: Record<string, string>
        groupMap: Record<string, DataEnum.Group>
      }>
    | undefined

  constructor(private options: DataEnum.ServerManagerOptions) {
    super()

    if (options.enumGroup) {
      this.enumCache = Promise.resolve(this.groupListToCache(options.enumGroup))
    }
  }

  async addGroup(group: DataEnum.Group) {
    await this.checkGroup(group)

    const groupNameInGroup = await this.getGroup(group.name)
    if (groupNameInGroup) {
      throw new Error(`group ${group.name} already exists`)
    }

    const groupNameInApiName = await this.getGroup(group.apiName, true)
    if (groupNameInApiName) {
      throw new Error(`group api name ${group.apiName} already exists`)
    }

    // 将枚举添加到数据库中
    const groupTableConfig = this.options.groupTableConfig
    if (groupTableConfig) {
      const groupFields = this.getGroupTableFields()
      const itemFields = this.getItemTableFields()

      await this.createGroupTableIfNotExist(groupTableConfig)
      await this.createItemTableIfNotExist(groupTableConfig)

      await groupTableConfig.knex.transaction(async (trx) => {
        const dbGroup = {
          [groupFields.name]: group.name,
          [groupFields.apiName]: group.apiName,
          [groupFields.label]: group.label,
          [groupFields.isSystem]: group.isSystem,
          [groupFields.isDelete]: false,
          ...this.createCustomRecord(groupTableConfig.custom || {}, group),
        }

        const dbItems = group.items.map((item) => {
          const newItem = {
            [itemFields.group]: group.name,
            [itemFields.name]: item.name,
            [itemFields.apiName]: item.apiName,
            [itemFields.label]: item.label,
            [itemFields.order]: item.order,
            [itemFields.color]: item.color,
            [itemFields.isDelete]: false,
            [itemFields.isDisabled]: item.isDisabled,
            ...this.createCustomRecord(
              groupTableConfig.itemTableConfig.custom || {},
              item,
            ),
          }

          return newItem
        })

        await trx(groupTableConfig.tableName).insert(dbGroup)
        if (dbItems.length > 0) {
          await trx(groupTableConfig.itemTableConfig.tableName).insert(dbItems)
        }
      })
    }

    // 更新缓存
    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: {
        ...groups.apiNameReflexName,
        [group.apiName]: group.name,
      },
      groupMap: {
        ...groups.groupMap,
        [group.name]: group,
      },
    }
    this.enumCache = Promise.resolve(newGroups)
  }

  async updateGroup(group: DataEnum.Group) {
    await this.checkGroup(group)

    const groupNameInGroup = await this.getGroup(group.name)
    if (!groupNameInGroup) {
      throw new Error(`group ${group.name} not exists`)
    }

    if (groupNameInGroup.isSystem) {
      throw new Error(`system group ${group.name} cannot be updated`)
    }

    const groupNameInApiName = await this.getGroup(group.apiName, true)
    if (groupNameInApiName && groupNameInApiName.name !== group.name) {
      throw new Error(`group api name ${group.apiName} already exists`)
    }

    // 更新数据库
    let needUpdateGroup = false
    if (
      groupNameInGroup.apiName !== group.apiName ||
      groupNameInGroup.label !== group.label
    ) {
      needUpdateGroup = true
    }

    const willAddItems: DataEnum.Item[] = []
    const willUpdateItems: DataEnum.Item[] = []
    for (const item of group.items) {
      const oldItem = groupNameInGroup.items.find((i) => i.name === item.name)
      if (!oldItem) {
        willAddItems.push(item)
      } else if (
        oldItem.apiName !== item.apiName ||
        oldItem.label !== item.label ||
        oldItem.isDisabled !== item.isDisabled ||
        oldItem.order !== item.order ||
        oldItem.color !== item.color
      ) {
        willUpdateItems.push(item)
      }
    }
    for (const oldItem of groupNameInGroup.items) {
      if (!group.items.some((item) => item.name === oldItem.name)) {
        willUpdateItems.push({
          ...oldItem,
          isDisabled: true,
        })
      }
    }

    const groupTableConfig = this.options.groupTableConfig
    if (
      groupTableConfig &&
      (needUpdateGroup || willAddItems.length > 0 || willUpdateItems.length > 0)
    ) {
      await groupTableConfig.knex.transaction(async (trx) => {
        if (needUpdateGroup) {
          const groupFields = this.getGroupTableFields()
          await trx(groupTableConfig.tableName)
            .where({
              [groupFields.name]: group.name,
            })
            .update({
              [groupFields.apiName]: group.apiName,
              [groupFields.label]: group.label,
            })
        }

        const itemFields = this.getItemTableFields()
        if (willAddItems.length > 0) {
          await trx(groupTableConfig.itemTableConfig.tableName).insert(
            willAddItems.map((item) => {
              const newItem = {
                [itemFields.group]: group.name,
                [itemFields.name]: item.name,
                [itemFields.apiName]: item.apiName,
                [itemFields.label]: item.label,
                [itemFields.order]: item.order,
                [itemFields.color]: item.color,
                [itemFields.isDelete]: false,
                [itemFields.isDisabled]: item.isDisabled,
                ...this.createCustomRecord(
                  groupTableConfig.itemTableConfig.custom || {},
                  item,
                ),
              }

              return newItem
            }),
          )
        }

        for (const item of willUpdateItems) {
          await trx(groupTableConfig.itemTableConfig.tableName)
            .where({
              [itemFields.name]: item.name,
            })
            .update({
              [itemFields.apiName]: item.apiName,
              [itemFields.label]: item.label,
              [itemFields.isDisabled]: item.isDisabled,
              [itemFields.order]: item.order,
              [itemFields.color]: item.color,
            })
        }
      })
    }

    // 更新缓存
    const newGroup = {
      ...groupNameInGroup,
      apiName: group.apiName,
      label: group.label,
      items: groupNameInGroup.items
        .reduce((acc: DataEnum.Item[], item) => {
          const needUpdateItem = willUpdateItems.find(
            (i) => i.name === item.name,
          )
          if (needUpdateItem) {
            acc.push({
              ...item,
              apiName: needUpdateItem.apiName,
              label: needUpdateItem.label,
              isDisabled: needUpdateItem.isDisabled,
              order: needUpdateItem.order,
              color: needUpdateItem.color,
            })
          } else {
            acc.push(item)
          }

          return acc
        }, [])
        .concat(willAddItems),
    }

    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: {
        ...groups.apiNameReflexName,
      },
      groupMap: {
        ...groups.groupMap,
        [group.name]: newGroup,
      },
    }
    if (newGroup.apiName !== groupNameInGroup.apiName) {
      newGroups.apiNameReflexName[newGroup.apiName] = newGroup.name
      delete newGroups.apiNameReflexName[groupNameInGroup.apiName]
    }
    this.enumCache = Promise.resolve(newGroups)
  }

  async removeGroup(name: string, useApiName?: boolean) {
    const group = await this.getGroup(name, useApiName)
    if (!group) {
      throw new Error(`group ${name} not found`)
    }

    if (group.isSystem) {
      throw new Error(`system group ${name} can not be removed`)
    }

    // 将枚举组在数据库中标记为删除
    const groupTableConfig = this.options.groupTableConfig
    if (groupTableConfig) {
      const groupFields = this.getGroupTableFields()
      const itemFields = this.getItemTableFields()
      await groupTableConfig.knex.transaction(async (trx) => {
        await trx(groupTableConfig.tableName)
          .where({
            [groupFields.name]: group.name,
          })
          .update({
            [groupFields.isDelete]: true,
          })

        await trx(groupTableConfig.itemTableConfig.tableName)
          .where({
            [itemFields.group]: group.name,
          })
          .update({
            [itemFields.isDelete]: true,
          })
      })
    }

    // 更新缓存
    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: {
        ...groups.apiNameReflexName,
      },
      groupMap: {
        ...groups.groupMap,
      },
    }
    delete newGroups.groupMap[group.name]
    delete newGroups.apiNameReflexName[group.apiName]
    this.enumCache = Promise.resolve(newGroups)
  }

  async hasGroup(name: string, useApiName?: boolean) {
    const groups = await this.all()
    if (useApiName) {
      return !!groups.apiNameReflexName[name]
    }

    return !!groups.groupMap[name]
  }

  async getGroup(name: string, useApiName?: boolean) {
    const groups = await this.all()
    if (useApiName) {
      name = groups.apiNameReflexName[name]
      if (!name) return
    }

    return groups.groupMap[name]
  }

  async addItem(groupName: string, item: DataEnum.Item, useApiName?: boolean) {
    await this.checkItem(item)

    const group = await this.getGroup(groupName, useApiName)
    if (!group) {
      throw new Error(`group ${groupName} not found`)
    }

    if (group.isSystem) {
      throw new Error(`system group ${groupName} can not be disabled`)
    }

    // 将枚举项加入数据库中
    const groupTableConfig = this.options.groupTableConfig
    if (groupTableConfig) {
      const itemFields = this.getItemTableFields()
      await groupTableConfig
        .knex(groupTableConfig.itemTableConfig.tableName)
        .insert({
          [itemFields.group]: group.name,
          [itemFields.name]: item.name,
          [itemFields.apiName]: item.apiName,
          [itemFields.label]: item.label,
          [itemFields.order]: item.order,
          [itemFields.color]: item.color,
          [itemFields.isDelete]: false,
          [itemFields.isDisabled]: item.isDisabled,
          ...this.createCustomRecord(
            groupTableConfig.itemTableConfig.custom || {},
            item,
          ),
        })
    }

    // 更新缓存
    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: {
        ...groups.apiNameReflexName,
        [item.apiName]: group.name,
      },
      groupMap: {
        ...groups.groupMap,
        [group.name]: {
          ...group,
          items: [...group.items, item],
        },
      },
    }
    this.enumCache = Promise.resolve(newGroups)
  }

  async updateItem(
    groupName: string,
    item: DataEnum.Item,
    useApiName?: boolean,
  ) {
    await this.checkItem(item)

    const group = await this.getGroup(groupName, useApiName)
    if (!group) {
      throw new Error(`group ${groupName} not found`)
    }

    if (group.isSystem) {
      throw new Error(`system group ${groupName} can not be disabled`)
    }

    const oldItem = group.items.find((i) => i.name === item.name)
    if (!oldItem) {
      throw new Error(`item ${item.name} not found`)
    }

    const apiNameOldItem = group.items.find((i) => i.apiName === item.apiName)
    if (apiNameOldItem && apiNameOldItem.name !== item.name) {
      throw new Error(`apiName ${item.apiName} is already used`)
    }

    // 在数据库中更新
    const groupTableConfig = this.options.groupTableConfig
    if (groupTableConfig) {
      const itemFields = this.getItemTableFields()
      await groupTableConfig
        .knex(groupTableConfig.itemTableConfig.tableName)
        .where({
          [itemFields.name]: oldItem.name,
        })
        .update({
          [itemFields.apiName]: item.apiName,
          [itemFields.label]: item.label,
          [itemFields.isDisabled]: item.isDisabled,
          [itemFields.order]: item.order,
          [itemFields.color]: item.color,
        })
    }

    // 更新缓存
    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: groups.apiNameReflexName,
      groupMap: {
        ...groups.groupMap,
        [group.name]: {
          ...group,
          items: [
            ...group.items.filter((i) => i.name !== item.name),
            {
              ...oldItem,
              apiName: item.apiName,
              label: item.label,
              isDisabled: item.isDisabled,
              order: item.order,
              color: item.color,
            },
          ],
        },
      },
    }
    this.enumCache = Promise.resolve(newGroups)
  }

  async disabledItem(
    groupName: string,
    itemName: string,
    useApiName?: boolean,
  ) {
    await this.updateItemDisable(groupName, itemName, useApiName, true)
  }

  async enabledItem(groupName: string, itemName: string, useApiName?: boolean) {
    await this.updateItemDisable(groupName, itemName, useApiName, false)
  }

  async updateItemDisable(
    groupName: string,
    itemName: string,
    useApiName?: boolean,
    disabled: boolean = false,
  ) {
    const group = await this.getGroup(groupName, useApiName)
    if (!group) {
      throw new Error(`group ${groupName} not found`)
    }

    if (group.isSystem) {
      throw new Error(`system group ${groupName} can not be change disabled`)
    }

    const item = group.items.find((i) =>
      useApiName ? i.apiName === itemName : i.name === itemName,
    )
    if (!item) {
      throw new Error(`item ${itemName} not found`)
    }

    if (!!item.isDisabled === disabled) return

    // 在数据库中更新
    const groupTableConfig = this.options.groupTableConfig
    if (groupTableConfig) {
      const itemFields = this.getItemTableFields()
      await groupTableConfig
        .knex(groupTableConfig.itemTableConfig.tableName)
        .where({
          [itemFields.name]: item.name,
        })
        .update({
          [itemFields.isDisabled]: disabled,
        })
    }

    // 更新缓存
    const groups = await this.all()
    const newGroups = {
      apiNameReflexName: groups.apiNameReflexName,
      groupMap: {
        ...groups.groupMap,
        [group.name]: {
          ...group,
          items: group.items.map((i) =>
            i.name === item.name
              ? {
                  ...i,
                  isDisabled: disabled,
                }
              : i,
          ),
        },
      },
    }
    this.enumCache = Promise.resolve(newGroups)
  }

  async hasItem(groupName: string, name: string, useApiName?: boolean) {
    const group = await this.getGroup(groupName, useApiName)
    if (!group) return false

    return group.items.some((item) =>
      useApiName ? item.apiName === name : item.name === name,
    )
  }

  async getItem(groupName: string, name: string, useApiName?: boolean) {
    const group = await this.getGroup(groupName, useApiName)
    if (!group) return

    return group.items.find((item) =>
      useApiName ? item.apiName === name : item.name === name,
    )
  }

  async all() {
    if (!this.enumCache) {
      this.enumCache = (async () => {
        const groupTableConfig = this.options.groupTableConfig
        if (!groupTableConfig) {
          throw new Error(
            'groupTableConfig is required when enumGroup is not provided',
          )
        }

        const hasGroupTable = await groupTableConfig.knex.schema.hasTable(
          groupTableConfig.tableName,
        )

        if (!hasGroupTable) {
          return this.groupListToCache([])
        }

        const groups: Omit<DataEnum.Group, 'items'>[] = await groupTableConfig
          .knex(groupTableConfig.tableName)
          .select(
            this.getGroupTableFields(),
            ...Object.keys(groupTableConfig.custom || {}),
          )
          .where('isDelete', '<>', true)

        const hasItemTable = await groupTableConfig.knex.schema.hasTable(
          groupTableConfig.itemTableConfig.tableName,
        )

        if (!hasItemTable) {
          return this.groupListToCache(
            groups.map((group) => ({
              ...group,
              items: [],
            })),
          )
        }

        const enumItems: (DataEnum.Item & { group: string })[] =
          await groupTableConfig
            .knex(groupTableConfig.itemTableConfig.tableName)
            .select(
              this.getItemTableFields(),
              ...Object.keys(groupTableConfig.itemTableConfig.custom || {}),
            )
            .where('isDelete', '<>', true)

        return this.groupListToCache(
          groups.map((group) => ({
            ...group,
            items: enumItems.filter((item) => item.group === group.name),
          })),
        )
      })()

      this.enumCache.catch((error) => {
        this.enumCache = undefined
        throw error
      })
    }

    return this.enumCache
  }

  async checkGroup(group: DataEnum.Group) {
    const groupZod = this.getGroupZodWithItems()

    groupZod.parse(group)
  }

  async checkItem(item: DataEnum.Item) {
    const itemZod = this.getItemZod()

    itemZod.parse(item)
  }

  private async createGroupTableIfNotExist(
    groupTableConfig: DataEnum.GroupTableConfig,
  ) {
    const hasGroupTable = await groupTableConfig.knex.schema.hasTable(
      groupTableConfig.tableName,
    )

    if (hasGroupTable) return

    const groupTableFields = this.getGroupTableFields()
    await groupTableConfig.knex.schema.createTable(
      groupTableConfig.tableName,
      (table) => {
        table.string(groupTableFields.name).primary()
        table.string(groupTableFields.apiName)
        table.string(groupTableFields.label)
        table.boolean(groupTableFields.isSystem).defaultTo(false)
        table.boolean(groupTableFields.isDelete).defaultTo(false)
        Object.values(groupTableConfig.custom || {}).forEach((customField) => {
          customField.builder(table)
        })
      },
    )
  }

  private async createItemTableIfNotExist(
    groupTableConfig: DataEnum.GroupTableConfig,
  ) {
    const hasItemTable = await groupTableConfig.knex.schema.hasTable(
      groupTableConfig.itemTableConfig.tableName,
    )

    if (hasItemTable) return

    const itemTableFields = this.getItemTableFields()
    await groupTableConfig.knex.schema.createTable(
      groupTableConfig.itemTableConfig.tableName,
      (table) => {
        table.string(itemTableFields.group)
        table.string(itemTableFields.name).primary()
        table.string(itemTableFields.apiName)
        table.string(itemTableFields.label)
        table.integer(itemTableFields.order)
        table.string(itemTableFields.color)
        table.boolean(itemTableFields.isDisabled).defaultTo(false)
        table.boolean(itemTableFields.isDelete).defaultTo(false)
        Object.values(groupTableConfig.itemTableConfig.custom || {}).forEach(
          (customField) => {
            customField.builder(table)
          },
        )
      },
    )
  }

  private getGroupTableFields() {
    const groupTableFieldMap: Record<
      keyof Omit<DataEnum.Group, 'items'> | 'isDelete',
      string
    > = {
      name: 'name',
      apiName: 'apiName',
      label: 'label',
      isSystem: 'isSystem',
      isDelete: 'isDelete',
    }

    const groupTableConfig = this.options.groupTableConfig || {}
    for (const key in groupTableFieldMap) {
      const factFieldName = (groupTableConfig as any)[`${key}Field`]
      if (factFieldName) {
        groupTableFieldMap[key as keyof typeof groupTableFieldMap] =
          factFieldName
      }
    }

    return groupTableFieldMap
  }

  private getItemTableFields() {
    const itemTableFieldMap: Record<
      keyof DataEnum.Item | 'isDelete' | 'group',
      string
    > = {
      group: 'group',
      name: 'name',
      apiName: 'apiName',
      label: 'label',
      isDisabled: 'isDisabled',
      isDelete: 'isDelete',
      order: 'order',
      color: 'color',
    }

    const itemTableConfig = this.options.groupTableConfig?.itemTableConfig || {}
    for (const key in itemTableFieldMap) {
      const factFieldName = (itemTableConfig as any)[`${key}Field`]
      if (factFieldName) {
        itemTableFieldMap[key as keyof typeof itemTableFieldMap] = factFieldName
      }
    }

    return itemTableFieldMap
  }

  private groupListToCache(groups: DataEnum.Group[]) {
    return {
      apiNameReflexName: groups.reduce(
        (acc: Record<string, string>, group) => ({
          ...acc,
          [group.apiName]: group.name,
        }),
        {},
      ),
      groupMap: groups.reduce(
        (acc: Record<string, DataEnum.Group>, group) => ({
          ...acc,
          [group.name]: group,
        }),
        {},
      ),
    }
  }

  private createCustomRecord<T>(
    custom: Partial<Record<keyof T, DataEnum.CustomField<T>>>,
    v: T,
  ) {
    const customRecord: Record<keyof T, any> = {} as Record<keyof T, any>
    for (const key in custom) {
      customRecord[key] = (custom as any)[key].onCreate(v)
    }
    return customRecord
  }
}
