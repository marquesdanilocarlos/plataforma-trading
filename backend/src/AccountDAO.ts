import pgp from 'pg-promise'

export default interface AccountDAO {
  saveAccount(account: any): Promise<void>
  getAccountById(accountId: string): Promise<any>
}

export class AccountDAODatabase implements AccountDAO {
  async saveAccount(account: any) {
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

  async getAccountById(accountId: string) {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    const [account] = await connection.query(
      'select * from ccca.account where account_id = $1',
      [accountId],
    )
    const balancesData = await connection.query("select * from ccca.account_balance where account_id = $1", [accountId]);
    account.balances = balancesData;
    await connection.$pool.end()
    return account
  }
}

// Fake
export class AccountDAOMemory implements AccountDAO {
  accounts: any[] = []

  async saveAccount(account: any): Promise<void> {
    this.accounts.push(account)
  }

  async getAccountById(accountId: string): Promise<any> {
    const account = this.accounts.find(
      (account: any) => account.accountId === accountId,
    )
    return account
  }
}
