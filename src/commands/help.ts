import { ContextMessageUpdate, Markup as m } from 'telegraf'

export function sendHelp(ctx: ContextMessageUpdate) {
  return ctx.replyWithHTML(ctx.i18n.t('help'), defaultKeyboard(ctx))
}

export function defaultKeyboard(ctx: ContextMessageUpdate) {
  const result = [ctx.i18n.t('settings'), ctx.i18n.t('favorites')]

  return m
    .keyboard([result])
    .resize()
    .extra()
}
