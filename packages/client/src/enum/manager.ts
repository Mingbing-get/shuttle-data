import { z } from 'zod'
import {
  DataEnumManager as _DataEnumManager,
  DataEnum,
  helper,
} from '@shuttle-data/type'
import './type'

export default class DataEnumManager extends _DataEnumManager {
  private enumCache: {
    groupApiNameMap: Record<string, Promise<DataEnum.Group>>
    groupMap: Record<string, Promise<DataEnum.Group>>
  } = {
    groupApiNameMap: {},
    groupMap: {},
  }
  private groupListCache: Promise<Omit<DataEnum.Group, 'items'>[]> | undefined

  private observerGroupList: DataEnum.ObserverGroupListCallback[] = []

  private observerList: {
    groupName: string
    useApiName: boolean
    callbacks: DataEnum.OberverCallback[]
  }[] = []

  constructor(private options: DataEnum.ManagerOptions) {
    super()

    options.enumGroup?.forEach((group) => {
      this.enumCache.groupMap[group.name] = Promise.resolve(group)
      this.enumCache.groupApiNameMap[group.apiName] = Promise.resolve(group)
    })
    if (options.enumGroup) {
      this.groupListCache = Promise.resolve(options.enumGroup)
    }
  }

  async addGroup(group: DataEnum.WithoutNameGroup) {
    await this.checkWithOutNameGroup(group)

    await this.options.transporter.addGroup(group)
    this.clearGroupList()
  }

  async updateGroup(group: DataEnum.WhenUpdateGroup) {
    await this.checkWhenUpdateGroup(group)

    await this.options.transporter.updateGroup(group)

    await this.removeGroupFromCache(group.name)
    this.clearGroupList()
  }

  async removeGroup(groupName: string, useApiName?: boolean) {
    await this.options.transporter.removeGroup(groupName, useApiName)

    await this.removeGroupFromCache(groupName, useApiName)
    this.clearGroupList()
  }

  async hasGroup(groupName: string, useApiName?: boolean) {
    try {
      const group = await this.getGroup(groupName, useApiName)

      return !!group
    } catch (error) {
      return false
    }
  }

  async getGroup(
    groupName: string,
    useApiName?: boolean,
  ): Promise<DataEnum.Group | undefined> {
    let groupPromise = useApiName
      ? this.enumCache.groupApiNameMap[groupName]
      : this.enumCache.groupMap[groupName]

    if (!groupPromise) {
      groupPromise = this.options.transporter.getGroup(groupName, useApiName)

      if (useApiName) {
        this.enumCache.groupApiNameMap[groupName] = groupPromise
        groupPromise.then((group) => {
          this.enumCache.groupMap[group.name] = groupPromise
        })
      } else {
        this.enumCache.groupMap[groupName] = groupPromise
        groupPromise.then((group) => {
          this.enumCache.groupApiNameMap[group.apiName] = groupPromise
        })
      }

      groupPromise.then((group) => {
        if (group) {
          this.trigger(group)
        }
      })
    }

    return groupPromise
  }

  async getGroupList() {
    if (!this.groupListCache) {
      this.groupListCache = this.options.transporter.getGroupList()
      this.groupListCache.then((groupList) => {
        this.triggerGroupList(groupList)
      })
    }

    return this.groupListCache
  }

  async addItem(
    groupName: string,
    item: DataEnum.WithoutNameItem,
    useApiName?: boolean,
  ) {
    await this.checkWithoutNameItem(item)

    const group = await this.getGroup(groupName, useApiName)
    if (!group) {
      throw new Error(`group ${groupName} not found`)
    }

    if (group.isSystem) {
      throw new Error(`system group ${groupName} can not be disabled`)
    }

    await this.options.transporter.addItem(groupName, item, useApiName)

    await this.removeGroupFromCache(groupName, useApiName)
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

    await this.options.transporter.updateItem(groupName, item, useApiName)

    await this.removeGroupFromCache(groupName, useApiName)
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

    await this.options.transporter.updateItemDisable(
      groupName,
      itemName,
      useApiName,
      disabled,
    )

    await this.removeGroupFromCache(groupName, useApiName)
  }

