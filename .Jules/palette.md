## 2024-05-24 - Accessibility of Interactive Custom Rows
**Learning:** Icon-only delete buttons hidden via opacity (to reduce clutter) are completely inaccessible to keyboard users unless they have a focus state that restores opacity.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus:opacity-100` for interactive elements.
