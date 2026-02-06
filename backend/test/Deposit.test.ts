import AccountRepository, {
  AccountRepositoryDatabase,
} from '../src/infra/repositories/AccountRepository'
import Signup from '../src/application/use-case/Signup'
import GetAccount from '../src/application/use-case/GetAccount'
import Deposit, { DepositInput } from '../src/application/use-case/Deposit'
import { DatabaseConnection } from '../src/infra/database/DatabaseConnection'
import PgPromiseAdapter from '../src/infra/database/PgPromiseAdapter'
import WalletRepository, {
  WalletRepositoryDatabase,
} from '../src/infra/repositories/WalletRepository'

let signup: Signup
let getAccount: GetAccount
let deposit: Deposit
let databaseConnection: DatabaseConnection
let accountRepository: AccountRepository
let walletRepository: WalletRepository

beforeEach(() => {
  databaseConnection = new PgPromiseAdapter()
  accountRepository = new AccountRepositoryDatabase(databaseConnection)
  walletRepository = new WalletRepositoryDatabase(databaseConnection)
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository, walletRepository)
  deposit = new Deposit(accountRepository, walletRepository)
})

afterEach(async () => {
  await databaseConnection.close()
})

test('Deve depositar em uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  const inputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await deposit.execute(inputDeposit)

  const outputGetAccount = await getAccount.execute(outputSignup.accountId)

  expect(outputGetAccount.balances[0].assetId).toBe('USD')
  expect(outputGetAccount.balances[0].quantity).toBe(10000)
})

test('Deve depositar duas vezes em uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await deposit.execute(firstInputDeposit)

  const secondInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await deposit.execute(secondInputDeposit)

  const outputGetAccount = await getAccount.execute(outputSignup.accountId)

  expect(outputGetAccount.balances[0].assetId).toBe('USD')
  expect(outputGetAccount.balances[0].quantity).toBe(20000)
})

test('Não deve permitir depositar sem account válida', () => {
  const inputDeposit: DepositInput = {
    accountId: 'b010dc02-4905-4be5-9879-317d3a669afc',
    assetId: 'USD',
    quantity: 10000,
  }

  expect(async () => {
    await deposit.execute(inputDeposit)
  }).rejects.toThrow(new Error('Account not found'))
})
