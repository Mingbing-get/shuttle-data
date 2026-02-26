export * from '@shuttle-data/type'
import { NHttpTransporter } from '../transporter'

declare module '@shuttle-data/type' {
  export namespace DataModel {}
  export namespace DataEnum {}
  export namespace DataCondition {}
  export namespace DataCRUD {
    export namespace Client {
      export interface Transporter {
        findOne: <M extends Record<string, any>>(
          option: FineOneOption<M> & ModelConfig,
        ) => Promise<M | undefined>
        find: <M extends Record<string, any>>(
          option: FindOption<M> & ModelConfig,
        ) => Promise<M[]>
        count: <M extends Record<string, any>>(
          option: CountOption<M> & ModelConfig,
        ) => Promise<number>
        create: <M extends Record<string, any>>(
          option: CreateOption<M> & ModelConfig,
        ) => Promise<string>
        batchCreate: <M extends Record<string, any>>(
          option: BatchCreateOption<M> & ModelConfig,
        ) => Promise<string[]>
        update: <M extends Record<string, any>>(
          option:
            | (UpdateOption<M> & ModelConfig)
            | (UpdateWithIdOption<M> & ModelConfig),
        ) => Promise<string[]>
        del: <M extends Record<string, any>>(
          option: DelOption<M> & ModelConfig,
        ) => Promise<string[]>
        queryGroupBy: <M extends Record<string, any>, T extends SelectField<M>>(
          option: QueryGroupByOption<M, T> & ModelConfig,
        ) => Promise<StrOrObjKeyToNumber<T, M>[]>
        startTransaction: (dataSourceName: string) => Promise<string>
        commitTransaction: (transactionId: string) => Promise<void>
        rollbackTransaction: (transactionId: string) => Promise<void>
      }

      export interface ModelConfig {
        modelName: string
        transactionId?: string
        useApiName?: boolean
      }

      export interface Options extends ModelConfig {
        transporter: Transporter
      }

      export interface HttpTransporterOptions extends NHttpTransporter.Options {
        findOne?: NHttpTransporter.MethodConfig<
          FineOneOption<any> & ModelConfig
        >
        find?: NHttpTransporter.MethodConfig<FindOption<any> & ModelConfig>
        count?: NHttpTransporter.MethodConfig<CountOption<any> & ModelConfig>
        create?: NHttpTransporter.MethodConfig<CreateOption<any> & ModelConfig>
        batchCreate?: NHttpTransporter.MethodConfig<
          BatchCreateOption<any> & ModelConfig
        >
        update?: NHttpTransporter.MethodConfig<
          | (UpdateOption<any> & ModelConfig)
          | (UpdateWithIdOption<any> & ModelConfig)
        >
        del?: NHttpTransporter.MethodConfig<DelOption<any> & ModelConfig>
        queryGroupBy?: NHttpTransporter.MethodConfig<
          QueryGroupByOption<any, any> & ModelConfig
        >
        startTransaction?: NHttpTransporter.MethodConfig<{
          dataSourceName: string
        }>
        commitTransaction?: NHttpTransporter.MethodConfig<{
          transactionId: string
        }>
        rollbackTransaction?: NHttpTransporter.MethodConfig<{
          transactionId: string
        }>
      }
    }
  }
}
