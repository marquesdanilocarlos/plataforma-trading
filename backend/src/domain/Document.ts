export default class Document {
    private static readonly VALID_LENGTH = 11;
    private value: string;

    constructor (document: string) {
        if (!Document.validate(document)) {
            throw new Error("Invalid document");
        }
        this.value = document;
    }

    getValue () {
        return this.value;
    }

    static validate (cpf: string): boolean {
        if (!cpf) return false;
        cpf = Document.extractOnlyNumbers(cpf);
        if (cpf.length !== Document.VALID_LENGTH) return false;
        if (Document.allDigitsTheSame(cpf)) return false;
        const dg1 = Document.calculateDigit(cpf, 10);
        const dg2 = Document.calculateDigit(cpf, 11);
        return Document.extractDigit(cpf) === `${dg1}${dg2}`;
    }

    private static extractOnlyNumbers (cpf: string): string {
        return cpf.replace(/\D/g, "");
    }

    private static allDigitsTheSame (cpf: string): boolean {
        const [firstDigit] = cpf;
        return [...cpf].every(digit => digit === firstDigit);
    }

    private static calculateDigit (cpf: string, factor: number): number {
        let total = 0;
        for (const digit of cpf) {
            if (factor > 1) total += parseInt(digit) * factor--;
        }
        const rest = total % 11;
        return (rest < 2) ? 0 : 11 - rest;
    }

    private static extractDigit (cpf: string): string {
        return cpf.slice(9);
    }
}
