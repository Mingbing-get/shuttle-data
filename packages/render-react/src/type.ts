import { DataModelSchema, DataEnumManager } from '@shuttle-data/client'
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

      export interface FieldPlugin<
        T extends DataModel.FieldType,
      > extends DataModel.FieldPlugin<T> {
        getSettingRender?: () => React.ComponentType<SettingRenderProps<T>>
      }
    }
  }
}
