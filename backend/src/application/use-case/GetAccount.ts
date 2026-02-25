import AccountRepository from '../../infra/repositories/AccountRepository'
import Balance from '../../domain/Balance'
import WalletRepository from '../../infra/repositories/WalletRepository'
import Registry from '../../di/Registry'

export type GetAccountOutput = {
  accountId: string
  name: string
  email: string
  document: string
  password: string
  balances: Balance[]
}

export default class GetAccount {
  accountRepository: AccountRepository
  walletRepository: WalletRepository

  constructor() {
    this.accountRepository = Registry.getInstance().inject('accountRepository')
    this.walletRepository = Registry.getInstance().inject('walletRepository')
  }

  async execute(accountId: string): Promise<GetAccountOutput> {
    const account = await this.accountRepository.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    const wallet = await this.walletRepository.getWalletById(accountId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      document: account.document,
      password: account.password,
      balances: wallet.balances,
    }
  }
}
