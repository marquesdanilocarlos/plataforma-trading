import AccountRepository from '../../infra/repositories/AccountRepository'
import { sendEmail } from '../../mailer'
import Account from '../../domain/Account'

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
  constructor(private accountDAO: AccountRepository) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    const account = Account.create(input)

    await this.accountDAO.saveAccount(account)
    await sendEmail(account.email, 'Welcome!', '...')
    return {
      accountId: account.accountId,
    }
  }
}
