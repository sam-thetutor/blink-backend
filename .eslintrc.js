module.exports = {
  env: {
    node: true,
    es2022: true,
    commonjs: true,
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console.log for backend logging
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/', '*.min.js'],
};
