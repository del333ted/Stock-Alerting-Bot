import { ContextMessageUpdate, Markup as m } from 'telegraf'

export function sendFavorites(ctx: ContextMessageUpdate) {
  return ctx.reply('Favorites coming soon')
}
