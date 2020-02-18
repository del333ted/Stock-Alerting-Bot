import { getStockChart } from './getTickers'
import * as tulind from 'tulind'

export const calculateIndexes = async (ticker: string) => {
  const chartData = await getStockChart(ticker)

  let graphData = chartData?.indicators?.quote ?? false

  if (!graphData?.length) {
    return false
  }

  graphData = await formatPureData(graphData[0], [
    'close',
    'open',
    'high',
    'volume',
    'low',
  ])

  const [psar] = (await indexCalculator(
    'psar',
    [graphData.high, graphData.low],
    [0.02, 0.2],
  )) as number[][]

  return {
    psar: psar,
    close: graphData.close[graphData.close.length - 1],
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
    data[property] = data[property].filter(v => {
      return v && v > 0
    })
  }

  return data
}
