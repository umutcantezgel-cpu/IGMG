import { fehlerTexte, startseite, type FehlerSprache } from './texte';

/**
 * Inhalt der Client-Fehlergrenze `global-error.tsx` (Blatt S24 Variante Fehler; E-030: keine eigene `[locale]/error.tsx`).
 * Bewusst ohne gemeinsame Bausteine (Seitenkopf, Icons, Statusblock, Lucide): Fehlergrenzen liegen in jeder Route,
 * jedes Byte zählt auf allen Seiten (K-12, FEHLERSTATISTIK A18). Gestaltung wie `Seitenkopf` und `Statusblock`.
 */
export function FehlerAnsicht({ sprache, erneut }: { sprache: FehlerSprache; erneut: () => void }) {
  'use no memo'; // React Compiler: kein Memo-Code für eine Ansicht, die nur im Fehlerfall erscheint
  const t = fehlerTexte(sprache);
  const knopf =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[22px] font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800';
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-[100] rounded-md bg-gruen-950 px-4 py-3 font-bold text-weiss focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:text-weiss"
      >
        {t.zumInhalt}
      </a>
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <section className="border-b border-linie bg-sand">
          <div className="mx-auto max-w-(--container-inhalt) px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14">
            <h1 className="text-36 leading-[1.15] text-pretty md:text-48">{t.titel}</h1>
          </div>
        </section>
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8 md:py-14">
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rand bg-weiss px-6 py-16 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">
              {/* Lucide „triangle-alert“ (ISC), dekorativ */}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-8"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <h2 className="text-30">{t.h2}</h2>
            <p className="max-w-[52ch] text-tinte-2">{t.text}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={erneut} className={knopf}>
                {t.erneut}
              </button>
              <a href={startseite(sprache)} className={knopf}>
                {t.startseite}
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
