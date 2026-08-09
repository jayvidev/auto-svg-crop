/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/globals.css',
  overrides: [
    {
      files: ['*.ts', '*.js'],
      options: { parser: 'typescript' },
    },
    {
      // Markup attributes stay double-quoted; only the script blocks follow singleQuote.
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
}
