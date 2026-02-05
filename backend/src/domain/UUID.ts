export default class UUID {
  constructor(private value: string) {
    if (!this.value || !this.validateUUID(this.value)) {
      throw new Error('Invalid UUID')
    }
  }

  getValue(): string {
    return this.value
  }

  static create(): UUID {
    return new UUID(crypto.randomUUID())
  }

  private validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}
