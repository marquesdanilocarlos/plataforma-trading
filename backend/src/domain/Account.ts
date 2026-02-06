import Name from './Name'
import Email from './Email'
import Document from './Document'
import Password from './Password'
import UUID from './UUID'

type AccountProps = {
  name: string
  email: string
  document: string
  password: string
  account_id?: string
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
    )
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
