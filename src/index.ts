// Dependencies
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
import Telegraf from 'telegraf'
import { checkTime } from './middlewares/checkTime'
import { attachUser } from './middlewares/attachUser'
import { setupI18N } from './helpers/i18n'
import { localesFiles, handleLanguage, sendLanguage } from './commands/language'
import { checkLanguage } from './middlewares/checkLanguage'
import { sendHelp } from './commands/help'
import { collectStatistic } from './middlewares/collectStatistic'
import { checkStarted } from './middlewares/checkStarted'
import {
  tickersInline,
  handleTicker,
  handleTickerUpdate,
} from './helpers/tickersInline'
import { sendTimzone, handleTimezone } from './commands/timezone'
import { sendFavorites } from './commands/favorites'
import { sendSettings } from './commands/settings'
import { checkIfPrivate } from './middlewares/checkIfPrivate'
import { handleFavorites } from './helpers/handleFavorites'
import { handleInlineQuery } from './helpers/inlineQuery'
const { match } = require('telegraf-i18n')

export const bot = new Telegraf(process.env.BOT_TOKEN)

// Check if the message needs to be handled
bot.use(checkTime)
bot.use(collectStatistic)
bot.on('inline_query', handleInlineQuery)
// Attach user with db
bot.use(attachUser)
bot.use(checkIfPrivate)
// Localization
setupI18N(bot)
// Check if the language keyboard is pressed
bot.action(
  localesFiles().map(file => file.split('.')[0]),
  handleLanguage,
)
// Check if user has set the language
bot.use(checkLanguage)

bot.command(['start', 'help'], sendHelp)
bot.command('timezone', sendTimzone)
bot.command('language', sendLanguage)
bot.hears(match('settings'), sendSettings)
bot.hears(match('favorites'), sendFavorites)

bot.on('text', checkStarted, tickersInline)
bot.action(/^t_/, handleTicker)
bot.action(/^u_/, handleTickerUpdate)
bot.action(/^f_/, handleFavorites)
bot.action(/^time_/, handleTimezone)

bot.catch(a => {
  console.log(a)
})

bot.startPolling()
