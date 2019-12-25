// Dependencies
import { findChat, findUser, findRequest } from '../models'
import { ContextMessageUpdate } from 'telegraf'

export async function attachUser(ctx: ContextMessageUpdate, next) {
  try {
    if (ctx.chat.id === ctx.message.from.id) {
      await findUser(ctx.from.id)
    } else {
      const chat = await findChat(ctx.chat.id)
      ctx.dbchat = chat
    }
    if (ctx.message && ctx.message.message_id) {
      await findRequest(ctx.message.message_id)
    }
  }
  catch {}
  await next()
}