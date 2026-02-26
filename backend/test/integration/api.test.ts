import axios from "axios";

axios.defaults.validateStatus = () => true;

test("Deve criar uma conta", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3000/signup", input);
    expect(responseSignup.status).toBe(200);
    const outputSignup = responseSignup.data;
    expect(outputSignup.accountId).toBeDefined();
    const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
    expect(responseGetAccount.status).toBe(200);
    const outputGetAccount = responseGetAccount.data;
    expect(outputGetAccount.accountId).toBe(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.document).toBe(input.document);
    expect(outputGetAccount.password).toBe(input.password);
});

test("Não deve criar uma conta se o nome for inválido", async () => {
    const input = {
        name: "John",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3000/signup", input);
    expect(responseSignup.status).toBe(422);
    const outputSignup = responseSignup.data;
    expect(outputSignup.message).toBe("Invalid name");
});

test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = `BTC-USD-${Math.random()}`;
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3000/signup", input);
    const outputSignup = responseSignup.data;
    await axios.post("http://localhost:3000/deposit", {
        accountId: outputSignup.accountId,
        assetId: "BTC",
        quantity: 2
    });
    await axios.post("http://localhost:3000/deposit", {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 200000
    });
    const outputPlaceOrder1 = (await axios.post("http://localhost:3000/place_order", {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    })).data;
    const outputPlaceOrder2 = (await axios.post("http://localhost:3000/place_order", {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 79000
    })).data;
    const outputPlaceOrder3 = (await axios.post("http://localhost:3000/place_order", {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 80000
    })).data;
    const outputGetOrder1 = (await axios.get(`http://localhost:3000/orders/${outputPlaceOrder1.orderId}`)).data;
    expect(outputGetOrder1.fillQuantity).toBe(1);
    expect(outputGetOrder1.fillPrice).toBe(78000);
    expect(outputGetOrder1.status).toBe("closed");
    const outputGetOrder2 = (await axios.get(`http://localhost:3000/orders/${outputPlaceOrder2.orderId}`)).data;
    expect(outputGetOrder2.fillQuantity).toBe(1);
    expect(outputGetOrder2.fillPrice).toBe(79000);
    expect(outputGetOrder2.status).toBe("closed");
    const outputGetOrder3 = (await axios.get(`http://localhost:3000/orders/${outputPlaceOrder3.orderId}`)).data;
    expect(outputGetOrder3.fillQuantity).toBe(2);
    expect(outputGetOrder3.fillPrice).toBe(78500);
    expect(outputGetOrder3.status).toBe("closed");
});
