import { UserModel, User } from '../models'
import {
  getStockInfoByTickers,
  formatTickerData,
  tickerData,
  formatNumberWithSignAndCurr,
  getTimezone,
} from './getTickers'
import { upOrDownEmoji } from './buildResponse'
import { bot } from '../index'
import * as moment from 'moment-timezone'
import { calculateIndexes } from './calculateIndexes'

export async function setupNotifyWorker() {
  NotifyWorker()
  setInterval(NotifyWorker, 60 * 1000)
}

export async function NotifyWorker() {
  const UsersNotify = await UserModel.find({
    'settings.notify': true,
    'settings.favorites.0': { $exists: true },
    'settings.notifyPeriod': { $exists: true },
  })

  let a = 0

  UsersNotify.forEach(async (uNotify) => {
    a++
    if (!uNotify.settings.lastNotify) {
      try {
        await sendNotify(uNotify.settings.favorites, uNotify)

        uNotify.settings.lastNotify = Date.now() / 1000
        await uNotify.save()
      } catch (e) {
        bot.telegram.sendMessage(Number(process.env.BOT_OWNER), e.toString())
      }
      return
    }
    if (
      uNotify.settings.lastNotify + uNotify?.settings?.notifyPeriod <
      Date.now() / 1000
    ) {
      await sendNotify(uNotify.settings.favorites, uNotify)

      uNotify.settings.lastNotify = Date.now() / 1000
      await uNotify.save()
      return
    }
  })

  bot.telegram.sendMessage(Number(process.env.BOT_OWNER), a.toString())
}

async function sendNotify(symbols: string[], user: User) {
  let notifyText = `<b>${l('report', user.telegramLanguage)}</b> <i>${moment(
    new Date(),
  )
    .tz(`Etc/GMT${getTimezone(user.settings.timezone)}`)
    .format('LT DD.MM')}</i>`
  const response = await getStockInfoByTickers(symbols)
  for (const ticker of response) {
    const info = await formatTickerData(ticker, user.settings.timezone)
    notifyText = notifyText + '\n\n' + (await buildNotifyResponse(info, user))
  }

  try {
    await bot.telegram.sendMessage(user.telegramId, notifyText, {
      parse_mode: 'HTML',
    })
  } catch (e) {
    bot.telegram.sendMessage(Number(process.env.BOT_OWNER), e.toString())
  }
}

async function buildNotifyResponse(info: tickerData, user: User) {
  const lang = user.telegramLanguage
  return `${info.symbol} <b>${info.currentPrice} (${
    info.currentPricePercent
  }%) ${upOrDownEmoji(info.currentPricePercentRaw)}</b>
${await indexesInfo(info)}  
${postMarket(info, user)}${preMarket(info, user)}
`
}

function postMarket(info: tickerData, user: User) {
  if (info.post) {
    const lang = user.telegramLanguage
    return `${l('afterMarketClosed', lang)} <b>${info.postPrice} (${
      info.postPricePercent
    }%) ${upOrDownEmoji(info.postPricePercentRaw)}</b>`
  }
  return ''
}

function preMarket(info: tickerData, user: User) {
  if (info.pre) {
    const lang = user.telegramLanguage
    return `${l('preMarket', lang)} <b>${info.prePrice} (${
      info.prePricePercent
    }%) ${upOrDownEmoji(info.prePricePercentRaw)}</b>`
  }
  return ''
}

export async function indexesInfo(info: tickerData) {
  const indexesCalculated = await calculateIndexes(info.symbol)
  if (!indexesCalculated || !indexesCalculated.psar) {
    return ''
  }
  return `<b>PSAR (0.02, 0.2):</b> ${formatNumberWithSignAndCurr(
    indexesCalculated.psar[indexesCalculated.psar.length - 1],
    info.currency,
  )}`
}

const phrases = {
  en: {
    report: 'R E P O R T',
    changed: 'Changed at',
    preMarket: 'Pre-market:',
    afterMarketClosed: 'After-market:',
    exchange: 'Exchange:',
    exchangeTime: 'Exchange time:',
  },
  ru: {
    report: 'О Т Ч Е Т',
    changed: 'Изменено:',
    preMarket: 'Премаркет:',
    afterMarketClosed: 'Постмаркет:',
    exchange: 'Биржа:',
    exchangeTime: 'Время биржи:',
  },
}

function l(phrase: string, lang: string) {
  return phrases[lang][phrase] || '???'
}
