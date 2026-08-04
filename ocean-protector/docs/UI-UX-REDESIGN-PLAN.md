# OceanGuard UI/UX Redesign Plan

## 1. Existing architecture

- React 18 + TypeScript + Vite single-page application.
- React Router provides separate Citizen, Analyst, and Authority route trees under a shared layout.
- Tailwind CSS and Radix UI primitives provide styling and accessible interaction foundations.
- TanStack Query manages server state; React Hook Form and Zod handle report validation.
- Leaflet powers maps, Recharts powers dashboard charts, and Socket.IO provides the realtime client.
- API access is isolated in `src/services`. Report workflows use the live API in API mode; incidents, alerts, regions, and social signals currently retain mock adapters.
- Offline citizen reports use IndexedDB through Dexie.
- Render deploys the frontend as a static site and rewrites all routes to `index.html`.

## 2. Files to modify

- Shared shell: `AppShell`, `MainLayout`, `Sidebar`, `TopBar`, `PageHeader`.
- Design foundation: `index.css`, Tailwind tokens, buttons, cards, badges, inputs.
- Shared states and semantics: status badges, loading skeletons, empty/error/offline messaging.
- Citizen: dashboard, report flow, alerts, tracking, map, offline queue.
- Analyst: dashboard, reports queue, report review, incidents, social signals, map.
- Authority: dashboard, incident list/detail, alert composer, teams, map.
- Routing and loading: `App.tsx`.
- Documentation: this plan and `UI-UX-REDESIGN-SUMMARY.md`.

## 3. New reusable components

- `RoleSwitcher`
- `ConnectionStatus`
- `FormStepIndicator`
- `LoadingSkeleton`
- A consolidated semantic status configuration used by severity/report/incident badges

## 4. Risk areas

- Report status values must remain identical to backend enums.
- Report submission and offline queue payloads must remain compatible.
- Role navigation cannot expose routes that do not exist.
- Map and chart bundles are large and should be route-lazy-loaded.
- Light design tokens must not leave legacy dark text utilities unreadable.
- Mock-backed services must remain visibly demo data and must not replace working report API calls.
- Media upload is not connected to the report form and will not be presented as complete.

## 5. Features that must be preserved

- Citizen report creation, geolocation, offline queue, tracking, alerts, and map.
- Analyst report review, status changes, confidence recalculation, incidents, signals, and map.
- Authority incident management, team assignment, public-alert preparation, and map.
- Role switching, realtime connection support, toasts, responsive navigation, and Render rewrites.

## 6. Responsive strategy

- Citizen: single-column mobile flow, bottom navigation, 44px targets, prominent report action.
- Analyst: evidence-first split pane on desktop; stacked queue and review sections on smaller screens.
- Authority: action queue before analytics; tables or compact rows collapse into cards.
- Maps use larger role-specific panels with controlled internal sizing.
- Avoid horizontal page scrolling; operational tables may scroll within their own region.

## 7. Testing checklist

- TypeScript check and production build.
- Citizen, Analyst, and Authority route navigation.
- Role switcher keyboard focus and active state.
- Report validation, geolocation, anonymous submission, offline queuing, and tracking.
- Report verify/reject actions and confidence refresh.
- Authority incident and alert routes.
- Empty, loading, offline, and API error states.
- Keyboard navigation, skip link, focus visibility, labels, and 44px controls.
- Responsive checks at mobile, tablet, laptop, and widescreen widths.

## 8. Deployment considerations

- Preserve `VITE_API_URL`, `VITE_SOCKET_URL`, and `VITE_DATA_MODE`.
- Preserve the Render SPA rewrite.
- Do not commit secrets or runtime values.
- Keep backend endpoint contracts unchanged.
- Route-level lazy loading reduces the initial Render static bundle.
- Render deployment still depends on the separately deployed API, classifier, and PostgreSQL services.
