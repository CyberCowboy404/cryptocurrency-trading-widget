export type UserBalancesList = {
	BTC: CoinBalance,
	USDT: CoinBalance
}

export type CoinBalance = {
	free: number,
	locked: number
}