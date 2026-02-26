import Account from "../../src/domain/Account";
import { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import Registry from "../../src/infra/di/Registry";
import { AccountModel } from "../../src/infra/orm/AccountModel";
import ORM from "../../src/infra/orm/ORM";
import { AccountRepositoryORM } from "../../src/infra/repository/AccountRepository";

test("Deve testar o ORM", async () => {
    const connection = new PgPromiseAdapter();
    Registry.getInstance().register("databaseConnection", connection);
    const orm = new ORM();
    const account = Account.createAccount("John Doe", "john.doe@gmail.com", "97456321558", "asdQWE123");
    const accountModel = AccountModel.fromEntity(account);
    await orm.save(accountModel);
    const savedAccountModel = await orm.get(AccountModel, "account_id", account.getAccountId());
    expect(savedAccountModel.accountId).toBe(account.getAccountId());
    expect(savedAccountModel.name).toBe("John Doe");
    expect(savedAccountModel.email).toBe("john.doe@gmail.com");
    expect(savedAccountModel.document).toBe("97456321558");
    expect(savedAccountModel.password).toBe("asdQWE123");
    await connection.close();
});

test("Deve testar o AccountRepository", async () => {
    const connection = new PgPromiseAdapter();
    Registry.getInstance().register("databaseConnection", connection);
    const orm = new ORM();
    Registry.getInstance().register("orm", orm);
    const accountRepository = new AccountRepositoryORM();
    const account = Account.createAccount("John Doe", "john.doe@gmail.com", "97456321558", "asdQWE123");
    await accountRepository.saveAccount(account);
    const savedAccount = await accountRepository.getAccountById(account.getAccountId());
    expect(savedAccount.getAccountId()).toBe(account.getAccountId());
    expect(savedAccount.getName()).toBe("John Doe");
    expect(savedAccount.getEmail()).toBe("john.doe@gmail.com");
    expect(savedAccount.getDocument()).toBe("97456321558");
    expect(savedAccount.getPassword()).toBe("asdQWE123");
    await connection.close();
});
