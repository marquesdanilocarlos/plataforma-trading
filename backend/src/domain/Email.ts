export default class Email {
  constructor(private value: string) {
    if (!this.value || !this.value.match(/.+@.+\..+/)) {
      throw new Error('Invalid email')
    }
  }

  getValue(): string {
    return this.value
  }
}
