import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
	IconButton,
	Menu,
	MenuItem
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { logoutCurrentUser } from '@/actions/current-user'

export default function Account () {
	const [anchorEl, setAnchorEl] = useState(null)
	const dispatch = useDispatch()
	const history = useHistory()

	function onMenuClose () {
		setAnchorEl(null)
	}

	function onIconButtonClick (event) {
		setAnchorEl(event.currentTarget)
	}

	async function onLogoutClick () {
		await dispatch(logoutCurrentUser())
		history.push('/login')
	}

	return (
		<div>
			<IconButton
				color='inherit'
				onClick={onIconButtonClick}
			>
				<FontAwesomeIcon icon={faUserCircle} />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				open={Boolean(anchorEl)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				onClose={onMenuClose}
			>
				<MenuItem onClick={onLogoutClick}>Logout</MenuItem>
			</Menu>
		</div>
	)
}
