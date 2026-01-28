export default interface HttpServer {
  route(method: 'get' | 'post', url: string, callback: Function): void
  listen(port: number): void
}
