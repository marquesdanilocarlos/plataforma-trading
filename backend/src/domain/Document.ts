const VALID_LENGTH = 11

export default class Document {
  constructor(private value: string) {
    if (!this.value || !this.validateCpf(this.value)) {
      throw new Error('Invalid document')
    }
  }

  getValue(): string {
    return this.value
  }

  private validateCpf(cpf: string) {
    if (!cpf) return false
    cpf = this.extractOnlyNumbers(cpf)
    if (cpf.length !== VALID_LENGTH) return false
    if (this.allDigitsTheSame(cpf)) return false
    const dg1 = this.calculateDigit(cpf, 10)
    const dg2 = this.calculateDigit(cpf, 11)
    return this.extractDigit(cpf) === `${dg1}${dg2}`
  }

  private extractOnlyNumbers(cpf: string) {
    return cpf.replace(/\D/g, '')
  }

  private allDigitsTheSame(cpf: string) {
    const [firstDigit] = cpf
    return [...cpf].every((digit) => digit === firstDigit)
  }

  private calculateDigit(cpf: string, factor: number) {
    let total = 0
    for (const digit of cpf) {
      if (factor > 1) total += parseInt(digit) * factor--
    }
    const rest = total % 11
    return rest < 2 ? 0 : 11 - rest
  }

  private extractDigit(cpf: string) {
    return cpf.slice(9)
  }
}
