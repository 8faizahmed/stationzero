## 2024-05-22 - Accessibility Pattern: Icon Buttons
**Learning:** This application uses emojis and SVGs as icon-only buttons (e.g., in HangarList). These were previously inaccessible to screen readers as they lacked `aria-label` or accessible names.
**Action:** When working on UI components, specifically check for emoji-based or SVG-based buttons and ensure they have descriptive `aria-label` attributes.
