import { inject } from '../../di/Registry'
import OrderRepository from '../../infra/repositories/OrderRepository'

export default class GetOrder {
  @inject('orderRepository')
  orderRepository!: OrderRepository

  async execute(orderId: string): Promise<Output> {
    const order = await this.orderRepository.getOrderById(orderId)
    return {
      orderId: order.orderId,
      marketId: order.marketId,
      accountId: order.accountId,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      fillQuantity: order.fillQuantity,
      fillPrice: order.fillPrice,
      status: order.status,
      timestamp: order.timestamp,
    }
  }
}

type Output = {
  orderId: string
  marketId: string
  accountId: string
  side: string
  quantity: number
  price: number
  fillQuantity: number
  fillPrice: number
  status: string
  timestamp: Date
}
