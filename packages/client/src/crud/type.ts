import { AxiosHeaders, AxiosResponse, Method as AxiosMethod } from 'axios'

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
      }

      export interface ModelConfig {
        modelName: string
        useApiName?: boolean
      }

      export interface Options extends ModelConfig {
        transporter: Transporter
      }

      export interface MethodConfig<T> {
        path?: string
        method?: AxiosMethod
        beforeSend?: (data: T) => Promise<T>
        afterSend?: (response: AxiosResponse) => Promise<void>
      }

      export interface HttpTransporterOptions {
        baseUrl?: string
        requestHeaders?: AxiosHeaders
        afterSend?: (response: AxiosResponse) => Promise<void>
        findOne?: MethodConfig<FineOneOption<any> & ModelConfig>
        find?: MethodConfig<FindOption<any> & ModelConfig>
        count?: MethodConfig<CountOption<any> & ModelConfig>
        create?: MethodConfig<CreateOption<any> & ModelConfig>
        batchCreate?: MethodConfig<BatchCreateOption<any> & ModelConfig>
        update?: MethodConfig<
          | (UpdateOption<any> & ModelConfig)
          | (UpdateWithIdOption<any> & ModelConfig)
        >
        del?: MethodConfig<DelOption<any> & ModelConfig>
        queryGroupBy?: MethodConfig<QueryGroupByOption<any, any> & ModelConfig>
      }
    }
  }
}
