import Order from '../../domain/Order'
import { DatabaseConnection } from '../database/DatabaseConnection'

type OrderRow = {
  order_id: string
  market_id: string
  account_id: string
  side: string
  quantity: string
  price: string
  fill_quantity: string
  fill_price: string
  status: string
  timestamp: string
}

export default interface OrderRepository {
  saveOrder(order: Order): Promise<void>
  updateOrder(order: Order): Promise<void>
  getOrderById(orderId: string): Promise<Order | null>
  getHighestBuy(marketId: string): Promise<Order | null>
  getLowestSell(marketId: string): Promise<Order | null>
}

export class OrderRepositoryDatabase implements OrderRepository {
  constructor(private connection: DatabaseConnection) {}

  async saveOrder(order: Order): Promise<void> {
    await this.connection.query(
      `insert into ccca.order (order_id, market_id, account_id, side, quantity, price, fill_quantity, fill_price, status, timestamp) 
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        order.orderId,
        order.marketId,
        order.accountId,
        order.side,
        order.quantity,
        order.price,
        order.fillQuantity,
        order.fillPrice,
        order.status,
        order.timestamp,
      ],
    )
  }

  async updateOrder(order: Order): Promise<void> {
    await this.connection.query(
      'update ccca.order set fill_quantity = $1, fill_price = $2, status = $3 where order_id = $4',
      [order.fillQuantity, order.fillPrice, order.status, order.orderId],
    )
  }

  async getOrderById(orderId: string): Promise<Order> {
    const [order] = await this.connection.query<OrderRow>(
      'select * from ccca.order where order_id = $1',
      [orderId],
    )

    if (!order) {
      throw new Error('Order not found')
    }

    return Order.create({
      order_id: order.order_id,
      market_id: order.market_id,
      account_id: order.account_id,
      side: order.side,
      quantity: parseFloat(order.quantity),
      price: parseFloat(order.price),
      fill_quantity: parseFloat(order.fill_quantity),
      fill_price: parseFloat(order.fill_price),
      status: order.status,
      timestamp: new Date(order.timestamp),
    })
  }

  async getHighestBuy(marketId: string): Promise<Order | null> {
    const [order] = await this.connection.query<OrderRow>(
      'select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price desc, timestamp asc limit 1',
      [marketId, 'buy', 'open'],
    )

    if (!order) {
      return null
    }

    return Order.create({
      order_id: order.order_id,
      market_id: order.market_id,
      account_id: order.account_id,
      side: order.side,
      quantity: parseFloat(order.quantity),
      price: parseFloat(order.price),
      fill_quantity: parseFloat(order.fill_quantity),
      fill_price: parseFloat(order.fill_price),
      status: order.status,
      timestamp: new Date(order.timestamp),
    })
  }

  async getLowestSell(marketId: string): Promise<Order | null> {
    const [order] = await this.connection.query<OrderRow>(
      'select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price asc, timestamp asc limit 1',
      [marketId, 'sell', 'open'],
    )

    if (!order) {
      return null
    }

    return Order.create({
      order_id: order.order_id,
      market_id: order.market_id,
      account_id: order.account_id,
      side: order.side,
      quantity: parseFloat(order.quantity),
      price: parseFloat(order.price),
      fill_quantity: parseFloat(order.fill_quantity),
      fill_price: parseFloat(order.fill_price),
      status: order.status,
      timestamp: new Date(order.timestamp),
    })
  }
}
