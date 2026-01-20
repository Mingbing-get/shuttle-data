import axios from 'axios'
import { DataCRUD } from '@shuttle-data/type'

export default class HttpTransporter implements DataCRUD.Client.Transporter {
  constructor(private options: DataCRUD.Client.HttpTransporterOptions) {}

  async findOne<M extends Record<string, any>>(
    option: DataCRUD.FineOneOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<M | undefined> {
    return this.request('findOne', option)
  }

  async find<M extends Record<string, any>>(
    option: DataCRUD.FindOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<M[]> {
    return this.request('find', option)
  }

  async count<M extends Record<string, any>>(
    option: DataCRUD.CountOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<number> {
    return this.request('count', option)
  }

  async create<M extends Record<string, any>>(
    option: DataCRUD.CreateOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string> {
    return this.request('create', option)
  }

  async batchCreate<M extends Record<string, any>>(
    option: DataCRUD.BatchCreateOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request('batchCreate', option)
  }

  async update<M extends Record<string, any>>(
    option: (DataCRUD.UpdateOption<M> | DataCRUD.UpdateWithIdOption<M>) &
      DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request('update', option)
  }

  async del<M extends Record<string, any>>(
    option: DataCRUD.DelOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request('del', option)
  }

  async queryGroupBy<
    M extends Record<string, any>,
    T extends DataCRUD.SelectField<M>,
  >(
    option: DataCRUD.QueryGroupByOption<M, T> & DataCRUD.Client.ModelConfig,
  ): Promise<DataCRUD.StrOrObjKeyToNumber<T, M>[]> {
    return this.request('queryGroupBy', option)
  }

  private async request(method: keyof DataCRUD.Client.Transporter, data: any) {
    const methodConfig = this.options?.[method]
    if (!methodConfig) {
      throw new Error(`method ${method} not config`)
    }

    const response = await axios({
      url: `${this.options?.baseUrl || ''}${methodConfig?.path || `/${method}`}`,
      method: methodConfig?.method || 'POST',
      headers: this.options?.requestHeaders,
      data: (await methodConfig?.beforeSend?.(data)) || data,
    })

    await this.options?.afterSend?.(response)
    await methodConfig?.afterSend?.(response)

    return response.data
  }
}
