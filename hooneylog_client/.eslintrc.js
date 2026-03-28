module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb', // or airbnb-base
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended', // 설치 한경우
    'plugin:import/errors', // 설치한 경우
    'plugin:import/warnings', // 설치한 경우
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'next/core-web-vitals',
  ],
  rules: {
    'prettier/prettier': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
    'react/function-component-definition': 0,
    'import/extensions': 0,
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/aria-role': [
      0,
      {
        allowedInvalidRoles: ['text'],
        ignoreNonDOM: true,
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'react/no-unused-prop-types': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'react/destructuring-assignment': 'off',
    'react/require-default-props': 'off',
    '@typescript-eslint/ban-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/namespace': 'off',
    'import/no-cycle': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/no-array-index-key': 'off',
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-case-declarations': 'off',
    'lines-between-class-members': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'no-alert': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
