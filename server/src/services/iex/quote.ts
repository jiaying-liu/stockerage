import iexCloud from './iexcloud'

export interface Quote {
	symbol: string
	companyName: string
	latestPrice: number
	volume: number
	previousClose: number
}

export async function quote (symbol: string): Promise<Quote> {
	const path = `/stock/${symbol}/quote`
	const iexQuote = await iexCloud(path)

	return {
		symbol: iexQuote.symbol,
		companyName: iexQuote.companyName,
		latestPrice: iexQuote.latestPrice,
		volume: iexQuote.volume,
		previousClose: iexQuote.previousClose
	}
}
