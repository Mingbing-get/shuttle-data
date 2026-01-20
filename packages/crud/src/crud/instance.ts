import { Knex } from 'knex'
import {
  DataCRUD,
  DataModel,
  DataCondition,
  DataEnum,
} from '@shuttle-data/type'

import crudFieldPluginManager from './plugins'

export default class CRUD<M extends Record<string, any>> {
  static readonly ID = '_id'
  static readonly DISPLAY = '_display'
  static readonly CREATED_AT = '_createdAt'
  static readonly UPDATED_AT = '_updatedAt'
  static readonly CREATED_BY = '_createdBy'
  static readonly UPDATED_BY = '_updatedBy'
  static readonly IS_DELETE = '_isDelete'

  constructor(private options: DataCRUD.Server.Options) {}

  async findOne(
    option: DataCRUD.FineOneOption<M> = {},
  ): Promise<M | undefined> {
    const records = await this.find({ ...option, limit: 1 })
    return records[0]
  }

  async find(option: DataCRUD.FindOption<M> = {}): Promise<M[]> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const checkpermissionRes = await this.checkPermission(
        'read',
        option.fields,
      )
      if (!checkpermissionRes) return []

      const enumInfo = await this.options.schema.getEnumManager().all()
      const model = await this.getCurrentModel()
      const selectFields = this.omitFields(
        await this.getSelectFields(option.fields),
        checkpermissionRes.fieldNames,
      )

