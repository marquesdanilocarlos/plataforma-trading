import pgp from 'pg-promise'
import { DatabaseConnection } from './DatabaseConnection'

export default class PgPromiseAdapter implements DatabaseConnection {
  private connection: pgp.IDatabase<{}>

  constructor() {
    this.connection = pgp()('postgres://postgres:123456@localhost:5432/app')
  }

  async close(): Promise<void> {
    return this.connection.$pool.end()
  }

  async query<T = unknown>(
    statement: string,
    params?: unknown[],
  ): Promise<T[]> {
    return await this.connection.query(statement, params)
  }
}
