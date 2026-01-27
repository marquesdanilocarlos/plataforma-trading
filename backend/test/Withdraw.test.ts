import { AccountRepositoryDatabase } from '../src/AccountRepository'
import Signup from '../src/Signup'
import GetAccount from '../src/GetAccount'
import Deposit, { DepositInput } from '../src/Deposit'
import Withdraw from '../src/Withdraw'

let signup: Signup
let getAccount: GetAccount
let deposit: Deposit
let withdraw: Withdraw

beforeEach(() => {
  const accountRepository = new AccountRepositoryDatabase()
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository)
  deposit = new Deposit(accountRepository)
  withdraw = new Withdraw(accountRepository)
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
