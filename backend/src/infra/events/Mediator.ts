type handlerType = {
  event: string
  callback: Function
}

export default class Mediator {
  handlers: handlerType[] = []

  register(event: string, callback: Function) {
    this.handlers.push({ event, callback })
  }

  async notifyAll(event: string, data: unknown) {
    for (const handler of this.handlers) {
      if (handler.event === event) {
        await handler.callback(data)
      }
    }
  }
}
