// Transformer to convert string values to numbers
// and vice versa. Need this because pg node driver
// returns decimal values as strings
export default class NumericTransformer {
	to (data: number) {
		return data
	}

	from (data: string) {
		return parseFloat(data)
	}
}
