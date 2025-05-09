import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Tailwind CSS plugin (assumed to be installed)
import tailwind from 'eslint-plugin-tailwindcss';

// ESLint 配置
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      tailwind,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Tailwind CSS 规则
      'tailwindcss/no-custom-classname': 'off', // 允许自定义类名
      'tailwindcss/classnames-order': 'warn', // 警告类名顺序
      // TypeScript 增强规则
      '@typescript-eslint/no-explicit-any': 'warn', // 警告 any 类型
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 允许隐式导出类型
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 允许 _ 开头的未使用变量
    },
  },
  // 集成 Prettier 避免冲突
  prettier,
);