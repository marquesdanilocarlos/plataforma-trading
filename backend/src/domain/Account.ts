import { validateCpf } from './validateCpf'
import Balance from './Balance'

type AccountProps = {
  name: string
  email: string
  document: string
  password: string
  account_id?: string
  balances?: Balance[]
}

export default class Account {
  constructor(
    readonly accountId: string,
    readonly name: string,
    readonly email: string,
    readonly document: string,
    readonly password: string,
    readonly balances: Balance[],
  ) {
    if (!this.name || !this.name.match(/[a-zA-Z]+ [a-zA-Z]+/)) {
      throw new Error('Invalid name')
    }

    if (!this.email || !this.email.match(/.+@.+\..+/)) {
      throw new Error('Invalid email')
    }

    if (!this.document || !validateCpf(this.document)) {
      throw new Error('Invalid document')
    }

    if (
      !this.password ||
      this.password.length < 8 ||
      !this.password.match(/[a-z]/) ||
      !this.password.match(/[A-Z]/) ||
      !this.password.match(/[0-9]/)
    ) {
      throw new Error('Invalid password')
    }
  }

  static create(input: AccountProps): Account {
    const accountId = input.account_id ?? crypto.randomUUID()
    return new Account(
      accountId,
      input.name,
      input.email,
      input.document,
      input.password,
      input.balances ?? [],
    )
  }

  deposit(assetId: string, quantity: number) {
    const existingBalance: Balance | undefined = this.balances.find(
      (balance) => balance.assetId === assetId,
    )

    if (!existingBalance) {
      this.balances.push(new Balance(assetId, quantity))
      return
    }

    existingBalance.quantity += quantity
  }

  withdraw(assetId: string, quantity: number) {
    const index = this.balances.findIndex(
      (balance) => balance.assetId === assetId,
    )

    if (index === -1) {
      throw new Error('You dont have funds')
    }

    const existingBalance = this.balances[index]

    if (existingBalance.quantity < quantity) {
      throw new Error('Insufficient funds')
    }

    existingBalance.quantity -= quantity

    if (existingBalance.quantity === 0) {
      this.balances.splice(index, 1)
    }
  }

  getBalance(assetId: string) {
    const balance = this.balances.find((balance) => balance.assetId === assetId)
    return balance?.quantity ?? 0
  }
}
