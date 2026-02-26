import Event from './Event'

export default class Mediator {
  handlers: Event[] = []

  register(event: Event) {
    this.handlers.push(event)
  }

  async notifyAll() {
    for (const handler of this.handlers) {
      handler.dispatch()
    }
  }
}
