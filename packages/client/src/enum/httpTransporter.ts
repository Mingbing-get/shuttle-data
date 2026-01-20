import axios from 'axios'
import { DataEnum } from '@shuttle-data/type'

export default class HttpTransporter implements DataEnum.Transporter {
  constructor(private options?: DataEnum.HttpTransporterOptions) {}

  async addGroup(group: DataEnum.WithoutNameGroup): Promise<void> {
    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.addGroup?.path || '/addGroup'}`,
      method: this.options?.addGroup?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.addGroup?.beforeSend?.(group)) || group,
    })

    await this.options?.afterSend?.(response)
    await this.options?.addGroup?.afterSend?.(response)
  }

  async updateGroup(group: DataEnum.WhenUpdateGroup): Promise<void> {
    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.updateGroup?.path || '/updateGroup'}`,
      method: this.options?.updateGroup?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.updateGroup?.beforeSend?.(group)) || group,
    })

    await this.options?.afterSend?.(response)
    await this.options?.updateGroup?.afterSend?.(response)
  }

  async removeGroup(name: string, useApiName?: boolean): Promise<void> {
    const data = {
      name,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.removeGroup?.path || '/removeGroup'}`,
      method: this.options?.removeGroup?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.removeGroup?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.removeGroup?.afterSend?.(response)
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

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.addItem?.path || '/addItem'}`,
      method: this.options?.addItem?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.addItem?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.addItem?.afterSend?.(response)
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

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.updateItem?.path || '/updateItem'}`,
      method: this.options?.updateItem?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.updateItem?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.updateItem?.afterSend?.(response)
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

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.updateItemDisable?.path || '/updateItemDisable'}`,
      method: this.options?.updateItemDisable?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await this.options?.updateItemDisable?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.updateItemDisable?.afterSend?.(response)
  }

  async getGroup(
    groupName: string,
    useApiName?: boolean,
  ): Promise<DataEnum.Group> {
    const data = {
      groupName,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${this.options?.getGroup?.path || '/getGroup'}`,
      method: this.options?.getGroup?.method || 'GET',
      headers: this.options?.requestHeaders,
      data: (await this.options?.getGroup?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.getGroup?.afterSend?.(response)

    return response.data
  }
}
