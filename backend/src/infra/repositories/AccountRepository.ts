import Account from '../../domain/Account'
import Balance from '../../domain/Balance'
import { DatabaseConnection } from '../database/DatabaseConnection'

type AccountRow = {
  account_id: string
  name: string
  email: string
  document: string
  password: string
  balances: BalanceRow[]
}

type BalanceRow = {
  asset_id: string
  quantity: string
  blocked_quantity: string
}

export default interface AccountRepository {
  saveAccount(account: Account): Promise<void>
  getAccountById(accountId: string): Promise<Account | null>
}

export class AccountRepositoryDatabase implements AccountRepository {
  constructor(private connection: DatabaseConnection) {}

  async saveAccount(account: Account): Promise<void> {
    await this.connection.query(
      'insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)',
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ],
    )
  }

  async getAccountById(accountId: string): Promise<Account> {
    const [account] = await this.connection.query<AccountRow>(
      'select * from ccca.account where account_id = $1',
      [accountId],
    )

    if (!account) {
      throw new Error('Account not found')
    }

    return Account.create(account)
  }
}
