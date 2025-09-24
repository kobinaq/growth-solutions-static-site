# Content Editing Guide

This document explains where and how to edit the content for the Growth Solutions website. The goal is to empower non‑developers to update text, add new projects, resources or services, and modify navigation links with minimal effort.

## 1. Editing Text Within HTML

Simple copy, such as the mission statement on the About page or headings on the Home page, can be edited directly in the HTML files. Search for `<!-- EDIT:` comments to locate sections intended for easy modification.

Example:

```html
<!-- EDIT: Mission copy -->
<p>
  At Growth Solutions, our mission is to co‑create solutions with local communities …
</p>
```

Replace the placeholder text within the `<p>` tags without removing the surrounding HTML structure.

## 2. Editing Global Site Information

Global information such as navigation labels, footer links, contact details and social media URLs live in `data/site.json`. Updating this file will automatically propagate changes across the site on next page load.

Key fields:

* **`siteTitle`** – The site title displayed in the browser tab.
* **`metaDescription`** – Description used by search engines.
* **`nav`** – Array of objects defining the navigation menu (`label` and `href`). Ensure `href` corresponds to one of the existing pages.
* **`contact`** – Email, phone numbers and address. This appears in the footer and contact section.
* **`socialLinks`** – Links to social profiles. Supported platforms: LinkedIn, Twitter (icons automatically inserted).
* **`footerCols`** – Column headings and links displayed in the footer. You can rearrange or add items here.

## 3. Projects

Projects are stored in `data/projects.json` as an array of objects. Each project must include:

* `id` – A unique identifier (used internally; no spaces).
* `title` – Project name.
* `focusArea` – One of the five focus areas (Environmental Issues, Energy, Livelihood, Gender, Governance).
* `location` – City or region.
* `dates` – Time span (e.g. `2024–2025`).
* `challenge` – A short description of the problem addressed.
* `approach` – Summary of how Growth Solutions tackled the challenge.
* `outcomes` – Array of bullet points highlighting results. Use `[placeholder]` markers for numbers you intend to update later.
* `kpis` – Array of strings (`"Number Label"`) displayed as key performance indicators in the modal.
* `images` – List of image filenames in `/assets/img/`. The first image appears on the card; all images appear in the modal gallery.
* `clientType` – Type of partnership (e.g. Community + NGO Partnership).
* `tags` – Array of keywords used for search.

To add a new project, duplicate one of the existing objects, assign a new `id` and update the fields. Add any new images to `/assets/img/` and reference them by filename. Ensure that alt text suggestions are added to the HTML where the image is used.

## 4. Resources

Resources such as blogs, reports, manuals and events live in `data/resources.json`. Each resource must include:

* `id` – Unique string ID.
* `type` – One of `Blog`, `Report`, `Manual`, `Event`.
* `title` – Title of the resource.
* `excerpt` – A short preview displayed on cards.
* `body` – HTML string containing the full content. You can embed paragraphs, lists and headings. Avoid complex markup.
* `categories` – Array of themes (e.g. `Energy`, `Gender`).
* `tags` – Array of keywords used for search.
* `coverImage` – Filename of the cover image located in `/assets/img/`.
* `author` – Name of the author or team.
* `publishDate` – ISO date string (`YYYY-MM-DD`).

Additional fields for `Event` type:

* `eventDate` – Date of the event.
* `city` – Location of the event.
* `registrationUrl` – External link for registration.

When adding a new resource, choose an appropriate `type` and ensure that required fields are provided. For events, include future dates. Cover images should be sized appropriately (see section on images below).

## 5. Services

Services are defined in `data/services.json`. Each service object must have:

* `id` – Unique identifier.
* `title` – Service name.
* `summary` – Short description displayed on the card.
* `focusAreas` – Array of focus areas to which the service applies.
* `capabilities` – Array of bullet points describing specific capabilities.
* `downloads` – Array of filenames or URLs for downloadable materials (optional).

You can group services under multiple focus areas by including multiple values in the `focusAreas` array.

## 6. Team

The team section currently supports a single team member profile defined in `data/team.json`. Update this file to modify the biography, role, expertise tags and social links for Sarah. If the organisation expands its team in the future, the JavaScript code can be extended to iterate over an array of members, but this template intentionally displays only one card.

## 7. Images & Alt Text

All images used on the site live in `/assets/img/`. When adding new images:

* Optimise images for the web (ideally < 200 KB each) and use meaningful file names.
* Add the file to `/assets/img/`.
* Reference it in the relevant JSON entry or HTML file.
* Provide descriptive `alt` text when the image appears in HTML. The cards and modals will automatically insert the title for resource and project images, but other images (e.g. hero, team portrait) should include alt attributes manually.

To replace a placeholder logo in the Partners section, save the logo in `/assets/img/` and swap the placeholder `<div>` with an `<img>` element providing alt text, for example:

```html
<img src="/assets/img/partner-logo.png" alt="[Partner Name] logo" />
```

## 8. Adding Navigation Links

Navigation items are defined in `data/site.json` under the `nav` array. Each object requires a `label` and `href`. The order of items in the array reflects the order in the navigation bar. Only the five pages defined in the sitemap should be linked; adding a new page requires creating the HTML file and updating the sitemap accordingly.

## 9. Caching

Caching headers are set in `vercel.json`. When editing content or assets, redeploy the site so that updated resources are served. You can adjust cache durations in `vercel.json` if you need more aggressive or relaxed caching.