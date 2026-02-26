import Mediator from "../infra/mediator/Mediator";
import Order from "./Order";

// Mediator as Observer
export default class Book extends Mediator {
    buys: Order[] = [];
    sells: Order[] = [];
 
    constructor (readonly marketId: string) {
        super();
    }

    async insert (order: Order) {
        if (order.getSide() === "buy") {
            this.buys.push(order);
            this.buys.sort((a, b) => b.getPrice() - a.getPrice());
        }
        if (order.getSide() === "sell") {
            this.sells.push(order);
            this.sells.sort((a, b) => a.getPrice() - b.getPrice());
        }
        await this.execute();
    }

    async execute () {
        while (true) {
            const [highestBuy] = this.buys;
            const [lowestSell] = this.sells;
            if (!highestBuy || !lowestSell || highestBuy.getPrice() < lowestSell.getPrice()) break;
            const fillQuantity = Math.min(highestBuy.getAvailableQuantity(), lowestSell.getAvailableQuantity());
            const fillPrice = (highestBuy.getTimestamp() > lowestSell.getTimestamp()) ? lowestSell.getPrice() : highestBuy.getPrice();
            highestBuy.fill(fillQuantity, fillPrice);
            lowestSell.fill(fillQuantity, fillPrice);
            if (highestBuy.getStatus() === "closed") this.buys.splice(this.buys.indexOf(highestBuy), 1);
            if (lowestSell.getStatus() === "closed") this.sells.splice(this.sells.indexOf(lowestSell), 1);
            await this.notifyAll("orderFilled", highestBuy);
            await this.notifyAll("orderFilled", lowestSell);
        }
    }

}
