import { DataModel, dataModelManager } from '@shuttle-data/type'

export default class Schema {
  private dataModelCache: {
    apiNameModelMap: Record<string, Promise<DataModel.Define>>
    modelMap: Record<string, Promise<DataModel.Define>>
  } = {
    apiNameModelMap: {},
    modelMap: {},
  }

  constructor(private options: DataModel.Schema.Options) {}

  async createTable(model: DataModel.WithoutNameModel) {
    this.checkWithOutNameModel(model)

    await this.options.transporter.createTable(model)
  }

  async updateTable(model: DataModel.WhenUpdateModel) {
    this.checkModelWhenUpdate(model)

    await this.options.transporter.updateTable(model)
    await this.removeModelFromCache(model.name)
  }

  async dropTable(tableName: string, useApiName: boolean = false) {
    await this.options.transporter.dropTable(tableName, useApiName)

    await this.removeModelFromCache(tableName, useApiName)
  }

  async hasTable(tableName: string, useApiName: boolean = false) {
    const model = await this.getTable(tableName, useApiName)

    return !!model
  }

  async getTable(tableName: string, useApiName: boolean = false) {
    let modelPromise = useApiName
      ? this.dataModelCache.apiNameModelMap[tableName]
      : this.dataModelCache.modelMap[tableName]

    if (!modelPromise) {
      modelPromise = this.options.transporter.getTable(tableName, useApiName)
      if (useApiName) {
        this.dataModelCache.apiNameModelMap[tableName] = modelPromise
        modelPromise.then((model) => {
          this.dataModelCache.modelMap[model.name] = modelPromise
        })
      } else {
        this.dataModelCache.modelMap[tableName] = modelPromise
        modelPromise.then((model) => {
          this.dataModelCache.apiNameModelMap[model.apiName] = modelPromise
        })
      }
    }

    return modelPromise
  }

  async addField(
    tableName: string,
    field: DataModel.WithoutNameField,
    useApiName: boolean = false,
  ) {
    this.checkWithOutNameField(field)

    await this.options.transporter.addField(tableName, field, useApiName)

    await this.removeModelFromCache(tableName, useApiName)
  }

  async updateField(
    tableName: string,
    field: DataModel.Field,
    useApiName: boolean = false,
  ) {
    this.checkField(field)

    await this.options.transporter.updateField(tableName, field, useApiName)

    await this.removeModelFromCache(tableName, useApiName)
  }

  async dropField(
    tableName: string,
    fieldName: string,
    useApiName: boolean = false,
  ) {
    await this.options.transporter.dropField(tableName, fieldName, useApiName)

    await this.removeModelFromCache(tableName, useApiName)
  }

  async hasField(
    tableName: string,
    fieldName: string,
    useApiName: boolean = false,
  ) {
    const table = await this.getTable(tableName, useApiName)
    if (!table) return false

    return table.fields.some((field) => {
      return (useApiName ? field.apiName : field.name) === fieldName
    })
  }

  async getField(
    tableName: string,
    fieldName: string,
    useApiName: boolean = false,
  ) {
    const table = await this.getTable(tableName, useApiName)
    if (!table) return

    return table.fields.find((field) => {
      return (useApiName ? field.apiName : field.name) === fieldName
    })
  }

  checkModel(model: DataModel.Define) {
    const modelZod = dataModelManager.getZod()

    modelZod.parse(model)

    for (const field of model.fields) {
      this.checkField(field)
    }
  }

  checkWithOutNameModel(model: DataModel.WithoutNameModel) {
    const modelZod = dataModelManager.getZod().omit({
      name: true,
    })

    modelZod.parse(model)

    for (const field of model.fields) {
      this.checkWithOutNameField(field)
    }
  }

  checkField(field: DataModel.Field) {
    const fieldPlugin = dataModelManager.getPlugin(field.type)
    if (!fieldPlugin) {
      throw new Error(`field type ${field.type} is not supported`)
    }

    fieldPlugin.getZod().parse(field)
  }

  checkWithOutNameField(field: DataModel.WithoutNameField) {
    const fieldPlugin = dataModelManager.getPlugin(field.type)
    if (!fieldPlugin) {
      throw new Error(`field type ${field.type} is not supported`)
    }

    fieldPlugin
      .getZod()
      .omit({
        name: true,
      })
      .parse(field)
  }

  checkModelWhenUpdate(model: DataModel.WhenUpdateModel) {
    const modelZod = dataModelManager.getZod()

    modelZod.parse(model)

    for (const field of model.fields) {
      if ('name' in field) {
        this.checkField(field)
      } else {
        this.checkWithOutNameField(field)
      }
    }
  }

  private async removeModelFromCache(modelName: string, useApiName?: boolean) {
    const modelPromise = useApiName
      ? this.dataModelCache.apiNameModelMap[modelName]
      : this.dataModelCache.modelMap[modelName]

    if (!modelPromise) return

    const model = await modelPromise
    delete this.dataModelCache.apiNameModelMap[model.apiName]
    delete this.dataModelCache.modelMap[model.name]
  }
}
