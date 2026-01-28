import AccountRepository from '../../infra/repositories/AccountRepository'
import Balance from '../../domain/Balance'

export type GetAccountOutput = {
  accountId: string
  name: string
  email: string
  document: string
  password: string
  balances: Balance[]
}

export default class GetAccount {
  constructor(private accountDAO: AccountRepository) {}

  async execute(accountId: string): Promise<GetAccountOutput> {
    const account = await this.accountDAO.getAccountById(accountId)

    if (!account) {
      throw new Error('Account not found')
    }

    return { ...account }
  }
}
