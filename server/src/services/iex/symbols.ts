import iexCloud from './iexcloud'

export interface Symbol {
	symbol: string
	name: string
}

export async function symbols (): Promise<Symbol[]> {
	const path = '/ref-data/symbols'
	const iexSymbols = await iexCloud(path)
	console.log('iex symbols are', iexSymbols)

	return iexSymbols.map((iexSymbol: Symbol) => ({
		symbol: iexSymbol.symbol,
		name: iexSymbol.name
	}))
}
