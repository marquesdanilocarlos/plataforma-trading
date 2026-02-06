import Wallet from '../../domain/Wallet'
import Balance from '../../domain/Balance'
import { DatabaseConnection } from '../database/DatabaseConnection'

type BalanceRow = {
  asset_id: string
  quantity: string
  blocked_quantity: string
}

export default interface WalletRepository {
  getWalletById(accountId: string): Promise<Wallet>
  updateWallet(wallet: Wallet): Promise<void>
}

export class WalletRepositoryDatabase implements WalletRepository {
  constructor(private connection: DatabaseConnection) {}

  async getWalletById(accountId: string): Promise<Wallet> {
    const balancesData = await this.connection.query<BalanceRow>(
      'select * from ccca.account_balance where account_id = $1',
      [accountId],
    )

    const balances = balancesData.map((balanceData: BalanceRow) => {
      return new Balance(
        balanceData.asset_id,
        parseFloat(balanceData.quantity),
        parseFloat(balanceData.blocked_quantity),
      )
    })

    return Wallet.create({ account_id: accountId, balances })
  }

  async updateWallet(wallet: Wallet): Promise<void> {
    await this.connection.query(
      'delete from ccca.account_balance where account_id = $1',
      [wallet.accountId],
    )

    for (const balance of wallet.balances) {
      await this.connection.query(
        'insert into ccca.account_balance (account_id, asset_id, quantity, blocked_quantity) values ($1, $2, $3, $4)',
        [
          wallet.accountId,
          balance.assetId,
          balance.quantity,
          balance.blockedQuantity,
        ],
      )
    }
  }
}
