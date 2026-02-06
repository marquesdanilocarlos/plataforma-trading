import Account from '../src/domain/Account'
import Order from '../src/domain/Order'

test('Deve fazer um depósito', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('BTC', 1000)

  expect(account.getBalance('BTC')).toBe(1000)
})

test('Deve fazer dois depósitos', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('BTC', 1000)
  account.deposit('BTC', 2653)

  expect(account.getBalance('BTC')).toBe(3653)
})

test('Deve fazer saque', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('BTC', 1000)
  account.withdraw('BTC', 500)
  account.deposit('BTC', 2000)

  expect(account.getBalance('BTC')).toBe(2500)
})

test('Não deve sacar sem fundos', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  expect(() => {
    account.withdraw('BTC', 500)
  }).toThrow(new Error('You dont have funds'))
})

test('Deve validar o saldo da conta para a criação de uma ordem', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('USD', 100000)

  const order = Order.create({
    account_id: account.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  expect(account.blockOrder(order)).toBe(true)
  expect(account.getBalance('USD')).toBe(22000)
})

test('Não deve ter saldo suficiente para a criação de uma ordem', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('USD', 10000)

  const order = Order.create({
    account_id: account.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  expect(account.blockOrder(order)).toBe(false)
  expect(account.getBalance('USD')).toBe(10000)
})

test('Não deve ter saldo suficiente para a criação de duas ordens', () => {
  const account = Account.create({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  })

  account.deposit('USD', 100000)
  const order = Order.create({
    account_id: account.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  const hasBalance = account.blockOrder(order)
  expect(hasBalance).toBe(true)
  expect(account.getBalance('USD')).toBe(22000)
  const newHasBalance = account.blockOrder(order)
  expect(newHasBalance).toBe(false)
  expect(account.getBalance('USD')).toBe(22000)
})
