/**
 * Shared Style Dictionary v4 name transform.
 *
 * The built-in name/kebab collapses repeated separators, so a token
 * named `solid--hover` (state suffixes joined with `--` by convention)
 * would come out as `solid-hover`. The custom transform builds the
 * full-path kebab name by joining path segments with a single `-` and
 * leaving each segment untouched — every token key in src/styles/tokens
 * is already written in kebab-case, so no normalization is needed.
 */
export const nameTransforms = {
  'name/path-kebab': {
    type: 'name',
    transform: (token) => token.path.join('-'),
  },
};
