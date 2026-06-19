# Designbydial CRM

A lead and call management CRM built for a small IT sales team. Agents can look up contacts before calling (to avoid duplicate outreach), log call notes, and tag leads by status. Admins manage users, review pipeline KPIs, and audit activity.

## Features

- **Duplicate-safe contact search** — debounced search by phone or email, with a soft warning (not a hard block) when creating a contact that looks like an existing one.
- **Lead status tracking** — New / Interested / Not Interested / Do Not Call / Callback, with a callback date picker and overdue/today highlighting.
- **Call notes** — chronological note history per contact, sortable oldest/newest first.
- **Segmented lead lists** — one list per status, filterable by agent and date range, exportable to CSV.
- **CSV bulk import** — upload a CSV of leads to create contacts in bulk.
- **Role-based access** — Agent vs Admin, enforced both in the UI and at the API layer.
- **Admin tools** — user management (create, deactivate, change role, reset password, delete), a pipeline/activity overview dashboard, an audit log of admin actions, and a trash with restore for soft-deleted users/contacts/notes.
- **Password management** — agents can change their own password from the Account page; admins can issue a temporary password to any agent from the Users page. No email dependency.
- Responsive layout — usable on mobile, tablet, and laptop screens.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- PostgreSQL via [Prisma 7](https://www.prisma.io) (driver adapters) — built and tested against [Neon](https://neon.tech)
- [NextAuth (Auth.js) v5](https://authjs.dev) with the Credentials provider, JWT sessions
- Tailwind CSS v4

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   - `DATABASE_URL` / `DIRECT_URL` — Neon (or any Postgres) connection strings; `DATABASE_URL` should be the pooled connection, `DIRECT_URL` the direct one (used by Prisma Migrate).
   - `AUTH_SECRET` — generate with `npx auth secret`.

3. Apply the database schema and seed an admin user:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in with the seeded admin account (see `prisma/seed.ts` for credentials — change the password after first login).

## Scripts

| Script            | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `npm run dev`     | Start the dev server (Turbopack)                                            |
| `npm run build`   | `prisma generate && prisma migrate deploy && next build` — used for deploys |
| `npm run start`   | Start the production server                                                 |
| `npm run lint`    | Run ESLint                                                                  |
| `npm run db:seed` | Seed the database (creates the initial admin user)                          |
