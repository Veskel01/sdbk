const BIOME_LINTABLE_FILES = [
  'ts',
  'tsx',
  'mts',
  'cts',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'json',
  'css',
  'scss',
  'sass',
  'less',
  'html',
  'htm'
];

/**
 * Lint-staged configuration for pre-commit hooks
 * Runs linting and formatting on staged files to ensure code quality
 * @type {import('lint-staged').Configuration}
 * @see https://github.com/okonet/lint-staged
 */

export default {
  [`*.{${BIOME_LINTABLE_FILES.join(',')}}`]: ['biome check --write', 'biome format --write']
  // TODO
  // '*.{md,mdx}': ['markdownlint --fix']
};
