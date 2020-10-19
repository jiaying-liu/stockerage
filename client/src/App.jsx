import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import reducers from '@/reducers'

import { Container } from '@material-ui/core'
import Login from './components/Login'
import Home from '@/components/Home'
import StockDetail from '@/components/StockDetail'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { teal } from '@material-ui/core/colors'
import Header from './components/Header'
import HttpsRedirect from 'react-https-redirect'

const theme = createMuiTheme({
	palette: {
		primary: {
			main: teal[500]
		}
	}
})
const store = createStore(reducers, {}, applyMiddleware(reduxThunk))

function App() {
  return (
		<HttpsRedirect>
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<Router>
						<Header />
						<Container style={{ paddingBottom: '64px' }}>
							<Switch>
								<Route exact path='/login' component={Login} />
								<Route exact path='/' component={Home} />
								<Route exact path='/stocks/:symbol' component={StockDetail} />
							</Switch>
						</Container>
					</Router>
				</ThemeProvider>
			</Provider>
		</HttpsRedirect>
  )
}

export default App
