export * from '@shuttle-ai/type'
export * from '@shuttle-ai/client'
export * from '@shuttle-ai/render-react'
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
