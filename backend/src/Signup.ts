import AccountDAO from './AccountDAO'
import { sendEmail } from './mailer'
import { validateCpf } from './validateCpf'

type SignupInput = {
  name: string
  email: string
  document: string
  password: string
}

type SignupOutput = {
  accountId: string
}


export default class Signup {
  constructor(
    private accountDAO: AccountDAO,
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
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
    await sendEmail(account.email, 'Welcome!', '...')
    return {
      accountId,
    }
  }
}
