import Event from './Event'
import Order from '../../domain/Order'
import ExecuteOrder from '../../application/use-case/ExecuteOrder'
import { inject } from '../../di/Registry'

export default class OrderPlacedEvent extends Event<Order> {
  @inject('executeOrder')
  private executeOrder!: ExecuteOrder

  constructor(order: Order) {
    super(order)
  }

  protected getSubject(): Order {
    return this.subject
  }

  public async dispatch(): Promise<void> {
    const order = this.getSubject()
    await this.executeOrder.execute(order.marketId)
  }
}
