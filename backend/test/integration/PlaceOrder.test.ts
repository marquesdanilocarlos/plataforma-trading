
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "../../src/infra/repository/OrderRepository";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import Deposit from "../../src/application/usecase/Deposit";
import GetAccount from "../../src/application/usecase/GetAccount";
import GetOrder from "../../src/application/usecase/GetOrder";
import Signup from "../../src/application/usecase/Signup";
import PlaceOrder from "../../src/application/usecase/PlaceOrder";
import { WalletRepositoryDatabase } from "../../src/infra/repository/WalletRepository";
import Registry from "../../src/infra/di/Registry";
import ExecuteOrder from "../../src/application/usecase/ExecuteOrder";
import Mediator from "../../src/infra/mediator/Mediator";
import OrderPlacedEvent from "../../src/domain/OrderPlacedEvent";

let databaseConnection: DatabaseConnection;
let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let getOrder: GetOrder;

beforeEach(() => {
    databaseConnection = new PgPromiseAdapter();
    Registry.getInstance().register("databaseConnection", databaseConnection);
    const mediator = new Mediator();
    Registry.getInstance().register("mediator", mediator);
    Registry.getInstance().register("accountRepository", new AccountRepositoryDatabase());
    Registry.getInstance().register("walletRepository", new WalletRepositoryDatabase());
    Registry.getInstance().register("orderRepository", new OrderRepositoryDatabase());
    Registry.getInstance().register("executeOrder", new ExecuteOrder());
    mediator.register("orderPlaced", async (event: OrderPlacedEvent) => {
        const executeOrder = new ExecuteOrder();
        await executeOrder.execute(event.marketId);
    });
    signup = new Signup();
    getAccount = new GetAccount();
    deposit = new Deposit();
    placeOrder = new PlaceOrder();
    getOrder = new GetOrder();
});

test("Deve criar uma ordem de compra em uma conta", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const outputSignup = await signup.execute(input);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100000
    }
    await deposit.execute(inputDeposit);
    const inputOrder = {
        accountId: outputSignup.accountId,
        marketId: "BTC-USD",
        side: "buy",
        quantity: 1,
        price: 78000
    }
    const outputPlaceOrder = await placeOrder.execute(inputOrder);
    expect(outputPlaceOrder.orderId).toBeDefined();
    const outputGetOrder = await getOrder.execute(outputPlaceOrder.orderId);
    expect(outputGetOrder.quantity).toBe(1);
    expect(outputGetOrder.price).toBe(78000);
});

test("Não deve criar uma ordem de compra em uma conta se não tiver saldo", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const outputSignup = await signup.execute(input);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 10000
    }
    await deposit.execute(inputDeposit);
    const inputOrder = {
        accountId: outputSignup.accountId,
        marketId: "BTC-USD",
        side: "buy",
        quantity: 1,
        price: 78000
    }
    await expect(() => placeOrder.execute(inputOrder)).rejects.toThrow(new Error("Insufficient funds"));
});

test("Não deve criar mais uma ordem de compra em uma conta do que existe saldo", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const outputSignup = await signup.execute(input);
    const inputDeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 100000
    }
    await deposit.execute(inputDeposit);
    const inputOrder1 = {
        accountId: outputSignup.accountId,
        marketId: "BTC-USD",
        side: "buy",
        quantity: 1,
        price: 78000
    }
    const outputPlaceOrder1 = await placeOrder.execute(inputOrder1);
    expect(outputPlaceOrder1.orderId).toBeDefined();

    const inputOrder2 = {
        accountId: outputSignup.accountId,
        marketId: "BTC-USD",
        side: "buy",
        quantity: 1,
        price: 78000
    }
    await expect(() => placeOrder.execute(inputOrder2)).rejects.toThrow(new Error("Insufficient funds"));
});

test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = `BTC-USD-${Math.random()}`;
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const outputSignup = await signup.execute(input);
    await deposit.execute({
        accountId: outputSignup.accountId,
        assetId: "BTC",
        quantity: 2
    });
    await deposit.execute({
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 200000
    });
    const outputPlaceOrder1 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    });
    const outputPlaceOrder2 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    });
    const outputPlaceOrder3 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 78000
    });
    const outputGetOrder1 = await getOrder.execute(outputPlaceOrder1.orderId);
    expect(outputGetOrder1.fillQuantity).toBe(1);
    expect(outputGetOrder1.fillPrice).toBe(78000);
    expect(outputGetOrder1.status).toBe("closed");
    const outputGetOrder2 = await getOrder.execute(outputPlaceOrder2.orderId);
    expect(outputGetOrder2.fillQuantity).toBe(1);
    expect(outputGetOrder2.fillPrice).toBe(78000);
    expect(outputGetOrder2.status).toBe("closed");
    const outputGetOrder3 = await getOrder.execute(outputPlaceOrder3.orderId);
    expect(outputGetOrder3.fillQuantity).toBe(2);
    expect(outputGetOrder3.fillPrice).toBe(78000);
    expect(outputGetOrder3.status).toBe("closed");
});

test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = `BTC-USD-${Math.random()}`;
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const outputSignup = await signup.execute(input);
    await deposit.execute({
        accountId: outputSignup.accountId,
        assetId: "BTC",
        quantity: 2
    });
    await deposit.execute({
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 200000
    });
    const outputPlaceOrder1 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    });
    const outputPlaceOrder2 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 79000
    });
    const outputPlaceOrder3 = await placeOrder.execute({
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 80000
    });
    const outputGetOrder1 = await getOrder.execute(outputPlaceOrder1.orderId);
    expect(outputGetOrder1.fillQuantity).toBe(1);
    expect(outputGetOrder1.fillPrice).toBe(78000);
    expect(outputGetOrder1.status).toBe("closed");
    const outputGetOrder2 = await getOrder.execute(outputPlaceOrder2.orderId);
    expect(outputGetOrder2.fillQuantity).toBe(1);
    expect(outputGetOrder2.fillPrice).toBe(79000);
    expect(outputGetOrder2.status).toBe("closed");
    const outputGetOrder3 = await getOrder.execute(outputPlaceOrder3.orderId);
    expect(outputGetOrder3.fillQuantity).toBe(2);
    expect(outputGetOrder3.fillPrice).toBe(78500);
    expect(outputGetOrder3.status).toBe("closed");
});

afterEach(async () => {
    await databaseConnection.close();
});
