import axios from 'axios'
import { DataModel } from '@shuttle-data/type'

export default class HttpTransporter implements DataModel.Schema.Transporter {
  constructor(private options?: DataModel.Schema.HttpTransporterOptions) {}

  async createTable(table: DataModel.WithoutNameModel): Promise<void> {
    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.createTable?.path ?? '/createTable'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.createTable?.method ?? 'POST',
      data: (await this.options?.createTable?.beforeSend?.(table)) || table,
    })

    await this.options?.afterSend?.(response)
    await this.options?.createTable?.afterSend?.(response)
  }

  async updateTable(table: DataModel.WhenUpdateModel): Promise<void> {
    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.updateTable?.path ?? '/updateTable'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.updateTable?.method ?? 'POST',
      data: (await this.options?.updateTable?.beforeSend?.(table)) || table,
    })

    await this.options?.afterSend?.(response)
    await this.options?.updateTable?.afterSend?.(response)
  }

  async dropTable(name: string, useApiName?: boolean): Promise<void> {
    const data = {
      name,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.dropTable?.path ?? '/dropTable'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.dropTable?.method ?? 'POST',
      data: (await this.options?.dropTable?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.dropTable?.afterSend?.(response)
  }

  async addField(
    tableName: string,
    field: DataModel.WithoutNameField,
    useApiName?: boolean,
  ): Promise<void> {
    const data = {
      tableName,
      field,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.addField?.path ?? '/addField'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.addField?.method ?? 'POST',
      data: (await this.options?.addField?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.addField?.afterSend?.(response)
  }

  async updateField(
    tableName: string,
    field: DataModel.Field,
    useApiName?: boolean,
  ): Promise<void> {
    const data = {
      tableName,
      field,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.updateField?.path ?? '/updateField'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.updateField?.method ?? 'POST',
      data: (await this.options?.updateField?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.updateField?.afterSend?.(response)
  }

  async dropField(
    tableName: string,
    fieldName: string,
    useApiName?: boolean,
  ): Promise<void> {
    const data = {
      tableName,
      fieldName,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.dropField?.path ?? '/dropField'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.dropField?.method ?? 'POST',
      data: (await this.options?.dropField?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.dropField?.afterSend?.(response)
  }

  async getTable(
    tableName: string,
    useApiName?: boolean,
  ): Promise<DataModel.Define> {
    const data = {
      tableName,
      useApiName,
    }

    const response = await axios({
      url: `${this.options?.baseUrl}${this.options?.getTable?.path ?? '/getTable'}`,
      headers: this.options?.requestHeaders,
      method: this.options?.getTable?.method ?? 'GET',
      data: (await this.options?.getTable?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await this.options?.getTable?.afterSend?.(response)

    return response.data
  }
}
