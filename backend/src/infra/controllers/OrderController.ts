import HttpServer from '../http/HttpServer'
import { inject } from '../../di/Registry'
import GetOrder from '../../application/use-case/GetOrder'
import PlaceOrder, {
  PlaceOrderInput,
} from '../../application/use-case/PlaceOrder'
import Deposit, { DepositInput } from '../../application/use-case/Deposit'

export default class OrderController {
  @inject('httpServer')
  private httpServer!: HttpServer

  @inject('getOrder')
  private getOrder!: GetOrder

  @inject('placeOrder')
  private placeOrder!: PlaceOrder

  @inject('deposit')
  private deposit!: Deposit

  constructor() {
    this.httpServer.route('get', '/orders/:orderId', async (params) => {
      return await this.getOrder.execute(params.orderId)
    })

    this.httpServer.route(
      'post',
      '/place_order',
      async (params, body: PlaceOrderInput) => {
        return await this.placeOrder.execute(body)
      },
    )

    this.httpServer.route(
      'post',
      '/deposit',
      async (params, body: DepositInput) => {
        return await this.deposit.execute(body)
      },
    )
  }
}
