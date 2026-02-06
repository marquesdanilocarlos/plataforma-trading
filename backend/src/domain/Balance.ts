export default class Balance {
  constructor(
    readonly assetId: string,
    public quantity: number,
    public blockedQuantity: number,
  ) {}

  getAvailableQuantity(): number {
    return this.quantity - this.blockedQuantity
  }
}
