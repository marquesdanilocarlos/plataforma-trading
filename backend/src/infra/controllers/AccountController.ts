import HttpServer from '../http/HttpServer'
import Signup from '../../application/use-case/Signup'
import GetAccount from '../../application/use-case/GetAccount'

export default class AccountController {
  constructor(httpServer: HttpServer, signup: Signup, getAccount: GetAccount) {
    httpServer.route('post', '/signup', async (params, body) => {
      return await signup.execute(body)
    })

    httpServer.route('get', '/accounts/:accountId', async (params, body) => {
      return await getAccount.execute(params.accountId)
    })
  }
}
