import type { ReactNode } from 'react';

/**
 * Kennungen im Startklar-Cockpit (H-F10): Umgebungsnamen mit Unterstrich (DATABASE_URL, CRON_SECRET …), Pfade zu
 * .md- und .json-Dateien sowie `pnpm …`-Befehle stehen als Code. Die Erkennung läuft auf dem Server und auf der
 * Kommandozeile gleich. Ohne Hooks und ohne 'use client', damit Seite und Liste sie gemeinsam nutzen.
 */
const MUSTER = /([\w./-]+\.(?:md|json)\b|pnpm [a-z:]+|\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b)/g;

/** Zerlegt einen Text: ungerade Teile sind Kennungen (als Code), gerade Teile bleiben Fließtext. */
export function mitKennungen(text: string): ReactNode {
  return text.split(MUSTER).map((teil, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded-sm bg-sand px-1 font-mono">
        {teil}
      </code>
    ) : (
      teil
    ),
  );
}

/** Ein Titel, der nur aus einer Kennung besteht (z. B. „CRON_SECRET“), wird in Monospace gesetzt. */
export const istKennung = (t: string) => /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(t);
