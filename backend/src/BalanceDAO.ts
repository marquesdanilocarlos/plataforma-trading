import pgp from 'pg-promise'

export default interface BalanceDAO {
  saveBalance(asset: any): Promise<void>
  getByAccountId(accountId: string): Promise<any>
  getByAccountAndAssetId(accountId: string, assetId: string): Promise<any>
  updateAsset(asset: any): Promise<void>
  deleteAsset(asset: any): Promise<void>
}

export class BalanceDAODatabase implements BalanceDAO {
  async saveBalance(asset: any) {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    await connection.query(
      'insert into ccca.account_balance (account_id, asset_id, quantity) values ($1, $2, $3)',
      [asset.accountId, asset.assetId, asset.quantity],
    )
    await connection.$pool.end()
  }

  async getByAccountId(accountId: string) {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    const balances = await connection.query(
      'select * from ccca.account_balance where account_id = $1',
      [accountId],
    )
    await connection.$pool.end()
    return balances
  }

  async updateAsset(balance: any): Promise<void> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    await connection.query(
      'update ccca.account_balance set quantity = $1 where asset_id = $2',
      [balance.quantity, balance.asset_id],
    )
    await connection.$pool.end()
  }

  async getByAccountAndAssetId(accountId: string, assetId: string): Promise<any> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    const balances = await connection.query(
        'select * from ccca.account_balance where account_id = $1 and asset_id = $2 limit 1',
        [accountId, assetId],
    )
    await connection.$pool.end()
    return balances
  }

  async deleteAsset(asset: any): Promise<void> {
    const connection = pgp()('postgres://postgres:123456@localhost:5432/app')
    const balances = await connection.query(
        'delete from ccca.account_balance where account_id = $1 and asset_id = $2',
        [asset.account_id, asset.asset_id],
    )
    await connection.$pool.end()
  }



}

