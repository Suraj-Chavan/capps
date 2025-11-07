// .eslintrc.js
module.exports = {
  // ignorePatterns: process.env.NODE_ENV === "production" ? ['*/*'] : [],
  root: true,
  env: {
    "es6": true,
    "browser": true
  },
  globals: {
    __webpack_public_path__: "writable"
  },
  extends: [
    'plugin:vue/essential', // Uses recommended Vue.js rules
    'eslint:recommended', // Uses recommended ESLint rules
  ],
  parserOptions: {
    parser: 'babel-eslint', // Or '@babel/eslint-parser' for newer Babel versions
  },
  rules: {
    // Add or override specific rules here
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
