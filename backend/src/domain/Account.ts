import Balance from './Balance'
import Name from './Name'
import Email from './Email'
import Document from './Document'
import Password from './Password'
import UUID from './UUID'
import Order from './Order'

type AccountProps = {
  name: string
  email: string
  document: string
  password: string
  account_id?: string
  balances?: Balance[]
}

export default class Account {
  private _name: Name
  private _email: Email
  private _document: Document
  private _password: Password
  private _accountId: UUID

  constructor(
    accountId: string,
    name: string,
    email: string,
    document: string,
    password: string,
    readonly balances: Balance[],
  ) {
    this._accountId = new UUID(accountId)
    this._name = new Name(name)
    this._email = new Email(email)
    this._document = new Document(document)
    this._password = new Password(password)
  }

  static create(input: AccountProps): Account {
    const accountId = input.account_id ?? UUID.create().getValue()
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
      this.balances.push(new Balance(assetId, quantity, 0))
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

  blockOrder(order: Order): boolean {
    const assetId =
      order.side === 'buy' ? order.getPaymentAsset() : order.getMainAsset()
    const balance = this.balances.find((balance: Balance) => {
      return balance.assetId === assetId
    })

    if (!balance) {
      return false
    }

    const quantity =
      order.side === 'buy' ? order.quantity * order.price : order.quantity

    if (balance.getAvailableQuantity() < quantity) {
      return false
    }

    balance.blockedQuantity += quantity
    return true
  }

  getBalance(assetId: string) {
    const balance = this.balances.find((balance) => balance.assetId === assetId)

    if (!balance) {
      return 0
    }

    return balance.getAvailableQuantity()
  }

  get name(): string {
    return this._name.getValue()
  }

  get email(): string {
    return this._email.getValue()
  }

  get document(): string {
    return this._document.getValue()
  }

  get password(): string {
    return this._password.getValue()
  }

  get accountId(): string {
    return this._accountId.getValue()
  }
}
