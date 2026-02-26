import Deposit from "../../application/usecase/Deposit";
import ExecuteOrder from "../../application/usecase/ExecuteOrder";
import GetAccount from "../../application/usecase/GetAccount";
import GetOrder from "../../application/usecase/GetOrder";
import PlaceOrder from "../../application/usecase/PlaceOrder";
import Signup from "../../application/usecase/Signup";
import Book from "../../domain/Book";
import Order from "../../domain/Order";
import OrderPlacedEvent from "../../domain/OrderPlacedEvent";
import { inject } from "../di/Registry";
import HttpServer from "../http/HttpServer";
import Mediator from "../mediator/Mediator";
import OrderRepository from "../repository/OrderRepository";

export default class OrderController {
    @inject("httpServer")
    httpServer!: HttpServer;
    @inject("deposit")
    deposit!: Deposit;
    @inject("placeOrder")
    placeOrder!: PlaceOrder;
    @inject("getOrder")
    getOrder!: GetOrder;
    @inject("executeOrder")
    executeOrder!: ExecuteOrder;
    @inject("mediator")
    mediator!: Mediator;
    @inject("book")
    book!: Book;
    @inject("orderRepository")
    orderRepository!: OrderRepository;

    constructor () {
        this.httpServer.route("post", "/deposit", async (params: any, body: any) => {
            const output = await this.deposit.execute(body);
            return output;
        });

        this.httpServer.route("post", "/place_order", async (params: any, body: any) => {
            const output = await this.placeOrder.execute(body);
            return output;
        });

        this.httpServer.route("get", "/orders/:orderId", async (params: any, body: any) => {
            const output = await this.getOrder.execute(params.orderId);
            return output;
        });

        this.mediator.register("orderPlaced", async (event: Order) => {
            // await this.executeOrder.execute(event.getMarketId());
            await this.book.insert(event);
        });

        this.book.register("orderFilled", async (event: Order) => {
            await this.orderRepository.updateOrder(event);
        });
    }
}
