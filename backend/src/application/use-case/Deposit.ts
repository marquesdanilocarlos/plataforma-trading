import WalletRepository from '../../infra/repositories/WalletRepository'
import Wallet from '../../domain/Wallet'
import AccountRepository from '../../infra/repositories/AccountRepository'

export type DepositInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

export default class Deposit {
  constructor(
    private accountRepository: AccountRepository,
    private walletRepository: WalletRepository,
  ) {}

  async execute(input: DepositInput) {
    const { accountId, assetId, quantity } = input

    const account = await this.accountRepository.getAccountById(input.accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    if (!assetId || !quantity) {
      throw new Error('Invalid deposit')
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0')
    }

    const wallet = await this.walletRepository.getWalletById(accountId)

    wallet.deposit(assetId, quantity)

    await this.walletRepository.updateWallet(wallet)
  }
}
