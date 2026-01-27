import AccountDAO from './AccountDAO'
import { sendEmail } from './mailer'
import { validateCpf } from './validateCpf'
import BalanceDAO from './BalanceDAO'

export type DepositInput = {
  accountId: string
  assetId: 'BTC' | 'USD'
  quantity: number
}

type Balance = {
  account_id: string
  asset_id: 'BTC' | 'USD'
  quantity: number
}

export default class AccountService {
  constructor(
    private accountDAO: AccountDAO,
    private balanceDAO: BalanceDAO,
  ) {}

  async signup(input: any) {
    const accountId = crypto.randomUUID()
    const account = {
      accountId,
      name: input.name,
      email: input.email,
      document: input.document,
      password: input.password,
    }
    if (!account.name || !account.name.match(/[a-zA-Z]+ [a-zA-Z]+/)) {
      throw new Error('Invalid name')
    }
    if (!account.email || !account.email.match(/.+@.+\..+/)) {
      throw new Error('Invalid email')
    }
    if (!account.document || !validateCpf(account.document)) {
      throw new Error('Invalid document')
    }
    if (
      !account.password ||
      account.password.length < 8 ||
      !account.password.match(/[a-z]/) ||
      !account.password.match(/[A-Z]/) ||
      !account.password.match(/[0-9]/)
    ) {
      throw new Error('Invalid password')
    }
    await this.accountDAO.saveAccount(account)
    const success = await sendEmail(account.email, 'Welcome!', '...')
    return {
      accountId,
    }
  }

  async getAccount(accountId: string) {
    const account = await this.accountDAO.getAccountById(accountId)
    const balances: Balance[] | null = await this.balanceDAO.getByAccountId(accountId)
    account.balances = balances ?? []
    return account
  }

  async deposit(input: DepositInput) {
    const { accountId, assetId, quantity } = input
    const account = await this.getAccount(accountId)

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

  async withdraw(input: DepositInput) {
    const { accountId, assetId, quantity } = input
    const account = await this.getAccount(accountId)

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
