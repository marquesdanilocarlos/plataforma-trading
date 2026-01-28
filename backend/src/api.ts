import { AccountRepositoryDatabase } from './AccountRepository'
import PgPromiseAdapter from './PgPromiseAdapter'
import Signup from './Signup'
import GetAccount from './GetAccount'
import ExpressAdapter from './ExpressAdapter'
import AccountController from './AccountController'

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
