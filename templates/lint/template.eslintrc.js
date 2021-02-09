module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sorceType: 'module',
  },
  extends: ['eslint:recommended'],
  plugins: [
    'chai-friendly',
  ],
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  rules: {
    'no-multiple-empty-lines': ['error'],
    'quote-props': ['error', 'consistent-as-needed'],
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'indent': ['error', 2, { SwitchCase: 1 }],
    'camelcase': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'no-unused-vars': [
      'error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
      },
    ],
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__set__', '__get__'],
      },
    ],
  },
};
