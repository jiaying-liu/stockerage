import iexCloud from "./iexcloud"

export interface Company {
	symbol: string
	companyName: string
	industry: string
	description: string
	CEO: string
	employees: number
}

export async function company (symbol: string): Promise<Company> {
	const path = `/stock/${symbol}/company`
	const iexCompany = await iexCloud(path)

	return {
		symbol: iexCompany.symbol,
		companyName: iexCompany.companyName,
		industry: iexCompany.industry,
		description: iexCompany.description,
		CEO: iexCompany.CEO,
		employees: iexCompany.employees
	}
}
