import { ContextMessageUpdate, Markup as m, Extra } from 'telegraf'
import {
  findTickers,
  getStockInfoByTickers,
  formatTickerData,
  tickerData,
  sendChartImage,
} from './getTickers'
import { buildResponse } from './buildResponse'
import { calculateIndexes } from './calculateIndexes'

export async function tickersInline(ctx: ContextMessageUpdate, next) {
  const keyboard = await buildTickersKeyboard(ctx.message.text)

  if (!keyboard) {
    return ctx.reply(ctx.i18n.t('ticker.notFound'))
  } else {
    return ctx.replyWithHTML(ctx.i18n.t('ticker.needSelect'), {
      reply_markup: keyboard,
    })
  }
}

export async function handleTicker(ctx: ContextMessageUpdate) {
  const ticker = await getStockInfoByTickers([ctx.callbackQuery.data.substr(2)])
  const info = (await formatTickerData(
    ticker[0],
    ctx.dbuser.settings.timezone,
  )) as tickerData

  const response = await buildResponse(info, ctx, true)

  await ctx.answerCbQuery()

  await ctx.editMessageText(response, {
    parse_mode: 'HTML',
    reply_markup: buildTickerManagementKeyboard(ctx, info.symbol),
  })
  return
}

export async function handleTickerChart(ctx: ContextMessageUpdate) {
  const ticker = ctx.callbackQuery.data.substr(2)

  const indexesCalculated = await calculateIndexes(ticker)

  if (!indexesCalculated || !indexesCalculated.psar) {
    return ''
  }

  try {
    await ctx.telegram.sendChatAction(ctx.from.id, 'upload_photo')

    const sendedChart = await sendChartImage(
      {
        X: indexesCalculated.timestamp,
        Psary: indexesCalculated.psar,
        Y: indexesCalculated.closeArray,
        Language: ctx.dbuser.telegramLanguage,
        Ticker: ticker,
      },
      ctx.from.id,
    )
    await ctx.answerCbQuery()
  } catch (err) {
    console.log(err)
    if (err.description === 'Bad Request: now I cannot send you chart :(') {
      return await ctx.answerCbQuery()
    }

    await await ctx.answerCbQuery(
      'This message is outdated, please repeat your request.',
      true,
    )
  }
  return
}

export async function handleTickerUpdate(ctx: ContextMessageUpdate) {
  const ticker = await getStockInfoByTickers([ctx.callbackQuery.data.substr(2)])
  const info = (await formatTickerData(
    ticker[0],
    ctx.dbuser.settings.timezone,
  )) as tickerData

  const response = await buildResponse(info, ctx, true)

  try {
    await ctx.editMessageText(response, {
      parse_mode: 'HTML',
      reply_markup: buildTickerManagementKeyboard(ctx, info.symbol),
    })
    await ctx.answerCbQuery()
  } catch (err) {
    if (
      err.description ===
      'Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'
    ) {
      return await ctx.answerCbQuery()
    }

    await await ctx.answerCbQuery(
      'This message is outdated, please repeat your request.',
      true,
    )
  }
  return
}

export function buildTickerManagementKeyboard(ctx, symbol: string) {
  const result = []

  if ((ctx?.dbuser?.settings?.favorites as string[]).includes(symbol)) {
    result.push(
      [m.callbackButton(ctx.i18n.t('update'), `u_${symbol}`)],
      [m.callbackButton(ctx.i18n.t('chart'), `cg${symbol}`)],
    )
  } else {
    result.push(
      [
        m.callbackButton(ctx.i18n.t('update'), `u_${symbol}`),
        m.callbackButton(ctx.i18n.t('addToFavorite'), `f_${symbol}`),
      ],
      [m.callbackButton(ctx.i18n.t('chart'), `cg${symbol}`)],
    )
  }
  return m.inlineKeyboard(result)
}

async function buildTickersKeyboard(query: string) {
  const result = []

  const apiResult = await findTickers(query)

  if (!apiResult) {
    return false
  }

  apiResult.forEach(field => {
    result.push([
      m.callbackButton(
        `${field.symbol} - ${field.shortname || 'NOT PROVIDED!'}`,
        `t_${field.symbol}`,
      ),
    ])
  })

  return m.inlineKeyboard(result)
}
