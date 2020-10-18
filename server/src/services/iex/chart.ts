import iexCloud from './iexcloud'

export interface ChartDataPoint {
	date: string
	close: number
	volume: number
}

export async function chart (symbol: string, range: string): Promise<ChartDataPoint[]> {
	const path = `/stock/${symbol}/chart/${range}`
	const iexChart = await iexCloud(path, {
		chartCloseOnly: true
	})

	return iexChart.map((chartDataPoint: ChartDataPoint) => ({
		date: chartDataPoint.date,
		close: chartDataPoint.close,
		volume: chartDataPoint.volume
	}))
}
