import { loadSite, loadProjects, loadResources, loadServices, loadTeam, preloadImage } from './dataLoader.js';
import { getQuery } from './router.js';

async function loadPartials() {
  const headerContainer = document.getElementById('site-header');
  const footerContainer = document.getElementById('site-footer');
  if (headerContainer) {
    const res = await fetch('/header.html');
    headerContainer.innerHTML = await res.text();
  }
  if (footerContainer) {
    const res = await fetch('/footer.html');
    footerContainer.innerHTML = await res.text();
  }
}

function getSocialSvg(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'linkedin':
      return `<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 4.99 8.5 2.5 2.5 0 0 1 4.98 3.5zm.02 4.91v12.59H.58V8.41h4.42zm7.92-.06c2.36 0 4.12 1.55 4.12 4.88v7.75h-4.41v-7.22c0-1.81-.65-3.04-2.27-3.04-1.24 0-1.98.83-2.31 1.63-.12.3-.15.71-.15 1.13v7.5H7.55s.06-12.18 0-13.37h4.42v1.89c.59-.9 1.64-2.18 4.06-2.18z"/></svg>`;
    case 'twitter':
      return `<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 0 1-2.825.775A4.958 4.958 0 0 0 23.292 3.1a9.86 9.86 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.379 4.482A13.978 13.978 0 0 1 1.671 3.149a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.93 4.93 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.086 4.936 4.936 0 0 0 4.604 3.419A9.867 9.867 0 0 1 0 19.539a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.72 13.995-14.646A9.935 9.935 0 0 0 24 4.59z"/></svg>`;
    default:
      return '';
  }
}

function renderHeaderFooter(site) {
  const navContainer = document.querySelector('#primary-navigation');
  if (navContainer && site?.nav) {
    navContainer.innerHTML =
      `<ul>` + site.nav.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join('') + `</ul>`;
    const currentPath = window.location.pathname.replace(/\/$/, '/index.html');
    navContainer.querySelectorAll('a').forEach((link) => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath || (currentPath.endsWith('/index.html') && linkPath.endsWith('/index.html'))) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle && navContainer) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      navContainer.classList.toggle('open', !expanded);
    });
  }
  const footerContent = document.getElementById('footer-content');
  if (footerContent && site?.footerCols) {
    let html = '';
    site.footerCols.forEach((col) => {
      html += `<div class="footer-col"><h3>${col.title}</h3><ul>`;
      col.links.forEach((link) => { html += `<li><a href="${link.href}">${link.label}</a></li>` });
      html += `</ul></div>`;
    });
    html += `<div class="footer-col contact-col"><h3>Contact</h3><address>`;
    if (site.contact?.email) html += `<p><strong>Email:</strong> <a href="mailto:${site.contact.email}">${site.contact.email}</a></p>`;
    if (site.contact?.phones?.length) html += `<p><strong>Phone:</strong> ${site.contact.phones.join(', ')}</p>`;
    if (site.contact?.address) html += `<p><strong>Address:</strong> ${site.contact.address}</p>`;
    html += `</address>`;
    if (site.socialLinks?.length) {
      html += `<div class="social-links">`;
      site.socialLinks.forEach((sl) => { html += `<a href="${sl.url}" target="_blank" rel="noopener" aria-label="${sl.platform}">${getSocialSvg(sl.platform)}</a>`; });
      html += `</div>`;
    }
    html += `</div>`;
    footerContent.innerHTML = html;
  }
}

