import { DataEnum } from '@shuttle-data/type'

import { generateName } from '../../utils'
import dataModel from '../../config/dataModel'

export default async function updateGroup(group: DataEnum.Group) {
  const oldGroup = await dataModel.schema.enumManager.getGroup(group.name)
  if (!oldGroup) {
    throw new Error(`group ${group.name} not found`)
  }

  group.items.forEach((item) => {
    const oldItem = oldGroup.items.find((i) => i.name === item.name)
    if (oldItem) return

    item.name = generateName('item')
  })

  await dataModel.schema.enumManager.updateGroup(group)
}
