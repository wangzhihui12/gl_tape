module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'vue/component-name-in-template-casing': ['warn', 'kebab-case'],
    'vue/multi-word-component-names': 'off',
    'prefer-destructuring': 'off',
    'no-plusplus': 'off',
  },
  globals: {
    uni: 'readonly',
    plus: 'readonly',
    getCurrentPages: 'readonly',
    getApp: 'readonly',
  },
  ignorePatterns: ['./pages.json', 'uni_modules', 'unpackage'],
};