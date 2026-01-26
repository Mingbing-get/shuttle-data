import { message } from 'antd'
import {
  DataModel,
  SchemaHttpTransporter,
  EnumHttpTransporter,
  CRUDHttpTransporter,
} from '@shuttle-data/client'

const dataModel = new DataModel(
  {
    transporter: new CRUDHttpTransporter({
      baseUrl: 'http://localhost:3100/dataModel',
      async afterSend(response) {
        if (response.data?.code !== 200) {
          message.error(response.data?.message || '未知错误')
          throw new Error(response.data?.message || '未知错误')
        }

        response.data = response.data.data
      },
    }),
  },
  {
    transporter: new SchemaHttpTransporter({
      baseUrl: 'http://localhost:3100/dataModel/schema',
      async afterSend(response) {
        if (response.data?.code !== 200) {
          message.error(response.data?.message || '未知错误')
          throw new Error(response.data?.message || '未知错误')
        }

        response.data = response.data.data
      },
    }),
  },
  {
    transporter: new EnumHttpTransporter({
      baseUrl: 'http://localhost:3100/dataEnum',
      async afterSend(response) {
        if (response.data?.code !== 200) {
          message.error(response.data?.message || '未知错误')
          throw new Error(response.data?.message || '未知错误')
        }

        response.data = response.data.data
      },
    }),
  },
)

export default dataModel
