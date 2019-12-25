// Dependencies
import * as tt from 'telegraf/typings/telegram-types.d'
import { Chat } from '../models'
import { DocumentType } from '@typegoose/typegoose'

export interface Session {
  stage: number
  key: string
  name: string
}

declare module 'telegraf' {
  export class ContextMessageUpdate {
    dbchat: DocumentType<User>
  }

  export interface Composer<TContext extends ContextMessageUpdate> {
    action(
      action: string | string[] | RegExp,
      middleware: Middleware<TContext>,
      ...middlewares: Array<Middleware<TContext>>
    ): Composer<TContext>
  }
}