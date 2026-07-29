/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,tsx,js,jsx,cjs,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,mdx,scss,css,yml,yaml}': ['prettier --write'],
};
