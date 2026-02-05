export default class Name {
  constructor(private value: string) {
    if (!this.value || !this.value.match(/[a-zA-Z]+ [a-zA-Z]+/)) {
      throw new Error('Invalid name')
    }
  }

  getValue(): string {
    return this.value
  }
}
