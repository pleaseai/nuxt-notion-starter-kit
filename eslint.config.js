import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: [
    '**/dist/**',
    '**/.output/**',
    '**/.nuxt/**',
    '**/node_modules/**',
  ],
}, {
  files: ['**/nuxt.config.ts', '**/server/**/*.ts'],
  rules: {
    'node/prefer-global/process': 'off',
  },
})
