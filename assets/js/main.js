/*
 * main.js
 *
 * Core behaviour for Growth Solutions static website. Handles loading of
 * partials, rendering of header/footer navigation, interactive components
 * (modals, filters, search) and page‑specific rendering. Only vanilla
 * JavaScript is used to keep the site lightweight and easy to maintain.
 */

import {
  loadSite,
  loadProjects,
  loadResources,
  loadServices,
  loadTeam,
  preloadImage,
} from './dataLoader.js';
import { getQuery } from './router.js';

// Load header and footer partials into the document. Returns a promise so
// further rendering can happen after they are available in the DOM.
async function loadPartials() {
  const headerContainer = document.getElementById('site-header');
  const footerContainer = document.getElementById('site-footer');
  if (headerContainer) {
    const res = await fetch('/partials/header.html');
    headerContainer.innerHTML = await res.text();
  }
  if (footerContainer) {
    const res = await fetch('/partials/footer.html');
    footerContainer.innerHTML = await res.text();
  }
}

// Build SVG icons for social links. Only LinkedIn and Twitter are supported
// here. Each returns an accessible SVG string.
function getSocialSvg(platform) {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return `
        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 4.99 8.5 2.5 2.5 0 0 1 4.98 3.5zm.02 4.91v12.59H.58V8.41h4.42zm7.92-.06c2.36 0 4.12 1.55 4.12 4.88v7.75h-4.41v-7.22c0-1.81-.65-3.04-2.27-3.04-1.24 0-1.98.83-2.31 1.63-.12.3-.15.71-.15 1.13v7.5H7.55s.06-12.18 0-13.37h4.42v1.89c.59-.9 1.64-2.18 4.06-2.18z"/></svg>
      `;
    case 'twitter':
      return `
        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 0 1-2.825.775A4.958 4.958 0 0 0 23.292 3.1a9.86 9.86 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.379 4.482A13.978 13.978 0 0 1 1.671 3.149a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.93 4.93 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.086 4.936 4.936 0 0 0 4.604 3.419A9.867 9.867 0 0 1 0 19.539a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.72 13.995-14.646A9.935 9.935 0 0 0 24 4.59z"/></svg>
      `;
    default:
      return '';
  }
}

