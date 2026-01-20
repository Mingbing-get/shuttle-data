import axios, { Method } from 'axios'
import { NHttpTransporter } from './type'

export default class BaseHttpTransporter {
  constructor(private _options?: NHttpTransporter.Options) {}

  protected async request<T>(
    methodConfig: NHttpTransporter.MethodConfig<T> | undefined,
    data: any,
    {
      defaultPath,
      defaultMethod = 'POST',
    }: {
      defaultPath: string
      defaultMethod?: Method
    },
  ) {
    const response = await axios({
      url: `${this._options?.baseUrl || ''}${methodConfig?.path || `/${defaultPath}`}`,
      method: methodConfig?.method || defaultMethod,
      headers: this._options?.requestHeaders,
      data: (await methodConfig?.beforeSend?.(data)) || data,
    })

    await this._options?.afterSend?.(response)
    await methodConfig?.afterSend?.(response)

    return response.data
  }
}
