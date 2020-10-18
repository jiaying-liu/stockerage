import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCurrentUser } from '@/actions/current-user'
import useMountEffect from '@/hooks/use-mount-effect'
import { useHistory } from 'react-router-dom'
import {
	AppBar,
	Toolbar,
	makeStyles,
	fade
} from '@material-ui/core'
import StockSearchBar from './header/StockSearchBar'
import Notification from './header/Notification'
import Account from './header/Account'
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
	searchBar: {
		backgroundColor: fade(theme.palette.common.white, 0.15),
		flexGrow: 1,
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
		}
	},
	'iconSection': {
		display: 'flex'
	}
}))

export default function Header () {
	const currentUser = useSelector(state => state.currentUser)
	const classes = useStyles()
	const dispatch = useDispatch()
	const history = useHistory()

	useMountEffect(() => {
		async function getCurrentUser () {
			try {
				await dispatch(fetchCurrentUser())
			} catch {
				history.push('/login')
			} 
		}

		getCurrentUser()
	})

	if (!currentUser) {
		return null
	}

	return (
		<AppBar position="fixed">
			<Toolbar>
				<Link
					to='/'
					style={{ color: 'inherit', textDecoration: 'inherit' }}
				>
					<h3 style={{ marginRight: '16px' }}>Stockerage</h3>
				</Link>
				<div className={classes.searchBar}>
					<StockSearchBar />
				</div>
				<div style={{ flexGrow: 1 }} />
				<div className={classes.iconSection}>
					{/* <IconButton
						color='inherit'
						style={{ marginRight: '8px' }}
					>
						<FontAwesomeIcon
							icon={faBell}
						/>
					</IconButton> */}
					<div style={{ marginRight: '8px' }}>
						<Notification />
					</div>
					<Account />
				</div>
			</Toolbar>
		</AppBar>
	)
}
