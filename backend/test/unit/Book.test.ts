import Account from "../../src/domain/Account";
import Book from "../../src/domain/Book";
import Order from "../../src/domain/Order";

function sleep (time: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}

test("Deve testar o livro de ofertas", async () => {
    const marketId = "BTC-USD";
    const book = new Book(marketId);
    book.register("orderFilled", async (event: any) => {
        // console.log(event);
    });
    const account = Account.createAccount("John Doe", "john.doe@gmail.com", "97456321558", "asdQWE123");
    const order1 = Order.createOrder(account.getAccountId(), marketId, "sell", 1, 78000);
    await book.insert(order1);
    await sleep(100);
    const order2 = Order.createOrder(account.getAccountId(), marketId, "sell", 1, 79000);
    await book.insert(order2);
    await sleep(100);
    const order3 = Order.createOrder(account.getAccountId(), marketId, "buy", 2, 80000);
    await book.insert(order3);
    await sleep(100);
});