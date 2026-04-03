# Frontend Integration Notes

## Summary

This frontend was updated to work cleanly with the production backend at:

`https://loyiha.kuprikqurilish.uz/api/v1`

The main issues were not caused by Django CORS configuration. The real problems were:

- inconsistent endpoint formats across pages
- missing trailing slashes on DRF endpoints
- incorrect endpoint prefixes in some files
- duplicate or malformed slashes in request paths
- recursive logout behavior on `401`
- refresh token flow missing in the auth store
- a registration page bypassing the shared API client

## Key Changes

### 1. API endpoint normalization

Updated:

- `src/services/api/axios.ts`

Changes:

- strips trailing slash from `VITE_APP_BASE_URL`
- normalizes relative request URLs before sending them
- collapses accidental double slashes in paths
- keeps requests consistent for both `localhost` and production

### 2. Safer auth handling

Updated:

- `src/store/authStore.ts`
- `src/services/api/axios.ts`

Changes:

- added refresh token storage
- added `refreshAccessToken()`
- added `clearSession()`
- prevented recursive logout/login refresh loops on `401`
- logout now clears local state cleanly even if the backend logout endpoint fails

### 3. Canonical endpoint constants

Updated:

- `src/services/api/endpoints.ts`

Changes:

- fixed auth endpoints to use trailing slash
- fixed user detail/update/delete paths to use `/auth/users/:id/`
- added missing helpers like:
  - `USERS.LIST_ALL`
  - `DASHBOARD.REYTING`
  - `BOSHQARMA.LIST_ALL`
  - `OBYEKTLAR.DETAIL`
  - `BAYONNOMALAR.DETAIL`
  - `TOPSHIRIQLAR.MENING`
  - `JARIMALAR.DETAIL`
  - `CHAT_XONALAR.LIST`

### 4. Page-level endpoint fixes

Updated:

- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/boshqarma/BoshqarmaPage.tsx`
- `src/pages/obyektlar/ObyektPage.tsx`
- `src/pages/obyektlar/ObyektDetailPage.tsx`
- `src/pages/obyektlar/ObyektEditPage.tsx`
- `src/pages/xodimlar/XodimlarSinglePage.tsx`
- `src/pages/bayonnomalar/BayonnomalarPage.tsx`
- `src/pages/bayonnomalar/TopshiriqQushishModal.tsx`
- `src/pages/chatXonalar/ChatXonalarPage.tsx`
- `src/pages/chatXonalar/ChatXonalarSinglePage.tsx`
- `src/pages/kategoriyalar/KategoriyalarPage.tsx`
- `src/pages/jarimalar/JarimalarSinglePage.tsx`
- `src/pages/auth/RegisterPage.tsx`

Changes:

- replaced hardcoded URLs with shared endpoint constants where practical
- fixed wrong route usage like incorrect user/chat endpoint forms
- fixed list/detail endpoint formatting
- moved registration to the shared Axios client instead of raw `fetch`

## Environment

Use:

```env
VITE_APP_BASE_URL=https://loyiha.kuprikqurilish.uz/api/v1
```

Do not mix multiple frontend API variables unless the app explicitly uses them.

## Important Backend Expectations

The backend uses Django REST Framework style routes and expects trailing slashes:

- `/analytics/dashboard/`
- `/analytics/reyting/`
- `/core/boshqarmalar/`
- `/obyektlar/`
- `/bayonnomalar/`
- `/auth/users/`

Requests without the trailing slash may redirect with `301`, which browsers can surface as misleading CORS/auth errors.

## Verification Notes

Server-side checks already showed:

- CORS headers are present for `http://localhost:5173`
- production endpoints respond correctly when called with valid auth
- many browser-side "CORS" failures were actually `401`, `404`, or `301`

## Remaining Step

Local verification commands could not be completed in this workspace because `monitoring/node_modules` is currently missing, so `vite` and `eslint` were unavailable.

After installing dependencies, run:

```bash
cd monitoring
npm install
npm run build
npm run lint
```

If needed, re-test locally with:

```bash
npm run dev
```
