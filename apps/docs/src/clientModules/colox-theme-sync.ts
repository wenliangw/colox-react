/**
 * Theme handshake: docusaurus owns the light/dark toggle (and its
 * persistence); @colox/theme ships its tokens as disjoint suites keyed
 * off `:root[data-colox-theme='dark']`. This client module keeps the
 * two attributes in step — `data-colox-theme` always mirrors the live
 * `data-theme` value, so every component and every token variable
 * follows the docs toggle without hand-copied values.
 *
 * The colox aggregate stylesheet is imported here too: client modules
 * ride the webpack module graph (the same channel the MDX pages use),
 * which resolves the package specifier through the exports map —
 * sass/customCss channels resolve filesystem paths only and cannot
 * reach it.
 */
import '@colox/react/style.css';

const syncColoxTheme = (): void => {
  const { documentElement } = document;
  const mode = documentElement.getAttribute('data-theme');
  if (mode === 'dark' || mode === 'light') {
    documentElement.setAttribute('data-colox-theme', mode);
  }
};

// Client modules are also evaluated during the server-side render, so
// every document access must sit behind a mounted guard — the same
// SSR contract the portal components learned.
if (typeof document !== 'undefined') {
  syncColoxTheme();

  new MutationObserver(syncColoxTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export default {};
