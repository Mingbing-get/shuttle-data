import 'koa'

interface InJwtUser {
  _id: string
}

export declare module 'Koa' {
  export interface DefaultState {
    user: InJwtUser
  }
}
