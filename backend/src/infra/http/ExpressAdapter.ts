import HttpServer from './HttpServer'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'

export default class ExpressAdapter implements HttpServer {
  private app: Express
  constructor() {
    this.app = express()
    this.app.use(cors())
    this.app.use(express.json())
  }

  listen(port: number): void {
    this.app.listen(port)
  }

  route(
    method: 'get' | 'post',
    url: string,
    callback: (params: any, body: any) => Promise<any>,
  ): void {
    this.app[method](
      url,
      async (req: Request, res: Response): Promise<void> => {
        try {
          const output = await callback(req.params, req.body)
          res.json(output)
        } catch (e: unknown) {
          const errorMessage =
            e instanceof Error ? e.message : 'An unknown error occurred'
          res.status(422).json({
            message: errorMessage,
          })
        }
      },
    )
  }
}
