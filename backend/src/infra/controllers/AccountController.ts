import HttpServer from '../http/HttpServer'
import Signup from '../../application/use-case/Signup'
import GetAccount from '../../application/use-case/GetAccount'

export default class AccountController {
  constructor(httpServer: HttpServer, signup: Signup, getAccount: GetAccount) {
    // @ts-expect-error Verificar tipagem
    httpServer.route('post', '/signup', async (params, body) => {
      const output = await signup.execute(body)
      return output
    })

    // @ts-expect-error Verificar tipagem
    httpServer.route('get', '/accounts/:accountId', async (params, body) => {
      const output = await getAccount.execute(params.accountId)
      return output
    })
  }
}
