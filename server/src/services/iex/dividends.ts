import iexCloud from './iexcloud';

export interface Dividend {
	symbol: string;
	exDate: string;
	paymentDate: string;
	recordDate: string;
	declaredDate: string;
	amount: number;
}

export async function dividends (symbol: string): Promise<Dividend[]> {
	const path = `/stock/${symbol}/dividends/next`;
	const iexDividends = await iexCloud(path);

	return iexDividends.map((dividend: Dividend) => ({
		symbol: dividend.symbol,
		exDate: dividend.exDate,
		paymentDate: dividend.paymentDate,
		recordDate: dividend.recordDate,
		declaredDate: dividend.declaredDate,
		amount: dividend.amount
	}))
}
