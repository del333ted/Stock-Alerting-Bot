import { tickerData } from './getTickers'
import { ContextMessageUpdate } from 'telegraf'
import * as moment from 'moment-timezone'

export async function buildResponse(
  info: tickerData,
  ctx: ContextMessageUpdate,
  updateField?: boolean,
) {
  return `${info.symbol} <b>${info.currentPrice} (${
    info.currentPricePercent
  }%) ${upOrDownEmoji(info.currentPricePercentRaw)}</b>
    
${ctx.i18n.t('changed')} ${info.currentPriceTime}
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
${ctx.i18n.t('changed')} ${info.postPriceTime}
`
  }
  return ''
}

export function preMarket(info: tickerData, ctx: ContextMessageUpdate) {
  if (info.pre) {
    return `
${ctx.i18n.t('preMarket')} <b>${info.prePrice} (${
      info.prePricePercent
    }%) ${upOrDownEmoji(info.prePricePercentRaw)}</b>
${ctx.i18n.t('changed')} ${info.prePriceTime}
`
  }
  return ''
}

export function upOrDownEmoji(n: number) {
  if (n > 50) {
    return '⏫‼️'
  } else if (n > 10) {
    return '⏫'
  } else if (n > 5) {
    return '⬆️'
  } else if (n > 0) {
    return '↗️'
  } else if (n === 0) {
    return '⏺'
  } else if (n < -50) {
    return '⏬‼️'
  } else if (n < -10) {
    return '⏬'
  } else if (n < -5) {
    return '⬇️'
  } else if (n < 0) {
    return '↘️'
  }
}

function updatedAt(ctx: ContextMessageUpdate, y: boolean) {
  if (y) {
    return `<i>${ctx.i18n.t('updated')} ${moment(new Date()).format(
      'LT DD.MM.YYYY',
    )}</i>`
  }
  return ``
}
