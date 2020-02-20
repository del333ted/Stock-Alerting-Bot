import { getStockChart } from './getTickers'
import * as tulind from 'tulind'

export const calculateIndexes = async (ticker: string) => {
  let chartData = await getStockChart(ticker)

  let graphData = chartData?.indicators?.quote ?? false

  if (!graphData?.length || !chartData?.timestamp?.length) {
    return false
  }

  chartData = await formatPureData(chartData, ['timestamp'])

  graphData = await formatPureData(graphData[0], ['close', 'high', 'low'])

  const [psar] = (await indexCalculator(
    'psar',
    [graphData.high, graphData.low],
    [0.02, 0.2],
  )) as number[][]

  if (psar.length < graphData.close.length) {
    psar.unshift(psar[0])
  }

  return {
    psar: psar,
    close: graphData.close[graphData.close.length - 1],
    closeArray: graphData.close,
    timestamp: chartData.timestamp,
  }
}

export const indexCalculator = async (
  name: string,
  data: any[],
  options: any[],
) => {
  return new Promise((res, rej) => {
    tulind.indicators[name].indicator(data, options, (err, data) => {
      if (err) return rej(err)
      res(data)
    })
  })
}

export const formatPureData = async (data: any, properties: string[]) => {
  for (const property of properties) {
    const sum = data[property].reduce((a, b) => a + b, 0)
    const avg = sum / data[property].length || 0

    data[property] = data[property].map((v, i) => {
      if (!v || v < 1) {
        if (data[property][i - 1]) {
          v = data[property][i - 1]
        } else {
          v = avg
        }
      }
      return v
    })
  }

  return data
}
