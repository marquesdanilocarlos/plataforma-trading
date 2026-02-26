import { inject } from "../../infra/di/Registry";
import OrderRepository from "../../infra/repository/OrderRepository";

export default class ExecuteOrder {
    @inject("orderRepository")
    orderRepository!: OrderRepository;

    async execute (marketId: string): Promise<void> {
        while (true) {
            const highestBuy = await this.orderRepository.getHighestBuy(marketId);
            const lowestSell = await this.orderRepository.getLowestSell(marketId);
            if (!highestBuy || !lowestSell || highestBuy.getPrice() < lowestSell.getPrice()) break;
            const fillQuantity = Math.min(highestBuy.getAvailableQuantity(), lowestSell.getAvailableQuantity());
            const fillPrice = (highestBuy.getTimestamp() > lowestSell.getTimestamp()) ? lowestSell.getPrice() : highestBuy.getPrice();
            highestBuy.fill(fillQuantity, fillPrice);
            lowestSell.fill(fillQuantity, fillPrice);
            await this.orderRepository.updateOrder(highestBuy);
            await this.orderRepository.updateOrder(lowestSell);
        }
    }
}
