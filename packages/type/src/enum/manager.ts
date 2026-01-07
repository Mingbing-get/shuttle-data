import { z } from 'zod'
import { DataEnum } from './type'

export default class DataEnumManager {
  getGroupZod() {
    return z.object({
      name: z.string(),
      apiName: z.string(),
      label: z.string().optional(),
    })
  }

  getGroupZodWithItems() {
    return this.getGroupZod().extend({
      items: z.array(this.getItemZod()),
    })
  }

  getItemZod() {
    return z.object({
      name: z.string(),
      apiName: z.string(),
      label: z.string().optional(),
    })
  }

  toTs(group: DataEnum.Group, useApiName?: boolean) {
    const enumTypeName = `${this.capitalizeFirstLetter(group.name)}Enum${useApiName ? 'Api' : ''}`

    const tipItems = group.items.map(
      (item) => `* - ${useApiName ? item.apiName : item.name}: '${item.label}'`,
    )

    const items = group.items.map((item) =>
      useApiName ? `'${item.apiName}'` : `'${item.name}'`,
    )

    return `/**
  * name: ${group.name}
  * apiName: ${group.apiName}
  * label: ${group.label}
  ${tipItems.join('\n  ')}
  */
type ${enumTypeName} = ${items.join(' | ')}`
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return str // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
