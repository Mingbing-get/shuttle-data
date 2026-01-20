import { z } from 'zod'
import {
  DataEnumManager as _DataEnumManager,
  DataEnum,
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

  constructor(private options: DataEnum.ManagerOptions) {
    super()

    options.enumGroup?.forEach((group) => {
      this.enumCache.groupMap[group.name] = Promise.resolve(group)
      this.enumCache.groupApiNameMap[group.apiName] = Promise.resolve(group)
    })
  }

  async addGroup(group: DataEnum.WithoutNameGroup) {
    await this.checkWithOutNameGroup(group)

    await this.options.transporter.addGroup(group)
  }

  async updateGroup(group: DataEnum.WhenUpdateGroup) {
    await this.checkWhenUpdateGroup(group)

    await this.options.transporter.updateGroup(group)

    await this.removeGroupFromCache(group.name)
  }

  async removeGroup(name: string, useApiName?: boolean) {
    await this.options.transporter.removeGroup(name, useApiName)

    await this.removeGroupFromCache(name, useApiName)
  }

  async hasGroup(name: string, useApiName?: boolean) {
    const group = await this.getGroup(name, useApiName)

    return !!group
  }

  async getGroup(
    name: string,
    useApiName?: boolean,
  ): Promise<DataEnum.Group | undefined> {
    let groupPromise = useApiName
      ? this.enumCache.groupApiNameMap[name]
      : this.enumCache.groupMap[name]

    if (!groupPromise) {
      groupPromise = this.options.transporter.getGroup(name, useApiName)

      if (useApiName) {
        this.enumCache.groupApiNameMap[name] = groupPromise
        groupPromise.then((group) => {
          this.enumCache.groupMap[group.name] = groupPromise
        })
      } else {
        this.enumCache.groupMap[name] = groupPromise
        groupPromise.then((group) => {
          this.enumCache.groupApiNameMap[group.apiName] = groupPromise
        })
      }
    }

    return groupPromise
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

  async checkWithOutNameGroup(group: DataEnum.WithoutNameGroup) {
    const groupZod = this.getGroupZod().omit({
      name: true,
    })

    const groupItemZod = this.getItemZod().omit({
      name: true,
    })

    groupZod
      .extend({
        items: z.array(groupItemZod),
      })
      .parse(group)
  }

  async checkGroup(group: DataEnum.Group) {
    const groupZod = this.getGroupZodWithItems()

    groupZod.parse(group)
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

    groupZod
      .extend({
        items: z.array(groupItemZod),
      })
      .parse(group)
  }

  async checkWithoutNameItem(item: DataEnum.WithoutNameItem) {
    const itemZod = this.getItemZod().omit({
      name: true,
    })

    itemZod.parse(item)
  }

  async checkItem(item: DataEnum.Item) {
    const itemZod = this.getItemZod()

    itemZod.parse(item)
  }

  clear() {
    this.enumCache = {
      groupApiNameMap: {},
      groupMap: {},
    }
  }

  private async removeGroupFromCache(groupName: string, useApiName?: boolean) {
    const groupPromise = useApiName
      ? this.enumCache.groupApiNameMap[groupName]
      : this.enumCache.groupMap[groupName]

    if (!groupPromise) return

    const group = await groupPromise
    delete this.enumCache.groupApiNameMap[group.apiName]
    delete this.enumCache.groupMap[group.name]
  }
}
