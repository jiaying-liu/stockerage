import React, { useState } from 'react'
import {
	Tabs,
	Tab,
	makeStyles
} from '@material-ui/core'
import {
	grey
} from '@material-ui/core/colors'
import {
	useTheme
} from '@material-ui/core/styles'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer
} from 'recharts'
import { formatCurrencyValue } from '@/helpers/value-format'

const useStyles = makeStyles(() => ({
	timeRangeTabs: {
		marginBottom: '16px',
		borderBottom: `1px solid ${grey[500]}`,
		'& button': {
			minWidth: '72px'
		}
	}
}))

export default function PriceChart ({
	chartData = [],
	timeRangeTabs = [],
	onTimeRangeTabChange,
	height = 250
}) {
	const [timeRange, setTimeRange] = useState(timeRangeTabs.length ? timeRangeTabs[0].value : '')
	const classes = useStyles()
	const theme = useTheme()

	function onTabChange (tabValue) {
		setTimeRange(tabValue)

		if (onTimeRangeTabChange) {
			onTimeRangeTabChange(tabValue)
		}
	}

	function renderRangeTabs () {
		if (!timeRangeTabs.length) {
			return null
		}

		return (
			<Tabs
				value={timeRange}
				onChange={(event, value) => onTabChange(value)}
				indicatorColor='primary'
				textColor='primary'
				className={classes.timeRangeTabs}
			>
				{timeRangeTabs.map((tab, index) => (
					<Tab
						key={index}
						label={tab.label}
						value={tab.value}
					/>
				))}
			</Tabs>
		)
	}

	function renderCustomTooltip ({ active, payload, label }) {
		if (active && payload && payload.length) {
			return (
				<div style={{ color: 'white', backgroundColor: grey[800], padding: '8px' }}>
					{label}: {formatCurrencyValue(payload[0].value)}
				</div>
			)
		}

		return null
	}

	if (!chartData) {
		return null
	}

	return (
		<div>
			{renderRangeTabs()}
			<ResponsiveContainer height={height} width='100%'>
				<LineChart data={chartData}>
					<XAxis dataKey='name' tick={false} />
					<YAxis domain={['auto', 'auto']} hide />
					<Tooltip content={renderCustomTooltip} />
					<Line type='monotone' dataKey='value' dot={false} strokeWidth={2} stroke={theme.palette.primary.main} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
