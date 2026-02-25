import WalletRepository from '../../infra/repositories/WalletRepository'
import AccountRepository from '../../infra/repositories/AccountRepository'
import { inject } from '../../di/Registry'

export type WithdrawInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

export default class Withdraw {
  @inject('accountRepository')
  private accountRepository!: AccountRepository

  @inject('walletRepository')
  private walletRepository!: WalletRepository

  async execute(input: WithdrawInput) {
    const { accountId, assetId, quantity } = input

    const account = await this.accountRepository.getAccountById(input.accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    if (!assetId || !quantity || quantity <= 0) {
      throw new Error('Invalid data')
    }
    const wallet = await this.walletRepository.getWalletById(accountId)

    wallet.withdraw(assetId, quantity)

    await this.walletRepository.updateWallet(wallet)
  }
}
