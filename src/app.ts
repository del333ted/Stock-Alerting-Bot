
import * as dotenv from "dotenv"
dotenv.config({ path:`${__dirname}/../.env`})
import Telegraf from 'telegraf'
import { setupBot } from './bot'

export const bot = new Telegraf(process.env.BOT_TOKEN)

setupBot(bot)

bot.startPolling()
