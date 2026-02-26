import { AccountRepositoryDatabase } from './infra/repositories/AccountRepository'
import PgPromiseAdapter from './infra/database/PgPromiseAdapter'
import Signup from './application/use-case/Signup'
import GetAccount from './application/use-case/GetAccount'
import Deposit from './application/use-case/Deposit'
import PlaceOrder from './application/use-case/PlaceOrder'
import Withdraw from './application/use-case/Withdraw'
import ExpressAdapter from './infra/http/ExpressAdapter'
import AccountController from './infra/controllers/AccountController'
import { WalletRepositoryDatabase } from './infra/repositories/WalletRepository'
import { OrderRepositoryDatabase } from './infra/repositories/OrderRepository'
import Registry from './di/Registry'
import GetOrder from './application/use-case/GetOrder'
import OrderController from './infra/controllers/OrderController'
import ExecuteOrder from './application/use-case/ExecuteOrder'
import Mediator from './infra/events/Mediator'

async function main() {
  const httpServer = new ExpressAdapter()
  Registry.getInstance().register('httpServer', httpServer)
  Registry.getInstance().register('databaseConnection', new PgPromiseAdapter())
  Registry.getInstance().register('mediator', new Mediator())

  /* Registro dos Repositories */
  Registry.getInstance().register(
    'accountRepository',
    new AccountRepositoryDatabase(),
  )
  Registry.getInstance().register(
    'walletRepository',
    new WalletRepositoryDatabase(),
  )
  Registry.getInstance().register(
    'orderRepository',
    new OrderRepositoryDatabase(),
  )

  /* Registro dos UseCases */
  Registry.getInstance().register('signup', new Signup())
  Registry.getInstance().register('getAccount', new GetAccount())
  Registry.getInstance().register('deposit', new Deposit())
  Registry.getInstance().register('getOrder', new GetOrder())
  Registry.getInstance().register('placeOrder', new PlaceOrder())
  Registry.getInstance().register('withdraw', new Withdraw())
  Registry.getInstance().register('executeOrder', new ExecuteOrder())

  // eslint-disable-next-line no-new
  new AccountController()
  // eslint-disable-next-line no-new
  new OrderController()
  httpServer.listen(3333)
}

main()
