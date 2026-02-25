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

async function main() {
  const httpServer = new ExpressAdapter()
  Registry.getInstance().register('httpServer', httpServer)
  Registry.getInstance().register('databaseConnection', new PgPromiseAdapter())
  Registry.getInstance().register(
    'accountRepository',
    new AccountRepositoryDatabase(),
  )
  Registry.getInstance().register(
    'walletRepository',
    new WalletRepositoryDatabase(),
  )
  Registry.getInstance().register('signup', new Signup())
  Registry.getInstance().register('getAccount', new GetAccount())
  Registry.getInstance().register('deposit', new Deposit())
  Registry.getInstance().register('placeOrder', new PlaceOrder())
  Registry.getInstance().register('withdraw', new Withdraw())
  Registry.getInstance().register(
    'orderRepository',
    new OrderRepositoryDatabase(),
  )

  // eslint-disable-next-line no-new
  new AccountController()
  httpServer.listen(3333)
}

main()
