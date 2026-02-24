import { z } from 'zod'
import { DataEnum } from './type'
import { nameZod, apiNameZod, labelZod, uniqueArrayZod } from '../utils'

export default class DataEnumManager {
  getGroupZod() {
    return z
      .object({
        name: nameZod(),
        apiName: apiNameZod(),
        label: labelZod(),
        isSystem: z.boolean().optional().nullable(),
      })
      .catchall(z.any())
  }

  getGroupWithoutNameZod() {
    return this.getGroupZod().omit({ name: true })
  }

  getGroupZodWithItems() {
    return this.getGroupZod().extend({
      items: uniqueArrayZod(z.array(this.getItemZod()), ['name', 'apiName']),
    })
  }

  getWithoutNameWithItemZod() {
    return this.getGroupWithoutNameZod().extend({
      items: uniqueArrayZod(z.array(this.getItemZod().omit({ name: true })), [
        'apiName',
      ]),
    })
  }

  getMabNameWithItemZod() {
    return this.getGroupZod().extend({
      items: uniqueArrayZod(
        z.array(this.getItemZod().partial({ name: true })),
        ['apiName'],
      ),
    })
  }

  getItemZod() {
    return z
      .object({
        name: nameZod(),
        apiName: apiNameZod(),
        label: labelZod(),
        isDisabled: z.boolean().optional().nullable(),
        order: z.number().optional().nullable(),
        color: z.string().optional().nullable(),
      })
      .catchall(z.any())
  }

  toTs(group: DataEnum.Group, useApiName?: boolean) {
    const enumTypeName = `${this.capitalizeFirstLetter(group.name)}_enum${useApiName ? '_api' : ''}`

    const tipItems = group.items.map(
      (item) =>
        `* - ${useApiName ? item.apiName : item.name}: '${item.label}'${item.isDisabled ? ' (disabled)' : ''}`,
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
