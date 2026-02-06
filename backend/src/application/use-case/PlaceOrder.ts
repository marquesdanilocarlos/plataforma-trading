import AccountRepository from '../../infra/repositories/AccountRepository'
import Account from '../../domain/Account'
import Order from '../../domain/Order'
import OrderRepository from '../../infra/repositories/OrderRepository'
import WalletRepository from '../../infra/repositories/WalletRepository'

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
    private walletRepository: WalletRepository,
  ) {}

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

    while (true) {
      const highestBuy = await this.orderRepository.getHighestBuy(marketId)
      const lowestSell = await this.orderRepository.getLowestSell(marketId)

      if (!highestBuy || !lowestSell || highestBuy.price < lowestSell.price) {
        break
      }

      const fillQuantity = Math.min(highestBuy.quantity, lowestSell.quantity)
      const fillPrice =
        highestBuy?.timestamp > lowestSell?.timestamp
          ? highestBuy.price
          : lowestSell.price

      highestBuy.fill(fillQuantity, fillPrice)
      lowestSell.fill(fillQuantity, fillPrice)

      await this.orderRepository.updateOrder(highestBuy)
      await this.orderRepository.updateOrder(lowestSell)
    }

    return {
      orderId: order.orderId,
    }
  }
}
