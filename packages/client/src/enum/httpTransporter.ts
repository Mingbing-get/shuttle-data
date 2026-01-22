import { DataEnum } from '@shuttle-data/type'
import { BaseHttpTransporter } from '../transporter'

export default class HttpTransporter
  extends BaseHttpTransporter
  implements DataEnum.Transporter
{
  constructor(private options?: DataEnum.HttpTransporterOptions) {
    super(options)
  }

  async addGroup(group: DataEnum.WithoutNameGroup): Promise<void> {
    await this.request(this.options?.addGroup, group, {
      defaultPath: '/addGroup',
    })
  }

  async updateGroup(group: DataEnum.WhenUpdateGroup): Promise<void> {
    await this.request(this.options?.updateGroup, group, {
      defaultPath: '/updateGroup',
    })
  }

  async removeGroup(groupName: string, useApiName?: boolean): Promise<void> {
    const data = {
      groupName,
      useApiName,
    }

    await this.request(this.options?.removeGroup, data, {
      defaultPath: '/removeGroup',
    })
  }

  async addItem(
    groupName: string,
    item: DataEnum.WithoutNameItem,
    useApiName?: boolean,
  ): Promise<void> {
    const data = {
      groupName,
      item,
      useApiName,
    }

    await this.request(this.options?.addItem, data, {
      defaultPath: '/addItem',
    })
  }

  async updateItem(
    groupName: string,
    item: DataEnum.Item,
    useApiName?: boolean,
  ): Promise<void> {
    const data = {
      groupName,
      item,
      useApiName,
    }

    await this.request(this.options?.updateItem, data, {
      defaultPath: '/updateItem',
    })
  }

  async updateItemDisable(
    groupName: string,
    itemName: string,
    useApiName?: boolean,
    disabled?: boolean,
  ): Promise<void> {
    const data = {
      groupName,
      itemName,
      useApiName,
      disabled,
    }

    await this.request(this.options?.updateItemDisable, data, {
      defaultPath: '/updateItemDisable',
    })
  }

  async getGroup(
    groupName: string,
    useApiName?: boolean,
  ): Promise<DataEnum.Group> {
    const data = {
      groupName,
      useApiName,
    }

    return await this.request(this.options?.getGroup, data, {
      defaultPath: '/getGroup',
      defaultMethod: 'GET',
    })
  }

  async getGroupList(): Promise<Omit<DataEnum.Group, 'items'>[]> {
    return await this.request(
      this.options?.getGroupList,
      {},
      {
        defaultPath: '/getGroupList',
        defaultMethod: 'GET',
      },
    )
  }
}
