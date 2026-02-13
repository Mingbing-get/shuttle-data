import { DataModel, dataModelManager } from '@shuttle-data/type'

export default class Schema {
  private dataModelCache: {
    apiNameModelMap: Record<string, Promise<DataModel.Define>>
    modelMap: Record<string, Promise<DataModel.Define>>
  } = {
    apiNameModelMap: {},
    modelMap: {},
  }
  private tableListCache:
    | Promise<Omit<DataModel.Define, 'fields'>[]>
    | undefined

  private observerTableList: DataModel.Schema.ObserverTableListCallback[] = []

  private observerList: {
    tableName: string
    useApiName: boolean
    callbacks: DataModel.Schema.ObserverCallback[]
  }[] = []

  constructor(private options: DataModel.Schema.Options) {
    this.options.tables?.forEach((model) => {
      this.dataModelCache.apiNameModelMap[model.apiName] =
        Promise.resolve(model)
      this.dataModelCache.modelMap[model.name] = Promise.resolve(model)
    })

    if (this.options.tables) {
      this.tableListCache = Promise.resolve(this.options.tables)
    }
  }

  async createTable(model: DataModel.WithoutNameModel) {
    this.checkWithOutNameModel(model)

    await this.options.transporter.createTable(model)
    this.clearTableList()
  }

  async updateTable(model: DataModel.MabyFieldNameModel) {
    this.checkModelWhenUpdate(model)

    await this.options.transporter.updateTable(model)
    await this.removeModelFromCache(model.name)
    this.clearTableList()
  }

  async dropTable(tableName: string, useApiName: boolean = false) {
    await this.options.transporter.dropTable(tableName, useApiName)

    await this.removeModelFromCache(tableName, useApiName)
    this.clearTableList()
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
      modelPromise.then((model) => {
        if (model) {
          this.trigger(model)
        }
      })
    }

    return modelPromise
  }

  async getTableList() {
    if (!this.tableListCache) {
      this.tableListCache = this.options.transporter.getTableList()
      this.tableListCache.then((tableList) => {
        this.triggerTableList(tableList)
      })
    }

    return this.tableListCache
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

    this.checkFieldNameAndApiNameIsUnique(model.fields)

    for (const field of model.fields) {
      this.checkField(field)
    }
  }

  checkWithOutNameModel(model: DataModel.WithoutNameModel) {
    const modelZod = dataModelManager.getZod().omit({
      name: true,
    })

    modelZod.parse(model)

    this.checkFieldNameAndApiNameIsUnique(model.fields)

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

  checkModelWhenUpdate(model: DataModel.MabyFieldNameModel) {
    const modelZod = dataModelManager.getZod()

    modelZod.parse(model)

    this.checkFieldNameAndApiNameIsUnique(model.fields)

    for (const field of model.fields) {
      if ('name' in field) {
        this.checkField(field)
      } else {
        this.checkWithOutNameField(field)
      }
    }
  }

  private checkFieldNameAndApiNameIsUnique(
    fields: (DataModel.WithoutNameField | DataModel.Field)[],
  ) {
    const nameList: string[] = []
    const apiNameList: string[] = []

    fields.forEach((field) => {
      if ('name' in field && field.name) {
        if (nameList.includes(field.name)) {
          throw new Error(`field name ${field.name} is not unique`)
        }
        nameList.push(field.name)
      }
      if (field.apiName) {
        if (apiNameList.includes(field.apiName)) {
          throw new Error(`field apiName ${field.apiName} is not unique`)
        }
        apiNameList.push(field.apiName)
      }
    })
  }

  observe(
    callback: DataModel.Schema.ObserverCallback,
    tableName: string,
    useApiName: boolean = false,
  ) {
    let observer = this.observerList.find((item) => {
      return item.tableName === tableName && item.useApiName === useApiName
    })

    if (observer) {
      observer.callbacks.push(callback)
    } else {
      observer = {
        tableName,
        useApiName,
        callbacks: [callback],
      }
      this.observerList.push(observer)
    }

    return () => {
      observer.callbacks = observer.callbacks.filter(
        (item) => item !== callback,
      )
    }
  }

  observeTableList(callback: DataModel.Schema.ObserverTableListCallback) {
    this.observerTableList.push(callback)

    return () => {
      this.observerTableList = this.observerTableList.filter(
        (item) => item !== callback,
      )
    }
  }

  private clearTableList() {
    this.tableListCache = undefined
    this.triggerTableList()
  }

  private async removeModelFromCache(modelName: string, useApiName?: boolean) {
    const modelPromise = useApiName
      ? this.dataModelCache.apiNameModelMap[modelName]
      : this.dataModelCache.modelMap[modelName]

    if (!modelPromise) return

    const model = await modelPromise
    delete this.dataModelCache.apiNameModelMap[model.apiName]
    delete this.dataModelCache.modelMap[model.name]
    this.trigger(model, true)
  }

  private trigger(model: DataModel.Define, remove: boolean = false) {
    const observers = this.observerList.filter((item) => {
      return (
        (item.tableName === model.name && !item.useApiName) ||
        (item.tableName === model.apiName && item.useApiName)
      )
    })

    observers.forEach((observer) => {
      observer.callbacks.forEach((callback) => {
        callback(remove ? undefined : model)
      })
    })
  }

  private triggerTableList(tableList?: Omit<DataModel.Define, 'fields'>[]) {
    this.observerTableList.forEach((callback) => {
      callback(tableList)
    })
  }
}