function openModal({ title, body, kpis, images, extra }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('tabindex', '-1');
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `
    <button class="modal-close" aria-label="Close dialog">&times;</button>
    <h2 class="modal-title">${title}</h2>
    <div class="modal-body">${body}</div>
  `;

  if (kpis?.length) {
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
  if (images?.length) {
    const gallery = document.createElement('div');
    gallery.className = 'modal-gallery';
    images.forEach((img) => {
      const image = document.createElement('img');
      image.src = `/${img}`;
      image.alt = '';
      gallery.appendChild(image);
    });
    dialog.appendChild(gallery);
  }
  if (extra) dialog.appendChild(extra);

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');

  const regions = [document.getElementById('site-header'), document.getElementById('site-footer'), document.getElementById('main-content')].filter(Boolean);
  regions.forEach((el) => el.setAttribute('inert', ''));

  const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  function handleKey(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab' && focusables.length) {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener('keydown', handleKey);
  if (first) first.focus();

  function closeModal() {
    document.removeEventListener('keydown', handleKey);
    overlay.remove();
    document.body.classList.remove('modal-open');
    regions.forEach((el) => el.removeAttribute('inert'));
  }

  dialog.querySelector('.modal-close').addEventListener('click', closeModal);
}

function searchItems(items, query) {
  if (!query) return items;
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const tagMatch = item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q));
    return titleMatch || tagMatch;
  });
}

async function initHome(site) {
  preloadImage('/hero.png');
  const trustEl = document.getElementById('trust-text');
  if (trustEl && site?.trustText) trustEl.textContent = site.trustText;
  try {
    const resources = await loadResources();
    resources.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    const latest = resources.slice(0, 3);
    const list = document.getElementById('latest-resources');
    if (list) {
      list.innerHTML = latest.map((res) => `
        <article class="card resource-card" data-id="${res.id}">
          <div class="card-image"><img src="/${res.coverImage}" alt="${res.title} cover" loading="lazy"></div>
          <div class="card-content">
            <span class="card-eyebrow">${res.type}</span>
            <h3 class="card-title">${res.title}</h3>
            <p class="card-excerpt">${res.excerpt}</p>
            <button class="text-button" aria-label="Read more about ${res.title}">Read more</button>
          </div>
        </article>`).join('');
      list.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          const data = resources.find((r) => r.id === id);
          if (data) {
            openModal({ title: data.title, body: data.body, kpis: null, images: [data.coverImage], extra: null });
          }
        });
      });
    }
  } catch (err) { console.error(err); }
}

async function initProjects() {
  const query = getQuery();
  const searchInput = document.getElementById('project-search');
  const chipsContainer = document.getElementById('project-chips');
  const cardsContainer = document.getElementById('project-cards');
  const data = await loadProjects();
  const focusAreas = Array.from(new Set(data.map((p) => p.focusArea)));
  chipsContainer.innerHTML = '<button class="chip" data-area="all">All</button>' + focusAreas.map((area) => `<button class="chip" data-area="${area}">${area}</button>`).join('');
  let activeArea = query.area && query.area !== 'null' ? capitalizeFirst(query.area) : 'all';
  function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

  function renderCards() {
    let filtered = data;
    if (activeArea !== 'all') filtered = filtered.filter((p) => p.focusArea === activeArea);
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (q) filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
    cardsContainer.innerHTML = filtered.map((p) => `
      <article class="card project-card" data-id="${p.id}">
        <div class="card-image"><img src="/${p.images[0]}" alt="${p.title} project image" loading="lazy"></div>
        <div class="card-content">
          <span class="card-eyebrow">${p.focusArea}</span>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-excerpt">${p.challenge}</p>
          <button class="text-button" aria-label="Read more about ${p.title}">Learn more</button>
        </div>
      </article>`).join('');
    cardsContainer.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const project = data.find((p) => p.id === id);
        if (project) {
          let body = '';
          body += `<p><strong>Location:</strong> ${project.location}</p>`;
          body += `<p><strong>Dates:</strong> ${project.dates}</p>`;
          body += `<p><strong>Challenge:</strong> ${project.challenge}</p>`;
          body += `<p><strong>Approach:</strong> ${project.approach}</p>`;
          body += '<h4>Outcomes</h4><ul>' + project.outcomes.map((o) => `<li>${o}</li>`).join('') + '</ul>';
          openModal({ title: project.title, body, kpis: project.kpis, images: project.images, extra: null });
        }
      });
    });
  }
  chipsContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('chip')) {
      activeArea = target.dataset.area;
      chipsContainer.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      target.classList.add('active');
      renderCards();
    }
  });
  searchInput?.addEventListener('input', renderCards);
  chipsContainer.querySelectorAll('.chip').forEach((chip) => {
    if (chip.dataset.area.toLowerCase() === (query.area || 'all')) { chip.classList.add('active'); activeArea = chip.dataset.area; }
  });
  renderCards();
}

