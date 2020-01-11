import { ContextMessageUpdate, Markup as m } from 'telegraf'
import { UserModel, RequestModel } from '../models'

export async function sendStatistic(ctx: ContextMessageUpdate) {
  if (ctx.message.from.id === Number(process.env.BOT_OWNER)) {
    const users = await UserModel.find({}).count()
    const requests = await RequestModel.find({}).count()
    return ctx.replyWithHTML(`<b>Статистика</b>
      
Пользователей: <b>${users}</b>

Запросов: <b>${requests}</b>
        `)
  }
  return
}
