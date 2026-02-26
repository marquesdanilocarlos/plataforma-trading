import AccountRepository from '../../infra/repositories/AccountRepository'
import Account from '../../domain/Account'
import Order from '../../domain/Order'
import OrderRepository from '../../infra/repositories/OrderRepository'
import WalletRepository from '../../infra/repositories/WalletRepository'
import { inject } from '../../di/Registry'
import Mediator from '../../infra/events/Mediator'
import OrderPlacedEvent from '../../infra/events/OrderPlacedEvent'

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
  @inject('accountRepository')
  private accountRepository!: AccountRepository

  @inject('orderRepository')
  private orderRepository!: OrderRepository

  @inject('walletRepository')
  private walletRepository!: WalletRepository

  @inject('mediator')
  private mediator!: Mediator

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const { accountId, marketId, side, quantity, price } = input

    const account: Account | null =
      await this.accountRepository.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    const wallet = await this.walletRepository.getWalletById(accountId)

    const order = Order.create({
      account_id: accountId,
      market_id: marketId,
      side,
      quantity,
      price,
    })

    const hasBalance = wallet.blockOrder(order)

    if (!hasBalance) {
      throw new Error('Insufficient funds')
    }

    await this.orderRepository.saveOrder(order)
    await this.walletRepository.updateWallet(wallet)

    this.mediator.register(new OrderPlacedEvent(order))
    await this.mediator.notifyAll()

    return {
      orderId: order.orderId,
    }
  }
}
