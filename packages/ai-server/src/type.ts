import '@shuttle-ai/type'
import '@shuttle-ai/agent'
import { DataCRUD } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/crud'

declare module '@shuttle-ai/type' {
  export namespace ShuttleAi {
    export namespace Cluster {
      export interface Context {
        dataModel: DataModel
        user: DataCRUD.Server.User
      }
    }
  }
}
