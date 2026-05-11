# VintedFlow

Premium SaaS web application for Vinted seller automation. The product pairs a Chrome extension with a Next.js dashboard for listing workflows, buyer messaging, analytics, and Supabase-backed account data.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase
- Vercel

## Project Structure

```text
src/
  app/                 App router pages, layout, global styles
    (auth)/            Login and register pages
    auth/callback/     Supabase OAuth callback route
    dashboard/         Protected SaaS dashboard pages
  components/
    auth/              Login, register, and logout components
    dashboard/         Dashboard shell, navigation, and page primitives
    layout/            Navbar and footer
    sections/          Homepage sections
    ui/                Reusable design system primitives
  lib/                 Utilities, Supabase clients, auth helpers, app data
  types/               Shared domain types
public/                Static assets
extension/             Chrome Extension MV3 app
```

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` before wiring Supabase auth or database features.

## Supabase Auth

Enable Email and Google providers in Supabase, then add the following redirect URL:

```text
http://localhost:3000/auth/callback
```

For production, add the matching Vercel URL callback as well.

## Chrome Extension MVP

The MV3 extension lives in `extension/` and builds to `extension/dist`.

```bash
npm run extension:build
```

Load `extension/dist` in Chrome via `chrome://extensions` → Developer mode → Load unpacked.

For local dashboard connection, create extension env variables before building:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DASHBOARD_URL=http://localhost:3000
```

Production should use `VITE_DASHBOARD_URL=https://vintly.live`. The MVP only detects Vinted pages, syncs auth/session state, logs activity, and prepares safe modules. It does not execute aggressive automation.
