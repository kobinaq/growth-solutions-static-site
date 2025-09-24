export function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return new Proxy({}, { get(_, prop) { return params.get(prop) || null; } });
}
