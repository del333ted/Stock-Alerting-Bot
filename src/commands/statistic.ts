import { ContextMessageUpdate, Markup as m } from 'telegraf'
import { UserModel, RequestModel } from '../models'

export async function sendStatistic(ctx: ContextMessageUpdate) {
  if (ctx.message.from.id === Number(process.env.BOT_OWNER)) {
    const users = await UserModel.find({}).count()
    const usersNotify = await UserModel.find({
      'settings.notify': true,
    }).count()

    const usersDisabledSendout = await UserModel.find({
      'settings.sendoutDisabled': true,
    }).count()

    const requests = await RequestModel.find({}).count()
    return ctx.replyWithHTML(`<b>Статистека</b>  
      
Пользователей: <b>${users}</b>

Пользователей с уведомлениями: <b>${usersNotify}</b>

Пользователей с выключенной рассылкой: <b>${usersDisabledSendout}</b>

Запросов: <b>${requests}</b>
        `)
  }
  return
}
