import AccountDAO from './AccountDAO'
import BalanceDAO from './BalanceDAO'

export type DepositInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

export default class Deposit {
  constructor(
    private accountDAO: AccountDAO,
    private balanceDAO: BalanceDAO,
  ) {}


  async execute(input: DepositInput) {
    const { accountId, assetId, quantity } = input
    const account = await this.balanceDAO.getByAccountId(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    if (!assetId || !quantity) {
      throw new Error('Invalid deposit')
    }

    if (input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    const [existingBalance] = await this.balanceDAO.getByAccountAndAssetId(accountId, assetId)

    if (!existingBalance) {
      await this.balanceDAO.saveBalance({
        accountId,
        assetId,
        quantity,
      })

      return
    }

    await this.balanceDAO.updateAsset({
      accountId,
      asset_id: assetId,
      quantity: parseFloat(existingBalance.quantity) + quantity,
    })

  }
}
