import { ContextMessageUpdate } from 'telegraf'
import { buildTickerManagementKeyboard } from './tickersInline'

export async function handleFavorites(ctx: ContextMessageUpdate) {
  const symbol = ctx.callbackQuery.data.substr(2)
  try {
    if (ctx?.dbuser?.settings?.favorites?.includes(symbol)) {
      await ctx.answerCbQuery(ctx.i18n.t('alreadyFavorite'), true)
      await ctx.editMessageReplyMarkup(
        buildTickerManagementKeyboard(ctx, symbol),
      )
    } else {
      if (ctx.dbuser?.settings?.favorites?.length > 14) {
        return await ctx.answerCbQuery(ctx.i18n.t('favoritesLimit'), true)
      }
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
