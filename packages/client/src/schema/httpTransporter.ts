import { DataModel } from '@shuttle-data/type'
import { BaseHttpTransporter } from '../transporter'

export default class HttpTransporter
  extends BaseHttpTransporter
  implements DataModel.Schema.Transporter
{
  constructor(private options?: DataModel.Schema.HttpTransporterOptions) {
    super(options)
  }

  async createTable(table: DataModel.WithoutNameModel): Promise<void> {
    await this.request(this.options?.createTable, table, {
      defaultPath: 'createTable',
    })
  }

  async updateTable(table: DataModel.MabyFieldNameModel): Promise<void> {
    await this.request(this.options?.updateTable, table, {
      defaultPath: 'updateTable',
    })
  }

  async dropTable(tableName: string, useApiName?: boolean): Promise<void> {
    const data = {
      tableName,
      useApiName,
    }

    await this.request(this.options?.dropTable, data, {
      defaultPath: 'dropTable',
    })
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

    await this.request(this.options?.addField, data, {
      defaultPath: 'addField',
    })
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

    await this.request(this.options?.updateField, data, {
      defaultPath: 'updateField',
    })
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

    await this.request(this.options?.dropField, data, {
      defaultPath: 'dropField',
    })
  }

  async getTable(
    tableName: string,
    useApiName?: boolean,
  ): Promise<DataModel.Define> {
    const data = {
      tableName,
      useApiName,
    }

    return await this.request(this.options?.getTable, data, {
      defaultPath: 'getTable',
      defaultMethod: 'GET',
    })
  }

  async getTableList(): Promise<Omit<DataModel.Define, 'fields'>[]> {
    return await this.request(
      this.options?.getTableList,
      {},
      {
        defaultPath: 'getTableList',
        defaultMethod: 'GET',
      },
    )
  }
}
