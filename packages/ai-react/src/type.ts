import '@shuttle-ai/type'
import '@shuttle-ai/client'
import '@shuttle-ai/render-react'
import { DataModel } from '@shuttle-data/client'

declare module '@shuttle-ai/type' {
  export namespace ShuttleAi {
    export namespace Client {
      export namespace ReactRender {
        export interface Context {
          dataModel: DataModel
        }
      }
    }
  }
}
