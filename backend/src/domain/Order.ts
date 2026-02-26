import UUID from "./UUID";

export default class Order {
    private orderId: UUID;
    private marketId: string;
    private accountId: UUID;
    private side: string;
    private quantity: number;
    private price: number;
    private fillQuantity: number;
    private fillPrice: number;
    private status: string;
    private timestamp: Date;

    constructor (
        orderId: string,
        marketId: string,
        accountId: string,
        side: string,
        quantity: number,
        price: number,
        fillQuantity: number,
        fillPrice: number,
        status: string,
        timestamp: Date
    ) {
        this.orderId = new UUID(orderId);
        this.marketId = marketId;
        this.accountId = new UUID(accountId);
        this.side = side;
        this.quantity = quantity;
        this.price = price;
        this.fillQuantity = fillQuantity;
        this.fillPrice = fillPrice;
        this.status = status;
        this.timestamp = timestamp;
    }

    static createOrder (
        accountId: string,
        marketId: string,
        side: string,
        quantity: number,
        price: number
    ) {
        const orderId = UUID.create().getValue();
        return new Order(
            orderId,
            marketId,
            accountId,
            side,
            quantity,
            price,
            0,
            0,
            "open",
            new Date()
        );
    }

    getOrderId () {
        return this.orderId.getValue();
    }

    getMarketId () {
        return this.marketId;
    }

    getAccountId () {
        return this.accountId.getValue();
    }

    getSide () {
        return this.side;
    }

    getQuantity () {
        return this.quantity;
    }

    getPrice () {
        return this.price;
    }

    getFillQuantity () {
        return this.fillQuantity;
    }

    getFillPrice () {
        return this.fillPrice;
    }

    getStatus () {
        return this.status;
    }

    getTimestamp () {
        return this.timestamp;
    }

    getMainAsset () {
        const [mainAsset] = this.getMarketId().split("-");
        return mainAsset;
    }

    getPaymentAsset () {
        const [, paymentAsset] = this.getMarketId().split("-");
        return paymentAsset;
    }

    fill (quantity: number, price: number) {
        this.fillPrice = ((this.fillQuantity*this.fillPrice)+(quantity*price))/(this.fillQuantity+quantity);
        this.fillQuantity += quantity;
        if (this.getAvailableQuantity() === 0) this.status = "closed";
    }
    
    getAvailableQuantity () {
        return this.quantity - this.fillQuantity;
    }

}
