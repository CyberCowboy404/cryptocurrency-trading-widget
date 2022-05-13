export enum OrderType {
	MARKET,
	LIMIT,
	STOPLIMIT
}
export enum OrderSide {
	BUY,
	SELL
}
export enum OrderStatus {
	NEW,
	CANCELED,
	FILLED
}
export type OrderTypeStrings = keyof typeof OrderType;

export type Order = {
	id: number,
	type: OrderType,
	side: OrderSide,
	status: OrderStatus,
	price: number,
	limitPrice: number,
	stopPrice: number,
	isActive: boolean,
	amount: number
}