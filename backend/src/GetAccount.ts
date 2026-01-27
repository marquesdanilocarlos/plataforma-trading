import AccountDAO from './AccountDAO'
import BalanceDAO from './BalanceDAO'

export type GetAccountOutput = {
  accountId: string
  name: string
  email: string
  document: string
  password: string
  balances: {
    assetId: string
    quantity: number
  }[]
}

type Balance = {
  asset_id: 'BTC' | 'USD'
  quantity: string
}

export default class GetAccount {
  constructor(
    private accountDAO: AccountDAO,
    private balanceDAO: BalanceDAO,
  ) {}

  async execute(accountId: string): Promise<GetAccountOutput> {
    const account = await this.accountDAO.getAccountById(accountId)
    const balances: Balance[] = await this.balanceDAO.getByAccountId(accountId) ?? []
    return {
      accountId: account.account_id,
      name: account.name,
      email: account.email,
      document: account.document,
      password: account.password,
      balances: balances.map(balance => ({
        assetId: balance.asset_id,
        quantity: parseFloat(balance.quantity),
      })),
    }
  }
}
