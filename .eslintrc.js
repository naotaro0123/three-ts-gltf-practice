module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: [
    'prettier',
  ],
  env: {
    'browser': true,
    'node': true,
    'es6': true,
    'jest': true
  },
   // add your custom rules here
  rules: {
  }
}
