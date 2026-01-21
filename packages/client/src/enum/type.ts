import { NHttpTransporter } from '../transporter'

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
      getGroupList(): Promise<Omit<DataEnum.Group, 'items'>[]>
    }

    export interface ManagerOptions {
      transporter: Transporter
      enumGroup?: DataEnum.Group[]
    }

    export type OberverCallback = (group?: DataEnum.Group) => void

    export type ObserverGroupListCallback = (
      groupList?: Omit<DataEnum.Group, 'items'>[],
    ) => void

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

    export interface HttpTransporterOptions extends NHttpTransporter.Options {
      addGroup?: NHttpTransporter.MethodConfig<WithoutNameGroup>
      updateGroup?: NHttpTransporter.MethodConfig<WhenUpdateGroup>
      removeGroup?: NHttpTransporter.MethodConfig<{
        name: string
        useApiName?: boolean
      }>
      addItem?: NHttpTransporter.MethodConfig<{
        groupName: string
        item: WithoutNameItem
        useApiName?: boolean
      }>
      updateItem?: NHttpTransporter.MethodConfig<{
        groupName: string
        item: DataEnum.Item
        useApiName?: boolean
      }>
      updateItemDisable?: NHttpTransporter.MethodConfig<{
        groupName: string
        itemName: string
        useApiName?: boolean
        disabled?: boolean
      }>
      getGroup?: NHttpTransporter.MethodConfig<{
        groupName: string
        useApiName?: boolean
      }>
      getGroupList?: NHttpTransporter.MethodConfig<{}>
    }
  }
}
