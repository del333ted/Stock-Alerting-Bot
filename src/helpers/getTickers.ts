// Dependencies
import axios from 'axios'
import * as moment from 'moment-timezone'

const formatCurrency = require('currency-formatter')

const axiosInstance = axios.create({
  baseURL: 'https://query1.finance.yahoo.com/v7/finance/',
  timeout: 1000,
  headers: { UserAgent: 'Telegram bot' },
})

const axiosGoChartAPI = axios.create({
  baseURL: 'http://localhost:3001/StockAlertingBot/',
  timeout: 1000,
  headers: { UserAgent: 'Telegram bot Stock Alerting Bot' },
})

const axiosSearchInstance = axios.create({
  baseURL: 'https://query1.finance.yahoo.com/v1/finance/',
  timeout: 1000,
  headers: { UserAgent: 'Telegram bot' },
})

const axiosChartInstance = axios.create({
  baseURL: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  timeout: 1000,
  headers: { UserAgent: 'Telegram bot' },
})

const requestTickersParams = {
  formatted: false,
  region: 'US',
  lang: 'en-US',
}

const requestChartParams = {
  region: 'US',
  lang: 'en-US',
  includePrePost: true,
}

const requestSearchParams = {
  quotesCount: 5,
  newsCount: 0,
}

// TODO: format search data
export async function findTickers(query: string) {
  try {
    const response = await axiosSearchInstance.get('/search', {
      params: {
        ...requestSearchParams,
        q: query,
      },
    })
    if (response?.data?.quotes?.length > 0) {
      return response.data.quotes
    }
    return false
  } catch (err) {
    return false
  }
}

export async function getStockChart(ticker: string) {
  try {
    const dateNow = new Date().getTime() / 1000
    const dateOld = (new Date().getTime() - 1000 * 86400 * 10) / 1000

    const response = await axiosChartInstance.get(`/${ticker}?interval=60m`, {
      params: {
        period1: Number(dateOld.toFixed(0)),
        period2: Number(dateNow.toFixed(0)),
        ...requestChartParams,
      },
    })

    return response?.data?.chart?.result[0] ?? false
  } catch (e) {
    console.log(e)
    return false
  }
}

export async function sendChartImage(chartData: any, user: number) {
  try {
    const response = await axiosGoChartAPI.post(`/analytics`, {
      chartData,
      user,
      token: process.env.BOT_TOKEN,
    })

    return true
  } catch (e) {
    return false
  }
}

export async function getStockInfoByTickers(tickers: string[]) {
  const symbols = tickers.join(',')
  try {
    const response = await axiosInstance.get('/quote', {
      params: {
        ...requestTickersParams,
        symbols,
      },
    })

    return response?.data?.quoteResponse?.result ?? false
  } catch {
    return false
  }
}

export interface tickerData {
  exchange: string
  exchangeTimezone: string
  currentPrice: string
  currentPriceTime: string
  currentPriceMarketTime: string
  currentPricePercent: string
  currentPricePercentRaw: number
  currency: string
  symbol: string
  company: string
  marketCap: number
  post: boolean
  postPrice: string
  postPricePercent: string
  postPriceTime: string
  postPricePercentRaw: number
  pre: boolean
  prePrice: string
  prePricePercent: string
  prePriceTime: string
  prePricePercentRaw: number
}

export async function formatTickerData(ticker: any, timezone: number) {
  const response: any = {}
  response.post = false
  response.pre = false

  // IF market closed
  if (ticker.postMarketPrice) {
    response.post = true
    response.postPrice = formatNumberWithSignAndCurr(
      ticker.postMarketPrice,
      ticker.currency,
    )
    response.postPricePercent = formatNumberWithSignAndCurr(
      ticker.postMarketChangePercent,
    )
    response.postPricePercentRaw = ticker.postMarketChangePercent
    response.postPriceTime = moment(new Date(ticker.postMarketTime * 1000))
      .tz(`Etc/GMT${getTimezone(timezone)}`)
      .format('LT DD.MM.YYYY')
  }
  // IF Pre-market
  if (ticker.preMarketPrice) {
    response.pre = true
    response.prePrice = formatNumberWithSignAndCurr(
      ticker.preMarketPrice,
      ticker.currency,
    )
    response.prePricePercent = formatNumberWithSignAndCurr(
      ticker.preMarketChangePercent,
    )
    response.prePricePercentRaw = ticker.preMarketChangePercent
    response.prePriceTime = moment(new Date(ticker.preMarketTime * 1000))
      .tz(`Etc/GMT${getTimezone(timezone)}`)
      .format('LT DD.MM.YYYY')
  }

  response.exchange = ticker.fullExchangeName
  response.exchangeTimezone = ticker.exchangeTimezoneShortName

  response.currentPrice = formatNumberWithSignAndCurr(
    ticker.regularMarketPrice,
    ticker.currency,
  )
  response.currentPriceTime = moment(new Date(ticker.regularMarketTime * 1000))
    .tz(`Etc/GMT${getTimezone(timezone)}`)
    .format('LT DD.MM.YYYY')
  response.currentPriceMarketTime = moment(
    new Date(
      (ticker.regularMarketTime + ticker.gmtOffSetMilliseconds / 1000) * 1000,
    ),
  ).format('LT DD.MM.YYYY')
  response.currentPricePercent = formatNumberWithSignAndCurr(
    ticker.regularMarketChangePercent,
  )
  response.currentPricePercentRaw = ticker.regularMarketChangePercent
  response.symbol = ticker.symbol
  response.currency = ticker.currency
  response.company = ticker.shortName || ticker.longName
  response.marketCap = ticker.marketCap
  return response as tickerData
}

export function formatNumberWithSignAndCurr(n: number, curvalue?: string) {
  if (curvalue) {
    return `${formatCurrency.format(n, { code: curvalue })}`
  }
  if (n > 0) {
    return `+${n.toFixed(2).toString()}`
  } else {
    return `${n.toFixed(2)}`
  }
}

export function getTimezone(n: number) {
  if (n > 0) {
    return `-${Math.abs(n)}`
  }
  return `+${Math.abs(n)}`
}

// fiftyTwoWeekXXX -- 52 weeks analytics
