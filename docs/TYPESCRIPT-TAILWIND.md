# TypeScript and Tailwind migration

All active application files under src use .ts or .tsx. Next.js configuration, PostCSS configuration, ESLint configuration and Node verification scripts remain JavaScript tooling. The unused pre-Next.js src/App.jsx entry point was removed; it referenced removed React Router packages and obsolete pages.

## Type safety

- tsconfig.json enables strict checking, disables JavaScript application files and preserves the @/* alias.
- src/common/types/index.ts defines sessions, roles, API envelopes, students, rooms, events, leaves, attendance, navigation, forms and resource state.
- API services return typed responses. useResource infers its data from the service function.
- Native React attributes type shared controls; React events type forms and DOM handlers.
- ECharts options, chart instances and DOM refs are typed.
- No ts-nocheck, ts-ignore, explicit any, or ignored build type errors were introduced.
- npm run typecheck checks the application. ESLint now checks TypeScript files.
- Existing Node test scripts import the converted pure .ts modules using Node 24's native type stripping.

## Styling and UI preservation

Tailwind v4 was already installed through @tailwindcss/postcss. Shared auth/workspace styles and admin dashboard styles now use Tailwind @apply utilities for existing flex/grid layouts, alignment, positioning, box sizing and image containment. Individual stylesheets reference Tailwind with @reference; the global stylesheet retains @import "tailwindcss". AuthLayout also uses utility classes directly.

Existing theme selectors, colors, dimensions, responsive breakpoints, images, animations and interaction states remain. Custom CSS continues to express detailed visual styling. No global scaling or visual redesign was added. API paths, request payloads, storage keys, routes and role guards remain.

## Verification

- Production build, strict typecheck and ESLint.
- All 15 existing API contract, dashboard/chart and Next route/asset tests.
- Login browser QA: 43 viewport/zoom cases, validation, keyboard focus, visibility, loading, duplicate submissions, network errors, remembered email, setup-token preservation and unauthenticated route guards.
- Effective CSS viewport zoom: 75%, 80%, 90%, 100%, 110%, 125%, 150%, 200%; native browser menu zoom was not driven.
- Before/after login screenshots retained in artifacts/typescript-baseline and artifacts.
- Authenticated dashboard data could not be exercised against the live backend without valid credentials; existing chart/data tests and protected-route checks passed.

The eight before/after login screenshot comparisons are recorded in artifacts/typescript-visual-comparison.json. Tablet, mobile and mobile zoom screenshots are pixel-identical. Desktop differences are confined to the existing animated golden Welcome to text; form, card, background and footer pixels match.
