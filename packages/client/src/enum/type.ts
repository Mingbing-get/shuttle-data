import { AxiosHeaders, AxiosResponse, Method } from 'axios'

declare module '@shuttle-data/type' {
  export namespace DataModel {}
  export namespace DataCRUD {}
  export namespace DataCondition {}
  export namespace DataEnum {
    export interface Transporter {
      addGroup(group: WithoutNameGroup): Promise<void>
      updateGroup(group: WhenUpdateGroup): Promise<void>
      removeGroup(name: string, useApiName?: boolean): Promise<void>
      addItem(
        groupName: string,
        item: WithoutNameItem,
        useApiName?: boolean,
      ): Promise<void>
      updateItem(
        groupName: string,
        item: DataEnum.Item,
        useApiName?: boolean,
      ): Promise<void>
      updateItemDisable(
        groupName: string,
        itemName: string,
        useApiName?: boolean,
        disabled?: boolean,
      ): Promise<void>
      getGroup(groupName: string, useApiName?: boolean): Promise<DataEnum.Group>
    }

    export interface ManagerOptions {
      transporter: Transporter
      enumGroup?: DataEnum.Group[]
    }

    export interface WithoutNameItem extends Omit<DataEnum.Item, 'name'> {}

    export interface WithoutNameGroup extends Omit<
      DataEnum.Group,
      'name' | 'items'
    > {
      items: WithoutNameItem[]
    }

    export interface WhenUpdateGroup extends Omit<DataEnum.Group, 'items'> {
      items: (WithoutNameItem | DataEnum.Item)[]
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
      addGroup?: MethodConfig<WithoutNameGroup>
      updateGroup?: MethodConfig<WhenUpdateGroup>
      removeGroup?: MethodConfig<{ name: string; useApiName?: boolean }>
      addItem?: MethodConfig<{
        groupName: string
        item: WithoutNameItem
        useApiName?: boolean
      }>
      updateItem?: MethodConfig<{
        groupName: string
        item: DataEnum.Item
        useApiName?: boolean
      }>
      updateItemDisable?: MethodConfig<{
        groupName: string
        itemName: string
        useApiName?: boolean
        disabled?: boolean
      }>
      getGroup?: MethodConfig<{ groupName: string; useApiName?: boolean }>
    }
  }
}
