# AGENTS.md

## Project Context

This is the FunFable e-commerce application powered by React, Vite, Tailwind CSS, TanStack Query, and Supabase.

Start with `README.md` for local setup, environment variables, and schema migrations.

## Key Files

- `src/`: frontend application source code.
- `src/api/supabaseClient.js`: frontend Supabase client and entity adapters.
- `supabase/schema.sql`: database tables, RLS policies, triggers, and seed script.
- `vite.config.js`: Vite configuration with `@` alias to `./src`.
- `.env.local`: local-only environment values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); never commit secrets.

## Working Notes

- Use `npm run dev` to start the local development server.
- Run `npm run build` or `npm run lint` before finishing code changes.
