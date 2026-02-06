import AccountRepository, {
  AccountRepositoryDatabase,
} from '../src/infra/repositories/AccountRepository'
import Signup from '../src/application/use-case/Signup'
import GetAccount from '../src/application/use-case/GetAccount'
import Deposit, { DepositInput } from '../src/application/use-case/Deposit'
import Withdraw from '../src/application/use-case/Withdraw'
import { DatabaseConnection } from '../src/infra/database/DatabaseConnection'
import PgPromiseAdapter from '../src/infra/database/PgPromiseAdapter'
import WalletRepository, {
  WalletRepositoryDatabase,
} from '../src/infra/repositories/WalletRepository'

let signup: Signup
let getAccount: GetAccount
let deposit: Deposit
let withdraw: Withdraw
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
  withdraw = new Withdraw(accountRepository, walletRepository)
})

afterEach(async () => {
  await databaseConnection.close()
})

test('Deve realizar um saque', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 7800,
  }

  await deposit.execute(firstInputDeposit)

  await withdraw.execute({
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 7000,
  })

  const outputGetAccount = await getAccount.execute(outputSignup.accountId)

  expect(outputGetAccount.balances[0].assetId).toBe('BTC')
  expect(outputGetAccount.balances[0].quantity).toBe(800)
})

test('Deve remover o balance caso seja sacado todo o valor', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 87454,
  }

  await deposit.execute(firstInputDeposit)

  await withdraw.execute({
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 87454,
  })

  const outputGetAccount = await getAccount.execute(outputSignup.accountId)

  expect(outputGetAccount.balances).toHaveLength(0)
})

test('Não deve sacar em conta sem fundos', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  await expect(async () => {
    await withdraw.execute({
      accountId: outputSignup.accountId,
      assetId: 'BTC',
      quantity: 1000,
    })
  }).rejects.toThrow(new Error('You dont have funds'))
})

test('Deve remover o balance caso seja sacado todo o valor', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 562,
  }

  await deposit.execute(firstInputDeposit)

  await expect(async () => {
    await withdraw.execute({
      accountId: outputSignup.accountId,
      assetId: 'BTC',
      quantity: 1000,
    })
  }).rejects.toThrow(new Error('Insufficient funds'))
})
