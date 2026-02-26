import Order from "../../domain/Order";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";

export default interface OrderRepository {
    saveOrder(order: Order): Promise<void>;
    updateOrder(order: Order): Promise<void>;
    getOrderById(orderId: string): Promise<Order>;
    getHighestBuy (marketId: string): Promise<Order | undefined>;
    getLowestSell (marketId: string): Promise<Order | undefined>;
}

export class OrderRepositoryDatabase implements OrderRepository {
    @inject("databaseConnection")
    connection!: DatabaseConnection;

    async saveOrder(order: Order): Promise<void> {
        await this.connection.query(
            "insert into ccca.order (order_id, market_id, account_id, side, quantity, price, fill_quantity, fill_price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            [
                order.getOrderId(),
                order.getMarketId(),
                order.getAccountId(),
                order.getSide(),
                order.getQuantity(),
                order.getPrice(),
                order.getFillQuantity(),
                order.getFillPrice(),
                order.getStatus(),
                order.getTimestamp()
            ]
        );
    }

    async updateOrder (order: Order) {
        await this.connection.query("update ccca.order set fill_quantity = $1, fill_price = $2, status = $3 where order_id = $4", [order.getFillQuantity(), order.getFillPrice(), order.getStatus(), order.getOrderId()]);
    }

    async getOrderById(orderId: string): Promise<Order> {
        const [orderData] = await this.connection.query("select * from ccca.order where order_id = $1", [orderId]);
        if (!orderData) throw new Error("Order not found");
        return new Order(
            orderData.order_id,
            orderData.market_id,
            orderData.account_id,
            orderData.side,
            parseFloat(orderData.quantity),
            parseFloat(orderData.price),
            parseFloat(orderData.fill_quantity),
            parseFloat(orderData.fill_price),
            orderData.status,
            orderData.timestamp
        );
    }

    async getHighestBuy(marketId: string): Promise<Order | undefined> {
        const [orderData] = await this.connection.query("select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price desc, timestamp asc limit 1", [marketId, "buy", "open"]);
        if (!orderData) return;
        return new Order(
            orderData.order_id,
            orderData.market_id,
            orderData.account_id,
            orderData.side,
            parseFloat(orderData.quantity),
            parseFloat(orderData.price),
            parseFloat(orderData.fill_quantity),
            parseFloat(orderData.fill_price),
            orderData.status,
            orderData.timestamp
        );
    }

    async getLowestSell(marketId: string): Promise<Order | undefined> {
        const [orderData] = await this.connection.query("select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price asc, timestamp asc limit 1", [marketId, "sell", "open"]);
        if (!orderData) return;
        return new Order(
            orderData.order_id,
            orderData.market_id,
            orderData.account_id,
            orderData.side,
            parseFloat(orderData.quantity),
            parseFloat(orderData.price),
            parseFloat(orderData.fill_quantity),
            parseFloat(orderData.fill_price),
            orderData.status,
            orderData.timestamp
        );
    }
}

