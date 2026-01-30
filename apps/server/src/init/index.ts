import { DataModel } from '@shuttle-data/type'
import dataModel from '../config/dataModel'

const userModel: DataModel.Define = {
  dataSourceName: 'main',
  name: '_user',
  apiName: 'user',
  label: '用户',
  displayField: 'name',
  isSystem: false,
  fields: [
    {
      name: 'name',
      apiName: 'name',
      label: '姓名',
      type: 'string',
      isSystem: true,
    },
    {
      name: 'email',
      apiName: 'email',
      label: '邮箱',
      type: 'string',
      isSystem: true,
    },
    {
      name: 'phone',
      apiName: 'phone',
      label: '手机号',
      type: 'string',
      isSystem: true,
    },
  ],
}

const admin = {
  _id: '1',
  name: 'admin',
  email: 'admin@example.com',
  phone: '13800000000',
  _createdBy: '1',
  _updatedBy: '1',
  _createdAt: new Date(),
  _updatedAt: new Date(),
}

export async function init() {
  const hasTable = await dataModel.schema.hasTable(userModel.name)
  if (!hasTable) {
    await dataModel.schema.createTable(userModel)
  }

  const userCrud = dataModel.crud({
    modelName: userModel.name,
    context: {
      user: admin,
    },
  })
  const adminRecord = await userCrud.findOne({
    fields: ['_id'],
    condition: {
      key: '_id',
      op: 'eq',
      value: admin._id,
    },
  })

  if (!adminRecord) {
    await userCrud.create({
      data: admin,
    })
  }
}
