import { AccountRepositoryDatabase } from './infra/repositories/AccountRepository'
import PgPromiseAdapter from './infra/database/PgPromiseAdapter'
import Signup from './application/use-case/Signup'
import GetAccount from './application/use-case/GetAccount'
import ExpressAdapter from './infra/http/ExpressAdapter'
import AccountController from './infra/controllers/AccountController'
import { WalletRepositoryDatabase } from './infra/repositories/WalletRepository'
import Registry from './di/Registry'

async function main() {
  const httpServer = new ExpressAdapter()
  const databaseConnection = new PgPromiseAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  const walletRepository = new WalletRepositoryDatabase(databaseConnection)
  const signup = new Signup(accountRepository)

  Registry.getInstance().register('accountRepository', accountRepository)
  Registry.getInstance().register('walletRepository', walletRepository)

  const getAccount = new GetAccount()

  // eslint-disable-next-line no-new
  new AccountController(httpServer, signup, getAccount)
  httpServer.listen(3333)
}

main()
