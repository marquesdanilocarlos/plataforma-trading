import AccountRepository from '../../infra/repositories/AccountRepository'
import { sendEmail } from '../../mailer'
import Account from '../../domain/Account'
import { inject } from '../../di/Registry'

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
  @inject('accountRepository')
  private accountRepository!: AccountRepository

  async execute(input: SignupInput): Promise<SignupOutput> {
    const account = Account.create(input)

    await this.accountRepository.saveAccount(account)
    await sendEmail(account.email, 'Welcome!', '...')
    return {
      accountId: account.accountId,
    }
  }
}
