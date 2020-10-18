import iexCloud from './iexcloud'

export interface IntradayPrice {
	date: string
	minute: string
	label: string
	high: number
	low: number
	open: number
	close: number
	average: number
	volume: number
	notional: number
	numberOfTrades: number
}

export async function intradayPrices (symbol: string): Promise<IntradayPrice[]> {
	const path = `/stock/${symbol}/intraday-prices`
	const iexIntradayPrices = await iexCloud(path, {
		chartIEXOnly: true
	})

	return iexIntradayPrices
}
