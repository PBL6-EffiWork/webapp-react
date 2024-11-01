// Sample Eslint config for React project with TypeScript support

module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended', // Thêm cấu hình cho TypeScript
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Quy tắc nâng cao với kiểm tra kiểu
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser', // Sử dụng parser của TypeScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Đường dẫn tới tsconfig.json
    tsconfigRootDir: __dirname, // Đảm bảo đường dẫn đúng
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: { version: '18.2' },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      }
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    '@typescript-eslint', // Thêm plugin TypeScript
    'import' // Thêm plugin import
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Áp dụng các quy tắc cho các tệp TypeScript
      rules: {
        // Thêm hoặc tùy chỉnh các quy tắc đặc thù cho TypeScript tại đây
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'import/no-unresolved': 'off' // Tắt quy tắc import không cần thiết
      }
    }
  ],
  rules: {
    // React
    'react-refresh/only-export-components': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Tắt kiểm tra prop-types vì TypeScript đã xử lý
    'react/display-name': 'off',

    // MUI
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@mui/*/*/*']
      }
    ],

    // Common
    'no-console': 1,
    'no-extra-boolean-cast': 0,
    'no-lonely-if': 1,
    'no-unused-vars': 'off', // Tắt quy tắc vì đã sử dụng @typescript-eslint/no-unused-vars
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-trailing-spaces': 1,
    'no-multi-spaces': 1,
    'no-multiple-empty-lines': 1,
    'space-before-blocks': ['error', 'always'],
    'object-curly-spacing': [1, 'always'],
    'indent': ['warn', 2],
    'semi': [1, 'never'],
    'quotes': ['error', 'single'],
    'array-bracket-spacing': 1,
    'linebreak-style': 0,
    'no-unexpected-multiline': 'warn',
    'keyword-spacing': 1,
    'comma-dangle': 1,
    'comma-spacing': 1,
    'arrow-spacing': 1,

    // Import
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off'
  }
}
