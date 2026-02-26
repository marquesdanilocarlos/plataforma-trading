import axios from "axios";

function sleep (time: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}

async function main () {
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
        quantity: 2000000000
    });
    await axios.post("http://localhost:3000/deposit", {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 2000000000
    });
    while (true) {
        const inputPlaceOrder = {
            accountId: outputSignup.accountId,
            marketId,
            side: (Math.random() > 0.5) ? "buy" : "sell",
            quantity: Math.round(Math.random() * 10),
            price: Math.round(78 + ((Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1)))
        }
        await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
    }
}

main();
