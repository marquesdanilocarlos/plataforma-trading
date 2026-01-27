import AccountRepository from './AccountRepository'

export type WithdrawInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

export default class Withdraw {
  constructor(private accountDAO: AccountRepository) {}

  async execute(input: WithdrawInput) {
    const { accountId, assetId, quantity } = input
    const account = await this.accountDAO.getAccountById(accountId)

    if (!assetId || !quantity || quantity <= 0) {
      throw new Error('Invalid data')
    }

    if (!account) {
      throw new Error('Account not found')
    }

    account.withdraw(assetId, quantity)

    await this.accountDAO.updateAccount(account)
  }
}
