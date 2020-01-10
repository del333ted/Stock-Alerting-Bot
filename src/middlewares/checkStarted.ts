import { ContextMessageUpdate, Markup as m, Extra } from 'telegraf'

export async function checkStarted(ctx: ContextMessageUpdate, next) {
  if (ctx?.dbuser?.session?.stage === 'botStarted') {
    await next()
  }
}
