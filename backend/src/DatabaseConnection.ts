export interface DatabaseConnection {
  query<T = unknown>(statement: string, params?: unknown[]): Promise<T[]>
  close(): Promise<void>
}
