import { createClient } from '@base44/sdk';

// The exported ZIP only contained a placeholder mock for this file (Base44
// doesn't hand out the real client bootstrap through the export tool).
// This is the standard, documented way to create a Base44 client for an
// app that requires login — see https://docs.base44.com/sdk-docs/functions/createClient
//
// Fill in your real values in `.env.local` (copy `.env.example`):
//   VITE_BASE44_APP_ID=your-app-id        <- from the Base44 editor URL
//   VITE_BASE44_APP_BASE_URL=https://fun-fable-play.base44.app
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
  requiresAuth: true,
});

// The rest of this codebase calls the client "db" (see any page that does
// `db.entities.Product.list()`, `db.auth.me()`, etc.) — keep both names
// exported so every existing import keeps working.
export const db = base44;
export default base44;
