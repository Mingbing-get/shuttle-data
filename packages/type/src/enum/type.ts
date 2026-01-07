export namespace DataEnum {
  export interface Item {
    name: string
    apiName: string
    label?: string
  }

  export interface Group {
    name: string
    apiName: string
    label?: string
    items: Item[]
  }
}
