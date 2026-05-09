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
