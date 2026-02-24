import { DataEnum } from '@shuttle-data/type'

import { generateName } from '../../utils'
import dataModel from '../../config/dataModel'

export default async function addGroup(group: DataEnum.Group) {
  group.name = generateName('group')
  group.items.forEach((item) => {
    item.name = generateName('item')
  })

  await dataModel.schema.enumManager.addGroup(group)
}
