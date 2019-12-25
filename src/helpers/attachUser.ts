// Dependencies
import { findChat, findUser } from '../models'
import { ContextMessageUpdate } from 'telegraf'

export async function attachUser(ctx: ContextMessageUpdate, next) {
  try {
    if (ctx.chat.id === ctx.message.from.id) {
      await findUser(ctx.from.id)
    } else {
      const chat = await findChat(ctx.chat.id)
      ctx.dbchat = chat
    }
  }
  catch {}
  await next()
}