import PortfolioCloseValue from '../entities/PortfolioCloseValue'
import User from '../entities/User'

export default async function recordPortfolioCloseValues () {
	const users = await User.find()

	users.forEach(async user => {
		const portfolioValue = await user.getPortfolioValue()
		const portfolioCloseValue = new PortfolioCloseValue()

		portfolioCloseValue.value = portfolioValue
		portfolioCloseValue.datetime = new Date().toISOString()
		portfolioCloseValue.user = user
		portfolioCloseValue.save()
	})
}
