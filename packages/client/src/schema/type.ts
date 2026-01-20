import { AxiosHeaders, AxiosResponse, Method } from 'axios'

declare module '@shuttle-data/type' {
  export namespace DataEnum {}
  export namespace DataCRUD {}
  export namespace DataCondition {}
  export namespace DataModel {
    export namespace Schema {
      export interface Transporter {
        createTable(table: WithoutNameModel): Promise<void>
        updateTable(table: WhenUpdateModel): Promise<void>
        dropTable(name: string, useApiName?: boolean): Promise<void>
        addField(
          tableName: string,
          field: WithoutNameField,
          useApiName?: boolean,
        ): Promise<void>
        updateField(
          tableName: string,
          field: DataModel.Field,
          useApiName?: boolean,
        ): Promise<void>
        dropField(
          tableName: string,
          fieldName: string,
          useApiName?: boolean,
        ): Promise<void>
        getTable(
          tableName: string,
          useApiName?: boolean,
        ): Promise<DataModel.Define>
      }

      export interface Options {
        transporter: Transporter
        tables?: DataModel.Define[]
      }

      export interface MethodConfig<T> {
        path?: string
        method?: Method
        beforeSend?: (data: T) => Promise<T>
        afterSend?: (response: AxiosResponse) => Promise<void>
      }

      export interface HttpTransporterOptions {
        baseUrl?: string
        requestHeaders?: AxiosHeaders
        afterSend?: (response: AxiosResponse) => Promise<void>
        createTable?: MethodConfig<WithoutNameModel>
        updateTable?: MethodConfig<WhenUpdateModel>
        dropTable?: MethodConfig<{ name: string; useApiName?: boolean }>
        addField?: MethodConfig<{
          tableName: string
          field: WithoutNameField
          useApiName?: boolean
        }>
        updateField?: MethodConfig<{
          tableName: string
          field: DataModel.Field
          useApiName?: boolean
        }>
        dropField?: MethodConfig<{
          tableName: string
          fieldName: string
          useApiName?: boolean
        }>
        getTable?: MethodConfig<{ tableName: string; useApiName?: boolean }>
      }
    }

    export interface WithoutNameField extends Omit<DataModel.Field, 'name'> {}

    export interface WithoutNameModel extends Omit<
      DataModel.Define,
      'name' | 'fields'
    > {
      fields: WithoutNameField[]
    }

    export interface WhenUpdateModel extends Omit<DataModel.Define, 'fields'> {
      fields: (WithoutNameField | DataModel.Field)[]
    }
  }
}
