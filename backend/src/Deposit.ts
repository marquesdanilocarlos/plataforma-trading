import AccountRepository from './AccountRepository'
import Account from './Account'

export type DepositInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

export default class Deposit {
  constructor(private accountRepository: AccountRepository) {}

  async execute(input: DepositInput) {
    const { accountId, assetId, quantity } = input

    const account: Account | null =
      await this.accountRepository.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    if (!assetId || !quantity) {
      throw new Error('Invalid deposit')
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    account.deposit(assetId, quantity)

    await this.accountRepository.updateAccount(account)
  }
}
