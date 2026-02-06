import AccountRepository from '../../infra/repositories/AccountRepository'
import Account from '../../domain/Account'
import Order from '../../domain/Order'
import OrderRepository from '../../infra/repositories/OrderRepository'

export type PlaceOrderInput = {
  accountId: string
  marketId: string
  side: string
  quantity: number
  price: number
}

export type PlaceOrderOutput = {
  orderId: string
}

export default class PlaceOrder {
  constructor(
    private accountRepository: AccountRepository,
    private orderRepository: OrderRepository,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const { accountId, marketId, side, quantity, price } = input

    const account: Account | null =
      await this.accountRepository.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    const order = Order.create({
      account_id: accountId,
      market_id: marketId,
      side,
      quantity,
      price,
    })

    if (!account.hasBalanceForOrder(order)) {
      throw new Error('Insufficient funds')
    }

    await this.orderRepository.saveOrder(order)

    return {
      orderId: order.orderId,
    }
  }
}
