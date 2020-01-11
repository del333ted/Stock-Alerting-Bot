import { ContextMessageUpdate, Markup as m } from 'telegraf'

export function sendFavorites(ctx: ContextMessageUpdate) {
  if (ctx?.dbuser?.settings?.favorites?.length < 1) {
    return ctx.replyWithHTML(
      `${ctx.i18n.t('favoritesManagementText')}

${ctx.i18n.t('noFavorites')}`,
      {
        reply_markup: favoritesKeyboard(ctx),
      },
    )
  }
  return ctx.replyWithHTML(ctx.i18n.t('favoritesManagementText'), {
    reply_markup: favoritesKeyboard(ctx),
  })
}

export function favoritesKeyboard(ctx: ContextMessageUpdate) {
  const result = []

  if (ctx?.dbuser?.settings?.favorites?.length < 1) {
    return
  }
  for (const ticker of ctx.dbuser.settings.favorites) {
    result.push([m.callbackButton(`🗑️ ${ticker}`, `d_${ticker}`)])
  }

  return m.inlineKeyboard(result)
}

export async function handleTickerDelete(ctx: ContextMessageUpdate) {
  const ticker = ctx.callbackQuery.data.substr(2)

  if (ctx.dbuser.settings.favorites.indexOf(ticker) > -1) {
    ctx.dbuser.settings.favorites.splice(
      ctx.dbuser.settings.favorites.indexOf(ticker),
      1,
    )
  }

  await ctx.dbuser.save()

  await ctx.answerCbQuery()
  try {
    if (ctx?.dbuser?.settings?.favorites?.length < 1) {
      return await ctx.editMessageText(
        `${ctx.i18n.t('favoritesManagementText')}

${ctx.i18n.t('noFavorites')}`,
        {
          reply_markup: favoritesKeyboard(ctx),
          parse_mode: 'HTML',
        },
      )
    }
    await ctx.editMessageText(ctx.i18n.t('favoritesManagementText'), {
      reply_markup: favoritesKeyboard(ctx),
      parse_mode: 'HTML',
    })
  } catch {}

  return
}
