import { ContextMessageUpdate, Markup as m, Extra } from 'telegraf'
import { formatNumberWithSignAndCurr } from '../helpers/getTickers'
import * as moment from 'moment-timezone'

export async function sendTimzone(ctx: ContextMessageUpdate) {
  return ctx.reply(ctx.i18n.t('selectTimezone'), {
    reply_markup: timezoneKeyboard(),
  })
}

export function timezoneKeyboard() {
  const result = []
  let offset = -12
  for (let _i = 0; _i < 5; _i++) {
    let subresult = []
    for (let __i = 0; __i < 4; __i++) {
      if (offset < 0) {
        subresult.push(
          m.callbackButton(
            moment()
              .tz(`Etc/GMT+${Math.abs(offset)}`)
              .format('HH:mm'),
            `time_${offset}`,
          ),
        )
        offset = offset + 1
      } else {
        subresult.push(
          m.callbackButton(
            moment()
              .tz(`Etc/GMT-${Math.abs(offset)}`)
              .format('HH:mm'),
            `time_${offset}`,
          ),
        )
        offset = offset + 1
      }
    }
    result.push(subresult)
    subresult = []
  }

  return m.inlineKeyboard(result)
}

export async function handleTimezone(ctx: ContextMessageUpdate) {
  const timezone = parseInt(ctx.callbackQuery.data.substr(5))

  ctx.dbuser.settings.timezone = timezone
  await ctx.dbuser.save()

  await ctx.answerCbQuery()

  await ctx.editMessageText(
    ctx.i18n.t('timezoneDone', {
      timezone: formatNumberWithSignAndCurr(timezone),
    }),
    {
      parse_mode: 'HTML',
    },
  )
  if (ctx.dbuser.session.stage === 'languageSelected') {
    ctx.dbuser.session.stage = 'botStarted'
    await ctx.saveSession()
    return ctx.reply(ctx.i18n.t('help'))
  }
}
