import Account from "../../src/domain/Account";
import Order from "../../src/domain/Order";
import Wallet from "../../src/domain/Wallet";

test("Deve fazer um depósito", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 10000);
    expect(wallet.getBalance("USD")).toBe(10000);
});

test("Deve fazer dois depósitos", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 10000);
    wallet.deposit("USD", 10000);
    expect(wallet.getBalance("USD")).toBe(20000);
});

test("Deve um saque", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 10000);
    wallet.deposit("USD", 10000);
    wallet.withdraw("USD", 10000);
    expect(wallet.getBalance("USD")).toBe(10000);
});

test("Não deve sacar sem fundos", () => {
    const wallet = Wallet.createWallet();
    expect(() => wallet.withdraw("USD", 10000)).toThrow(new Error("Insufficient funds"));
});

test("Deve validar o saldo da conta para a criação de uma ordem", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 100000);
    const order = Order.createOrder(wallet.getAccountId(), "BTC-USD", "buy", 1, 78000);
    const hasBalance = wallet.blockOrder(order);
    expect(hasBalance).toBe(true);
    expect(wallet.getBalance("USD")).toBe(22000);
});

test("Não deve ter saldo suficiente na conta para a criação de uma ordem", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 10000);
    const order = Order.createOrder(wallet.getAccountId(), "BTC-USD", "buy", 1, 78000);
    const hasBalance = wallet.blockOrder(order);
    expect(hasBalance).toBe(false);
    expect(wallet.getBalance("USD")).toBe(10000);
});

test("Não deve ter saldo da conta para a criação de duas ordens", () => {
    const wallet = Wallet.createWallet();
    wallet.deposit("USD", 100000);
    const order1 = Order.createOrder(wallet.getAccountId(), "BTC-USD", "buy", 1, 78000);
    const hasBalance1 = wallet.blockOrder(order1);
    expect(hasBalance1).toBe(true);
    expect(wallet.getBalance("USD")).toBe(22000);
    const order2 = Order.createOrder(wallet.getAccountId(), "BTC-USD", "buy", 1, 78000);
    const hasBalance2 = wallet.blockOrder(order2);
    expect(hasBalance2).toBe(false);
    expect(wallet.getBalance("USD")).toBe(22000);
});
