import { DataCRUD } from '@shuttle-data/type'

export default class CRUD<M extends Record<string, any>> {
  static readonly ID = '_id'
  static readonly DISPLAY = '_display'
  static readonly CREATED_AT = '_createdAt'
  static readonly UPDATED_AT = '_updatedAt'
  static readonly CREATED_BY = '_createdBy'
  static readonly UPDATED_BY = '_updatedBy'
  static readonly IS_DELETE = '_isDelete'

  constructor(private options: DataCRUD.Client.Options) {}

  async findOne(
    option: DataCRUD.FineOneOption<M> = {},
  ): Promise<M | undefined> {
    return this.options.transporter.findOne({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async find(option: DataCRUD.FindOption<M> = {}): Promise<M[]> {
    return this.options.transporter.find({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async count(option: DataCRUD.CountOption<M> = {}): Promise<number> {
    return this.options.transporter.count({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async create(option: DataCRUD.CreateOption<M>): Promise<string> {
    return this.options.transporter.create({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async batchCreate(option: DataCRUD.BatchCreateOption<M>): Promise<string[]> {
    return this.options.transporter.batchCreate({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async update(
    option: DataCRUD.UpdateOption<M> | DataCRUD.UpdateWithIdOption<M>,
  ): Promise<string[]> {
    return this.options.transporter.update({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async del(option: DataCRUD.DelOption<M> = {}): Promise<string[]> {
    return this.options.transporter.del({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }

  async queryGroupBy<T extends DataCRUD.SelectField<M>>(
    option: DataCRUD.QueryGroupByOption<M, T>,
  ): Promise<DataCRUD.StrOrObjKeyToNumber<T, M>[]> {
    return this.options.transporter.queryGroupBy({
      ...option,
      modelName: this.options.modelName,
      useApiName: this.options.useApiName,
    })
  }
}
