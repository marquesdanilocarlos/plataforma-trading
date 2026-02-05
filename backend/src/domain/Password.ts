export default class Password {
  constructor(private value: string) {
    if (
      !this.value ||
      this.value.length < 8 ||
      !this.value.match(/[a-z]/) ||
      !this.value.match(/[A-Z]/) ||
      !this.value.match(/[0-9]/)
    ) {
      throw new Error('Invalid password')
    }
  }

  getValue(): string {
    return this.value
  }
}
