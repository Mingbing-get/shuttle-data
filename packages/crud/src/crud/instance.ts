import { Knex } from 'knex'
import {
  DataCRUD,
  DataModel,
  DataCondition,
  DataEnum,
} from '@shuttle-data/type'

import crudFieldPluginManager from './plugins'

import type { NCRUD } from './type'

export default class CRUD<M extends Record<string, any>> {
  static readonly ID = '_id'
  static readonly DISPLAY = '_display'
  static readonly CREATED_AT = '_createdAt'
  static readonly UPDATED_AT = '_updatedAt'
  static readonly CREATED_BY = '_createdBy'
  static readonly UPDATED_BY = '_updatedBy'
  static readonly IS_DELETE = '_isDelete'

  constructor(private options: NCRUD.Options) {}

  async find(option: DataCRUD.FindOption<M> = {}): Promise<M[]> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )
    const enumInfo = await this.options.schema.getEnumManager().all()

    try {
      const model = await this.getCurrentModel()
      const selectFields = this.getSelectFields(model, option.fields)

      const knex = await this.options.getKnex(model.dataSourceName)
      const builder = knex(model.name)
      builder
        .orWhere((builder) => {
          builder.whereNull(CRUD.IS_DELETE).orWhere(CRUD.IS_DELETE, '=', false)
        })
        .andWhere((builder) => {
          this.createCondition(builder, model, enumInfo, option.condition)
        })
      this.createOrder(builder, model, option.orders)
      if (option.limit !== undefined) {
        builder.limit(option.limit)
      }
      if (option.offset !== undefined) {
        builder.offset(option.offset)
      }

      const records = await builder.select(
        ...Object.keys(selectFields),
        CRUD.ID,
        this.createDisplaySelectField(model),
      )

      return (await this.toOutput(model, records, selectFields)) as M[]
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  create(
    data: DataCRUD.CreateInput<M>,
    returnFields?: DataCRUD.SelectField<M>[],
  ): Promise<M>
  create(
    data: DataCRUD.CreateInput<M>[],
    returnFields?: DataCRUD.SelectField<M>[],
  ): Promise<M[]>
  async create(
    data: DataCRUD.CreateInput<M> | DataCRUD.CreateInput<M>[],
    returnFields?: DataCRUD.SelectField<M>[],
  ): Promise<M | M[]> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const model = await this.getCurrentModel()
      const dbRecords = await this.toDb(
        model,
        Array.isArray(data) ? data : [data],
        'create',
      )

      if (dbRecords.length === 0) {
        throw new Error('Create data can not be empty')
      }

      const knex = await this.options.getKnex(model.dataSourceName)
      await knex(model.name).insert(dbRecords)

      const selectFields = this.getSelectFields(model, returnFields)
      const outputRecords = (await this.toOutput(
        model,
        this.pickValueFromRecords(
          dbRecords,
          selectFields,
          model.displayField || CRUD.ID,
        ),
        selectFields,
      )) as M[]

      if (Array.isArray(data)) {
        return outputRecords
      }
      return outputRecords[0]
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  private createDisplaySelectField(model: DataModel.Define) {
    return {
      [CRUD.DISPLAY]: model.displayField || CRUD.ID,
    }
  }

  private getSelectFields(
    model: DataModel.Define,
    fields?: DataCRUD.SelectField<M>[],
  ) {
    const selectFieldReflex: Record<string, string> = {}

    if (!fields?.length) {
      model.fields.forEach((field) => {
        selectFieldReflex[field.name] = this.options.useApiName
          ? field.apiName
          : field.name
      })
    } else {
      fields.forEach((field) => {
        if (typeof field === 'string') {
          const factField = model.fields.find((f) =>
            this.options.useApiName ? f.apiName === field : f.name === field,
          )
          if (!factField) {
            throw new Error(`Field ${field} not found`)
          }
          selectFieldReflex[factField.name] = field
        } else {
          for (const key in field) {
            const factField = model.fields.find((f) =>
              this.options.useApiName ? f.apiName === key : f.name === key,
            )
            if (!factField) {
              throw new Error(`Field ${key} not found`)
            }
            selectFieldReflex[factField.name] = field[key] as string
          }
        }
      })
    }

    return selectFieldReflex
  }

  private createOrder(
    builder: Knex.QueryBuilder,
    model: DataModel.Define,
    orders?: DataCRUD.OrderBy<M>[],
  ) {
    orders?.forEach((order) => {
      const field = model.fields.find((f) =>
        this.options.useApiName
          ? f.apiName === order.key
          : f.name === order.key,
      )

      if (!field) {
        throw new Error(`Field ${order.key} not found`)
      }

      if (order.desc) {
        builder.orderBy(field.name, 'desc')
      } else {
        builder.orderBy(field.name, 'asc')
      }
    })
  }

  private createCondition(
    builder: Knex.QueryBuilder,
    model: DataModel.Define,
    enumInfo: {
      apiNameReflexName: Record<string, string>
      groupMap: Record<string, DataEnum.Group>
    },
    condition?: DataCondition.Define<M>,
  ) {
    if (!condition) return

    if (condition.op === 'and' || condition.op === 'or') {
      builder.where((builder) => {
        condition.subCondition.forEach((item) => {
          this.createCondition(
            condition.op === 'and' ? builder.and : builder.or,
            model,
            enumInfo,
            item,
          )
        })
      })
      return
    }

    const field = model.fields.find((f) =>
      this.options.useApiName
        ? f.apiName === condition.key
        : f.name === condition.key,
    )
    if (!field) {
      throw new Error(`Field ${condition.key} not found`)
    }

    const plugin = crudFieldPluginManager.getPlugin(field.type)
    if (!plugin) {
      throw new Error(`Plugin for field ${field.type} not found`)
    }

    plugin.createCondition({
      schema: this.options.schema,
      builder,
      enumInfo,
      field,
      condition,
      useApiName: this.options.useApiName,
    })
  }

  private pickValueFromRecords(
    records: Record<string, any>[],
    selectFields: Record<string, string>,
    displayField: string,
  ) {
    return records.map((record) => {
      const outputRecord: Record<string, any> = {
        [CRUD.ID]: record[CRUD.ID],
        [CRUD.DISPLAY]: record[displayField],
      }
      for (const key in selectFields) {
        outputRecord[key] = record[key]
      }
      return outputRecord
    })
  }

  private async toOutput(
    model: DataModel.Define,
    records: Record<string, any>[],
    selectFields: Record<string, string>,
  ) {
    if (records.length === 0) return []

    const fieldWithPlugin: Record<
      string,
      {
        field: DataModel.Field
        plugin: NCRUD.FieldPlugin<any>
      }
    > = {}
    for (const key in selectFields) {
      const field = model.fields.find((f) => f.name === key)
      if (!field) {
        throw new Error(`Field ${key} not found`)
      }

      const plugin = crudFieldPluginManager.getPlugin(field.type)
      if (!plugin) {
        throw new Error(`Plugin for field ${field.type} not found`)
      }

      fieldWithPlugin[key] = {
        field,
        plugin,
      }
    }

    for (const key in selectFields) {
      const { field, plugin } = fieldWithPlugin[key]
      const displayKey = selectFields[key]
      if (!plugin.toOutput) {
        if (displayKey !== key) {
          records.forEach((record) => {
            record[displayKey] = record[key]
            delete record[key]
          })
        }
      } else {
        const values = records.map((record) => record[key])
        const afterTransformValues = await plugin.toOutput({
          generateId: this.options.generateId,
          getKnex: this.options.getKnex,
          schema: this.options.schema,
          field,
          values,
          useApiName: this.options.useApiName,
          context: this.options.context,
        })
        records.forEach((record, index) => {
          delete record[key]
          record[displayKey] = afterTransformValues[index]
        })
      }
    }

    return records
  }

  private async toDb(
    model: DataModel.Define,
    records: Record<string, any>[],
    action: 'create' | 'update',
  ) {
    if (records.length === 0) return []

    const fieldWithPlugin: Record<
      string,
      {
        field: DataModel.Field
        plugin: NCRUD.FieldPlugin<any>
      }
    > = {}
    const skipFieldNames = [
      CRUD.ID,
      CRUD.CREATED_AT,
      CRUD.UPDATED_AT,
      CRUD.CREATED_BY,
      CRUD.UPDATED_BY,
    ]

    for (const field of model.fields) {
      if (skipFieldNames.includes(field.name)) continue

      const plugin = crudFieldPluginManager.getPlugin(field.type)
      if (!plugin) {
        throw new Error(`Plugin for field ${field.type} not found`)
      }

      fieldWithPlugin[this.options.useApiName ? field.apiName : field.name] = {
        field,
        plugin,
      }
    }

    const now = new Date()
    const toDbRecords: Record<string, any>[] = records.map((record) => {
      if (action === 'create') {
        return {
          ...record,
          [CRUD.ID]: this.options.generateId(),
          [CRUD.CREATED_AT]: now,
          [CRUD.UPDATED_AT]: now,
          [CRUD.CREATED_BY]: this.options.context.user._id,
          [CRUD.UPDATED_BY]: this.options.context.user._id,
        }
      }

      return {
        ...record,
        [CRUD.UPDATED_AT]: now,
        [CRUD.UPDATED_BY]: this.options.context.user._id,
      }
    })

    for (const key in fieldWithPlugin) {
      const { field, plugin } = fieldWithPlugin[key]
      if (!plugin.toDb) {
        if (key !== field.name) {
          toDbRecords.forEach((record) => {
            record[field.name] = record[key]
            delete record[key]
          })
        }

        continue
      }

      const values = toDbRecords.map((record) => record[key])
      const afterTransformValues = await plugin.toDb({
        generateId: this.options.generateId,
        getKnex: this.options.getKnex,
        schema: this.options.schema,
        field,
        values,
        useApiName: this.options.useApiName,
        context: this.options.context,
      })
      if (key !== field.name) {
        toDbRecords.forEach((record, index) => {
          record[field.name] = afterTransformValues[index]
          delete record[key]
        })
      } else {
        toDbRecords.forEach((record, index) => {
          record[field.name] = afterTransformValues[index]
        })
      }
    }

    return toDbRecords
  }

  private async getCurrentModel() {
    const { schema, modelName, useApiName } = this.options
    const model = await schema.getTable(modelName, useApiName)
    if (!model) {
      throw new Error(`Model ${modelName} not found`)
    }
    return model
  }
}
