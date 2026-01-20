import { AxiosHeaders, AxiosResponse, Method } from 'axios'

export namespace NHttpTransporter {
  export interface MethodConfig<T> {
    path?: string
    method?: Method
    beforeSend?: (data: T) => Promise<T>
    afterSend?: (response: AxiosResponse) => Promise<void>
  }

  export interface Options {
    baseUrl?: string
    requestHeaders?: AxiosHeaders
    afterSend?: (response: AxiosResponse) => Promise<void>
  }
}
