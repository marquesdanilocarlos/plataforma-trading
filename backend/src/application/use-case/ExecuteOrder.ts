import OrderRepository from '../../infra/repositories/OrderRepository'
import { inject } from '../../di/Registry'

export default class ExecuteOrder {
  @inject('orderRepository')
  private orderRepository!: OrderRepository

  async execute(marketId: string): Promise<void> {
    while (true) {
      const highestBuy = await this.orderRepository.getHighestBuy(marketId)
      const lowestSell = await this.orderRepository.getLowestSell(marketId)

      if (!highestBuy || !lowestSell || highestBuy.price < lowestSell.price) {
        break
      }

      const fillQuantity = Math.min(
        highestBuy.getAvailableQuantity(),
        lowestSell.getAvailableQuantity(),
      )
      const fillPrice =
        highestBuy?.timestamp > lowestSell?.timestamp
          ? highestBuy.price
          : lowestSell.price

      highestBuy.fill(fillQuantity, fillPrice)
      lowestSell.fill(fillQuantity, fillPrice)

      await this.orderRepository.updateOrder(highestBuy)
      await this.orderRepository.updateOrder(lowestSell)
    }
  }
}
