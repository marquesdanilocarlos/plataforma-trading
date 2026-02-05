import { AccountRepositoryDatabase } from '../src/infra/repositories/AccountRepository'
import sinon from 'sinon'
import * as mailer from '../src/mailer'
import Signup from '../src/application/use-case/Signup'
import GetAccount from '../src/application/use-case/GetAccount'
import Account from '../src/domain/Account'
import { DatabaseConnection } from '../src/infra/database/DatabaseConnection'
import PgPromiseAdapter from '../src/infra/database/PgPromiseAdapter'

let signup: Signup
let getAccount: GetAccount
let databaseConnection: DatabaseConnection

beforeEach(() => {
  databaseConnection = new PgPromiseAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  signup = new Signup(accountRepository)
  getAccount = new GetAccount(accountRepository)
})

afterEach(async () => {
  await databaseConnection.close()
})

test('Deve criar uma conta', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const outputSignup = await signup.execute(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await getAccount.execute(outputSignup.accountId)
  expect(outputGetAccount.name).toBe(input.name)
  expect(outputGetAccount.email).toBe(input.email)
  expect(outputGetAccount.document).toBe(input.document)
  expect(outputGetAccount.password).toBe(input.password)
})

test('Deve criar uma conta com stub', async () => {
  const mailerStub = sinon.stub(mailer, 'sendEmail').resolves()
  const accountDAOSaveAccountStub = sinon
    .stub(AccountRepositoryDatabase.prototype, 'saveAccount')
    .resolves()
  const input = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  }
  const account = Account.create(input)
  const accountDAOGetAccountByIdStub = sinon
    .stub(AccountRepositoryDatabase.prototype, 'getAccountById')
    .resolves(account)
  const outputSignup = await signup.execute(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await getAccount.execute(outputSignup.accountId)
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
  const outputSignup = await signup.execute(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await getAccount.execute(outputSignup.accountId)
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
  const outputSignup = await signup.execute(input)
  expect(outputSignup.accountId).toBeDefined()
  const outputGetAccount = await getAccount.execute(outputSignup.accountId)
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
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
  await expect(() => signup.execute(input)).rejects.toThrow(
    new Error('Invalid password'),
  )
})
