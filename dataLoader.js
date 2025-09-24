export async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) { throw new Error(`Failed to load ${path}: ${response.status}`); }
  return await response.json();
}
export function loadSite() { return loadJSON('/site.json'); }
export function loadProjects() { return loadJSON('/projects.json'); }
export function loadResources() { return loadJSON('/resources.json'); }
export function loadServices() { return loadJSON('/services.json'); }
export function loadTeam() { return loadJSON('/team.json'); }
export function preloadImage(src) {
  return new Promise((resolve, reject) => { const img = new Image(); img.src = src; img.onload = resolve; img.onerror = reject; });
}
