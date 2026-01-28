import { AccountRepositoryDatabase } from './infra/repositories/AccountRepository'
import PgPromiseAdapter from './infra/database/PgPromiseAdapter'
import Signup from './application/use-case/Signup'
import GetAccount from './application/use-case/GetAccount'
import ExpressAdapter from './infra/http/ExpressAdapter'
import AccountController from './infra/controllers/AccountController'

async function main() {
  const httpServer = new ExpressAdapter()
  const databaseConnection = new PgPromiseAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  const signup = new Signup(accountRepository)
  const getAccount = new GetAccount(accountRepository)
  new AccountController(httpServer, signup, getAccount)
  httpServer.listen(3333)
}

main()
