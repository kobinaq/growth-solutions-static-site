# Growth Solutions Static Site

This repository contains the source code for the Growth Solutions website, a lightweight static website built with pure HTML, CSS and vanilla JavaScript. The site showcases the organisation’s mission, focus areas, projects, resources, services and provides a simple contact form via a Google Form embed.

## Project Overview

Growth Solutions is a social enterprise based in Ghana. The website communicates our offerings and track record to partners, donors and B2B clients, while also serving as a hub for resources such as blogs, reports and manuals. No frameworks or build tools are used; all content is editable directly within the files.

## File Structure

```
/
  index.html            # Home page
  about.html            # About page (mission, values, team, contact)
  projects.html         # Projects index with filters and modals
  resources.html        # Resources library with filters and modals
  services.html         # Services overview
  404.html              # Simple 404 page
  /assets/
    /css/               # Stylesheet(s)
      styles.css        # Main stylesheet containing variables and component styles
    /js/                # JavaScript modules
      dataLoader.js     # Helper to load JSON data and preload images
      router.js         # Query string helpers
      main.js           # Core UI logic and page initialisation
    /img/               # Optimised images used throughout the site
  /data/                # Human‑readable JSON files for content
    site.json           # Global site information (nav, footer, contact details)
    projects.json       # List of projects/case studies
    resources.json      # List of blogs, reports, manuals and events
    services.json       # List of services/capabilities
    team.json           # Single team member profile
  /partials/            # Reusable HTML snippets
    header.html         # Header with nav placeholder
    footer.html         # Footer template
  /docs/
    README.md           # This overview and setup guide
    CONTENT_GUIDE.md    # Instructions for editing content
    ACCESSIBILITY.md    # Checklist of accessibility considerations
  robots.txt            # Robots directive for search engines
  sitemap.xml           # XML sitemap listing the pages
  vercel.json           # Vercel configuration (headers, redirects)
```

## Running Locally

Since there is no build step, you can preview the site locally using any static HTTP server. A simple way is to use Python’s built‑in web server:

```sh
cd growth-solutions-static-site
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in your browser. Dynamic features (loading JSON, modals, filters) require running over HTTP rather than directly opening the files via `file://`.

## Editing Content

Most of the editable text is stored in JSON files within the `/data` folder. The structure and instructions for these files are documented in [`docs/CONTENT_GUIDE.md`](./CONTENT_GUIDE.md). For small copy edits on static pages (e.g. Mission statement on the About page), look for `<!-- EDIT: … -->` comments in the HTML files.

## Deployment to Vercel

1. **Create a new GitHub repository** (e.g. `growth-solutions-static-site`) and push this code. Use `git init`, `git add .`, `git commit -m "Initial commit"` and `git remote add origin <your-repo-url>` followed by `git push`.
2. **Import the repository into Vercel**. In your Vercel dashboard, click “New Project”, select the GitHub repository and choose **Framework Preset: Other**. Because this is a static site with no build step, leave the **Build Command** empty and set **Output Directory** to `./`.
3. **Configure environment** (optional). The site doesn’t require any environment variables. You can optionally enable analytics (GA4, Plausible) by adding the snippet directly into `index.html`.
4. **Add collaborators**. In your GitHub repository settings and Vercel project settings, add your collaborators’ email addresses to grant them access.

Each push to the `main` branch will automatically trigger a new deployment on Vercel. Pull requests create preview deployments so you can review changes before merging.

## Google Forms Contact

The contact form on the About page is embedded via an `<iframe>` from Google Forms. To use your own form:

1. Create a new Google Form with fields: **Name**, **Email**, **Organization**, **Reason** (Dropdown), **Message** and **Consent** (Checkbox).
2. In the form editor, click **Send**, choose the “<>” embed option, and copy the embed code.
3. Replace the `src` attribute in the iframe inside `about.html` with your form’s embed URL. Do not attempt to style the form itself; use the surrounding container for styling.

## Contact & Support

For questions or support regarding this template, please contact the Growth Solutions team via the contact details listed on the About page or open an issue in the repository once it’s hosted on GitHub.