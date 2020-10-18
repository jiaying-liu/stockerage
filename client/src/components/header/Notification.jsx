import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
	IconButton,
	Popover,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Badge,
	Link,
	CircularProgress,
	makeStyles
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faBell
} from '@fortawesome/free-solid-svg-icons'
import Toast from '@/components/helper-components/Toast'
import { fetchUserStocks } from '@/actions/user-stocks'
import { fetchCurrentUser } from '@/actions/current-user'
import useMountEffect from '@/hooks/use-mount-effect'
import api from '@/api'
import EventSource from 'eventsource'
import moment from 'moment-timezone'

const useStyles = makeStyles(theme => ({
	newNotificationIcon: {
		backgroundColor: theme.palette.primary.main,
		borderRadius: '50%',
		height: '12px',
		width: '12px'
	},
	listItemNotificationIconContainer: {
		minWidth: '32px'
	}
}))

export default function Notification () {
	const [anchorEl, setAnchorEl] = useState(null)
	const [eventSource, setEventSource] = useState(null)
	const [notifications, setNotifications] = useState([])
	const [showMoreVisible, setShowMoreVisible] = useState(true)
	const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false)
	const [batchIndex, setBatchIndex] = useState(0)
	const [showSnackbar, setShowSnackbar] = useState(false)
	const [snackbarMessage, setSnackbarMessage] = useState('')
	const classes = useStyles()
	const history = useHistory()
	const currentUser = useSelector(state => state.currentUser)
	const dispatch = useDispatch()

	useMountEffect(() => {
		async function initializeNotifications () {
			const initNotifications = await getNotificationBatch()

			setNotifications(initNotifications)
			setBatchIndex(batchIndex + 1)
		}

		initializeNotifications()
	})

	useEffect(() => {
		function setUpEventSource () {
			if (eventSource) {
				eventSource.close()
			}

			const newEventSource = new EventSource(`${process.env.REACT_APP_API_URL}/sse-notifications/${currentUser.id}`, {
				withCredentials: true,
				headers: {
					Authorization: api.defaults.headers.common['Authorization']
				}
			})
			
			newEventSource.onmessage = event => {
				const newNotifications = getUnaddedNotifications(JSON.parse(event.data))
	
				if (newNotifications.length) {
					dispatch(fetchUserStocks(currentUser.id))
					// TODO: Need to find a way to get updated user cash balance without
					// having need to refetch entire user object from server
					dispatch(fetchCurrentUser())
					setNotifications([...newNotifications, ...notifications])
					setSnackbarMessage(newNotifications[0].content)
					setShowSnackbar(true)
				}
			}

			newEventSource.onerror = () => {
				newEventSource.close()
			}

			setEventSource(newEventSource)
		}

		setUpEventSource()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [notifications])

	function unopenedNotifications () {
		return notifications.filter(notification => notification.status === 'unopened')
	}

	function notificationBadgeAmount () {
		return unopenedNotifications().length
	}

	function notificationBadgeContent () {
		const amount = notificationBadgeAmount()

		return amount >= 10 ? `${10}+` : `${amount}`
	}

	function getNotficationIdHash () {
		return notifications.reduce((acc, notification) => {
			acc[Number(notification.id)] = true

			return acc
		}, {})
	}

	function getUnaddedNotifications (newNotifications) {
		const idHash = getNotficationIdHash()

		return newNotifications.filter(notification => {
			if (!idHash[Number(notification.id)]) {
				idHash[Number(notification.id)] = true

				return true
			}

			return false
		})
	}

	async function getNotificationBatch () {
		const notifications = (await api.get(`/users/${currentUser.id}/notifications`, {
			params: { batchIndex }
		})).data

		return notifications
	}

	async function addNextNotificationBatch () {
		const notificationBatch = await getNotificationBatch()
		
		setBatchIndex(batchIndex + 1)

		if (!notificationBatch.length) {
			setShowMoreVisible(false)
		} else {
			const notificationsToAdd = getUnaddedNotifications(notificationBatch)
			const updatedNotifications = [...notifications, ...notificationsToAdd]

			setNotifications(updatedNotifications)
		}
	}

	function setAllNotificationsToRead () {
		setNotifications(notifications.map(notification => ({
			...notification,
			status: 'read'
		})))
	}

	function onIconButtonClick (event) {
		setAnchorEl(event.currentTarget)
	}

	function onPopoverClose () {
		setAllNotificationsToRead()
		setAnchorEl(null)
	}


	function onPopoverEntered () {
		notifications.forEach(notification => {
			api.put(`/users/${currentUser.id}/notifications/${notification.id}`, {
				status: 'read'
			})
		})
	}

	function onSnackbarClose () {
		setShowSnackbar(false)
	}

	async function onShowMoreClick () {
		setLoadingMoreNotifications(true)
		await addNextNotificationBatch()
		setLoadingMoreNotifications(false)
	}

	function renderNotificationListItem (notification, index) {
		const { createdDatetime, title, content } = notification

		return (
			<ListItem
				key={index}
				button
				onClick={() => history.push(`/stocks/${notification.stock}`)}
			>
				<ListItemIcon className={classes.listItemNotificationIconContainer}>
					{notification.status === 'unopened' ? <div className={classes.newNotificationIcon} /> : null}
				</ListItemIcon>
				<ListItemText
					primary={(
						<div>
							<div><b>{title}</b></div>
							<div>{content}</div>
						</div>
					)}
					secondary={<span>{moment(createdDatetime).local().format('MMM DD')}</span>}
				/>
			</ListItem>
		)
	}

	function renderShowMoreListItem () {
		if (!showMoreVisible) {
			return null
		}

		return (
			<ListItem
				button
				onClick={onShowMoreClick}
			>
				<ListItemText
					primary={loadingMoreNotifications ? <CircularProgress /> : <Link>Show More...</Link>}
					style={{ textAlign: 'center' }}
				/>
			</ListItem>
		)
	}

	function renderNotificationList () {
		const listItems = notifications.map((notification, index) => renderNotificationListItem(notification, index))

		return (
			<List style={{ width: '360px', maxHeight: '400px' }}>
				{listItems}
				{renderShowMoreListItem()}
			</List>
		)
	}

	function renderPopoverContent () {
		if (!notifications.length) {
			return <div>You have no notifications.</div>
		}

		return renderNotificationList()
	}

	return (
		<div>
			<IconButton
				color='inherit'
				onClick={onIconButtonClick}
			>
				<Badge
					badgeContent={notificationBadgeContent()}
					color='secondary'
					invisible={notificationBadgeAmount() === 0}
				>
					<FontAwesomeIcon icon={faBell} />
				</Badge>
			</IconButton>
			<Popover
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				onClose={onPopoverClose}
				onEntered={onPopoverEntered}
			>
				{renderPopoverContent()}
			</Popover>
			<Toast
				open={showSnackbar}
				message={snackbarMessage}
				onClose={onSnackbarClose}
			/>
		</div>
	)
}
