import UUID from './UUID'

type OrderProps = {
  account_id: string
  market_id: string
  side: string
  quantity: number
  price: number
  fill_quantity?: number
  fill_price?: number
  status?: string
  timestamp?: Date
  order_id?: string
}

export default class Order {
  private _orderId: UUID
  private _accountId: UUID
  private _marketId: string
  private _side: string
  private _quantity: number
  private _price: number
  private _fillQuantity: number
  private _fillPrice: number
  private _status: string
  private _timestamp: Date

  constructor(
    orderId: string,
    marketId: string,
    accountId: string,
    side: string,
    quantity: number,
    price: number,
    fillQuantity: number,
    fillPrice: number,
    status: string,
    timestamp: Date,
  ) {
    this._orderId = new UUID(orderId)
    this._accountId = new UUID(accountId)
    this._marketId = marketId
    this._side = side
    this._quantity = quantity
    this._price = price
    this._fillQuantity = fillQuantity
    this._fillPrice = fillPrice
    this._status = status
    this._timestamp = timestamp
  }

  static create(input: OrderProps): Order {
    const orderId = input.order_id ?? UUID.create().getValue()
    return new Order(
      orderId,
      input.market_id,
      input.account_id,
      input.side,
      input.quantity,
      input.price,
      input.fill_quantity ?? 0,
      input.fill_price ?? 0,
      input.status ?? 'open',
      input.timestamp ?? new Date(),
    )
  }

  fill(quantity: number, price: number) {
    this._fillQuantity += quantity
    this._fillPrice = price

    if (this.getAvailableQuantity() === 0) {
      this._status = 'closed'
    }
  }

  getAvailableQuantity(): number {
    return this._quantity - this._fillQuantity
  }

  get orderId(): string {
    return this._orderId.getValue()
  }

  get accountId(): string {
    return this._accountId.getValue()
  }

  get marketId(): string {
    return this._marketId
  }

  get side(): string {
    return this._side
  }

  get quantity(): number {
    return this._quantity
  }

  get price(): number {
    return this._price
  }

  get fillQuantity(): number {
    return this._fillQuantity
  }

  get fillPrice(): number {
    return this._fillPrice
  }

  get status(): string {
    return this._status
  }

  get timestamp(): Date {
    return this._timestamp
  }

  getMainAsset(): string {
    const [mainAsset] = this.marketId.split('-')
    return mainAsset
  }

  getPaymentAsset(): string {
    const [, paymentAsset] = this.marketId.split('-')
    return paymentAsset
  }
}
