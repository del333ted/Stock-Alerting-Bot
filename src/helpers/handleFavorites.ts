import { ContextMessageUpdate } from 'telegraf'
import { buildTickerManagementKeyboard } from './tickersInline'

export async function handleFavorites(ctx: ContextMessageUpdate) {
  const symbol = ctx.callbackQuery.data.substr(2)
  try {
    if (ctx?.dbuser?.settings?.favorites?.includes(symbol)) {
      await ctx.answerCbQuery(ctx.i18n.t('alreadyFavorite'))
      await ctx.editMessageReplyMarkup(
        buildTickerManagementKeyboard(ctx, symbol),
      )
    } else {
      ctx.dbuser.settings.favorites.push(symbol)
      await ctx.dbuser.save()
      await ctx.editMessageReplyMarkup(
        buildTickerManagementKeyboard(ctx, symbol),
      )
      await ctx.answerCbQuery(ctx.i18n.t('addedToFavorites'))
    }
  } catch (e) {}

  return
}
