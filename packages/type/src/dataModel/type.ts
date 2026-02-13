import { ZodObject } from 'zod'
import { DataCondition } from '../condition'

export namespace DataModel {
  export interface BaseField<T extends string, E = undefined> {
    type: T
    name: string
    apiName: string
    label?: string
    required?: boolean
    isSystem?: boolean
    order?: number

    extra?: E
  }

  export interface BooleanField extends BaseField<
    'boolean',
    {
      trueText?: string
      falseText?: string
    }
  > {}
  export interface StringField extends BaseField<
    'string',
    { maxLength?: number; unique?: boolean }
  > {}
  export interface TextField extends BaseField<'text', { unique?: boolean }> {}
  export interface NumberField extends BaseField<
    'number',
    {
      autoIncrement?: boolean
      unique?: boolean
      min?: number
      max?: number
      func?: 'floor' | 'round' | 'ceil'
    }
  > {}
  export interface DoubleField extends BaseField<
    'double',
    { min?: number; max?: number; decimal?: number }
  > {}
  export interface DateTimeField extends BaseField<
    'datetime',
    { unique?: boolean; format?: string }
  > {}
  export interface DateField extends BaseField<
    'date',
    { unique?: boolean; format?: string }
  > {}
  export interface EnumField extends BaseField<
    'enum',
    {
      groupName: string
      multiple?: boolean
    }
  > {}
  export interface LookupField extends BaseField<
    'lookup',
    {
      modalName: string
      multiple?: boolean
      unique?: boolean
    }
  > {}
  export interface JsonField extends BaseField<'json'> {}

  export interface FieldMap {
    boolean: BooleanField
    string: StringField
    text: TextField
    number: NumberField
    double: DoubleField
    datetime: DateTimeField
    date: DateField
    enum: EnumField
    lookup: LookupField
    json: JsonField
  }

  export type Field = FieldMap[keyof FieldMap]

  export type FieldType = Field['type']

  export interface Define {
    dataSourceName: string
    name: string
    apiName: string
    label?: string
    displayField: string
    isSystem?: boolean
    fields: Field[]
  }

  export interface WithoutNameField extends Omit<DataModel.Field, 'name'> {}

  export interface WithoutNameModel extends Omit<
    DataModel.Define,
    'name' | 'fields'
  > {
    fields: WithoutNameField[]
  }

  export interface MabyFieldNameModel extends Omit<DataModel.Define, 'fields'> {
    fields: (WithoutNameField | DataModel.Field)[]
  }

  export interface FieldPlugin<T extends FieldType> {
    readonly type: T
    readonly label: string
    readonly canAsDisplay?: boolean

    getZod(): ZodObject<any, any>

    getTs(field: Extract<Field, { type: T }>, useApiName?: boolean): string

    getSupportConditionOps(
      field: Extract<Field, { type: T }>,
    ): Exclude<DataCondition.Op, 'and' | 'or'>[]
  }
}
