import { ContextMessageUpdate, Markup as m } from 'telegraf'
import {
  findTickers,
  getStockInfoByTickers,
  tickerData,
  formatTickerData,
} from './getTickers'
import { upOrDownEmoji } from './buildResponse'
import * as moment from 'moment-timezone'
import { User } from '../models'

export async function handleInlineQuery(ctx: ContextMessageUpdate) {
  const { message, inlineQuery, dbuser, answerInlineQuery } = ctx
  if (inlineQuery.query) {
    const query = inlineQuery.query
    const result = []

    const apiResult = await findTickers(query)

    if (!apiResult) {
      return answerInlineQuery([], { is_personal: true, cache_time: 0 })
    }

    for (const field of apiResult) {
      const request = await getStockInfoByTickers([field.symbol])
      const info = await formatTickerData(request[0], 0)

      const response = `<b>${info.symbol}</b> (<i>${info.company}</i>) — <b>${
        info.currentPrice
      } (${info.currentPricePercent}%) ${upOrDownEmoji(
        info.currentPricePercentRaw,
      )}</b>
${postMarket(info, ctx)}${preMarket(info, ctx)}`

      result.push({
        type: 'article',
        id: new Date().getTime().toString(),
        title: `${field.symbol} — ${info.currentPrice} (${
          info.currentPricePercent
        }%) ${upOrDownEmoji(info.currentPricePercentRaw)}`,
        description: `${info.company || 'NOT PROVIDED'}`,
        input_message_content: {
          message_text: response,
          parse_mode: 'HTML',
        },
        reply_markup: buildKeyboardForInline(info.symbol),
      })
    }

    await answerInlineQuery(result, {
      is_personal: true,
      cache_time: 0,
      switch_pm_text: 'Get all features',
      switch_pm_parameter: 'inline',
    })
  }
}

function buildKeyboardForInline(symbol: string) {
  return m.inlineKeyboard([m.callbackButton('🔄', `i${symbol}`)])
}

export async function handleInlineUpdate(ctx: ContextMessageUpdate) {
  const symbol = ctx.callbackQuery.data.substr(1)
  const request = await getStockInfoByTickers([symbol])
  const info = await formatTickerData(request[0], 0)

  const response = `<b>${info.symbol}</b> (<i>${info.company}</i>) — <b>${
    info.currentPrice
  } (${info.currentPricePercent}%) ${upOrDownEmoji(
    info.currentPricePercentRaw,
  )}</b>
${postMarket(info, ctx)}${preMarket(info, ctx)}

<i>Updated at ${moment(new Date())
    .tz('Etc/GMT0')
    .format('LT DD.MM.YYYY')} GMT</i>`

  await ctx.answerCbQuery()
  try {
    await ctx.editMessageText(response, {
      reply_markup: buildKeyboardForInline(symbol),
      parse_mode: 'HTML',
    })
  } catch {}
}

function postMarket(info: tickerData, ctx: ContextMessageUpdate) {
  if (info.post) {
    const lang = ctx.dbuser.telegramLanguage
    return `${ctx.i18n.t('afterMarketClosed')} <b>${info.postPrice} (${
      info.postPricePercent
    }%) ${upOrDownEmoji(info.postPricePercentRaw)}</b>`
  }
  return ''
}

function preMarket(info: tickerData, ctx: ContextMessageUpdate) {
  if (info.pre) {
    const lang = ctx.dbuser.telegramLanguage
    return `${ctx.i18n.t('preMarket')} <b>${info.prePrice} (${
      info.prePricePercent
    }%) ${upOrDownEmoji(info.prePricePercentRaw)}</b>`
  }
  return ''
}
