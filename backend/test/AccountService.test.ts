import { AccountDAODatabase, AccountDAOMemory } from '../src/AccountDAO'
import AccountService, { DepositInput } from '../src/AccountService'
import sinon from 'sinon'
import * as mailer from '../src/mailer'
import { BalanceDAODatabase } from '../src/BalanceDAO'

let accountService: AccountService

beforeEach(() => {
  const accountDAO = new AccountDAODatabase()
  const balanceDAO = new BalanceDAODatabase()
  accountService = new AccountService(accountDAO, balanceDAO)
})

test('Deve criar uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  )
  expect(outputGetAccount.name).toBe(input.name)
  expect(outputGetAccount.email).toBe(input.email)
  expect(outputGetAccount.document).toBe(input.document)
  expect(outputGetAccount.password).toBe(input.password)
})

test('Deve criar uma conta com stub', async () => {
  const mailerStub = sinon.stub(mailer, 'sendEmail').resolves()
  const accountDAOSaveAccountStub = sinon
    .stub(AccountDAODatabase.prototype, 'saveAccount')
    .resolves()
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const accountDAOGetAccountByIdStub = sinon
    .stub(AccountDAODatabase.prototype, 'getAccountById')
    .resolves(input)
  const outputSignup = await accountService.signup(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  )
  expect(outputGetAccount.name).toBe(input.name)
  expect(outputGetAccount.email).toBe(input.email)
  expect(outputGetAccount.document).toBe(input.document)
  expect(outputGetAccount.password).toBe(input.password)
  mailerStub.restore()
  accountDAOSaveAccountStub.restore()
  accountDAOGetAccountByIdStub.restore()
})

test('Deve criar uma conta com spy', async () => {
  const mailerSpy = sinon.spy(mailer, 'sendEmail')
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  )
  expect(outputGetAccount.name).toBe(input.name)
  expect(outputGetAccount.email).toBe(input.email)
  expect(outputGetAccount.document).toBe(input.document)
  expect(outputGetAccount.password).toBe(input.password)
  expect(mailerSpy.calledOnce).toBe(true)
  expect(mailerSpy.calledWith('john.doe@gmail.com', 'Welcome!', '...')).toBe(
    true,
  )
  mailerSpy.restore()
})

test('Deve criar uma conta com mock', async () => {
  const mailerMock = sinon.mock(mailer)
  mailerMock
    .expects('sendEmail')
    .once()
    .withArgs('john.doe@gmail.com', 'Welcome!', '...')
    .resolves(false)
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  )
  expect(outputGetAccount.name).toBe(input.name)
  expect(outputGetAccount.email).toBe(input.email)
  expect(outputGetAccount.document).toBe(input.document)
  expect(outputGetAccount.password).toBe(input.password)
  mailerMock.verify()
  mailerMock.restore()
})

test('Não deve criar uma conta se o nome for inválido', async () => {
  const input = {
    name: 'John',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid name'),
  )
})

test('Não deve criar uma conta se o email for inválido', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail',
    document: '97456321558',
    password: 'asdQWE123',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid email'),
  )
})

test('Não deve criar uma conta se o documento for inválido', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '974563215',
    password: 'asdQWE123',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid document'),
  )
})

test('Não deve criar uma conta se a senha for inválida', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: '123456789',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid password'),
  )
})

test('Não deve criar uma conta se a senha for inválida', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWEasdQWE',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid password'),
  )
})

test('Não deve criar uma conta se a senha for inválida', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdasdasd',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid password'),
  )
})

test('Não deve criar uma conta se a senha for inválida', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: '',
  }
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid password'),
  )
})

test('Deve depositar em uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)

  const inputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await accountService.deposit(inputDeposit)

  const outputGetAccount = await accountService.getAccount(
    outputSignup.accountId,
  )

  expect(outputGetAccount.balances[0].asset_id).toBe('USD')
  expect(outputGetAccount.balances[0].quantity).toBe("10000")
})


test('Deve depositar duas vezes em uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await accountService.deposit(firstInputDeposit)

  const secondInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await accountService.deposit(secondInputDeposit)


  const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId,
  )

  expect(outputGetAccount.balances[0].asset_id).toBe('USD')
  expect(outputGetAccount.balances[0].quantity).toBe("20000")
})


test('Deve realizar um saque', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 7800,
  }

  await accountService.deposit(firstInputDeposit)

  await accountService.withdraw({
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 7000,
  })

  const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId,
  )

  expect(outputGetAccount.balances[0].asset_id).toBe('BTC')
  expect(outputGetAccount.balances[0].quantity).toBe('800')
})

test('Deve remover o balance caso seja sacado todo o valor', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 87454,
  }

  await accountService.deposit(firstInputDeposit)

  await accountService.withdraw({
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 87454,
  })

  const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId,
  )

  expect(outputGetAccount.balances).toHaveLength(0)
})


test('Não deve sacar em conta sem fundos', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await accountService.signup(input)

  await expect(async () => {
    await accountService.withdraw({
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
  const outputSignup = await accountService.signup(input)

  const firstInputDeposit: DepositInput = {
    accountId: outputSignup.accountId,
    assetId: 'BTC',
    quantity: 562,
  }

  await accountService.deposit(firstInputDeposit)

  await expect(async () => {
    await accountService.withdraw({
      accountId: outputSignup.accountId,
      assetId: 'BTC',
      quantity: 1000,
    })
  }).rejects.toThrow(new Error('Insufficient funds'))
})


test('Não deve permitir depositar sem account válida',  () => {

  const inputDeposit: DepositInput = {
    accountId: 'b010dc02-4905-4be5-8535-317d3a669afc',
    assetId: 'USD',
    quantity: 10000,
  }

  expect(async () => {
    await accountService.deposit(inputDeposit)
  }).rejects.toThrow(new Error('Account not found'))
})