      const knex = await this.options.getKnex(model.dataSourceName)
      const builder = knex(model.name)
      builder
        .where((builder) => {
          builder.whereNull(CRUD.IS_DELETE).orWhere(CRUD.IS_DELETE, '=', false)
        })
        .andWhere((builder) => {
          this.createCondition(builder, model, enumInfo, option.condition)
        })
        .andWhere((builder) => {
          this.createCondition(
            builder,
            model,
            enumInfo,
            checkpermissionRes.condition,
          )
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

      return (await this.toOutput(records, selectFields)) as M[]
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  async count(option: DataCRUD.CountOption<M> = {}): Promise<number> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const checkpermissionRes = await this.checkPermission('read')
      if (!checkpermissionRes) return 0

      const enumInfo = await this.options.schema.getEnumManager().all()
      const model = await this.getCurrentModel()
      const knex = await this.options.getKnex(model.dataSourceName)
      const builder = knex(model.name)
      builder
        .orWhere((builder) => {
          builder.whereNull(CRUD.IS_DELETE).orWhere(CRUD.IS_DELETE, '=', false)
        })
        .andWhere((builder) => {
          this.createCondition(builder, model, enumInfo, option.condition)
        })
        .andWhere((builder) => {
          this.createCondition(
            builder,
            model,
            enumInfo,
            checkpermissionRes.condition,
          )
        })

      const res = await builder.count(CRUD.ID, { as: 'count' })
      return Number(res[0].count) || 0
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  async create(option: DataCRUD.CreateOption<M>): Promise<string> {
    const records = await this._create(option)
    return records[0]
  }

  async batchCreate(option: DataCRUD.BatchCreateOption<M>): Promise<string[]> {
    return this._create(option)
  }

  private async _create(
    option: DataCRUD.CreateOption<M> | DataCRUD.BatchCreateOption<M>,
  ): Promise<string[]> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const checkpermissionRes = await this.checkPermission('create')
      if (!checkpermissionRes) {
        throw new Error('Create permission denied')
      }

      const model = await this.getCurrentModel()
      const dbRecords = await this.toDb(
        Array.isArray(option.data) ? option.data : [option.data],
        'create',
      )

      if (dbRecords.length === 0) {
        throw new Error('Create data can not be empty')
      }

      const knex = await this.options.getKnex(model.dataSourceName)
      await knex(model.name).insert(dbRecords)

      this.triggerCreate(dbRecords)
      return dbRecords.map((record) => record[CRUD.ID])
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  async update(
    option: DataCRUD.UpdateOption<M> | DataCRUD.UpdateWithIdOption<M>,
  ): Promise<string[]> {
    if (this.isWithIdUpdateOption(option) && option.data.length === 0) {
      throw new Error('Update data can not be empty')
    }

    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const updateFieldNames = await this.getFieldNamesFromUpdateData(
        option.data,
      )
      const checkpermissionRes = await this.checkPermission(
        'update',
        updateFieldNames,
      )
      if (!checkpermissionRes) {
        throw new Error('Update permission denied')
      }

      const model = await this.getCurrentModel()
      const crud = new CRUD<M>({
        ...this.options,
        modelName: model.name,
        useApiName: false,
        onCheckPermission: undefined,
      })
      const beforeUpdateRecords = await crud.find({
        condition: this.createAndCondition(
          this.isWithIdUpdateOption(option)
            ? {
                key: CRUD.ID,
                op: 'in',
                value: option.data.map((item) => item._id),
              }
            : option.condition,
          checkpermissionRes.condition,
        ),
      })

      const knex = await this.options.getKnex(model.dataSourceName)
      const willUpdateIds: string[] = beforeUpdateRecords.map(
        (record) => record[CRUD.ID],
      )
      if (this.isWithIdUpdateOption(option)) {
        const notUpdateRecords = option.data.filter(
          (item) => !willUpdateIds.includes(item._id),
        )
        if (notUpdateRecords.length > 0) {
          throw new Error(
            `Can not update records with id ${notUpdateRecords.map(
              (item) => item._id,
            )}`,
          )
        }

        const dbRecords = await this.toDb(option.data, 'update')
        const { fieldCaseList, values } = await this.createUpdateCase(dbRecords)
        if (fieldCaseList.length === 0) return []

        await knex.raw(
          `UPDATE \`${model.name}\` SET ${fieldCaseList.join(', ')}, \`${CRUD.UPDATED_AT}\` = NOW() WHERE ${CRUD.ID} IN (?)`,
          [...values, willUpdateIds],
        )
      } else {
        if (willUpdateIds.length === 0) return []

        const dbRecords = await this.toDb([option.data], 'update')
        await knex(model.name)
          .whereIn(CRUD.ID, willUpdateIds)
          .update(dbRecords[0])
      }

      this.triggerUpdate(beforeUpdateRecords)
      return willUpdateIds
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  async del(option: DataCRUD.DelOption<M> = {}): Promise<string[]> {
    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const checkpermissionRes = await this.checkPermission('delete')
      if (!checkpermissionRes) {
        throw new Error('Delete permission denied')
      }

      const model = await this.getCurrentModel()
      const crud = new CRUD<M>({
        ...this.options,
        modelName: model.name,
        useApiName: false,
        onCheckPermission: undefined,
      })
      const records = await crud.find({
        condition: this.createAndCondition(
          option.condition,
          checkpermissionRes.condition,
        ),
      })

      if (records.length === 0) return []

      const willDeleteIds = records.map((record) => record[CRUD.ID])
      const knex = await this.options.getKnex(model.dataSourceName)
      await knex(model.name).whereIn(CRUD.ID, willDeleteIds).del()

      this.triggerDelete(records)
      return willDeleteIds
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  async queryGroupBy<T extends DataCRUD.SelectField<M>>({
    aggFunction,
    aggField,
    groupByFields,
    condition,
    orders,
    limit,
    offset,
  }: DataCRUD.QueryGroupByOption<M, T>): Promise<
    DataCRUD.StrOrObjKeyToNumber<T, M>[]
  > {
    if (groupByFields.length === 0) {
      throw new Error(`Group by fields can not be empty`)
    }

    const lockId = await this.options.schema.addLockPromise(
      this.options.modelName,
      this.options.useApiName,
    )

    try {
      const checkpermissionRes = await this.checkPermission('read', [
        aggField,
        ...groupByFields,
      ])
      if (!checkpermissionRes) return []

      const enumInfo = await this.options.schema.getEnumManager().all()
      const aggFieldMap = await this.getSelectFields([aggField])
      const groupByFieldsMap = await this.getSelectFields(groupByFields)

      const aggFieldKey = Object.keys(aggFieldMap)[0]
      const aggFieldAlias = aggFieldMap[aggFieldKey]
      if (groupByFieldsMap[aggFieldKey]) {
        throw new Error(`Agg field ${aggField} can not be group by field`)
      }

      const model = await this.getCurrentModel()
      const knex = await this.options.getKnex(model.dataSourceName)
      const builder = knex(model.name)

      builder
        .orWhere((builder) => {
          builder.whereNull(CRUD.IS_DELETE).orWhere(CRUD.IS_DELETE, '=', false)
        })
        .andWhere((builder) => {
          this.createCondition(builder, model, enumInfo, condition)
        })
      this.createOrder(builder, model, orders)
      if (limit !== undefined) {
        builder.limit(limit)
      }
      if (offset !== undefined) {
        builder.offset(offset)
      }

      const groupByKeys = Object.keys(groupByFieldsMap)
      builder.select(...groupByKeys).groupBy(...groupByKeys)

      let records: any[] = []
      if (aggFunction === 'count') {
        records = await builder.count({ [aggFieldAlias]: aggFieldKey })
      } else if (aggFunction === 'avg') {
        records = await builder.avg({ [aggFieldAlias]: aggFieldKey })
      } else if (aggFunction === 'min') {
        records = await builder.min({ [aggFieldAlias]: aggFieldKey })
      } else if (aggFunction === 'max') {
        records = await builder.max({ [aggFieldAlias]: aggFieldKey })
      } else if (aggFunction === 'sum') {
        records = await builder.sum({ [aggFieldAlias]: aggFieldKey })
      }

      if (records.length === 0) return []

      records.forEach((record) => {
        record[aggFieldAlias] = Number(record[aggFieldAlias])
      })

      return (await this.toOutput(
        records,
        groupByFieldsMap,
      )) as DataCRUD.StrOrObjKeyToNumber<T, M>[]
    } catch (error) {
      throw error
    } finally {
      this.options.schema.unlockPromise(lockId)
    }
  }

  private isWithIdUpdateOption<T extends Record<string, any>>(
    option: DataCRUD.UpdateOption<T> | DataCRUD.UpdateWithIdOption<T>,
  ): option is DataCRUD.UpdateWithIdOption<T> {
    return Array.isArray(option.data)
  }

  private async createUpdateCase(dbRecords: Record<string, any>[]) {
    const fieldCaseList: string[] = []
    const values: any[] = []

    const model = await this.getCurrentModel()
    const systemFieldNames = this.getSystemFields()

    model.fields.forEach((field) => {
      if (systemFieldNames.includes(field.name)) return

      const currentFieldCase: string[] = []
      dbRecords.forEach((record) => {
        if (record[field.name] !== undefined) {
          currentFieldCase.push(`WHEN ${record[CRUD.ID]} THEN ?`)
          values.push(record[field.name])
        }
      })
      if (currentFieldCase.length > 0) {
        fieldCaseList.push(
          `\`${field.name}\` = CASE ${CRUD.ID}\n${currentFieldCase.join('\n')} \n ELSE \`${field.name}\` END`,
        )
      }
    })

    return {
      fieldCaseList,
      values,
    }
  }

  private createDisplaySelectField(model: DataModel.Define) {
    return {
      [CRUD.DISPLAY]: model.displayField || CRUD.ID,
    }
  }

  private async getSelectFields(fields?: DataCRUD.SelectField<M>[]) {
    const selectFieldReflex: Record<string, string> = {}
    const model = await this.getCurrentModel()

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

  async toOutput(
    records: Record<string, any>[],
    selectFields: Record<string, string>,
  ) {
    if (records.length === 0) return []

    const model = await this.getCurrentModel()

    const fieldWithPlugin: Record<
      string,
      {
        field: DataModel.Field
        plugin: DataCRUD.Server.FieldPlugin<any>
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
    records: Record<string, any>[],
    action: 'create' | 'update',
  ) {
    if (records.length === 0) return []

    const model = await this.getCurrentModel()

    const fieldWithPlugin: Record<
      string,
      {
        field: DataModel.Field
        plugin: DataCRUD.Server.FieldPlugin<any>
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

  private async checkPermission(
    type: DataCRUD.Server.CheckPermissionOptions<M>['type'],
    fields?: DataCRUD.SelectField<M>[],
  ) {
    const { onCheckPermission } = this.options
    if (!onCheckPermission) return {}

    const model = await this.getCurrentModel()
    let fieldNames: (keyof M & string)[] | undefined = undefined
    if (type === 'read' && fields?.length) {
      const selectFields = await this.getSelectFields(fields)
      fieldNames = Object.keys(selectFields) as (keyof M & string)[]
    }
    if (type === 'update') {
      fieldNames = fields as string[]
    }

    return await onCheckPermission({
      type,
      context: this.options.context,
      modelName: model.name,
      fieldNames,
    })
  }

  private omitFields(
    selectFields: Record<string, string>,
    omitKeys?: string[],
  ) {
    if (!omitKeys?.length) return selectFields

    const result: Record<string, string> = {}
    for (const key in selectFields) {
      if (!omitKeys.includes(key)) {
        result[key] = selectFields[key]
      }
    }

    return result
  }

  private createAndCondition(
    ...conditions: (DataCondition.Define<M> | undefined)[]
  ): DataCondition.Define<M> | undefined {
    const subCondition = conditions.filter(Boolean) as DataCondition.Define<M>[]
    if (subCondition.length < 2) return subCondition[0]

    return {
      op: 'and',
      subCondition,
    }
  }

  private getSystemFields() {
    return [
      CRUD.ID,
      CRUD.DISPLAY,
      CRUD.CREATED_AT,
      CRUD.UPDATED_AT,
      CRUD.CREATED_BY,
      CRUD.UPDATED_BY,
      CRUD.IS_DELETE,
    ]
  }

  private async getFieldNamesFromUpdateData(
    data: DataCRUD.UpdateInput<M> | DataCRUD.UpdateInputWithId<M>[],
  ): Promise<(keyof M & string)[]> {
    const systemFieldNames = this.getSystemFields()

    const allKeys: string[] = []

    if (Array.isArray(data)) {
      data.forEach((record) => {
        for (const key in record) {
          if (
            record[key] !== undefined &&
            !systemFieldNames.includes(key) &&
            !allKeys.includes(key)
          ) {
            allKeys.push(key)
          }
        }
      })
    } else {
      for (const key in data) {
        if (data[key] !== undefined && !systemFieldNames.includes(key)) {
          allKeys.push(key)
        }
      }
    }

    const model = await this.getCurrentModel()

    return allKeys.map((key) => {
      const field = model.fields.find((field) =>
        this.options.useApiName ? field.apiName === key : field.name === key,
      )
      if (!field) {
        throw new Error(`Field ${key} not found`)
      }
      return field.name
    })
  }

  private triggerCreate(dbRecords: Record<string, any>[]) {
    if (!this.options.onCreate || !dbRecords.length) return

    this.options.onCreate(async () => {
      const selectFields = await this.getSelectFields()
      const outputRecords = await this.toOutput(dbRecords, selectFields)
      return outputRecords
    })
  }

  private triggerUpdate(beforeUpdateRecords: M[]) {
    if (!this.options.onUpdate || !beforeUpdateRecords.length) return

    this.options.onUpdate(async () => {
      const model = await this.getCurrentModel()
      const updateIds = beforeUpdateRecords.map((record) => record[CRUD.ID])
      const crud = new CRUD<M>({
        ...this.options,
        modelName: model.name,
        useApiName: false,
        onCheckPermission: undefined,
      })
      const newRecords = await crud.find({
        condition: {
          op: 'in',
          key: CRUD.ID,
          value: updateIds,
        },
      })
      const systemFieldNames = this.getSystemFields()

      const updatedRecords: {
        oldRecord: M
        newRecord: M
        updateFieldNames: (keyof M & string)[]
      }[] = []

      for (const oldRecord of beforeUpdateRecords) {
        const newRecord = newRecords.find(
          (record) => record[CRUD.ID] === oldRecord[CRUD.ID],
        )
        if (!newRecord) continue

        const updateFieldNames: (keyof M & string)[] = []
        for (const field of model.fields) {
          if (systemFieldNames.includes(field.name)) continue

          const plugin = crudFieldPluginManager.getPlugin(field.type)
          if (!plugin?.compare) {
            if (oldRecord[field.name] !== newRecord[field.name]) {
              updateFieldNames.push(field.name)
            }
          } else {
            const isChanged = await plugin.compare({
              schema: this.options.schema,
              field,
              useApiName: false,
              value1: oldRecord[field.name],
              value2: newRecord[field.name],
            })

            if (isChanged) {
              updateFieldNames.push(field.name)
            }
          }
        }

        if (updateFieldNames.length) {
          updatedRecords.push({
            oldRecord,
            newRecord,
            updateFieldNames,
          })
        }
      }

      return updatedRecords
    })
  }

  private triggerDelete(records: M[]) {
    if (!this.options.onDelete || !records.length) return

    this.options.onDelete(async () => records)
  }
}
