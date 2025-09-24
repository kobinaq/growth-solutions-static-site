/*
 * dataLoader.js
 *
 * Lightweight JSON loader for the Growth Solutions site.
 * Reads data from the /data folder and returns parsed objects. All functions
 * return Promises to allow asynchronous usage. If a fetch fails the promise
 * will reject, so callers should handle errors appropriately.
 */

export async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
    }
  return await response.json();
}

export function loadSite() {
  return loadJSON('/data/site.json');
}

export function loadProjects() {
  return loadJSON('/data/projects.json');
}

export function loadResources() {
  return loadJSON('/data/resources.json');
}

export function loadServices() {
  return loadJSON('/data/services.json');
}

export function loadTeam() {
  return loadJSON('/data/team.json');
}

// Utility to preload an image so the browser caches it. Returns a promise that
// resolves when the image is loaded. Not essential but improves LCP for hero.
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
}