  async hasItem(groupName: string, name: string, useApiName?: boolean) {
    try {
      const group = await this.getGroup(groupName, useApiName)
      if (!group) return false

      return group.items.some((item) =>
        useApiName ? item.apiName === name : item.name === name,
      )
    } catch (error) {
      return false
    }
  }

  async getItem(groupName: string, name: string, useApiName?: boolean) {
    const group = await this.getGroup(groupName, useApiName)
    if (!group) return

    return group.items.find((item) =>
      useApiName ? item.apiName === name : item.name === name,
    )
  }

  async checkWithOutNameGroup(group: DataEnum.WithoutNameGroup) {
    const groupZod = this.getGroupZod().omit({
      name: true,
    })

    const groupItemZod = this.getItemZod().omit({
      name: true,
    })

    const result = groupZod
      .extend({
        items: helper.uniqueArrayZod(z.array(groupItemZod), [
          'name',
          'apiName',
        ]),
      })
      .safeParse(group)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }

  async checkGroup(group: DataEnum.Group) {
    const groupZod = this.getGroupZodWithItems()

    const result = groupZod.safeParse(group)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }

  async checkWhenUpdateGroup(group: DataEnum.WhenUpdateGroup) {
    const groupZod = this.getGroupZod()

    const groupItemZod = this.getItemZod()
      .omit({
        name: true,
      })
      .extend({
        name: z.string().optional(),
      })

    const result = groupZod
      .extend({
        items: helper.uniqueArrayZod(z.array(groupItemZod), [
          'name',
          'apiName',
        ]),
      })
      .safeParse(group)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }

  async checkWithoutNameItem(item: DataEnum.WithoutNameItem) {
    const itemZod = this.getItemZod().omit({
      name: true,
    })

    const result = itemZod.safeParse(item)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }

  async checkItem(item: DataEnum.Item) {
    const itemZod = this.getItemZod()

    const result = itemZod.safeParse(item)
    if (!result.success) {
      throw new Error(result.error.message)
    }
  }

  observe(
    callback: DataEnum.OberverCallback,
    groupName: string,
    useApiName: boolean = false,
  ) {
    let observe = this.observerList.find(
      (o) => o.useApiName === useApiName && o.groupName === groupName,
    )
    if (!observe) {
      observe = {
        groupName,
        useApiName,
        callbacks: [callback],
      }
      this.observerList.push(observe)
    } else {
      observe.callbacks.push(callback)
    }

    return () => {
      observe.callbacks = observe.callbacks.filter((c) => c !== callback)
    }
  }

  observeGroupList(callback: DataEnum.ObserverGroupListCallback) {
    this.observerGroupList.push(callback)

    return () => {
      this.observerGroupList = this.observerGroupList.filter(
        (o) => o !== callback,
      )
    }
  }

  clearGroupList() {
    this.groupListCache = undefined
    this.triggerGroupList()
  }

  async removeGroupFromCache(groupName: string, useApiName?: boolean) {
    const groupPromise = useApiName
      ? this.enumCache.groupApiNameMap[groupName]
      : this.enumCache.groupMap[groupName]

    if (!groupPromise) return

    const group = await groupPromise
    delete this.enumCache.groupApiNameMap[group.apiName]
    delete this.enumCache.groupMap[group.name]
    this.trigger(group, true)
  }

  private trigger(group: DataEnum.Group, remove: boolean = false) {
    const observers = this.observerList.filter(
      (o) =>
        (o.groupName === group.name && !o.useApiName) ||
        (o.groupName === group.apiName && o.useApiName),
    )

    observers.forEach((o) => {
      o.callbacks.forEach((c) => c(remove ? undefined : group))
    })
  }

  private triggerGroupList(groupList?: Omit<DataEnum.Group, 'items'>[]) {
    this.observerGroupList.forEach((o) => o(groupList))
  }
}
