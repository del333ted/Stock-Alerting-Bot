import { ContextMessageUpdate, Markup as m } from 'telegraf'

export function sendSettings(ctx: ContextMessageUpdate) {
  return ctx.reply('Settings coming soon')
}
