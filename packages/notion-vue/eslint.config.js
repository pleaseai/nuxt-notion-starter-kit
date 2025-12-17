import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  type: 'lib',
  ignores: [
    '**/dist/**',
    '**/.output/**',
    '**/.nuxt/**',
    '**/node_modules/**',
  ],
})
