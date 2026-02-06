import { AccountRepositoryDatabase } from '../src/infra/repositories/AccountRepository'
import { OrderRepositoryDatabase } from '../src/infra/repositories/OrderRepository'
import Deposit, { DepositInput } from '../src/application/use-case/Deposit'
import { DatabaseConnection } from '../src/infra/database/DatabaseConnection'
import PgPromiseAdapter from '../src/infra/database/PgPromiseAdapter'
import PlaceOrder from '../src/application/use-case/PlaceOrder'
import Account from '../src/domain/Account'

let placeOrder: PlaceOrder
let deposit: Deposit
let databaseConnection: DatabaseConnection
let orderRepository: OrderRepositoryDatabase
let accountRepository: AccountRepositoryDatabase

beforeEach(() => {
  databaseConnection = new PgPromiseAdapter()
  accountRepository = new AccountRepositoryDatabase(databaseConnection)
  orderRepository = new OrderRepositoryDatabase(databaseConnection)
  deposit = new Deposit(accountRepository)
  placeOrder = new PlaceOrder(accountRepository, orderRepository)
})

afterEach(async () => {
  await databaseConnection.close()
})

test('Deve criar uma ordem de compra em uma conta', async () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  const inputDeposit: DepositInput = {
    accountId: account.accountId,
    assetId: 'USD',
    quantity: 100000,
  }

  await deposit.execute(inputDeposit)

  const inputOrder = {
    accountId: account.accountId,
    marketId: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  }

  const outputPlaceOrder = await placeOrder.execute(inputOrder)
  expect(outputPlaceOrder.orderId).toBeDefined()

  const outputGetOrder = await orderRepository.getOrderById(
    outputPlaceOrder.orderId,
  )
  expect(outputGetOrder?.quantity).toBe(1)
  expect(outputGetOrder?.price).toBe(78000)
})

test.only('Não deve criar uma ordem de compra em uma conta se não tiver saldo', async () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  await accountRepository.saveAccount(account)

  const inputDeposit: DepositInput = {
    accountId: account.accountId,
    assetId: 'USD',
    quantity: 10000,
  }

  await deposit.execute(inputDeposit)

  const inputOrder = {
    accountId: account.accountId,
    marketId: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  }

  await expect(async () => {
    await placeOrder.execute(inputOrder)
  }).rejects.toThrow(new Error('Insufficient funds'))
})
