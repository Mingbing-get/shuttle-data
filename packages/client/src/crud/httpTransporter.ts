import { BaseHttpTransporter } from '../transporter'
import { DataCRUD } from '@shuttle-data/type'

export default class HttpTransporter
  extends BaseHttpTransporter
  implements DataCRUD.Client.Transporter
{
  constructor(private options: DataCRUD.Client.HttpTransporterOptions) {
    super(options)
  }

  async findOne<M extends Record<string, any>>(
    option: DataCRUD.FineOneOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<M | undefined> {
    return this.request(this.options.findOne, option, {
      defaultPath: 'findOne',
    })
  }

  async find<M extends Record<string, any>>(
    option: DataCRUD.FindOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<M[]> {
    return this.request(this.options.find, option, {
      defaultPath: 'find',
    })
  }

  async count<M extends Record<string, any>>(
    option: DataCRUD.CountOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<number> {
    return this.request(this.options.count, option, {
      defaultPath: 'count',
    })
  }

  async create<M extends Record<string, any>>(
    option: DataCRUD.CreateOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string> {
    return this.request(this.options.create, option, {
      defaultPath: 'create',
    })
  }

  async batchCreate<M extends Record<string, any>>(
    option: DataCRUD.BatchCreateOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request(this.options.batchCreate, option, {
      defaultPath: 'batchCreate',
    })
  }

  async update<M extends Record<string, any>>(
    option: (DataCRUD.UpdateOption<M> | DataCRUD.UpdateWithIdOption<M>) &
      DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request(this.options.update, option, {
      defaultPath: 'update',
    })
  }

  async del<M extends Record<string, any>>(
    option: DataCRUD.DelOption<M> & DataCRUD.Client.ModelConfig,
  ): Promise<string[]> {
    return this.request(this.options.del, option, {
      defaultPath: 'del',
    })
  }

  async queryGroupBy<
    M extends Record<string, any>,
    T extends DataCRUD.SelectField<M>,
  >(
    option: DataCRUD.QueryGroupByOption<M, T> & DataCRUD.Client.ModelConfig,
  ): Promise<DataCRUD.StrOrObjKeyToNumber<T, M>[]> {
    return this.request(this.options.queryGroupBy, option, {
      defaultPath: 'queryGroupBy',
    })
  }
}
