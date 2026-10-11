'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FehlerAnsicht } from '@/components/website/fehler/FehlerAnsicht';
import { fehlerTexte, spracheAusPfad } from '@/components/website/fehler/texte';
import { schriftKlassen } from './schriften';

/**
 * Fehlergrenze für alle Seiten (Blatt S24, Variante Fehler, E-030): ersetzt das Wurzel-Layout, deshalb eigenes html
 * und body mit den Stilen und Schriften. Eine einzige Grenze statt zusätzlich `[locale]/error.tsx` – jede Grenze
 * liegt im Bundle jeder Route (K-12); ohne Kopf und Fußzeile sähen beide gleich aus. Die Sprache liest die Komponente aus dem Adressanfang; unbekannt → Deutsch.
 * Kein Metadata-Export möglich (Client-Komponente), darum ein title-Element.
 */
export default function GlobalerFehler({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  'use no memo';
  useEffect(() => {
    console.error(error);
  }, [error]);
  const sprache = spracheAusPfad(usePathname());
  const t = fehlerTexte(sprache);
  return (
    <html lang={sprache} className={schriftKlassen}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t.titel}</title>
      </head>
      <body>
        <FehlerAnsicht sprache={sprache} erneut={retry} />
      </body>
    </html>
  );
}
