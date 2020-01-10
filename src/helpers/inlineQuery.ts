import { ContextMessageUpdate } from 'telegraf'
import {
  findTickers,
  getStockInfoByTickers,
  tickerData,
  formatTickerData,
} from './getTickers'
import { upOrDownEmoji } from './buildResponse'

export async function handleInlineQuery({
  message,
  inlineQuery,
  answerInlineQuery,
}: ContextMessageUpdate) {
  if (inlineQuery.query) {
    const query = inlineQuery.query
    const result = []

    const apiResult = await findTickers(query)

    if (!apiResult) {
      return answerInlineQuery([], { is_personal: true, cache_time: 0 })
    }

    for (const field of apiResult) {
      const request = await getStockInfoByTickers([field.symbol])
      const info = await formatTickerData(request[0], 0)
      result.push({
        type: 'article',
        id: new Date().getTime().toString(),
        title: `${field.symbol} (${info.currentPrice})`,
        description: `${info.company || 'NOT PROVIDED'}`,
        input_message_content: {
          message_text: `${info.symbol} <b>${info.currentPrice} (${
            info.currentPricePercent
          }%) ${upOrDownEmoji(info.currentPricePercentRaw)}</b>`,
          parse_mode: 'HTML',
        },
      })
    }

    await answerInlineQuery(result, {
      is_personal: true,
      cache_time: 0,
      switch_pm_text: 'Use all features',
      switch_pm_parameter: 'inline',
    })
  }
}
