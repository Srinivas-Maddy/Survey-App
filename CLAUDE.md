# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Requires `.env.local` with `MONGODB_URI` (MongoDB Atlas connection string) and `JWT_SECRET`.

## Architecture

Next.js 16 App Router application with MongoDB (Mongoose) backend. All code is TypeScript with Tailwind CSS 4 styling. Path alias `@/*` maps to `./src/*`.

### Core Layers

- **`src/models/`** — Mongoose schemas: `User` (with role/adminId for employee management), `Survey` (with embedded `Question` subdocuments), `Response` (with employeeId/collectionMethod tracking), `SurveyAssignment`. Survey model deletes cached mongoose model on import to ensure schema updates in dev.
- **`src/lib/db.ts`** — Singleton MongoDB connection with global cache to survive HMR.
- **`src/lib/auth.ts`** — JWT helpers (`signToken`, `verifyToken`, `getUser`, `getAuth`). `getUser()` reads cookies (web). `getAuth(req)` tries cookie first then `Authorization: Bearer` header (mobile). Role helpers: `requireAdmin()`, `requireEmployee()`.
- **`src/app/api/`** — REST API routes. All authenticated endpoints call `getUser()` or `getAuth()` and verify survey ownership via `userId` match.

### Key Patterns

- **Survey ownership**: Every survey CRUD operation filters by `{ userId: auth.userId }` to enforce access control.
- **User roles**: `admin` (default, survey creators) and `employee` (field agents linked via `adminId`). Existing users auto-become admins.
- **Employee management**: Admins create employee accounts, assign surveys to them. Employees use the mobile app to collect responses face-to-face.
- **Response tracking**: Responses have `collectionMethod` ("public"/"employee") and optional `employeeId` for attribution.
- **Public survey access**: `/api/public/[publicId]` endpoints require no auth — they look up surveys by `publicId` (8-char UUID slug) and check `isActive`.
- **Yes/No conditional logic**: Questions of type `yesno` control visibility of the next question in the array. The public form hides dependent questions by default, only showing them when "No" is selected. Hidden question answers are stripped before submission.
- **13 question types**: `text`, `textarea`, `radio`, `checkbox`, `select`, `number`, `date`, `list`, `yesno`, `image`, `rating`, `phone`, `email`. Types requiring options: `radio`, `checkbox`, `select`, `list`.
- **Client components**: All pages under `app/` are `"use client"` except `layout.tsx`. They fetch data from API routes using `fetch()`.

### Route Structure

- `/` — Landing page (redirects to dashboard if authenticated)
- `/login`, `/register` — Auth pages
- `/dashboard` — Survey list with stats
- `/dashboard/employees` — Employee management (CRUD)
- `/dashboard/create` — Survey builder
- `/dashboard/edit/[id]` — Edit existing survey
- `/dashboard/survey/[id]` — Analytics dashboard (charts, individual responses)
- `/dashboard/admin` — Storage manager (MongoDB Atlas 512MB free tier monitoring, cleanup tools)
- `/s/[publicId]` — Public survey form for respondents (no auth required)

### API Endpoints

- `POST /api/auth/{register,login,logout,mobile}`, `GET /api/auth/me`
- `GET|POST /api/surveys`, `GET|PUT|DELETE /api/surveys/[id]`, `PATCH /api/surveys/[id]/toggle`
- `GET|POST /api/public/[publicId]`
- `GET|POST /api/employees`, `GET|PUT|DELETE /api/employees/[id]` — Admin employee management
- `GET|POST /api/assignments`, `DELETE /api/assignments/[id]` — Survey-employee assignments
- `GET /api/employee/surveys` — Employee's assigned surveys (mobile)
- `POST /api/employee/responses` — Employee response submission with tracking
- `GET /api/admin/stats`, `POST /api/admin/cleanup`

## Database

MongoDB Atlas free tier (512MB). Connection string in `MONGODB_URI` env var. Mongoose models use `mongoose.models.X || mongoose.model()` pattern except Survey which force-recreates to pick up schema changes in dev.

## Mobile App

React Native / Expo app in `../mobile/` directory for employee field survey collection. Uses Bearer token auth via `expo-secure-store`. Connects to the Next.js API. Set `API_BASE_URL` in `mobile/src/api/client.ts` to your server URL (defaults to Android emulator localhost `10.0.2.2:3000`).

```bash
cd mobile && npm install && npx expo start --android
```
