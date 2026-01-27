import pgp from 'pg-promise'
import Account from './Account'
import Balance from './Balance'

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
  async saveAccount(account: Account): Promise<void> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    await connection.query(
      'insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)',
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ],
    )
    await connection.$pool.end()
  }

  async getAccountById(accountId: string): Promise<Account> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    const [account] = await connection.query(
      'select * from ccca.account where account_id = $1',
      [accountId],
    )

    if (!account) {
      throw new Error('Account not found')
    }

    const balancesData = await connection.query(
      'select * from ccca.account_balance where account_id = $1',
      [accountId],
    )

    const balances = balancesData.map((balanceData: BalanceRow) => {
      return new Balance(balanceData.asset_id, parseFloat(balanceData.quantity))
    })

    await connection.$pool.end()
    return Account.create({ ...account, balances })
  }

  async updateAccount(account: Account): Promise<void> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')

    await connection.query(
      'delete from ccca.account_balance where account_id = $1',
      [account.accountId],
    )

    for (const balance of account.balances) {
      await connection.query(
        'insert into ccca.account_balance (account_id, asset_id, quantity) values ($1, $2, $3)',
        [account.accountId, balance.assetId, balance.quantity],
      )
    }

    await connection.$pool.end()
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
