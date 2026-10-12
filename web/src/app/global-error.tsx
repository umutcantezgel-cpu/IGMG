'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { lazy, Suspense, useEffect } from 'react';
import { knopfRahmen } from '@/components/website/fehler/knopf';
import { fehlerTexte, spracheAusPfad, startseite, type FehlerSprache } from '@/components/website/fehler/texte';
import { schriftKlassen } from './schriften';

/**
 * Die gestaltete Ansicht (Kopf, Zustandsgrafik, Statusbereich) kommt erst im Fehlerfall nach (H-L01): Die Grenze
 * liegt im Bundle jeder Route (K-12), statisch eingebunden kostete sie jede Seite ≈ 4,8 kB gz und Rechenzeit beim
 * Laden. Bis sie da ist – oder wenn sie nicht laden kann (offline) – steht die schlichte Ansicht mit denselben Texten.
 */
const FehlerAnsicht = lazy(() =>
  import('@/components/website/fehler/FehlerAnsicht')
    .then((m) => ({ default: m.FehlerAnsicht }))
    .catch(() => ({ default: SchlichteFehlerAnsicht })),
);

function SchlichteFehlerAnsicht({ sprache, erneut }: { sprache: FehlerSprache; erneut: () => void }) {
  'use no memo';
  const t = fehlerTexte(sprache);
  return (
    <main id="inhalt" className="mx-auto flex max-w-(--container-inhalt) flex-col items-start gap-4 px-4 py-abschnitt md:px-8">
      <h1 className="text-display-1">{t.titel}</h1>
      <p className="max-w-text text-20 leading-einleitung text-tinte-2">{t.text}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={erneut} className={knopfRahmen}>
          {t.erneut}
        </button>
        <a href={startseite(sprache)} className={knopfRahmen}>
          {t.startseite}
        </a>
      </div>
    </main>
  );
}

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
        <meta name="robots" content="noindex, follow" />
        <title>{t.titel}</title>
      </head>
      <body>
        <Suspense fallback={<SchlichteFehlerAnsicht sprache={sprache} erneut={retry} />}>
          <FehlerAnsicht sprache={sprache} erneut={retry} />
        </Suspense>
      </body>
    </html>
  );
}
