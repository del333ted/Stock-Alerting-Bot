import { ContextMessageUpdate, Markup as m, Extra } from 'telegraf'
import { findRequest } from '../models'

export async function collectStatistic(ctx: ContextMessageUpdate, next) {
  await next()
  if (ctx.message?.message_id && ctx.message.from?.id) {
    await findRequest(ctx.message.message_id, ctx.message.from.id)
  }
}
