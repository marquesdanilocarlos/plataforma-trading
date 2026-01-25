import axios from "axios";
import {DepositInput} from "../src/AccountService";

axios.defaults.validateStatus = () => true;

test("Deve criar uma conta", async () => {
    const input = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        document: "97456321558",
        password: "asdQWE123"
    }
    const responseSignup = await axios.post("http://localhost:3333/signup", input);
    expect(responseSignup.status).toBe(200);
    const outputSignup = responseSignup.data;
    expect(outputSignup.accountId).toBeDefined();
    const responseGetAccount = await axios.get(`http://localhost:3333/accounts/${outputSignup.accountId}`);
    expect(responseGetAccount.status).toBe(200);
    const outputGetAccount = responseGetAccount.data;
    expect(outputGetAccount.account_id).toBe(outputSignup.accountId);
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
    const responseSignup = await axios.post("http://localhost:3333/signup", input);
    expect(responseSignup.status).toBe(422);
    const outputSignup = responseSignup.data;
    expect(outputSignup.message).toBe("Invalid name");
});


test('Deve realizar um depósito', async () => {

    const input = {
        name: "Danilo Carlos Marques",
        email: "john.danilo@gmail.com",
        document: "03321844125",
        password: "ASfQWE123Uyhjg882"
    }
    const responseSignup = await axios.post("http://localhost:3333/signup", input);
    expect(responseSignup.status).toBe(200);
    const outputSignup = responseSignup.data;
    expect(outputSignup.accountId).toBeDefined();

    const depositInput: DepositInput = {
        assetId: "USD",
        quantity: 100
    }
    const responseDeposit = await axios.post(`http://localhost:3333/deposit/${outputSignup.accountId}`, depositInput);
    expect(responseDeposit.status).toBe(200);
})

test('Deve realizar um saque', async () => {

    const input = {
        name: "Joventino Moreira Santos",
        email: "jovereira.santos@gmail.com",
        document: "17075650076",
        password: "ASfQWE123Uyhjg882"
    }
    const responseSignup = await axios.post("http://localhost:3333/signup", input);
    expect(responseSignup.status).toBe(200);
    const outputSignup = responseSignup.data;
    expect(outputSignup.accountId).toBeDefined();

    const depositInput1: DepositInput = {
        assetId: "USD",
        quantity: 100
    }
    const responseDeposit1 = await axios.post(`http://localhost:3333/deposit/${outputSignup.accountId}`, depositInput1);
    expect(responseDeposit1.status).toBe(200);

    const depositInput2: DepositInput = {
        assetId: "BTC",
        quantity: 100
    }
    const responseDeposit2 = await axios.post(`http://localhost:3333/deposit/${outputSignup.accountId}`, depositInput2);
    expect(responseDeposit2.status).toBe(200);

    const withdrawInput: DepositInput = {
        assetId: "USD",
        quantity: 75
    }

    const responseWithdraw = await axios.post(`http://localhost:3333/withdraw/${outputSignup.accountId}`, withdrawInput);
    const {asset} = responseWithdraw.data
    expect(responseWithdraw.status).toBe(200);
    expect(asset.quantity).toBe(25);


})