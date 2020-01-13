import { UserModel, User } from '../models'
import { bot } from '../'
import { ContextMessageUpdate } from 'telegraf'
import { DocumentType } from '@typegoose/typegoose'

async function sendOut(text: string) {
  try {
    const users = await UserModel.find()

    let n = 1
    let usersCount = 0
    for (const user of users) {
      if (!user?.settings?.sendoutDisabled) {
        try {
          await bot.telegram.sendMessage(user.telegramId, text, {
            parse_mode: 'HTML',
          })
          usersCount = usersCount + 1
        } catch (e) {}

        if (n > 19) {
          await sleep(1000)
          n = 0
        }
        n = n + 1
      }
    }
    return usersCount
  } catch (err) {
    bot.telegram.sendMessage(Number(process.env.BOT_OWNER), err.toString())
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function sendoutCommand(ctx: ContextMessageUpdate) {
  if (ctx.message.from.id === Number(process.env.BOT_OWNER)) {
    const text = ctx.message.text.substr(9)
    const answ = await sendOut(text)
    await ctx.reply(`Sendout done.
      
Users: ${answ}`)
  }
}

export async function unsubCommand(ctx: ContextMessageUpdate) {
  ctx.dbuser.settings.sendoutDisabled = true
  await ctx.dbuser.save()

  await ctx.reply(ctx.i18n.t('unsub'))
}

export async function subCommand(ctx: ContextMessageUpdate) {
  ctx.dbuser.settings.sendoutDisabled = false
  await ctx.dbuser.save()

  await ctx.reply(ctx.i18n.t('sub'))
}
