import { notFound } from 'next/navigation';

export const ensureStatic = 'navigation';

/** Platzhalter für den statischen Bau: ensureStatic verlangt je Route mindestens eine vollständige Parametermenge (MUSTER 1). */
export function generateStaticParams() {
  return [{ rest: ['_'] }];
}

/**
 * Unbekannte Adressen innerhalb einer Sprache (Blatt S24, Variante 404): `notFound()` – Next antwortet mit HTTP 404
 * und rendert `[locale]/not-found.tsx` (lokalisierter Inhalt, noindex). Vorher HTTP 200 (Soft-404, Tor A SP-A-05).
 */
export default function UnbekannteAdresse(): never {
  notFound();
}
