import BalanceDAO from './BalanceDAO'
import AccountDAO from "./AccountDAO";

export type WithdrawInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

type Balance = {
  asset_id: 'BTC' | 'USD'
  quantity: number
}

export default class Withdraw {
  constructor(
    private accountDAO: AccountDAO,
    private balanceDAO: BalanceDAO,
  ) {}

  async execute(input: WithdrawInput) {
    const { accountId, assetId, quantity } = input
    const account = await this.accountDAO.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    if (!assetId || !quantity || quantity <= 0) {
      throw new Error('Invalid data')
    }

    const balance = account.balances.find(
      (balance: Balance) => balance.asset_id === assetId,
    )

    if (!balance) {
      throw new Error('You dont have funds')
    }

    if (balance.quantity < quantity) {
      throw new Error('Insufficient funds')
    }

    balance.quantity -= quantity

    if (balance.quantity === 0) {
      await this.balanceDAO.deleteAsset(balance)
      return
    }

    await this.balanceDAO.updateAsset(balance)
  }
}