// Render the primary navigation and footer columns using the site.json data.
function renderHeaderFooter(site) {
  // Navigation
  const navContainer = document.querySelector('#primary-navigation');
  if (navContainer) {
    navContainer.innerHTML = `<ul>` +
      site.nav
        .map(
          (item) =>
            `<li><a href="${item.href}">${item.label}</a></li>`
        )
        .join('') +
      `</ul>`;
    // Highlight current page
    const currentPath = window.location.pathname.replace(/\/index.html$/, '/index.html');
    navContainer.querySelectorAll('a').forEach((link) => {
      const linkPath = link.getAttribute('href');
      if (
        linkPath === currentPath ||
        (currentPath === '/' && linkPath === '/index.html')
      ) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }
  // Nav toggle for mobile
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      navContainer.classList.toggle('open', !expanded);
    });
  }
  // Footer
  const footerContent = document.getElementById('footer-content');
  if (footerContent) {
    let html = '';
    // Columns from footerCols
    site.footerCols.forEach((col) => {
      html += `<div class="footer-col"><h3>${col.title}</h3><ul>`;
      col.links.forEach((link) => {
        html += `<li><a href="${link.href}">${link.label}</a></li>`;
      });
      html += `</ul></div>`;
    });
    // Contact and social
    html += `<div class="footer-col contact-col"><h3>Contact</h3><address>`;
    html += `<p><strong>Email:</strong> <a href="mailto:${site.contact.email}">${site.contact.email}</a></p>`;
    html += `<p><strong>Phone:</strong> ${site.contact.phones.join(', ')}</p>`;
    html += `<p><strong>Address:</strong> ${site.contact.address}</p>`;
    html += `</address>`;
    if (site.socialLinks && site.socialLinks.length) {
      html += `<div class="social-links">`;
      site.socialLinks.forEach((sl) => {
        html += `<a href="${sl.url}" target="_blank" rel="noopener" aria-label="${sl.platform}">${getSocialSvg(sl.platform)}</a>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    footerContent.innerHTML = html;
  }
}

// Utility: filter an array of objects by matching query against title or tags
function searchItems(items, query) {
  if (!query) return items;
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const tagMatch = item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q));
    return titleMatch || tagMatch;
  });
}

// Modal creation helper. Accepts an object with a title and body HTML. Adds
// event listeners for closing and focus management. Returns nothing.
function openModal({ title, body, kpis, images, extra }) {
  // Create modal elements
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('tabindex', '-1');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `
    <button class="modal-close" aria-label="Close dialog">&times;</button>
    <h2 class="modal-title">${title}</h2>
    <div class="modal-body">${body}</div>
  `;
  if (kpis && kpis.length) {
    const bar = document.createElement('div');
    bar.className = 'kpi-bar';
    kpis.forEach((kpi) => {
      const [number, label] = kpi.split(/\s(.+)/);
      const item = document.createElement('div');
      item.className = 'kpi-item';
      item.innerHTML = `<span class="kpi-number">${number}</span><span class="kpi-label">${label}</span>`;
      bar.appendChild(item);
    });
    dialog.appendChild(bar);
  }
  if (images && images.length) {
    const gallery = document.createElement('div');
    gallery.className = 'modal-gallery';
    images.forEach((img) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = `/assets/img/${img}`;
      image.alt = '';
      figure.appendChild(image);
      gallery.appendChild(figure);
    });
    dialog.appendChild(gallery);
  }
  if (extra) {
    dialog.appendChild(extra);
  }
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');
  // Focus management: focus first focusable element in dialog
  const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
  // Close actions
  dialog.querySelector('.modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', escListener);

  function escListener(e) {
    if (e.key === 'Escape') closeModal();
  }
  function closeModal() {
    document.removeEventListener('keydown', escListener);
    overlay.remove();
    document.body.classList.remove('modal-open');
  }
}

// Home page setup: render latest resources and handle hero preloading.
async function initHome(site) {
  // Preload hero image for LCP
  preloadImage('/assets/img/hero.png');
  // Insert trust text
  const trustEl = document.getElementById('trust-text');
  if (trustEl) trustEl.textContent = site.trustText;
  // Load and render latest resources
  try {
    const resources = await loadResources();
    // Sort by publishDate descending
    resources.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    const latest = resources.slice(0, 3);
    const list = document.getElementById('latest-resources');
    if (list) {
      list.innerHTML = latest
        .map(
          (res) => `
          <article class="card resource-card" data-id="${res.id}">
            <div class="card-image"><img src="/assets/img/${res.coverImage}" alt="${res.title} cover" loading="lazy"></div>
            <div class="card-content">
              <span class="card-eyebrow">${res.type}</span>
              <h3 class="card-title">${res.title}</h3>
              <p class="card-excerpt">${res.excerpt}</p>
              <button class="text-button" aria-label="Read more about ${res.title}">Read more</button>
            </div>
          </article>`
        )
        .join('');
      // Add click listeners to open modal with full content
      list.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('click', async (e) => {
          const id = card.getAttribute('data-id');
          const data = resources.find((r) => r.id === id);
          if (data) {
            const extra = null;
            openModal({
              title: data.title,
              body: data.body,
              kpis: null,
              images: [data.coverImage],
              extra,
            });
          }
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// Projects page setup
async function initProjects() {
  const query = getQuery();
  const searchInput = document.getElementById('project-search');
  const chipsContainer = document.getElementById('project-chips');
  const cardsContainer = document.getElementById('project-cards');
  const data = await loadProjects();
  // Derive unique focus areas from projects
  const focusAreas = Array.from(new Set(data.map((p) => p.focusArea)));
  // Render filter chips
  chipsContainer.innerHTML =
    '<button class="chip" data-area="all">All</button>' +
    focusAreas
      .map((area) => `<button class="chip" data-area="${area}">${area}</button>`)
      .join('');
  // Set active chip based on query
  let activeArea = query.area && query.area !== 'null' ? capitalizeFirst(query.area) : 'all';
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function renderCards() {
    let filtered = data;
    if (activeArea !== 'all') {
      filtered = filtered.filter((p) => p.focusArea === activeArea);
    }
    // search filter
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    // Render project cards
    cardsContainer.innerHTML = filtered
      .map(
        (p) => `
        <article class="card project-card" data-id="${p.id}">
          <div class="card-image"><img src="/assets/img/${p.images[0]}" alt="${p.title} project image" loading="lazy"></div>
          <div class="card-content">
            <span class="card-eyebrow">${p.focusArea}</span>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-excerpt">${p.challenge}</p>
            <button class="text-button" aria-label="Read more about ${p.title}">Learn more</button>
          </div>
        </article>`
      )
      .join('');
    // Add click listeners for modals
    cardsContainer.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const project = data.find((p) => p.id === id);
        if (project) {
          // Build body HTML for modal
          let body = '';
          body += `<p><strong>Location:</strong> ${project.location}</p>`;
          body += `<p><strong>Dates:</strong> ${project.dates}</p>`;
          body += `<p><strong>Challenge:</strong> ${project.challenge}</p>`;
          body += `<p><strong>Approach:</strong> ${project.approach}</p>`;
          body += '<h4>Outcomes</h4><ul>' + project.outcomes.map((o) => `<li>${o}</li>`).join('') + '</ul>';
          body += '<h4>Key Performance Indicators</h4>';
          // Pass KPI bar separately
          openModal({
            title: project.title,
            body,
            kpis: project.kpis,
            images: project.images,
            extra: null,
          });
        }
      });
    });
  }
  // Event listeners for chips
  chipsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('chip')) {
      activeArea = target.dataset.area;
      chipsContainer.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      target.classList.add('active');
      renderCards();
    }
  });
  // Event listener for search
  searchInput.addEventListener('input', renderCards);
  // Set active chip by default
  chipsContainer.querySelectorAll('.chip').forEach((chip) => {
    if (chip.dataset.area.toLowerCase() === (query.area || 'all')) {
      chip.classList.add('active');
      activeArea = chip.dataset.area;
    }
  });
  renderCards();
}

// Resources page setup
async function initResources() {
  const query = getQuery();
  const typeChips = document.getElementById('resource-type-chips');
  const searchInput = document.getElementById('resource-search');
  const listContainer = document.getElementById('resource-cards');
  const resources = await loadResources();
  // Derive unique types
  const types = Array.from(new Set(resources.map((r) => r.type)));
  // Render type chips
  typeChips.innerHTML =
    '<button class="chip" data-type="all">All</button>' +
    types
      .map((t) => `<button class="chip" data-type="${t}">${t}</button>`)
      .join('');
  let activeType = query.type || 'all';
  function renderResources() {
    let filtered = resources;
    if (activeType !== 'all') {
      filtered = filtered.filter((r) => r.type === activeType);
    }
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
    }
    listContainer.innerHTML = filtered
      .map((r) => {
        const dateInfo = r.type === 'Event' ? `<p class="card-extra">${formatDate(r.eventDate)} &middot; ${r.city}</p>` : '';
        return `
        <article class="card resource-card" data-id="${r.id}">
          <div class="card-image"><img src="/assets/img/${r.coverImage}" alt="${r.title} cover" loading="lazy"></div>
          <div class="card-content">
            <span class="card-eyebrow">${r.type}</span>
            <h3 class="card-title">${r.title}</h3>
            <p class="card-excerpt">${r.excerpt}</p>
            ${dateInfo}
            <button class="text-button" aria-label="Read more about ${r.title}">Learn more</button>
          </div>
        </article>`;
      })
      .join('');
    // Attach click listeners
    listContainer.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = resources.find((r) => r.id === id);
        if (!item) return;
        let extra = null;
        if (item.type === 'Event') {
          // Build register button
          const btn = document.createElement('a');
          btn.href = item.registrationUrl;
          btn.className = 'button primary';
          btn.textContent = 'Register';
          btn.target = '_blank';
          btn.rel = 'noopener';
          extra = document.createElement('div');
          extra.className = 'modal-extra';
          extra.appendChild(btn);
        }
        openModal({
          title: item.title,
          body: item.body,
          kpis: null,
          images: [item.coverImage],
          extra,
        });
      });
    });
  }
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, options);
  }
  // Listeners
  typeChips.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('chip')) {
      activeType = target.dataset.type;
      typeChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      target.classList.add('active');
      renderResources();
    }
  });
  searchInput.addEventListener('input', renderResources);
  // Set active type chip
  typeChips.querySelectorAll('.chip').forEach((chip) => {
    if (chip.dataset.type === activeType) {
      chip.classList.add('active');
    }
  });
  renderResources();
}

// Services page setup
async function initServices() {
  const services = await loadServices();
  const container = document.getElementById('services-container');
  // Group services by focus area
  const groups = {};
  services.forEach((svc) => {
    svc.focusAreas.forEach((fa) => {
      if (!groups[fa]) groups[fa] = [];
      groups[fa].push(svc);
    });
  });
  let html = '';
  Object.keys(groups).forEach((fa) => {
    html += `<section class="service-group"><h3>${fa}</h3><div class="service-cards">`;
    groups[fa].forEach((svc) => {
      html += `
        <article class="card service-card">
          <h4 class="card-title">${svc.title}</h4>
          <p class="card-excerpt">${svc.summary}</p>
          <ul class="capabilities">${svc.capabilities.map((cap) => `<li>${cap}</li>`).join('')}</ul>
        </article>`;
    });
    html += `</div></section>`;
  });
  container.innerHTML = html;
}

// About page setup: load team info
async function initAbout() {
  try {
    const team = await loadTeam();
    const card = document.getElementById('team-card');
    if (card) {
      card.innerHTML = `
        <img src="/assets/img/${team.photo}" alt="Portrait of ${team.name}" loading="lazy">
        <div class="team-info">
          <h3>${team.name}</h3>
          <p class="team-role">${team.role}</p>
          <p class="team-bio">${team.bio}</p>
          <ul class="expertise-tags">${team.expertiseTags.map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

// 404 page has no dynamic content

// Determine which page is being loaded by data-page attribute and initialize accordingly
document.addEventListener('DOMContentLoaded', async () => {
  const site = await loadSite().catch((err) => {
    console.error('Failed to load site data', err);
    return {};
  });
  await loadPartials();
  renderHeaderFooter(site);
  const page = document.body.dataset.page;
  switch (page) {
    case 'home':
      initHome(site);
      break;
    case 'projects':
      initProjects();
      break;
    case 'resources':
      initResources();
      break;
    case 'services':
      initServices();
      break;
    case 'about':
      initAbout();
      break;
    default:
      // no specific initialisation
      break;
  }
});