import Order from "../../domain/Order";
import OrderPlacedEvent from "../../domain/OrderPlacedEvent";
import { inject } from "../../infra/di/Registry";
import Mediator from "../../infra/mediator/Mediator";
import OrderRepository from "../../infra/repository/OrderRepository";
import WalletRepository from "../../infra/repository/WalletRepository";

export default class PlaceOrder {
    @inject("orderRepository")
    orderRepository!: OrderRepository;
    @inject("walletRepository")
    walletRepository!: WalletRepository;
    @inject("mediator")
    mediator!: Mediator;

    async execute (input: Input): Promise<Output> {
        const wallet = await this.walletRepository.getWalletById(input.accountId);
        if (!wallet) throw new Error("Account not found");
        const order = Order.createOrder(input.accountId, input.marketId, input.side, input.quantity, input.price);
        const hasBalance = wallet.blockOrder(order);
        if (!hasBalance) throw new Error("Insufficient funds");
        await this.orderRepository.saveOrder(order);
        await this.walletRepository.updateWallet(wallet);
        await this.mediator.notifyAll("orderPlaced", order);
        return {
            orderId: order.getOrderId()
        }
    }
}

export type Input = {
    accountId: string,
    marketId: string,
    side: string,
    quantity: number,
    price: number
}

type Output = {
    orderId: string
}
