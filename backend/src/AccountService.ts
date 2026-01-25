import AccountDAO, { AccountDAODatabase } from "./AccountDAO";
import { sendEmail } from "./mailer";
import { validateCpf } from "./validateCpf";
import AssetDAO from "./AssetDAO";

export type DepositInput = {
    assetId: 'BTC' | 'USD';
    quantity: number;
}


type Asset = {
    account_id: string;
    asset_id: 'BTC' | 'USD';
    quantity: number;
}

export default class AccountService {
    constructor (private accountDAO: AccountDAO, private assetDAO: AssetDAO) {
    }

    async signup (input: any) {
        const accountId = crypto.randomUUID();
        const account = {
            accountId,
            name: input.name,
            email: input.email,
            document: input.document,
            password: input.password
        }
        if (!account.name || !account.name.match(/[a-zA-Z]+ [a-zA-Z]+/)) {
            throw new Error("Invalid name");
        }
        if (!account.email || !account.email.match(/.+@.+\..+/)) {
            throw new Error("Invalid email");
        }
        if (!account.document || !validateCpf(account.document)) {
            throw new Error("Invalid document");
        }
        if (
            !account.password || 
            account.password.length < 8 || 
            !account.password.match(/[a-z]/) || 
            !account.password.match(/[A-Z]/) ||
            !account.password.match(/[0-9]/)
        ) {
            throw new Error("Invalid password");
        }
        await this.accountDAO.saveAccount(account);
        const success = await sendEmail(account.email, "Welcome!", "...");
        return {
            accountId
        }
    }

    async getAccount (accountId: string) {
        const account = await this.accountDAO.getAccountById(accountId);
        const assets: Asset[] | null = await this.assetDAO.getByAccountId(accountId)
        account.assets = assets ?? [];
        return account;
    }

    async deposit (accountId: string, input: DepositInput) {
        const account = await this.getAccount(accountId);

        if (!account) {
            throw new Error("Account not found");
        }

        if (!input.assetId || !input.quantity) {
            throw new Error("Invalid deposit");
        }

        if (input.quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        const asset = {
            accountId,
            assetId: input.assetId,
            quantity: input.quantity
        }

        await this.assetDAO.saveAsset(asset);

    }

    async withdraw (accountId: string, input: DepositInput) {
        const account = await this.getAccount(accountId);

        if (!account) {
            throw new Error("Account not found");
        }

        if (!input.assetId || !input.quantity) {
            throw new Error("Invalid deposit");
        }

        if (input.quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        const asset =  account.assets.find((asset: Asset) => asset.asset_id === input.assetId);

        if (asset.quantity < input.quantity) {
            throw new Error("Insufficient balance");
        }

        asset.quantity -= input.quantity;
        await this.assetDAO.updateAsset(asset);

        return {asset}
    }
}
