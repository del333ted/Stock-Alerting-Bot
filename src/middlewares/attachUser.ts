// Dependencies
import { findUser, User } from '../models'
import { ContextMessageUpdate } from 'telegraf'
import { saveSession } from '../helpers/session'
import { DocumentType } from '@typegoose/typegoose'

export async function attachUser(ctx: ContextMessageUpdate, next) {
  const dbuser = await findUser(ctx.from.id)

  if (!dbuser) {
    return ctx.reply('Auth error.')
  }
  ctx.dbuser = dbuser as DocumentType<User>
  ctx.saveSession = saveSession
  if (!ctx.dbuser.session) {
    ctx.dbuser.session = { stage: 'default' }
    await ctx.dbuser.save()
  }
  if (!ctx.dbuser.settings) {
    ctx.dbuser.settings = { timezone: 0, notify: false }
    await ctx.dbuser.save()
  }
  next()
}
