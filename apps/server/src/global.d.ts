import 'koa'
import 'koa-body'
import '@shuttle-data/ai-server'
import '@shuttle-ai/agent'

interface InJwtUser {
  _id: string
}

export declare module 'Koa' {
  export interface DefaultState {
    user: InJwtUser
  }
}
