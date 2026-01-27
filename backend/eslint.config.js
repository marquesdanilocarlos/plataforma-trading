import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  {
    ignores: ['build/**', 'node_modules/**'],
  },
  ...compat.extends('@rocketseat/eslint-config/node'),
  {
    rules: {
      'no-useless-constructor': 'off',
    },
  },
]
