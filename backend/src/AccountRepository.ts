import Account from './Account'
import Balance from './Balance'
import { DatabaseConnection } from './DatabaseConnection'

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
}

export default interface AccountRepository {
  saveAccount(account: Account): Promise<void>
  getAccountById(accountId: string): Promise<Account | null>
  updateAccount(account: Account): Promise<void>
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

    const balancesData = await this.connection.query<BalanceRow>(
      'select * from ccca.account_balance where account_id = $1',
      [accountId],
    )

    const balances = balancesData.map((balanceData: BalanceRow) => {
      return new Balance(balanceData.asset_id, parseFloat(balanceData.quantity))
    })

    return Account.create({ ...account, balances })
  }

  async updateAccount(account: Account): Promise<void> {
    await this.connection.query(
      'delete from ccca.account_balance where account_id = $1',
      [account.accountId],
    )

    for (const balance of account.balances) {
      await this.connection.query(
        'insert into ccca.account_balance (account_id, asset_id, quantity) values ($1, $2, $3)',
        [account.accountId, balance.assetId, balance.quantity],
      )
    }
  }
}

// Fake
export class AccountRepositoryMemory implements AccountRepository {
  accounts: Account[] = []

  async saveAccount(account: Account): Promise<void> {
    this.accounts.push(account)
  }

  async getAccountById(accountId: string): Promise<Account> {
    const account = this.accounts.find(
      (account: Account) => account.accountId === accountId,
    )

    if (!account) {
      throw new Error('Account not found')
    }

    return Account.create(account)
  }

  updateAccount(account: Account): Promise<void> {
    return Promise.resolve()
  }
}
