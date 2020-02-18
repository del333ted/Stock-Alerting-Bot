import {
  tickerData,
  getTimezone,
  formatNumberWithSignAndCurr,
} from './getTickers'
import { ContextMessageUpdate } from 'telegraf'
import * as moment from 'moment-timezone'
import { calculateIndexes } from './calculateIndexes'

export async function buildResponse(
  info: tickerData,
  ctx: ContextMessageUpdate,
  updateField?: boolean,
) {
  return `${info.symbol} <b>${info.currentPrice} (${
    info.currentPricePercent
  }%) ${upOrDownEmoji(info.currentPricePercentRaw)}</b>
${await indexesInfo(info, ctx)}
${ctx.i18n.t('changed')} ${
    info.currentPriceTime
  } (GMT ${formatNumberWithSignAndCurr(ctx.dbuser.settings.timezone)})
${ctx.i18n.t('exchange')} ${info.exchange}
${ctx.i18n.t('exchangeTime')} ${info.currentPriceMarketTime} (${
    info.exchangeTimezone
  })
${postMarket(info, ctx)}${preMarket(info, ctx)}
${updatedAt(ctx, updateField)}`
}

export function postMarket(info: tickerData, ctx: ContextMessageUpdate) {
  if (info.post) {
    return `
${ctx.i18n.t('afterMarketClosed')} <b>${info.postPrice} (${
      info.postPricePercent
    }%) ${upOrDownEmoji(info.postPricePercentRaw)}</b>
${ctx.i18n.t('changed')} ${
      info.postPriceTime
    } (GMT ${formatNumberWithSignAndCurr(ctx.dbuser.settings.timezone)})
`
  }
  return ''
}

export async function indexesInfo(info: tickerData, ctx: ContextMessageUpdate) {
  const indexesCalculated = await calculateIndexes(info.symbol)
  if (!indexesCalculated || !indexesCalculated.psar) {
    return ''
  }
  return `<b>PSAR (0.02, 0.2):</b> ${formatNumberWithSignAndCurr(
    indexesCalculated.psar[indexesCalculated.psar.length - 1],
    info.currency,
  )}
  `
}

export function preMarket(info: tickerData, ctx: ContextMessageUpdate) {
  if (info.pre) {
    return `
${ctx.i18n.t('preMarket')} <b>${info.prePrice} (${
      info.prePricePercent
    }%) ${upOrDownEmoji(info.prePricePercentRaw)}</b>
${ctx.i18n.t('changed')} ${
      info.prePriceTime
    } (GMT ${formatNumberWithSignAndCurr(ctx.dbuser.settings.timezone)})
`
  }
  return ''
}

// (x,y) interval
export const emojiIntervals = {
  '0:5': '↗️',
  '5:10': '⬆️',
  '10:50': '⏫',
  '50:100000': '⏫‼️',
  '-5:0': '↘️',
  '-10:-5': '⬇️',
  '-50:-10': '⏬',
  '-100000:-50': '⏬‼️',
  '0': '⏺',
}

export function upOrDownEmoji(n: number) {
  if (n === 0) {
    return emojiIntervals[n.toString()]
  }
  for (const k in emojiIntervals) {
    let [min, max] = k.split(':')
    if (n > parseInt(min) && n < parseInt(max)) {
      return emojiIntervals[k]
    }
  }
}

function updatedAt(ctx: ContextMessageUpdate, y: boolean) {
  if (y) {
    return `<i>${ctx.i18n.t('updated')} ${moment(new Date())
      .tz(`Etc/GMT${getTimezone(ctx.dbuser.settings.timezone)}`)
      .format('LT DD.MM.YYYY')} (GMT ${formatNumberWithSignAndCurr(
      ctx.dbuser.settings.timezone,
    )})</i>`
  }
  return ``
}
