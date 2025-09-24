/*
 * router.js
 *
 * Small helper for reading query parameters from the URL. Returns an object
 * with getters for each parameter. For example, getQuery().area will
 * return the value of the 'area' query parameter or null if not present.
 */

export function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return new Proxy(
    {},
    {
      get(_, prop) {
        return params.get(prop) || null;
      },
    },
  );
}