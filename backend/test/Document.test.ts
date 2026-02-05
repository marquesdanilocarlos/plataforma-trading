import Document from '../src/domain/Document'

test.each(['97456321558', '87748248800'])(
  'Deve validar um cpf: %s',
  (cpf: string) => {
    const document = new Document(cpf)
    expect(document.getValue()).toBe(cpf)
  },
)

test.each(['974563215', null, undefined, '11111111111', '11111111abc'])(
  'Não deve validar um cpf: %s',
  (cpf: any) => {
    expect(() => new Document(cpf)).toThrow('Invalid document')
  },
)