async function initResources() {
  const query = getQuery();
  const typeChips = document.getElementById('resource-type-chips');
  const searchInput = document.getElementById('resource-search');
  const listContainer = document.getElementById('resource-cards');
  const resources = await loadResources();
  const types = Array.from(new Set(resources.map((r) => r.type)));
  typeChips.innerHTML = '<button class="chip" data-type="all">All</button>' + types.map((t) => `<button class="chip" data-type="${t}">${t}</button>`).join('');
  let activeType = query.type || 'all';

  function renderResources() {
    let filtered = resources;
    if (activeType !== 'all') filtered = filtered.filter((r) => r.type === activeType);
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (q) filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || (r.tags && r.tags.some((t) => t.toLowerCase().includes(q))));
    listContainer.innerHTML = filtered.map((r) => {
      const dateInfo = r.type === 'Event' ? `<p class="card-extra">${formatDate(r.eventDate)} &middot; ${r.city}</p>` : '';
      return `
        <article class="card resource-card" data-id="${r.id}">
          <div class="card-image"><img src="/${r.coverImage}" alt="${r.title} cover" loading="lazy"></div>
          <div class="card-content">
            <span class="card-eyebrow">${r.type}</span>
            <h3 class="card-title">${r.title}</h3>
            <p class="card-excerpt">${r.excerpt}</p>
            ${dateInfo}
            <button class="text-button" aria-label="Read more about ${r.title}">Learn more</button>
          </div>
        </article>`;
    }).join('');
    listContainer.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = resources.find((r) => r.id === id);
        if (!item) return;
        let extra = null;
        if (item.type === 'Event') {
          const btn = document.createElement('a');
          btn.href = item.registrationUrl;
          btn.className = 'button primary';
          btn.textContent = 'Register';
          btn.target = '_blank'; btn.rel = 'noopener';
          extra = document.createElement('div'); extra.className = 'modal-extra'; extra.appendChild(btn);
        }
        openModal({ title: item.title, body: item.body, kpis: null, images: [item.coverImage], extra });
      });
    });
  }
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  }
  typeChips.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('chip')) {
      activeType = target.dataset.type;
      typeChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      target.classList.add('active');
      renderResources();
    }
  });
  searchInput?.addEventListener('input', renderResources);
  typeChips.querySelectorAll('.chip').forEach((chip) => { if (chip.dataset.type === activeType) chip.classList.add('active'); });
  renderResources();
}

async function initServices() {
  const services = await loadServices();
  const container = document.getElementById('services-container');
  const groups = {};
  services.forEach((svc) => { svc.focusAreas.forEach((fa) => { if (!groups[fa]) groups[fa] = []; groups[fa].push(svc); }); });
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
  if (container) container.innerHTML = html;
}

async function initAbout() {
  try {
    const team = await loadTeam();
    const card = document.getElementById('team-card');
    if (card && team) {
      card.innerHTML = `
        <img src="/${team.photo}" alt="Portrait of ${team.name}" loading="lazy">
        <div class="team-info">
          <h3>${team.name}</h3>
          <p class="team-role">${team.role}</p>
          <p class="team-bio">${team.bio}</p>
          <ul class="expertise-tags">${(team.expertiseTags || []).map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
      `;
    }
  } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', async () => {
  const site = await loadSite().catch((err) => { console.error('Failed to load site data', err); return {}; });
  await loadPartials();
  renderHeaderFooter(site);

  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 2);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });

  const page = document.body.dataset.page;
  switch (page) {
    case 'home':     initHome(site); break;
    case 'projects': initProjects(); break;
    case 'resources':initResources(); break;
    case 'services': initServices(); break;
    case 'about':    initAbout(); break;
    default: break;
  }
});
