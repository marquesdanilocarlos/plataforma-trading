import HttpServer from '../http/HttpServer'
import Signup from '../../application/use-case/Signup'
import GetAccount from '../../application/use-case/GetAccount'
import { inject } from '../../di/Registry'

export default class AccountController {
  @inject('httpServer')
  private httpServer!: HttpServer

  @inject('signup')
  private signup!: Signup

  @inject('getAccount')
  private getAccount!: GetAccount

  constructor() {
    this.httpServer.route('post', '/signup', async (params, body) => {
      return await this.signup.execute(body)
    })

    this.httpServer.route(
      'get',
      '/accounts/:accountId',
      async (params, body) => {
        return await this.getAccount.execute(params.accountId)
      },
    )
  }
}
