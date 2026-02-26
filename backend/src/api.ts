import Deposit from "./application/usecase/Deposit";
import ExecuteOrder from "./application/usecase/ExecuteOrder";
import GetAccount from "./application/usecase/GetAccount";
import GetOrder from "./application/usecase/GetOrder";
import PlaceOrder from "./application/usecase/PlaceOrder";
import Signup from "./application/usecase/Signup";
import Book from "./domain/Book";
import AccountController from "./infra/controller/AccountController";
import OrderController from "./infra/controller/OrderController";
import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import Registry from "./infra/di/Registry";
import { ExpressAdapter } from "./infra/http/HttpServer";
import Mediator from "./infra/mediator/Mediator";
import { AccountRepositoryDatabase } from "./infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "./infra/repository/OrderRepository";
import { WalletRepositoryDatabase } from "./infra/repository/WalletRepository";

async function main () {
    const httpServer = new ExpressAdapter();
    Registry.getInstance().register("httpServer", httpServer);
    Registry.getInstance().register("mediator", new Mediator());
    Registry.getInstance().register("databaseConnection", new PgPromiseAdapter());
    Registry.getInstance().register("accountRepository", new AccountRepositoryDatabase());
    Registry.getInstance().register("walletRepository", new WalletRepositoryDatabase());
    Registry.getInstance().register("orderRepository", new OrderRepositoryDatabase());
    Registry.getInstance().register("signup", new Signup());
    Registry.getInstance().register("getAccount", new GetAccount());
    Registry.getInstance().register("deposit", new Deposit());
    Registry.getInstance().register("placeOrder", new PlaceOrder());
    Registry.getInstance().register("executeOrder", new ExecuteOrder());
    Registry.getInstance().register("getOrder", new GetOrder());
    Registry.getInstance().register("book", new Book("BTC-USD"));
    new AccountController();
    new OrderController();
    httpServer.listen(3000);
}

main();
