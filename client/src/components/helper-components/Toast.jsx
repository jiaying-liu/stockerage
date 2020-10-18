import React from 'react'
import {
	Snackbar
} from '@material-ui/core'
import {
	Alert
} from '@material-ui/lab'

export default function Toast ({ open = false, message, onClose }) {
	return (
		<Snackbar
			open={open}
			autoHideDuration={5000}
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'center'
			}}
			onClose={onClose}
		>
			<Alert
				severity='info'
				onClose={onClose}
			>
				{message}
			</Alert>
		</Snackbar>
	)
}
