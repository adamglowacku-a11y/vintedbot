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

Enable Email and Google providers in Supabase. For Google OAuth, create OAuth credentials in Google Cloud and paste the
Client ID / Client Secret into Supabase Auth Providers.

In Google Cloud OAuth Client settings, add the Supabase callback URL as an authorized redirect URI:

```text
https://adjxvqcqwtwwrwximytc.supabase.co/auth/v1/callback
```

Add these redirect URLs in Supabase Auth URL Configuration:

```text
http://localhost:3000/auth/callback
https://vintly.live/auth/callback
https://www.vintly.live/auth/callback
```

If you test on a Vercel preview domain, add that preview callback too:

```text
https://your-preview-domain.vercel.app/auth/callback
```

Set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000` locally and `https://vintly.live` in production.

## Admin Panel

The dashboard includes a hidden admin panel visible only for `adamglowa2008@gmail.com`. It uses Supabase Auth Admin APIs to list users and grant or revoke access.

Add this server-only variable in `.env.local` and Vercel Environment Variables:

```text
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Find it in Supabase Project Settings -> API -> `service_role`. Do not prefix it with `NEXT_PUBLIC_`, because this key must never be exposed in the browser.

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
