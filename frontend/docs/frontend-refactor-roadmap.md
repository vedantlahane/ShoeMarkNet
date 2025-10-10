# Frontend Refactor Roadmap

This roadmap sequences the modernization effort across the ShoeMarkNet frontend. Each wave includes engineering, UX, and QA deliverables so we can ship incrementally without breaking core journeys.

## Foundations (Sprint 0)

Before Wave 1 kicks off we need shared infrastructure:

- **React Query Provider** – create a `QueryClient` with caching defaults, retry/backoff behaviour, and Devtools toggle. Wrap the router in `QueryClientProvider` and `ReactQueryDevtools` (dev-only).
- **API Client consolidation** – collapse `src/services/api.js` and `src/utils/api.js` into a single `src/lib/api-client.ts` (or `.js`), configure auth header injection, error normalization, and base response typing.
- **Typed API responses** – introduce lightweight TypeScript-style JSDoc typedefs or migrate files touching network calls to `.ts(x)` where feasible to gain editor support while staying within existing tooling.
- **Env surface** – document required `VITE_API_URL`, `VITE_API_TIMEOUT`, and future feature flags in `frontend/README.md`.

## Wave 1 – Core Commerce Flows

**Scope**: Product list/detail, cart, checkout; retire local mocks; ensure React Query caching and theme polish.

1. **Data layer migration**
   - Create React Query hooks (`useProducts`, `useProduct`, `useFeaturedProducts`, `useCart`, `useCheckoutSession`).
   - Migrate `Home`, `Products`, `ProductDetail`, `Cart`, `Checkout` pages off Redux thunks; keep Redux for cart persistence temporarily, then swap to React Query mutation + localStorage cache.
   - Remove sessionStorage caching in favour of React Query stale times and initialData hydration when applicable.
2. **UI polish**
   - Audit layouts for 3 breakpoints (≥1280, 768–1279, <768). Harmonize spacing/typography via tailwind tokens (see Design System pass).
   - Validate skeleton states, loading indicators, and error boundaries per route.
3. **Checkout orchestration**
   - Replace placeholder order submission with `POST /api/orders` integration; include coupon validation via new endpoint and ensure optimistic updates roll back on failure.
4. **QA**
   - Smoke-test add-to-cart, cart persistence, checkout success/failure in light/dark themes.
   - Capture viewport screenshots (desktop/tablet/mobile) for regression artifacts.

## Wave 2 – User & Account Experiences

**Scope**: Auth, profile, wishlist, orders.

1. **Auth workflow**
   - Build React Query mutations for login/register/logout, refresh tokens, and profile fetch; migrate Redux slice to rely on server state + React Query cache invalidation.
   - Ensure `ThemeProvider` + router remain top-level; remove manual DOM class toggles inside feature components.
2. **Profile & wishlist**
   - Convert pages to hooks `useUserProfile`, `useWishlist`, `useOrders` with optimistic updates for wishlist add/remove.
   - Break down oversized components (e.g., `Profile` page) into presentational + data containers (`ProfileOverview`, `AddressBook`, `SecuritySettings`).
3. **Order history**
   - Implement paginated queries using React Query’s cursor/page patterns; integrate filters and export actions.
4. **QA**
   - Test session expiry, role-based guard rails, and wishlist operations in both themes and screen sizes.

## Wave 3 – Admin Dashboards & Insights

**Scope**: Admin analytics, marketing, lead components.

1. **Admin data hooks**
   - Introduce query keys for realtime stats, category analytics, campaigns, notifications.
   - Use React Query subscriptions with SSE (via `useEffect` + `queryClient.setQueryData`) to merge `GET /api/admin/realtime` events.
2. **Dashboard UI**
   - Refactor `AdminDashboard` into modular widgets (KPI cards, charts, tables) using centralized tokens and chart theme support.
   - Add marketing lead management views with filter/search/assignment flows.
3. **Performance**
   - Memoize expensive charts, throttle search inputs, and virtualize long tables (e.g., orders/users) with `@tanstack/react-virtual` or `react-window`.
4. **QA**
   - Regression run for admin-only features, confirm access control, theme compliance, and viewport responsiveness.

## Design System Pass (Runs in Parallel, Finalized before Wave 2)

- **Tokens** – Move color palette, typography scale, spacing, radii, and shadows into Tailwind `theme.extend` with CSS variables (`:root` & `[data-theme="dark"]`). Optionally generate a `tokens.css` file to expose custom properties for non-Tailwind usage.
- **Component alignment** – Update shared components (`Button`, `Card`, `Modal`, `Input`, `Badge`, etc.) to consume tokens via utility classes or CSS variables. Remove ad-hoc gradient definitions from feature components.
- **Theme Provider integration** – Ensure `ThemeProvider` sets the proper `data-theme` attribute; components should only rely on tokens (no manual `dark:` overrides unless necessary).

## Code Quality & Performance Enhancements

- **Shared hooks** – Create `src/hooks/api/` for reusable `useApiMutation`, `useDebouncedValue`, `useIntersectionObserverList` to replace duplicated logic.
- **Bundle health** – Split vendor chunks with Vite `build.rollupOptions`, lazily load admin modules, audit `heroicons`/`lucide-react` imports for tree-shaking.
- **Linting** – Extend ESLint config with React Query plugin rules and enforce exhaustive deps; convert scripts to use `lint-staged` before commit.
- **Monitoring** – Add basic web vitals logging and React Query Devtools toggled via `VITE_ENABLE_DEBUG_TOOLS`.

## Testing & Verification Strategy

- **Automated** – Stand up Vitest or Jest + Testing Library for key components; add Cypress (or Playwright) smoke scripts for checkout, wishlist, admin dashboard.
- **Manual checklists** – Maintain per-wave QA sheets with theme/viewport coverage and regression screenshots (store under `frontend/docs/regression/`).
- **CI hooks** – Update GitHub Actions (or add) to run lint + unit test + build on PR.

## Deliverables per Wave

| Wave | Deliverables | Exit Criteria |
| ---- | ------------ | ------------- |
| Foundations | Query provider, API client, docs | App builds with React Query provider, no runtime regressions |
| Wave 1 | Product/cart/checkout using React Query, UI polish | All commerce pages load data via hooks, pass smoke tests in both themes |
| Wave 2 | Auth/profile/wishlist/orders migration | User area pages server-driven, optimistic updates verified |
| Wave 3 | Admin dashboards and marketing tools | Admin widgets powered by live data, SSE integrated |
| Design System | Tokenized Tailwind + shared components | Visual QA passes for light/dark, tokens consumed everywhere |
| QA & Performance | Tests, linting, throttling/memoization | CI green, Lighthouse ≥90 performance on key pages |

---

This roadmap should be treated as a living document—update sprint by sprint as we refine scope or uncover new dependencies.
