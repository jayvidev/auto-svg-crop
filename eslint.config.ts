import { includeIgnoreFile } from '@eslint/compat'
// Plugins:
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import ts from 'typescript-eslint'

// Svelte Config:
import svelteConfig from './svelte.config.js'

// Ignore files:
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-undef': 'off',
      'no-useless-assignment': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      'prettier/prettier': 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-alert': 'warn',

      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^svelte$', '^svelte/', '^\\$app/', '^\\$env'],
            ['^@?\\w'],
            ['^@/'],
            ['^\\.\\.(?!/?$)', '^\\./'],
            ['\\.css$', '\\.scss$', '\\.less$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
    rules: {
      // `let` is required by runes ($props, $state, $bindable), so the core
      // rule is replaced by the rune-aware one from eslint-plugin-svelte.
      'prefer-const': 'off',
      'svelte/prefer-const': ['error', { destructuring: 'any' }],
      'svelte/no-at-html-tags': 'off',
      'svelte/no-unused-svelte-ignore': 'warn',
      'svelte/no-useless-mustaches': 'warn',
      'svelte/require-each-key': 'warn',
    },
  },
  {
    // Root config files live outside the tsconfig project.
    files: ['*.js', '*.mjs', '*.ts'],
    languageOptions: {
      parserOptions: { projectService: false, project: false },
    },
  },
  {
    ignores: ['node_modules/**', '.svelte-kit/**', 'build/**', 'dist/**', '.vercel/**'],
  },
])
