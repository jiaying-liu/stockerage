import iexCloud from './iexcloud'

export interface KeyStats {
	companyName: string
	marketcap: number
	week52high: number
	week52low: number
	sharesOutstanding: number
	dividendYield: number
	peRatio: number
	avg10Volume: number
	nextEarningsDate: string
}

export async function keyStats (symbol: string): Promise<KeyStats> {
	const path = `/stock/${symbol}/stats`
	const iexKeyStats = await iexCloud(path)

	return {
		companyName: iexKeyStats.companyName,
		marketcap: iexKeyStats.marketcap,
		week52high: iexKeyStats.week52high,
		week52low: iexKeyStats.week52low,
		sharesOutstanding: iexKeyStats.sharesOutstanding,
		dividendYield: iexKeyStats.dividendYield,
		peRatio: iexKeyStats.peRatio,
		avg10Volume: iexKeyStats.avg10Volume,
		nextEarningsDate: iexKeyStats.nextEarningsDate
	}
}
