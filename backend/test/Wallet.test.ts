import Wallet from '../src/domain/Wallet'
import Order from '../src/domain/Order'

test('Deve fazer um depósito', () => {
  const wallet = Wallet.create({})

  wallet.deposit('BTC', 1000)

  expect(wallet.getBalance('BTC')).toBe(1000)
})

test('Deve fazer dois depósitos', () => {
  const wallet = Wallet.create({})

  wallet.deposit('BTC', 1000)
  wallet.deposit('BTC', 2653)

  expect(wallet.getBalance('BTC')).toBe(3653)
})

test('Deve fazer saque', () => {
  const wallet = Wallet.create({})

  wallet.deposit('BTC', 1000)
  wallet.withdraw('BTC', 500)
  wallet.deposit('BTC', 2000)

  expect(wallet.getBalance('BTC')).toBe(2500)
})

test('Não deve sacar sem fundos', () => {
  const wallet = Wallet.create({})

  expect(() => {
    wallet.withdraw('BTC', 500)
  }).toThrow(new Error('You dont have funds'))
})

test('Deve validar o saldo da conta para a criação de uma ordem', () => {
  const wallet = Wallet.create({})

  wallet.deposit('USD', 100000)

  const order = Order.create({
    account_id: wallet.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  expect(wallet.blockOrder(order)).toBe(true)
  expect(wallet.getBalance('USD')).toBe(22000)
})

test('Não deve ter saldo suficiente para a criação de uma ordem', () => {
  const wallet = Wallet.create({})

  wallet.deposit('USD', 10000)

  const order = Order.create({
    account_id: wallet.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  expect(wallet.blockOrder(order)).toBe(false)
  expect(wallet.getBalance('USD')).toBe(10000)
})

test('Não deve ter saldo suficiente para a criação de duas ordens', () => {
  const wallet = Wallet.create({})

  wallet.deposit('USD', 100000)
  const order = Order.create({
    account_id: wallet.accountId,
    market_id: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 78000,
  })

  const hasBalance = wallet.blockOrder(order)
  expect(hasBalance).toBe(true)
  expect(wallet.getBalance('USD')).toBe(22000)
  const newHasBalance = wallet.blockOrder(order)
  expect(newHasBalance).toBe(false)
  expect(wallet.getBalance('USD')).toBe(22000)
})
