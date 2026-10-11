'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { SpeicherZustand } from '@/server/actions/seiteninhalte';
import type { VerwaltungBereich } from './bereiche';
import { FehlerKontext } from './Felder';
import { beschreibePfad, feldId, zaehlePlatzhalter } from './hilfen';

/** Server Action des Formulars: nimmt Bereich und Inhalt (JSON) entgegen und liefert Fehler am Feld. */
export type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;

/**
 * Gemeinsamer Rahmen aller Bereiche: versteckte Felder `bereich` und `inhalt` (JSON des Zustands), Fehler-Zusammenfassung
 * mit Sprungverweisen und Fokus (K-07), Hinweis auf Platzhalter (G-05) und Speichern. Ohne Bearbeitungsrecht nur lesen.
 */
export function FormularRahmen({
  bereich,
  wert,
  aktion,
  nurLesen,
  hinweis,
  children,
}: {
  bereich: VerwaltungBereich;
  wert: unknown;
  aktion: Aktion;
  nurLesen: boolean;
  hinweis?: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const [ergebnis, absenden, laeuft] = useActionState(aktion, {});
  const zusammenfassung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ergebnis.fehler || ergebnis.gespeichert) zusammenfassung.current?.focus();
  }, [ergebnis]);

  const feldFehler = ergebnis.feldFehler ?? {};
  const fehlerListe = Object.entries(feldFehler);
  const anzahlPlatzhalter = zaehlePlatzhalter(wert);
  const beschreibe = (pfad: string) =>
    beschreibePfad(
      pfad,
      (s, werte) => t(s, werte),
      (s) => t.has(s),
    );

  return (
    <FehlerKontext.Provider value={feldFehler}>
      <form action={absenden} className="flex flex-col gap-6" noValidate>
        <input type="hidden" name="bereich" value={bereich} />
        <input type="hidden" name="inhalt" value={JSON.stringify(wert)} />
        <div ref={zusammenfassung} tabIndex={-1} className="outline-none">
          {ergebnis.fehler ? (
            <Meldung art="fehler">
              <p>{t(`fehler.${ergebnis.fehler}`)}</p>
              {fehlerListe.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 font-normal">
                  {fehlerListe.map(([pfad, schluessel]) => (
                    <li key={pfad}>
                      <a href={`#${feldId(pfad)}`} className="text-fehler underline">
                        {beschreibe(pfad)}: {t(`fehler.${schluessel}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Meldung>
          ) : ergebnis.gespeichert ? (
            <Meldung art="erfolg">{t('gespeichert')}</Meldung>
          ) : null}
        </div>
        {hinweis}
        {anzahlPlatzhalter > 0 ? <Meldung art="info">{t('platzhalterHinweis', { anzahl: anzahlPlatzhalter })}</Meldung> : null}
        {nurLesen ? <Meldung art="info">{t('nurLesen')}</Meldung> : null}
        <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
          {children}
        </fieldset>
        {!nurLesen ? (
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={laeuft}>
              <Save aria-hidden />
              {laeuft ? t('speichert') : t('speichern')}
            </Button>
          </div>
        ) : null}
      </form>
    </FehlerKontext.Provider>
  );
}
