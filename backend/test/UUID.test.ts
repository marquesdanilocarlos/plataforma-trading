import UUID from '../src/domain/UUID'

test('Deve criar um UUID válido', () => {
  const uuid = UUID.create()
  expect(uuid.getValue()).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  )
})

test.each([
  '123e4567-e89b-12d3-a456-426614174000',
  '550e8400-e29b-41d4-a716-446655440000',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
])('Deve aceitar um UUID válido: %s', (uuidString: string) => {
  const uuid = new UUID(uuidString)
  expect(uuid.getValue()).toBe(uuidString)
})

test.each([
  'invalid-uuid',
  '123-456-789',
  '',
  null,
  undefined,
  '123e4567-e89b-12d3-a456-42661417400',
  '123e4567-e89b-12d3-a456-4266141740000',
])('Não deve aceitar um UUID inválido: %s', (uuidString: any) => {
  expect(() => new UUID(uuidString)).toThrow('Invalid UUID')
})
