import React, { useState } from 'react'
import useMountEffect from '@/hooks/use-mount-effect'
import { useHistory } from 'react-router-dom'
import {
	Autocomplete
} from '@material-ui/lab'
import {
	TextField,
	InputAdornment
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import api from '@/api'
import levenshtein from 'js-levenshtein'

export default function StockSearchBar () {
	const [stocks, setStocks] = useState([])
	const [filterText, setFilterText] = useState('')
	const history = useHistory()

	useMountEffect(() => {
		async function getStocks () {
			const stockResponse = await api.get('/stocks')

			setStocks(stockResponse.data)
		}

		getStocks()
	})

	function getOptionNameForStock (stock) {
		return `${stock.symbol} (${stock.name})`
	}

	function getFilteredStocks () {
		if (!filterText) {
			return []
		}

		const filterTextCompare = filterText.toLowerCase()

		const filteredStocks = stocks
			.filter(stock => (
				stock.symbol.toLowerCase().includes(filterTextCompare) ||
				stock.name.toLowerCase().includes(filterTextCompare)) ||
				getOptionNameForStock(stock).toLowerCase().includes(filterTextCompare)
			)
			.sort((a, b) => {
				const aSymbolEditDistance = levenshtein(a.symbol.toLowerCase(), filterTextCompare)
				const bSymbolEditDistance = levenshtein(b.symbol.toLowerCase(), filterTextCompare)

				if (aSymbolEditDistance !== bSymbolEditDistance) {
					return aSymbolEditDistance - bSymbolEditDistance
				}

				const aNameEditDistance = levenshtein(a.name.toLowerCase(), filterTextCompare)
				const bNameEditDistance = levenshtein(b.name.toLowerCase(), filterTextCompare)

				return aNameEditDistance - bNameEditDistance
			})
			.slice(0, 10)

		return filteredStocks
	}

	function onStockSelect (stock) {
		if (stock) {
			history.push(`/stocks/${stock.symbol}`)
		}
	}

	function renderInputAdornment () {
		return (
			<InputAdornment position='start'>
				<FontAwesomeIcon
					icon={faSearch}
					style={{ marginLeft: '8px' }}
				/>
			</InputAdornment>
		)
	}

	function renderInput (params) {
		if (params.InputProps) {
			params.InputProps.startAdornment = renderInputAdornment()
		}

		return (
			<TextField
				{...params}
				placeholder='Search for stocks'
			/>
		)
	}

	return (
		<Autocomplete
			inputValue={filterText}
			onInputChange={(event, value) => setFilterText(value)}
			options={getFilteredStocks()}
			getOptionLabel={getOptionNameForStock}
			onChange={(event, value) => onStockSelect(value)}
			renderInput={renderInput}
		/>
	)
}
