import Account from "../../domain/Account";
import { column, model, Model } from "./ORM";

@model("ccca", "account")
export class AccountModel extends Model {
    @column("account_id")
    accountId: string;
    @column("name")
    name: string;
    @column("email")
    email: string;
    @column("document")
    document: string;
    @column("password")
    password: string;

    constructor (accountId: string, name: string, email: string, document: string, password: string) {
        super();
        this.accountId = accountId;
        this.name = name;
        this.email = email;
        this.document = document;
        this.password = password;
    }

    toEntity () {
        return new Account(this.accountId, this.name, this.email, this.document, this.password);
    }

    static fromEntity (account: Account) {
        return new AccountModel(
            account.getAccountId(), 
            account.getName(), 
            account.getEmail(), 
            account.getDocument(), 
            account.getPassword()
        );
    }
}
