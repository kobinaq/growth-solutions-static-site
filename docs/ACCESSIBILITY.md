# Accessibility Checklist

This project follows the [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) guidelines to ensure the website is usable by as many people as possible, including those who rely on assistive technologies or keyboard navigation. Below is a non‑exhaustive checklist of measures taken and things to consider when editing or extending the site.

## Semantic HTML

* Use appropriate elements (`<main>`, `<nav>`, `<section>`, `<article>`, `<header>`, `<footer>`) to describe the structure of the page.
* Headings are ordered logically (`<h1>` followed by `<h2>`, etc.) without skipping levels.

## Text & Contrast

* All text maintains a contrast ratio of at least 4.5:1 against its background (checked using tools like the WebAIM contrast checker).
* Body copy uses a legible sans‑serif font with sufficient line height (1.6).
* Colour alone is not used to convey meaning; chips and buttons use both colour and text.

## Focus Management

* A visible skip link at the top of the page allows keyboard users to bypass the navigation and jump directly to the main content.
* Focus states are clearly defined on interactive elements such as links, buttons and input fields.
* The mobile navigation menu uses `aria-expanded` to indicate when it is open.
* Modals trap keyboard focus and can be closed via the close button, the overlay or the Escape key.

## Keyboard Navigation

* All interactive controls (links, buttons, chips, search inputs) are reachable and operable using the keyboard.
* The navigation menu toggles open and closed with the Enter/Space keys on the burger button.
* Filter chips behave like buttons and are fully keyboard accessible.

## Forms

* The contact form is embedded from Google Forms, which automatically handles form field labels and validation. The surrounding container clearly labels the purpose of the form.

## Images & Alt Text

* Informative images include descriptive `alt` attributes. Decorative images either have empty `alt` attributes or are applied via CSS.
* When adding new images, always provide alt text that conveys the purpose of the image. For decorative graphics, use `alt=""`.

## Animations & Motion

* Motion effects (such as hover lifts on cards) are subtle and constrained to avoid triggering motion sensitivity.
* No auto‑playing video or audio is used. `prefers-reduced-motion` is respected; heavy animations can be disabled with a media query if added later.

## Language & Structure

* The `lang="en"` attribute declares the page language, assisting screen readers.
* Lists are used for groups of items (footer links, KPI lists) to convey structure.

## Error Handling

* The 404 page provides a clear error message and a link back to the home page.
* JavaScript errors are logged to the console but do not break keyboard accessibility.

## Ongoing Considerations

* When embedding third‑party content (e.g. more complex forms, maps), ensure that the embed meets accessibility standards or provide alternative contact methods.
* If adding videos, include captions and transcripts.
* Always test new features with keyboard navigation and screen readers like NVDA or VoiceOver.