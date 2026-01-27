import { AccountRepositoryDatabase } from '../src/AccountRepository'
import Signup from '../src/Signup'
import GetAccount from '../src/GetAccount'
import Deposit, { DepositInput } from '../src/Deposit'
import { DatabaseConnection } from '../src/DatabaseConnection'
import PgPromiseAdapter from '../src/PgPromiseAdapter'

let signup: Signup
let getAccount: GetAccount
let deposit: Deposit
let databaseConnection: DatabaseConnection

beforeEach(() => {
  databaseConnection = new PgPromiseAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository)
  deposit = new Deposit(accountRepository)
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
    accountId: 'b010dc02-4905-4be5-8535-317d3a669afc',
    assetId: 'USD',
    quantity: 10000,
  }

  expect(async () => {
    await deposit.execute(inputDeposit)
  }).rejects.toThrow(new Error('Account not found'))
})
