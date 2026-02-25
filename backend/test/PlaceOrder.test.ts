import AccountRepository, {
  AccountRepositoryDatabase,
} from '../src/infra/repositories/AccountRepository'
import { OrderRepositoryDatabase } from '../src/infra/repositories/OrderRepository'
import Deposit, { DepositInput } from '../src/application/use-case/Deposit'
import { DatabaseConnection } from '../src/infra/database/DatabaseConnection'
import PgPromiseAdapter from '../src/infra/database/PgPromiseAdapter'
import PlaceOrder from '../src/application/use-case/PlaceOrder'
import Account from '../src/domain/Account'
import WalletRepository, {
  WalletRepositoryDatabase,
} from '../src/infra/repositories/WalletRepository'
import Registry from '../src/di/Registry'
import ExecuteOrder from '../src/application/use-case/ExecuteOrder'

let placeOrder: PlaceOrder
let deposit: Deposit
let databaseConnection: DatabaseConnection
let orderRepository: OrderRepositoryDatabase
let accountRepository: AccountRepository
let walletRepository: WalletRepository
let executeOrder: ExecuteOrder

beforeEach(() => {
  databaseConnection = new PgPromiseAdapter()
  accountRepository = new AccountRepositoryDatabase()
  orderRepository = new OrderRepositoryDatabase()
  walletRepository = new WalletRepositoryDatabase()
  executeOrder = new ExecuteOrder()

  const registry = Registry.getInstance()
  registry.register('accountRepository', accountRepository)
  registry.register('orderRepository', orderRepository)
  registry.register('walletRepository', walletRepository)
  registry.register('databaseConnection', databaseConnection)
  registry.register('executeOrder', executeOrder)

  deposit = new Deposit()
  placeOrder = new PlaceOrder()
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

  await accountRepository.saveAccount(account)

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

test('Não deve criar uma ordem de compra em uma conta se não tiver saldo', async () => {
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

test('Deve criar uma ordem de compra e uma ordem de venda em uma conta', async () => {
  const marketId = `BTC-USD-${Math.random()}`

  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  await accountRepository.saveAccount(account)

  await deposit.execute({
    accountId: account.accountId,
    assetId: 'USD',
    quantity: 200000,
  })

  await deposit.execute({
    accountId: account.accountId,
    assetId: 'BTC',
    quantity: 2,
  })

  const outputPlaceOrder2 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'sell',
    quantity: 1,
    price: 78000,
  })

  const outputPlaceOrder3 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'sell',
    quantity: 1,
    price: 78000,
  })

  const outputPlaceOrder1 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'buy',
    quantity: 2,
    price: 78000,
  })

  const outputGetOrder1 = await orderRepository.getOrderById(
    outputPlaceOrder1.orderId,
  )
  const outputGetOrder2 = await orderRepository.getOrderById(
    outputPlaceOrder2.orderId,
  )
  const outputGetOrder3 = await orderRepository.getOrderById(
    outputPlaceOrder3.orderId,
  )
  expect(outputGetOrder1.status).toBe('closed')
  expect(outputGetOrder1.fillQuantity).toBe(2)
  expect(outputGetOrder1.fillPrice).toBe(78000)
  expect(outputGetOrder2.status).toBe('closed')
  expect(outputGetOrder2.fillQuantity).toBe(1)
  expect(outputGetOrder2.fillPrice).toBe(78000)
  expect(outputGetOrder3.status).toBe('closed')
  expect(outputGetOrder3.fillQuantity).toBe(1)
  expect(outputGetOrder3.fillPrice).toBe(78000)
})

test('Deve criar uma ordem de compra e uma ordem de venda em uma conta', async () => {
  const marketId = `BTC-USD-${Math.random()}`

  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  await accountRepository.saveAccount(account)

  await deposit.execute({
    accountId: account.accountId,
    assetId: 'USD',
    quantity: 200000,
  })

  await deposit.execute({
    accountId: account.accountId,
    assetId: 'BTC',
    quantity: 2,
  })

  const outputPlaceOrder1 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'buy',
    quantity: 2,
    price: 80000,
  })

  const outputPlaceOrder2 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'sell',
    quantity: 1,
    price: 78000,
  })

  const outputPlaceOrder3 = await placeOrder.execute({
    accountId: account.accountId,
    marketId,
    side: 'sell',
    quantity: 1,
    price: 79000,
  })

  const outputGetOrder1 = await orderRepository.getOrderById(
    outputPlaceOrder1.orderId,
  )
  const outputGetOrder2 = await orderRepository.getOrderById(
    outputPlaceOrder2.orderId,
  )
  const outputGetOrder3 = await orderRepository.getOrderById(
    outputPlaceOrder3.orderId,
  )
  expect(outputGetOrder1.status).toBe('closed')
  expect(outputGetOrder1.fillQuantity).toBe(2)
  expect(outputGetOrder1.fillPrice).toBe(78500)
  expect(outputGetOrder2.status).toBe('closed')
  expect(outputGetOrder2.fillQuantity).toBe(1)
  expect(outputGetOrder2.fillPrice).toBe(78000)
  expect(outputGetOrder3.status).toBe('closed')
  expect(outputGetOrder3.fillQuantity).toBe(1)
  expect(outputGetOrder3.fillPrice).toBe(79000)
})
