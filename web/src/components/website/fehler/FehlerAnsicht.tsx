import { Seitenkopf } from '../Seitenkopf';
import { Zustandsgrafik } from '../Zustandsgrafik';
import { knopfRahmen } from './knopf';
import { Statusblock } from './Statusblock';
import { fehlerTexte, startseite, type FehlerSprache } from './texte';

/**
 * Inhalt der Client-Fehlergrenze `global-error.tsx` (Blatt S24 Variante Fehler; E-030: keine eigene `[locale]/error.tsx`).
 * Ohne Kopf und Navigation des Rahmens, mit denselben Bausteinen wie die Seite „nicht gefunden“: Seitenkopf (ohne
 * next/image, für Routenebene vorgesehen), Zustandsgrafik und Statusblock. Die Grenze liegt in jeder Route (K-12),
 * deshalb keine Pfadtabelle, kein next-intl und keine Icon-Bibliothek.
 */
export function FehlerAnsicht({ sprache, erneut }: { sprache: FehlerSprache; erneut: () => void }) {
  'use no memo'; // React Compiler: kein Memo-Code für eine Ansicht, die nur im Fehlerfall erscheint
  const t = fehlerTexte(sprache);
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-gruen-950 px-4 py-3 font-bold text-weiss focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t.zumInhalt}
      </a>
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <Seitenkopf titel={t.titel} />
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Statusblock grafik={<Zustandsgrafik art="fehler" className="tritt-auf" />} ueberschrift={t.h2} text={t.text}>
            <button type="button" onClick={erneut} className={knopfRahmen}>
              {t.erneut}
            </button>
            <a href={startseite(sprache)} className={knopfRahmen}>
              {t.startseite}
            </a>
          </Statusblock>
        </div>
      </main>
    </>
  );
}
