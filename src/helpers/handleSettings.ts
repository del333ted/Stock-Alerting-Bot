import { ContextMessageUpdate, Markup as m } from 'telegraf'
import { settingsKeyboard } from '../commands/settings'
import { defaultKeyboard } from '../commands/help'
import { sendTimzone } from '../commands/timezone'

export async function handleLanguageSettings(ctx: ContextMessageUpdate) {
  try {
    switch (ctx.dbuser.telegramLanguage) {
      case 'en':
        ctx.dbuser.telegramLanguage = 'ru'
        await ctx.dbuser.save()
        break
      case 'ru':
        ctx.dbuser.telegramLanguage = 'en'
        await ctx.dbuser.save()
        break
      default:
        return
    }
    await ctx.i18n.locale(ctx.dbuser.telegramLanguage)
    await ctx.answerCbQuery()

    await ctx.replyWithHTML(
      ctx.i18n.t('language_selected'),
      defaultKeyboard(ctx),
    )
    await ctx.editMessageText(ctx.i18n.t('settingsText'), {
      reply_markup: settingsKeyboard(ctx),
      parse_mode: 'HTML',
    })
  } catch (e) {}

  return
}

export async function handleTimezoneSettings(ctx: ContextMessageUpdate) {
  await ctx.answerCbQuery()
  sendTimzone(ctx)

  return
}

export async function handleNotify(ctx: ContextMessageUpdate) {
  if (ctx.dbuser.settings.notify) {
    ctx.dbuser.settings.notify = false
  } else {
    ctx.dbuser.settings.notify = true
  }
  await ctx.dbuser.save()

  await ctx.answerCbQuery()
  await ctx.editMessageReplyMarkup(settingsKeyboard(ctx))

  return
}

export async function handleNotifyPeriod(ctx: ContextMessageUpdate) {
  await ctx.answerCbQuery()
  await ctx.editMessageText(ctx.i18n.t('periodSettingsText'), {
    reply_markup: notifyPeriodKeyboard(ctx),
  })
  return
}

function notifyPeriodKeyboard(ctx: ContextMessageUpdate) {
  const result = []

  result.push([
    m.callbackButton(
      ctx.i18n.t('minutes', {
        m: 5,
      }),
      'period_300',
    ),
    m.callbackButton(
      ctx.i18n.t('minutes', {
        m: 10,
      }),
      'period_600',
    ),
    m.callbackButton(
      ctx.i18n.t('minutes', {
        m: 15,
      }),
      'period_900',
    ),
  ])
  result.push([
    m.callbackButton(
      ctx.i18n.t('minutes', {
        m: 30,
      }),
      'period_1800',
    ),
    m.callbackButton(
      ctx.i18n.t('hours', {
        h: 1,
      }),
      'period_3600',
    ),
    m.callbackButton(
      ctx.i18n.t('hours', {
        h: 3,
      }),
      'period_10800',
    ),
  ])
  result.push([
    m.callbackButton(
      ctx.i18n.t('hours', {
        h: 6,
      }),
      'period_21600',
    ),
    m.callbackButton(
      ctx.i18n.t('hours', {
        h: 12,
      }),
      'period_43200',
    ),
    m.callbackButton(
      ctx.i18n.t('days', {
        d: 1,
      }),
      'period_86400',
    ),
  ])

  return m.inlineKeyboard(result)
}

export async function handlePeriodSet(ctx: ContextMessageUpdate) {
  const time = parseInt(ctx.callbackQuery.data.substr(7))

  ctx.dbuser.settings.notifyPeriod = time
  await ctx.dbuser.save()

  await ctx.answerCbQuery()
  await ctx.editMessageText(ctx.i18n.t('settingsText'), {
    reply_markup: settingsKeyboard(ctx),
    parse_mode: 'HTML',
  })
  return
}
