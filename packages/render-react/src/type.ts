import {
  DataModelSchema,
  DataEnumManager,
  DataModel,
} from '@shuttle-data/client'
import '@shuttle-data/type'

declare module '@shuttle-data/type' {
  export namespace DataCRUD {}
  export namespace DataCondition {}
  export namespace DataEnum {}
  export namespace DataModel {
    export namespace Render {
      export interface SettingRenderProps<T extends DataModel.FieldType> {
        field: Extract<DataModel.Field, { type: T }>
        prePath: (string | number)[]
        schema: DataModelSchema
        enumManager: DataEnumManager
      }

      export interface FormInputRenderProps<
        T extends DataModel.FieldType,
        V = any,
      > {
        field: Extract<DataModel.Field, { type: T }>
        dataModel: DataModel
        useApiName?: boolean
        disabled?: boolean
        value?: V
        onChange?: (value?: V | null) => void
        onFocus?: (e: React.FocusEvent) => void
        style?: React.CSSProperties
        className?: string
      }

      export interface DisplayRenderProps<
        T extends DataModel.FieldType,
        V = any,
      > {
        field: Extract<DataModel.Field, { type: T }>
        dataModel: DataModel
        useApiName?: boolean
        value?: V
        style?: React.CSSProperties
        className?: string
      }

      export interface ConditionInputRenderProps<
        T extends DataModel.FieldType,
        V = any,
      > {
        field: Extract<DataModel.Field, { type: T }>
        dataModel: DataModel
        op: Exclude<DataCondition.Op, 'and' | 'or'>
        useApiName?: boolean
        disabled?: boolean
        value?: V
        onChange?: (value?: V | null) => void
        onFocus?: (e: React.FocusEvent) => void
        style?: React.CSSProperties
        className?: string
      }

      export interface FieldPlugin<
        T extends DataModel.FieldType,
        V = any,
      > extends DataModel.FieldPlugin<T> {
        getSettingRender?: () => React.ComponentType<SettingRenderProps<T>>
        getFormInputRender: () => React.ComponentType<
          FormInputRenderProps<T, V>
        >
        getConditionInputRender: () => React.ComponentType<
          ConditionInputRenderProps<T, V>
        >
        getDisplayRender?: () => React.ComponentType<DisplayRenderProps<T, V>>
      }
    }
  }
}
