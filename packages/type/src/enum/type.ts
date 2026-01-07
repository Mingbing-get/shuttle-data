export namespace DataEnum {
  export interface Item {
    name: string
    apiName: string
    label?: string
    isDisabled?: boolean
  }

  export interface Group {
    name: string
    apiName: string
    label?: string
    isSystem?: boolean
    items: Item[]
  }
}
