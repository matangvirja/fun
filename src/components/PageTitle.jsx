import { useEffect } from 'react';

const BASE_TITLE = 'FunFable';

/**
 * Sets document.title dynamically.
 * Usage: <PageTitle title="Shop All Toys" /> → "Shop All Toys — FunFable"
 * Usage: <PageTitle /> → "FunFable — Toys That Tell Stories"
 */
export default function PageTitle({ title }) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — Toys That Tell Stories`;
    return () => {
      // Restore previous title on unmount so navigating back still works
      document.title = prev;
    };
  }, [title]);

  return null;
}
