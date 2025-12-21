## 2024-05-23 - State Dependency in Memoization
**Learning:** When memoizing complex calculations that depend on a subset of a state object (e.g., `toggles.flightPlan` vs the entire `toggles` object), always be specific in the dependency array.
**Action:** Deconstruct state objects or access specific properties in the dependency array to prevent unnecessary re-runs when unrelated properties change. This was critical in `app/page.tsx` where `toggles` contained UI-only flags (`moments`, `info`) that shouldn't trigger weight and balance recalculation.
