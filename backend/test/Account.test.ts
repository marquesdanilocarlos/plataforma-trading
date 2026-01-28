import Account from '../src/domain/Account'

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

test('Deve fazer dois depósito', () => {
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
