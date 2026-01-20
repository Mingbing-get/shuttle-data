import { Knex } from 'knex'
import { DataModel, DataEnum, dataModelManager } from '@shuttle-data/type'
import { randomUUID } from 'node:crypto'

import DataEnumManager from '../enum'

import schemaFieldPluginManager from '../fieldPlugin'

export default class Schema {
  readonly userDbName: string
  private dataModelCache:
    | Promise<{
        apiNameReflexName: Record<string, string>
        modelMap: Record<string, DataModel.Define>
      }>
    | undefined
  private lockSchema: {
    id: string
    type: 'data' | 'schema'
    tableName: string
    promise: Promise<void>
    resolve: () => void
  }[] = []

  constructor(private options: DataModel.Schema.ServerOptions) {
    if (options.dataModels) {
      this.dataModelCache = Promise.resolve(
        this.modelListToCache(options.dataModels),
      )
    }

    this.userDbName = options.userDbName || '_user'
  }

  /**
   * 1. 根据model数据在数据库中创建对应的表
   * 2. 将该数据模型添加到缓存中
   * 3. 特殊处理：
   *    3.1 自动添加系统字段：_id, _createdAt, _updatedAt, _createdBy, _updatedBy
   *    3.2 检查是否存在同样名字的数据模型，保证唯一
   */
  async createTable(model: DataModel.Define) {
    model = this.fillDefaultField(model)

    await this.checkModel(model)

    if (!this.options.knex) {
      throw new Error('knex is required')
    }

    const tableNameInModel = await this.getTable(model.name)
    if (tableNameInModel) {
      throw new Error(`table ${model.name} already exists in model`)
    }

    const tableApiNameInModel = await this.getTable(model.apiName, true)
    if (tableApiNameInModel) {
      throw new Error(`table api name ${model.apiName} already exists in model`)
    }

    const tableInDb = await this.options.knex.schema.hasTable(model.name)
    if (tableInDb) {
      throw new Error(`table ${model.name} already exists in db`)
    }

    const id = await this.addUpdateSchemaPromise(model.name)
    try {
      // 实际创建表
      const factKnex = this.options.knex
      await factKnex.schema.createTable(model.name, (table) => {
        model.fields.forEach((field) => {
          if (field.name === '_id') {
            table.bigInteger('_id').primary()
          } else {
            const plugin = schemaFieldPluginManager.getPlugin(field.type)
            if (!plugin) {
              throw new Error(`field type ${field.type} plugin not found`)
            }
            plugin.fieldBuilder(table, field)
          }
        })
      })

      // 将数据模型加入到数据库
      if (this.options.modelTableConfig) {
        const modelFields = this.getModelTableFields()
        const fieldFields = this.getFieldTableFields()
        const tableConfig = this.options.modelTableConfig
        const tableKnex = tableConfig.knex || factKnex

        await this.createModelTableIfNotExist(tableKnex, tableConfig)
        await this.createFieldTableIfNotExist(
          tableKnex,
          tableConfig.fieldConfig,
        )

        await tableKnex.transaction(async (trx) => {
          await trx(tableConfig.tableName).insert({
            [modelFields.dataSourceName]: model.dataSourceName,
            [modelFields.name]: model.name,
            [modelFields.apiName]: model.apiName,
            [modelFields.label]: model.label,
            [modelFields.displayField]: model.displayField,
            [modelFields.isSystem]: model.isSystem,
            [modelFields.isDelete]: false,
            ...this.createCustomRecord(tableConfig.custom || {}, model),
          })

          await trx(tableConfig.fieldConfig.tableName).insert(
            model.fields.map((field) => ({
              [fieldFields.model]: model.name,
              [fieldFields.name]: field.name,
              [fieldFields.apiName]: field.apiName,
              [fieldFields.label]: field.label,
              [fieldFields.type]: field.type,
              [fieldFields.required]: field.required,
              [fieldFields.isSystem]: field.isSystem,
              [fieldFields.isDelete]: false,
              [fieldFields.extra]: field.extra
                ? JSON.stringify(field.extra)
                : null,
              ...this.createCustomRecord(
                tableConfig.fieldConfig.custom || {},
                field as DataModel.BaseField<any>,
              ),
            })),
          )
        })
      }

      // 更新缓存
      const allModels = await this.all()
      const newModels = {
        apiNameReflexName: {
          ...allModels.apiNameReflexName,
          [model.apiName]: model.name,
        },
        modelMap: {
          ...allModels.modelMap,
          [model.name]: model,
        },
      }
      this.dataModelCache = Promise.resolve(newModels)
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
  }

  /**
   * 1. 根据model数据在数据库中更新对应的表
   * 2. 将该数据模型添加到缓存中
   * 3. 特殊处理：
   *    3.1 自动添加系统字段：_id, _createdAt, _updatedAt, _createdBy, _updatedBy
   *    3.2 检查是否存在同样名字的数据模型，保证唯一
   */
  async updateTable(model: DataModel.Define) {
    model = this.fillDefaultField(model)

    await this.checkModel(model)

    if (!this.options.knex) {
      throw new Error('knex is required')
    }

    const oldModel = await this.getTable(model.name)
    if (!oldModel) {
      throw new Error(`table ${model.name} does not exist in model`)
    }

    const oldModelApiName = await this.getTable(model.apiName, true)
    if (oldModelApiName && oldModelApiName.name !== oldModel.name) {
      throw new Error(`table api name ${model.apiName} already exists in model`)
    }

    const tableInDb = await this.options.knex.schema.hasTable(model.name)
    if (!tableInDb) {
      throw new Error(`table ${model.name} does not exist in db`)
    }

    let needUpdateModel = false
    const canUpdateModelKeys: (keyof DataModel.Define)[] = [
      'apiName',
      'label',
      'displayField',
    ]
    canUpdateModelKeys.forEach((key) => {
      if (model[key] !== oldModel[key]) {
        needUpdateModel = true
      }
    })

    const willAddFields: DataModel.Field[] = []
    const willDropFields: DataModel.Field[] = []
    const willUpdateFields: DataModel.Field[] = []
    const canUpdateFieldKeys: (keyof DataModel.Field)[] = [
      'apiName',
      'label',
      'required',
    ]
    model.fields.forEach((field) => {
      const oldField = oldModel.fields.find((f) => f.name === field.name)
      if (!oldField) {
        willAddFields.push(field)
      } else if (!field.isSystem) {
        canUpdateFieldKeys.forEach((key) => {
          if (field[key] !== oldField[key]) {
            willUpdateFields.push(field)
          }
        })
        if (
          JSON.stringify(field.extra || {}) !==
          JSON.stringify(oldField.extra || {})
        ) {
          willUpdateFields.push(field)
        }
      }
    })
    oldModel.fields.forEach((field) => {
      if (field.isSystem) return

      if (!model.fields.find((f) => f.name === field.name)) {
        willDropFields.push(field)
      }
    })

    const id = await this.addUpdateSchemaPromise(model.name)
    try {
      const factKnex = this.options.knex
      // 若有字段被移除，则迁移数据
      if (willDropFields.length > 0) {
        await this.migrationHistory(
          model.name,
          willDropFields.map((f) => f.name),
        )
      }

      // 实际更新表
      if (willAddFields.length > 0 || willDropFields.length > 0) {
        await factKnex.schema.alterTable(model.name, (table) => {
          willAddFields.forEach((field) => {
            if (field.name === '_id') {
              table.bigInteger('_id').primary()
            } else {
              const plugin = schemaFieldPluginManager.getPlugin(field.type)
              if (!plugin) {
                throw new Error(`field type ${field.type} plugin not found`)
              }
              plugin.fieldBuilder(table, field)
            }
          })
          willDropFields.forEach((field) => {
            table.dropColumn(field.name)
          })
        })
      }

      // 将数据模型更新到数据库
      if (this.options.modelTableConfig) {
        const modelFields = this.getModelTableFields()
        const fieldFields = this.getFieldTableFields()
        const tableConfig = this.options.modelTableConfig
        const tableKnex = tableConfig.knex || factKnex

        await tableKnex.transaction(async (trx) => {
          if (needUpdateModel) {
            await trx(tableConfig.tableName)
              .where({
                [modelFields.name]: model.name,
              })
              .update({
                [modelFields.apiName]: model.apiName,
                [modelFields.label]: model.label,
                [modelFields.displayField]: model.displayField,
              })
          }

          if (willAddFields.length > 0) {
            await trx(tableConfig.fieldConfig.tableName).insert(
              willAddFields.map((field) => ({
                [fieldFields.model]: model.name,
                [fieldFields.name]: field.name,
                [fieldFields.apiName]: field.apiName,
                [fieldFields.label]: field.label,
                [fieldFields.required]: field.required,
                [fieldFields.type]: field.type,
                [fieldFields.isSystem]: field.isSystem,
                [fieldFields.isDelete]: false,
                [fieldFields.extra]: field.extra
                  ? JSON.stringify(field.extra)
                  : null,
                ...this.createCustomRecord(
                  tableConfig.fieldConfig.custom || {},
                  field as DataModel.BaseField<any>,
                ),
              })),
            )
          }

          if (willDropFields.length > 0) {
            const dropFieldName = willDropFields.map((field) => field.name)
            await trx(tableConfig.fieldConfig.tableName)
              .where(fieldFields.name, 'in', dropFieldName)
              .update({
                [fieldFields.isDelete]: true,
              })
          }

          if (willUpdateFields.length > 0) {
            // 批量更新，根据记录的名称不同更新不同的内容
            for (const field of willUpdateFields) {
              await trx(tableConfig.fieldConfig.tableName)
                .where(fieldFields.name, '=', field.name)
                .update({
                  [fieldFields.apiName]: field.apiName,
                  [fieldFields.label]: field.label,
                  [fieldFields.required]: field.required,
                  [fieldFields.extra]: field.extra
                    ? JSON.stringify(field.extra)
                    : null,
                })
            }
          }
        })
      }

      // 更新缓存
      const newModel = {
        ...oldModel,
        fields: oldModel.fields
          .reduce((total: DataModel.Field[], field) => {
            const needDrop = willDropFields.find((f) => f.name === field.name)
            if (needDrop) {
              return total
            }

            const needUpdate = willUpdateFields.find(
              (f) => f.name === field.name,
            )
            if (needUpdate) {
              total.push({
                ...field,
                apiName: needUpdate.apiName,
                label: needUpdate.label,
                required: needUpdate.required,
                extra: needUpdate.extra,
              } as any)
            } else {
              total.push(field)
            }

            return total
          }, [])
          .concat(willAddFields),
      }
      canUpdateModelKeys.forEach((key) => {
        if (model[key] !== newModel[key]) {
          ;(newModel as any)[key] = model[key]
        }
      })
      const allModels = await this.all()
      const newModels = {
        apiNameReflexName: {
          ...allModels.apiNameReflexName,
        },
        modelMap: {
          ...allModels.modelMap,
          [newModel.name]: newModel,
        },
      }
      if (newModel.apiName !== oldModel.apiName) {
        newModels.apiNameReflexName[newModel.apiName] = newModel.name
        delete newModels.apiNameReflexName[oldModel.apiName]
      }
      this.dataModelCache = Promise.resolve(newModels)
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
  }

  /**
   * 1. 根据model数据在数据库中删除对应的表
   * 2. 将该数据模型从缓存中移除
   * 3. 特殊处理：
   *    3.1 检查表是否时系统表，若是则不允许删除
   *    3.2 将该表的所有数据迁移到数据历史表
   */
  async dropTable(tableName: string, useApiName: boolean = false) {
    if (!this.options.knex) {
      throw new Error('knex is required')
    }

    const oldModel = await this.getTable(tableName, useApiName)
    if (!oldModel) {
      throw new Error(`table ${tableName} does not exist in model`)
    }

    if (oldModel.isSystem) {
      throw new Error(`table ${tableName} is system table, cannot be dropped`)
    }

    const modelInDb = await this.options.knex.schema.hasTable(tableName)
    if (!modelInDb) {
      throw new Error(`table ${tableName} does not exist in db`)
    }

    const id = await this.addUpdateSchemaPromise(oldModel.name)
    try {
      // 将该表的所有数据迁移到数据历史表
      await this.migrationHistory(
        tableName,
        oldModel.fields.map((f) => f.name),
      )

      // 实际删除表
      await this.options.knex.schema.dropTable(tableName)

      // 将数据模型从数据库中移除
      if (this.options.modelTableConfig) {
        const modelFields = this.getModelTableFields()
        const fieldFields = this.getFieldTableFields()
        const tableConfig = this.options.modelTableConfig
        const tableKnex = tableConfig.knex || this.options.knex

        await tableKnex.transaction(async (trx) => {
          await trx(tableConfig.tableName)
            .where(modelFields.name, '=', oldModel.name)
            .update({
              [modelFields.isDelete]: true,
            })

          await trx(tableConfig.fieldConfig.tableName)
            .where(fieldFields.model, '=', oldModel.name)
            .update({
              [fieldFields.isDelete]: true,
            })
        })
      }

      // 更新缓存
      const allModels = await this.all()
      const newModels = {
        apiNameReflexName: {
          ...allModels.apiNameReflexName,
        },
        modelMap: {
          ...allModels.modelMap,
        },
      }
      delete newModels.apiNameReflexName[oldModel.apiName]
      delete newModels.modelMap[oldModel.name]
      this.dataModelCache = Promise.resolve(newModels)
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
  }

  async hasTable(tableName: string, useApiName: boolean = false) {
    const dataModels = await this.all()
    if (useApiName) {
      return !!dataModels.apiNameReflexName[tableName]
    }

    return !!dataModels.modelMap[tableName]
  }

  async getTable(tableName: string, useApiName: boolean = false) {
    const dataModels = await this.all()
    if (useApiName) {
      tableName = dataModels.apiNameReflexName[tableName]
      if (!tableName) return
    }

    return dataModels.modelMap[tableName]
  }

  async addField(
    tableName: string,
    field: DataModel.Field,
    useApiName: boolean = false,
  ) {
    await this.checkField(field)

    if (!this.options.knex) {
      throw new Error('knex is required')
    }

    const oldModel = await this.getTable(tableName, useApiName)
    if (!oldModel) {
      throw new Error(`table ${tableName} does not exist in model`)
    }

    const fieldInModel = oldModel.fields.find(
      (f) => f.name === field.name || f.apiName === field.apiName,
    )
    if (fieldInModel) {
      throw new Error(
        `table ${tableName} field ${field.name}, api name ${field.apiName} already exists in model`,
      )
    }

    const fieldInDb = await this.options.knex.schema.hasColumn(
      oldModel.name,
      field.name,
    )
    if (fieldInDb) {
      throw new Error(
        `table ${tableName} field ${field.name} already exists in db`,
      )
    }

    const id = await this.addUpdateSchemaPromise(oldModel.name)
    try {
      // 实际添加字段
      await this.options.knex.schema.alterTable(oldModel.name, (table) => {
        const fieldPlugin = schemaFieldPluginManager.getPlugin(field.type)
        if (!fieldPlugin) {
          throw new Error(`field type ${field.type} is not supported`)
        }
        fieldPlugin.fieldBuilder(table, field)
      })

      // 将字段加入到数据库
      const tableConfig = this.options.modelTableConfig
      if (tableConfig) {
        const tableKnex = tableConfig.knex || this.options.knex
        const fieldFields = this.getFieldTableFields()

        await tableKnex(tableConfig.fieldConfig.tableName).insert({
          [fieldFields.model]: oldModel.name,
          [fieldFields.name]: field.name,
          [fieldFields.apiName]: field.apiName,
          [fieldFields.label]: field.label,
          [fieldFields.required]: field.required,
          [fieldFields.type]: field.type,
          [fieldFields.isSystem]: field.isSystem,
          [fieldFields.extra]: field.extra ? JSON.stringify(field.extra) : null,
          [fieldFields.isDelete]: false,
          ...this.createCustomRecord(
            tableConfig.fieldConfig.custom || {},
            field as DataModel.BaseField<any>,
          ),
        })
      }

      // 将字段加入到缓存中
      const allModels = await this.all()
      this.dataModelCache = Promise.resolve({
        apiNameReflexName: allModels.apiNameReflexName,
        modelMap: {
          ...allModels.modelMap,
          [oldModel.name]: {
            ...oldModel,
            fields: [...oldModel.fields, field],
          },
        },
      })
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
  }

  async updateField(
    tableName: string,
    field: DataModel.Field,
    useApiName: boolean = false,
  ) {
    await this.checkField(field)

    const oldModel = await this.getTable(tableName, useApiName)
    if (!oldModel) {
      throw new Error(`table ${tableName} does not exist in model`)
    }

    const oldField = oldModel.fields.find((f) => f.name === field.name)
    if (!oldField) {
      throw new Error(
        `${tableName} field ${field.name} does not exist in model`,
      )
    }

    const oldFieldApiName = oldModel.fields.find(
      (f) => f.apiName === field.apiName,
    )
    if (oldFieldApiName && oldFieldApiName.name !== oldField.name) {
      throw new Error(
        `${tableName} field api name ${field.apiName} already exists in model`,
      )
    }

    if (oldField.isSystem) {
      throw new Error(
        `${tableName} field ${field.name} is system field, cannot be updated`,
      )
    }

    const id = await this.addUpdateSchemaPromise(oldModel.name)
    try {
      // 将字段在数据库中更新
      const tableConfig = this.options.modelTableConfig
      if (tableConfig) {
        const tableKnex = tableConfig.knex || this.options.knex
        if (!tableKnex) {
          throw new Error('knex is required')
        }

        const fieldFields = this.getFieldTableFields()
        await tableKnex(tableConfig.fieldConfig.tableName)
          .where(fieldFields.name, '=', field.name)
          .update({
            [fieldFields.apiName]: field.apiName,
            [fieldFields.label]: field.label,
            [fieldFields.required]: field.required,
            [fieldFields.extra]: field.extra
              ? JSON.stringify(field.extra)
              : null,
          })
      }

      // 将字段在缓存中更新
      const newField = {
        ...oldField,
        apiName: field.apiName,
        label: field.label,
        required: field.required,
        extra: field.extra,
      } as DataModel.Field
      const allModels = await this.all()
      this.dataModelCache = Promise.resolve({
        apiNameReflexName: allModels.apiNameReflexName,
        modelMap: {
          ...allModels.modelMap,
          [oldModel.name]: {
            ...oldModel,
            fields: [
              ...oldModel.fields.filter((f) => f.name !== field.name),
              newField,
            ],
          },
        },
      })
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
  }

  async dropField(
    tableName: string,
    fieldName: string,
    useApiName: boolean = false,
  ) {
    if (!this.options.knex) {
      throw new Error('knex is required')
    }

    const oldModel = await this.getTable(tableName, useApiName)
    if (!oldModel) {
      throw new Error(`table ${tableName} does not exist in model`)
    }

    const oldField = oldModel.fields.find((f) =>
      useApiName ? f.apiName === fieldName : f.name === fieldName,
    )
    if (!oldField) {
      throw new Error(
        `table ${tableName} field ${fieldName} does not exist in model`,
      )
    }

    if (oldModel.displayField === oldField.name) {
      throw new Error(
        `table ${tableName} field ${fieldName} is display field, cannot be dropped`,
      )
    }

    if (oldField.isSystem) {
      throw new Error(
        `table ${tableName} field ${fieldName} is system field, cannot be dropped`,
      )
    }

    const fieldInDb = await this.options.knex.schema.hasColumn(
      oldModel.name,
      oldField.name,
    )
    if (!fieldInDb) {
      throw new Error(
        `table ${tableName} field ${fieldName} does not exist in db`,
      )
    }

    const id = await this.addUpdateSchemaPromise(oldModel.name)
    try {
      // 将该字段的所有数据迁移到历史记录表中
      await this.migrationHistory(oldModel.name, [oldField.name])

      // 实际删除字段
      await this.options.knex.schema.alterTable(oldModel.name, (table) => {
        table.dropColumn(oldField.name)
      })

      // 在数据库中将字段标记为删除
      const tableConfig = this.options.modelTableConfig
      if (tableConfig) {
        const tableKnex = tableConfig.knex || this.options.knex

        const fieldFields = this.getFieldTableFields()
        await tableKnex(tableConfig.fieldConfig.tableName)
          .where(fieldFields.name, '=', oldField.name)
          .update({
            [fieldFields.isDelete]: true,
          })
      }

      // 将字段从缓存中删除
      const allModels = await this.all()
      this.dataModelCache = Promise.resolve({
        apiNameReflexName: allModels.apiNameReflexName,
        modelMap: {
          ...allModels.modelMap,
          [oldModel.name]: {
            ...oldModel,
            fields: oldModel.fields.filter((f) => f.name !== oldField.name),
          },
        },
      })
    } catch (error) {
      throw error
    } finally {
      this.unlockPromise(id)
    }
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

  async all() {
    if (!this.dataModelCache) {
      this.dataModelCache = (async () => {
        if (!this.options.modelTableConfig) {
          throw new Error(
            'modelTableConfig is required when dataModels is not provided',
          )
        }

        const tableKnex =
          this.options.modelTableConfig.knex || this.options.knex
        if (!tableKnex) {
          throw new Error('model`s knex is required')
        }

        // 判断是否存在数据模型存储表
        const hasModelTable = await tableKnex.schema.hasTable(
          this.options.modelTableConfig.tableName,
        )

        if (!hasModelTable) {
          return this.modelListToCache([])
        }

        const modelTables: Omit<DataModel.Define, 'fields'>[] = await tableKnex(
          this.options.modelTableConfig.tableName,
        )
          .select(
            this.getModelTableFields(),
            ...Object.keys(this.options.modelTableConfig.custom || {}),
          )
          .where('isDelete', '<>', true)

        const hasFieldTable = await tableKnex.schema.hasTable(
          this.options.modelTableConfig.fieldConfig.tableName,
        )

        if (!hasFieldTable) {
          return this.modelListToCache(
            modelTables.map((model) => ({
              ...model,
              fields: [],
            })),
          )
        }

        const modelFields: (DataModel.Field & { model: string })[] =
          await tableKnex(this.options.modelTableConfig.fieldConfig.tableName)
            .select(
              this.getFieldTableFields(),
              ...Object.keys(
                this.options.modelTableConfig.fieldConfig.custom || {},
              ),
            )
            .where('isDelete', '<>', true)

        return this.modelListToCache(
          modelTables.map((model) => ({
            ...model,
            fields: modelFields.filter((field) => field.model === model.name),
          })),
        )
      })()

      this.dataModelCache.catch((error) => {
        this.dataModelCache = undefined
        throw error
      })
    }

    return this.dataModelCache
  }

  private getModelTableFields() {
    const modelTableFieldMap: Record<
      keyof Omit<DataModel.Define, 'fields'> | 'isDelete',
      string
    > = {
      name: 'name',
      apiName: 'apiName',
      label: 'label',
      dataSourceName: 'dataSourceName',
      displayField: 'displayField',
      isDelete: 'isDelete',
      isSystem: 'isSystem',
    }

    const modleTableConfig = this.options.modelTableConfig || {}
    for (const key in modelTableFieldMap) {
      const factFieldName = (modleTableConfig as any)[`${key}Field`]
      if (factFieldName) {
        modelTableFieldMap[key as keyof typeof modelTableFieldMap] =
          factFieldName
      }
    }

    return modelTableFieldMap
  }

  private getFieldTableFields() {
    const fieldTableFieldMap: Record<
      keyof DataModel.BaseField<any> | 'isDelete' | 'model',
      string
    > = {
      model: 'model',
      type: 'type',
      name: 'name',
      apiName: 'apiName',
      label: 'label',
      required: 'required',
      extra: 'extra',
      isDelete: 'isDelete',
      isSystem: 'isSystem',
    }

    const fieldTableConfig = this.options.modelTableConfig?.fieldConfig || {}
    for (const key in fieldTableFieldMap) {
      const factFieldName = (fieldTableConfig as any)[`${key}Field`]
      if (factFieldName) {
        fieldTableFieldMap[key as keyof typeof fieldTableFieldMap] =
          factFieldName
      }
    }

    return fieldTableFieldMap
  }

  private getHistoryTableFields() {
    const historyTableFieldMap: Record<
      keyof DataModel.Schema.DataHistory,
      string
    > = {
      tableName: 'tableName',
      value: 'value',
    }

    const historyTableConfig = this.options.dataHistoryConfig || {}
    for (const key in historyTableFieldMap) {
      const factFieldName = (historyTableConfig as any)[`${key}Field`]
      if (factFieldName) {
        historyTableFieldMap[key as keyof typeof historyTableFieldMap] =
          factFieldName
      }
    }

    return historyTableFieldMap
  }

  private async migrationHistory(tableName: string, fields: string[]) {
    if (!fields.length) return

    const historyConfig = this.options.dataHistoryConfig
    if (!historyConfig) return

    const originKnex = this.options.knex
    if (!originKnex) {
      throw new Error('knex is required')
    }
    const historyKnex = historyConfig.knex || originKnex

    await this.createHistoryTableIfNotExist(historyKnex, historyConfig)

    const willMigrateRecords = await originKnex(tableName).select(
      ...fields,
      '_id',
    )

    if (willMigrateRecords.length === 0) return

    const historyTableFieldMap = this.getHistoryTableFields()
    const willInsertMigrateData: Record<string, any>[] = []
    for (const record of willMigrateRecords) {
      willInsertMigrateData.push({
        [historyTableFieldMap.tableName]: tableName,
        [historyTableFieldMap.value]: JSON.stringify(record),
      })
    }

    await historyKnex(historyConfig.tableName).insert(willInsertMigrateData)
  }

  private async createModelTableIfNotExist(
    knex: Knex,
    modelTableConfig: DataModel.Schema.ModelTableConfig,
  ) {
    const hasModelTable = await knex.schema.hasTable(modelTableConfig.tableName)
    if (hasModelTable) return

    const modelTableFieldMap = this.getModelTableFields()

    await knex.schema.createTable(modelTableConfig.tableName, (table) => {
      table.string(modelTableFieldMap.name).primary()
      table.string(modelTableFieldMap.apiName)
      table.string(modelTableFieldMap.label)
      table.string(modelTableFieldMap.dataSourceName).notNullable()
      table.string(modelTableFieldMap.displayField).notNullable()
      table.boolean(modelTableFieldMap.isDelete).defaultTo(false)
      table.boolean(modelTableFieldMap.isSystem).defaultTo(false)
      Object.values(modelTableConfig.custom || {}).forEach((customField) => {
        customField.builder(table)
      })
    })
  }

  private async createFieldTableIfNotExist(
    knex: Knex,
    fieldConfig: DataModel.Schema.ModelFieldConfig,
  ) {
    const hasFieldTable = await knex.schema.hasTable(fieldConfig.tableName)
    if (hasFieldTable) return

    const fieldTableFieldMap = this.getFieldTableFields()

    await knex.schema.createTable(fieldConfig.tableName, (table) => {
      table.string(fieldTableFieldMap.model).notNullable()
      table.string(fieldTableFieldMap.type, 20).notNullable()
      table.string(fieldTableFieldMap.name)
      table.string(fieldTableFieldMap.apiName)
      table.string(fieldTableFieldMap.label)
      table.boolean(fieldTableFieldMap.required).defaultTo(false)
      table.json(fieldTableFieldMap.extra)
      table.boolean(fieldTableFieldMap.isDelete).defaultTo(false)
      table.boolean(fieldTableFieldMap.isSystem).defaultTo(false)
      Object.values(fieldConfig.custom || {}).forEach((customField) => {
        customField.builder(table)
      })
    })
  }

  private async createHistoryTableIfNotExist(
    knex: Knex,
    historyConfig: DataModel.Schema.DataHistoryConfig,
  ) {
    const hasHistoryTable = await knex.schema.hasTable(historyConfig.tableName)
    if (hasHistoryTable) return

    const historyTableFieldMap = this.getHistoryTableFields()

    await knex.schema.createTable(historyConfig.tableName, (table) => {
      table.string(historyTableFieldMap.tableName).notNullable()
      table.json(historyTableFieldMap.value).notNullable()
    })
  }

  private async addUpdateSchemaPromise(tableName: string) {
    // 需要等待所有的schema、data变更完成后才可以继续
    while (true) {
      const updateSchemaPromise = this.lockSchema.find(
        (item) => item.tableName === tableName,
      )
      if (updateSchemaPromise) {
        await updateSchemaPromise.promise
      } else {
        break
      }
    }

    const { promise, resolve } = Promise.withResolvers<void>()
    const id = randomUUID()
    this.lockSchema.push({
      id,
      type: 'schema',
      tableName,
      promise,
      resolve,
    })

    return id
  }

  // 添加数据锁
  async addLockPromise(tableName: string, useApiName: boolean = false) {
    const modal = await this.getTable(tableName, useApiName)
    if (!modal) {
      throw new Error(`table ${tableName} is not found`)
    }

    const { promise, resolve } = Promise.withResolvers<void>()
    const id = randomUUID()
    this.lockSchema.push({
      id,
      type: 'data',
      tableName: modal.name,
      promise,
      resolve,
    })

    return id
  }

  // 解除锁
  unlockPromise(id: string) {
    const updateSchemaPromise = this.lockSchema.find((item) => item.id === id)
    if (!updateSchemaPromise) return

    this.lockSchema = this.lockSchema.filter((item) => item.id !== id)
    updateSchemaPromise.resolve()
  }

  // 等待锁
  async waitUpdateSchema(tableName: string, useApiName: boolean = false) {
    if (useApiName) {
      const model = await this.getTable(tableName, useApiName)
      if (!model) return

      tableName = model.name
    }

    while (true) {
      const updateSchemaPromise = this.lockSchema.find(
        (item) => item.tableName === tableName && item.type === 'schema',
      )
      if (updateSchemaPromise) {
        await updateSchemaPromise.promise
      } else {
        break
      }
    }
  }

  async checkModel(model: DataModel.Define) {
    const modelZod = dataModelManager.getZod()

    modelZod.parse(model)

    const displayField = model.fields.find(
      (field) => field.name === model.displayField,
    )
    if (!displayField) {
      throw new Error(
        `display field ${model.displayField} is not found in model ${model.name}`,
      )
    }
    const displayFieldPlugin = schemaFieldPluginManager.getPlugin(
      displayField.type,
    )
    if (!displayFieldPlugin?.canAsDisplay) {
      throw new Error(
        `field ${displayField.name} type ${displayField.type} is not supported as display field`,
      )
    }

    for (const field of model.fields) {
      await this.checkField(field)
    }
  }

  async checkField(field: DataModel.Field) {
    const fieldPlugin = schemaFieldPluginManager.getPlugin(field.type)
    if (!fieldPlugin) {
      throw new Error(`field type ${field.type} is not supported`)
    }

    await fieldPlugin.check(this, field)
  }

  fillDefaultField(model: DataModel.Define) {
    const systemFields = this.getSystemFields()
    const systemFieldNames = systemFields.map((field) => field.name)
    const otherFields = model.fields.filter(
      (field) => !systemFieldNames.includes(field.name),
    )

    return {
      ...model,
      fields: [...systemFields, ...otherFields],
    }
  }

  getSystemFields() {
    const fields: DataModel.Field[] = [
      {
        name: '_id',
        apiName: '_id',
        label: 'ID',
        type: 'string',
        isSystem: true,
        required: true,
      },
      {
        name: '_createdAt',
        apiName: '_createdAt',
        label: 'Created At',
        type: 'datetime',
        isSystem: true,
        required: true,
      },
      {
        name: '_updatedAt',
        apiName: '_updatedAt',
        label: 'Updated At',
        type: 'datetime',
        isSystem: true,
        required: true,
      },
      {
        name: '_createdBy',
        apiName: '_createdBy',
        label: 'Created By',
        type: 'lookup',
        isSystem: true,
        required: true,
        extra: {
          modalName: this.userDbName,
        },
      },
      {
        name: '_updatedBy',
        apiName: '_updatedBy',
        label: 'Updated By',
        type: 'lookup',
        isSystem: true,
        required: true,
        extra: {
          modalName: this.userDbName,
        },
      },
      {
        name: '_isDelete',
        apiName: '_isDelete',
        label: 'Is Delete',
        type: 'boolean',
        isSystem: true,
        required: true,
      },
    ]

    return fields
  }

  getEnumManager() {
    const enumManagerOptions = this.options.enumSourceConfig
    if (!enumManagerOptions) {
      return new DataEnumManager({})
    }

    const options = {
      ...enumManagerOptions,
    }

    if (options.groupTableConfig && !options.groupTableConfig.knex) {
      if (this.options.knex) {
        options.groupTableConfig = {
          ...options.groupTableConfig,
          knex: this.options.knex,
        }
      } else {
        delete options.groupTableConfig
      }
    }

    return new DataEnumManager(options as DataEnum.ServerManagerOptions)
  }

  private modelListToCache(models: DataModel.Define[]) {
    return {
      apiNameReflexName: models.reduce((prev: Record<string, string>, cur) => {
        prev[cur.apiName] = cur.name
        return prev
      }, {}),
      modelMap: models.reduce((prev: Record<string, DataModel.Define>, cur) => {
        prev[cur.name] = cur
        return prev
      }, {}),
    }
  }

  private createCustomRecord<T>(
    custom: Partial<Record<keyof T, DataModel.Schema.CustomField<T>>>,
    v: T,
  ) {
    const customRecord: Record<keyof T, any> = {} as Record<keyof T, any>
    for (const key in custom) {
      customRecord[key] = (custom as any)[key].onCreate(v)
    }
    return customRecord
  }
}
