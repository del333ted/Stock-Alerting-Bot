import { ContextMessageUpdate, Markup as m } from 'telegraf'
import { formatNumberWithSignAndCurr } from '../helpers/getTickers'

export function sendSettings(ctx: ContextMessageUpdate) {
  return ctx.replyWithHTML(ctx.i18n.t('settingsText'), {
    reply_markup: settingsKeyboard(ctx),
  })
}

export function settingsKeyboard(ctx: ContextMessageUpdate) {
  const result = []

  // Notify
  if (ctx?.dbuser?.settings?.notify) {
    result.push([
      m.callbackButton(`${ctx.i18n.t('notifications')} ✅`, 'change_notify'),
    ])
  } else {
    result.push([
      m.callbackButton(`${ctx.i18n.t('notifications')} ❌`, 'change_notify'),
    ])
  }

  // Notify period
  result.push([
    m.callbackButton(
      `${ctx.i18n.t('notifyPeriod', {
        min: ctx?.dbuser?.settings?.notifyPeriod || '0',
      })}`,
      'change_period',
    ),
  ])

  // Timezone
  result.push([
    m.callbackButton(
      `${ctx.i18n.t('timezone')} ${formatNumberWithSignAndCurr(
        ctx?.dbuser?.settings?.timezone,
      )}`,
      'change_timezone',
    ),
  ])

  // Language
  result.push([
    m.callbackButton(
      `${ctx.i18n.t('languageSettings')} ${ctx.dbuser.telegramLanguage}`,
      'change_language',
    ),
  ])

  return m.inlineKeyboard(result)
}
