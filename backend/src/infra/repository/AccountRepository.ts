import Account from "../../domain/Account";
import DatabaseConnection, { PgPromiseAdapter } from "../database/DatabaseConnection";
import { inject } from "../di/Registry";
import { AccountModel } from "../orm/AccountModel";
import ORM from "../orm/ORM";


export default interface AccountRepository {
    saveAccount (account: Account): Promise<void>;
    getAccountById (accountId: string): Promise<Account>;
}

export class AccountRepositoryDatabase implements AccountRepository {
    @inject("databaseConnection")
    connection!: DatabaseConnection;

    async saveAccount (account: Account) {
        await this.connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.getAccountId(), account.getName(), account.getEmail(), account.getDocument(), account.getPassword()]);
    }

    async getAccountById (accountId: string): Promise<Account> {
        const [account] = await this.connection.query("select * from ccca.account where account_id = $1", [accountId]);
        if (!account) throw new Error("Account not found");
        return new Account(account.account_id, account.name, account.email, account.document, account.password);
    }
}

export class AccountRepositoryORM implements AccountRepository {
    @inject("orm")
    orm!: ORM;

    async saveAccount (account: Account) {
        await this.orm.save(AccountModel.fromEntity(account));
    }

    async getAccountById (accountId: string): Promise<Account> {
        const accountModel = await this.orm.get(AccountModel, "account_id", accountId);
        return accountModel.toEntity();
    }
}

// Fake
export class AccountRepositoryMemory implements AccountRepository {
    accounts: Account[] = [];

    async saveAccount(account: Account): Promise<void> {
        this.accounts.push(account);
    }

    async getAccountById(accountId: string): Promise<Account> {
        const account = this.accounts.find((account: Account) => account.getAccountId() === accountId);
        if (!account) throw new Error("Account not found");
        return account;
    }

}
