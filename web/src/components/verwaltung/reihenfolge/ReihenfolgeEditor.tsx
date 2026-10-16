'use client';

import { ArrowDown, ArrowUp, Lock, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { ReihenfolgeZustand } from './typen';

export type ReihenfolgeEintrag = { schluessel: string; titel: string; beschreibung?: string; sichtbar?: boolean; marke?: string };
type Aktion = (vorher: ReihenfolgeZustand, fd: FormData) => Promise<ReihenfolgeZustand>;

/**
 * Reihenfolge per Tastatur (F-40; Muster wie der Menü-Editor): „Nach oben“ und „Nach unten“ je Eintrag (48 px), der
 * Fokus bleibt am verschobenen Knopf (am Rand wechselt er auf den Gegenknopf), eine Live-Region sagt die neue Stelle
 * an. Kein Ziehen nötig. Optional je Eintrag „anzeigen“ (Startseite). Gespeichert wird erst mit „Speichern“: Die Liste
 * geht als JSON (Feld `ordnung`) an die Action, die sie erneut prüft. Texte aus dem Namensraum des Moduls.
 */
export function ReihenfolgeEditor({
  aktion,
  eintraege,
  namensraum,
  mitSichtbarkeit = false,
  fest,
}: {
  aktion: Aktion;
  eintraege: ReihenfolgeEintrag[];
  /** Namensraum mit den Schlüsseln nachOben, nachUnten, verschoben, stelle, speichern, speichert, gespeichert, ungespeichert, hinweis, fehler.* (und sichtbar, sichtbarName, eingeblendet, ausgeblendet, ausgeblendetMarke) */
  namensraum: string;
  mitSichtbarkeit?: boolean;
  /** Fester erster Eintrag (nicht verschiebbar), z. B. der Kopf der Startseite. */
  fest?: { titel: string; beschreibung: string; marke: string };
}) {
  const t = useTranslations(namensraum);
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [liste, setListe] = useState(eintraege);
  const [ansage, setAnsage] = useState('');
  // Ungespeicherte Änderungen: Zähler der Änderungen und Stand beim letzten Absenden (ohne setState im Effekt)
  const [aenderungen, setAenderungen] = useState(0);
  const [gesendet, setGesendet] = useState(0);
  const geaendert = zustand.gespeichert ? aenderungen !== gesendet : aenderungen > 0;
  const basis = useId();
  const fokusZiel = useRef<string | null>(null);
  const meldungRef = useRef<HTMLDivElement>(null);
  const versatz = fest ? 1 : 0;
  const anzahl = liste.length + versatz;
  const kid = (schluessel: string, knopf: 'oben' | 'unten') => `${basis}-${schluessel}-${knopf}`;

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);
  useEffect(() => {
    const ziel = fokusZiel.current;
    if (!ziel) return;
    fokusZiel.current = null;
    const el = document.getElementById(ziel) as HTMLButtonElement | null;
    if (el && !el.disabled) el.focus();
    else document.getElementById(ziel.endsWith('-oben') ? ziel.replace(/-oben$/, '-unten') : ziel.replace(/-unten$/, '-oben'))?.focus();
  }, [liste]);

  const bewege = (i: number, richtung: -1 | 1) => {
    const j = i + richtung;
    if (j < 0 || j >= liste.length) return;
    const e = liste[i];
    const neu = [...liste];
    [neu[i], neu[j]] = [neu[j], neu[i]];
    fokusZiel.current = kid(e.schluessel, richtung === -1 ? 'oben' : 'unten');
    setListe(neu);
    setAenderungen((n) => n + 1);
    setAnsage(t('verschoben', { name: e.titel, nr: j + 1 + versatz, anzahl }));
  };
  const schalte = (i: number, sichtbar: boolean) => {
    const e = liste[i];
    setListe(liste.map((x, k) => (k === i ? { ...x, sichtbar } : x)));
    setAenderungen((n) => n + 1);
    setAnsage(t(sichtbar ? 'eingeblendet' : 'ausgeblendet', { name: e.titel }));
  };
  const wert = mitSichtbarkeit
    ? liste.map((e) => ({ schluessel: e.schluessel, sichtbar: e.sichtbar !== false }))
    : liste.map((e) => e.schluessel);

  return (
    <form action={absenden} onSubmit={() => setGesendet(aenderungen)} className="flex flex-col gap-5" noValidate>
      <p role="status" aria-live="polite" className="sr-only">
        {ansage}
      </p>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">{t(`fehler.${zustand.fehler}`)}</Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      <input type="hidden" name="ordnung" value={JSON.stringify(wert)} />
      <ol className="flex flex-col gap-3">
        {fest ? (
          <li className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-dashed border-rand bg-sand p-4 md:p-5">
            <span
              aria-hidden
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-weiss font-bold text-tinte-2 tabular-nums"
            >
              1
            </span>
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
              <h3 className="font-text text-18 font-bold tracking-normal">
                <span className="sr-only">{t('stelle', { nr: 1, anzahl })}: </span>
                {fest.titel}
              </h3>
              <p className="text-16 text-tinte-2">{fest.beschreibung}</p>
            </div>
            <span className={cn(PILLE, 'gap-1.5 bg-weiss text-tinte-2')}>
              <Lock aria-hidden className="size-4" />
              {fest.marke}
            </span>
          </li>
        ) : null}
        {liste.map((e, i) => {
          const sichtbar = e.sichtbar !== false;
          const nr = i + 1 + versatz;
          return (
            <li
              key={e.schluessel}
              className={cn(
                'flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-linie p-4 shadow-s1 md:p-5',
                mitSichtbarkeit && !sichtbar ? 'bg-papier' : 'bg-weiss',
              )}
            >
              <span
                aria-hidden
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-gruen-50 font-bold text-gruen-800 tabular-nums"
              >
                {nr}
              </span>
              <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
                <h3 className="font-text text-18 font-bold tracking-normal">
                  <span className="sr-only">{t('stelle', { nr, anzahl })}: </span>
                  {e.titel}
                </h3>
                {e.beschreibung ? <p className="text-16 text-tinte-2">{e.beschreibung}</p> : null}
                {e.marke || (mitSichtbarkeit && !sichtbar) ? (
                  <span className="flex flex-wrap gap-2">
                    {e.marke ? <span className={cn(PILLE, 'bg-sand text-tinte-2')}>{e.marke}</span> : null}
                    {mitSichtbarkeit && !sichtbar ? (
                      <span className={cn(PILLE, 'bg-warnung-toenung text-warnung')}>{t('ausgeblendetMarke')}</span>
                    ) : null}
                  </span>
                ) : null}
              </div>
              {mitSichtbarkeit ? (
                <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
                  <input
                    type="checkbox"
                    checked={sichtbar}
                    onChange={(ev) => schalte(i, ev.target.checked)}
                    aria-label={t('sichtbarName', { name: e.titel })}
                    className="size-5.5 shrink-0 accent-gruen-700"
                  />
                  <span>{t('sichtbar')}</span>
                </label>
              ) : null}
              <div className="flex gap-2">
                <Button
                  id={kid(e.schluessel, 'oben')}
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={i === 0}
                  aria-label={t('nachOben', { name: e.titel })}
                  onClick={() => bewege(i, -1)}
                >
                  <ArrowUp aria-hidden />
                </Button>
                <Button
                  id={kid(e.schluessel, 'unten')}
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={i === liste.length - 1}
                  aria-label={t('nachUnten', { name: e.titel })}
                  onClick={() => bewege(i, 1)}
                >
                  <ArrowDown aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="sticky bottom-0 z-(--ebene-kopf) -mx-4 flex flex-wrap items-center gap-3 border-t border-linie bg-papier px-4 py-3 shadow-s2 md:mx-0 md:rounded-lg md:border">
        <Button type="submit" size="lg" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('speichert') : t('speichern')}
        </Button>
        <p className="text-16 text-tinte-2">{geaendert ? t('ungespeichert') : t('hinweis')}</p>
      </div>
    </form>
  );
}
