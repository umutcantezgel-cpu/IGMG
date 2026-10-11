'use client';

import { ArrowDown, ArrowUp, CircleAlert, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bereinige, feldId, hatPlatzhalter, tausche, type Mehrsprachig } from './hilfen';

/** Fehler je Feldpfad aus dem letzten Speichern (Pfad wie `projekt.name.de`, Wert = Fehlerschlüssel). */
export const FehlerKontext = createContext<Record<string, string>>({});

const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler disabled:bg-sand';

/** Kennung, Fehlertext am Feld und ARIA-Attribute (aria-invalid, aria-describedby – K-07, K-11). */
function useFeld(pfad: string, hinweis: string | undefined, platzhalter: boolean) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const schluessel = useContext(FehlerKontext)[pfad];
  const id = feldId(pfad);
  const fehler = schluessel ? t(`fehler.${schluessel}`) : undefined;
  const beschreibung =
    [hinweis ? `${id}-hinweis` : null, platzhalter ? `${id}-platz` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') ||
    undefined;
  return { id, fehler, t, aria: { id, 'aria-invalid': fehler ? true : undefined, 'aria-describedby': beschreibung } };
}

type Feld = ReturnType<typeof useFeld>;

/** Beschriftung, Hinweis, Platzhalter-Hinweis und Fehler am Feld. Das Eingabefeld kommt als Kind. */
function Feldrahmen({
  feld,
  label,
  pflicht,
  hinweis,
  platzhalter,
  children,
}: {
  feld: Feld;
  label: string;
  pflicht?: boolean;
  hinweis?: string;
  platzhalter: boolean;
  children: ReactNode;
}) {
  const { id, fehler, t } = feld;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> ({t('pflichtfeld')})</span> : null}
      </label>
      {children}
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {platzhalter ? (
        <p id={`${id}-platz`} className="text-16 font-bold text-warnung">
          {t('platzhalterFeld')}
        </p>
      ) : null}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Abschnitt des Formulars: Überschrift und Felder in einer benannten Region. */
export function Abschnitt({ id, titel, children }: { id: string; titel: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-5 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <h2 id={`${id}-titel`} className="font-display text-24 font-semibold">
        {titel}
      </h2>
      {children}
    </section>
  );
}

/** Einzeiliges oder mehrzeiliges Textfeld (Klartext, kein Rich-Text). */
export function TextFeld({
  pfad,
  label,
  wert,
  onChange,
  pflicht = false,
  hinweis,
  zeilen,
  typ = 'text',
}: {
  pfad: string;
  label: string;
  wert: string;
  onChange: (neu: string) => void;
  pflicht?: boolean;
  hinweis?: string;
  zeilen?: number;
  typ?: 'text' | 'email' | 'tel';
}) {
  const platzhalter = hatPlatzhalter(wert);
  const feld = useFeld(pfad, hinweis, platzhalter);
  return (
    <Feldrahmen feld={feld} label={label} pflicht={pflicht} hinweis={hinweis} platzhalter={platzhalter}>
      {zeilen ? (
        <textarea
          {...feld.aria}
          rows={zeilen}
          value={wert}
          aria-required={pflicht || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(eingabe, 'py-2.5')}
        />
      ) : (
        <input
          {...feld.aria}
          type={typ}
          value={wert}
          aria-required={pflicht || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={eingabe}
        />
      )}
    </Feldrahmen>
  );
}

/** Ganze Zahl; leer heißt „keine Angabe“ (null). */
export function ZahlFeld({
  pfad,
  label,
  wert,
  onChange,
  min,
  max,
  hinweis,
}: {
  pfad: string;
  label: string;
  wert: number | null;
  onChange: (neu: number | null) => void;
  min?: number;
  max?: number;
  hinweis?: string;
}) {
  const feld = useFeld(pfad, hinweis, false);
  return (
    <Feldrahmen feld={feld} label={label} hinweis={hinweis} platzhalter={false}>
      <input
        {...feld.aria}
        type="number"
        inputMode="numeric"
        step={1}
        min={min}
        max={max}
        value={wert ?? ''}
        onChange={(e) => {
          const zahl = e.target.valueAsNumber;
          onChange(Number.isNaN(zahl) ? null : zahl);
        }}
        className={eingabe}
      />
    </Feldrahmen>
  );
}

/** Auswahl aus festen Werten (Schema-Enum); die Texte kommen aus den Nachrichten. */
export function AuswahlFeld<W extends string>({
  pfad,
  label,
  wert,
  onChange,
  optionen,
}: {
  pfad: string;
  label: string;
  wert: W;
  onChange: (neu: W) => void;
  optionen: readonly { wert: W; text: string }[];
}) {
  const feld = useFeld(pfad, undefined, false);
  return (
    <Feldrahmen feld={feld} label={label} platzhalter={false}>
      <select
        {...feld.aria}
        value={wert}
        onChange={(e) => {
          const gewaehlt = optionen.find((o) => o.wert === e.target.value);
          if (gewaehlt) onChange(gewaehlt.wert);
        }}
        className={eingabe}
      >
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert}>
            {o.text}
          </option>
        ))}
      </select>
    </Feldrahmen>
  );
}

/** Ja/Nein als Häkchen. */
export function SchalterFeld({
  pfad,
  label,
  wert,
  onChange,
}: {
  pfad: string;
  label: string;
  wert: boolean;
  onChange: (neu: boolean) => void;
}) {
  const feld = useFeld(pfad, undefined, false);
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
      <input id={feld.id} type="checkbox" checked={wert} onChange={(e) => onChange(e.target.checked)} className="size-6 accent-gruen-700" />
      {label}
    </label>
  );
}

/**
 * Mehrsprachiger Text (Muster 4, Schema `mehrsprachig`): Deutsch im Feld, Türkisch und Englisch in einem aufklappbaren
 * Abschnitt. Leere Übersetzungen entfallen aus dem Inhalt. Ist eine Übersetzung fehlerhaft, öffnet sich der Abschnitt.
 */
export function MehrsprachigFeld({
  pfad,
  label,
  wert,
  onChange,
  zeilen,
  pflicht = true,
  hinweis,
}: {
  pfad: string;
  label: string;
  wert: Mehrsprachig;
  onChange: (neu: Mehrsprachig) => void;
  zeilen?: number;
  pflicht?: boolean;
  hinweis?: string;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const fehlerKontext = useContext(FehlerKontext);
  const uebersetzungFehler = Boolean(fehlerKontext[`${pfad}.tr`] || fehlerKontext[`${pfad}.en`]);
  const details = useRef<HTMLDetailsElement>(null);
  // Beim ersten Anzeigen offen, wenn schon eine Übersetzung besteht; danach bestimmt die Nutzerin den Zustand selbst.
  const [anfangsOffen] = useState(() => Boolean(wert.tr || wert.en));
  useEffect(() => {
    if (uebersetzungFehler && details.current) details.current.open = true;
  }, [uebersetzungFehler]);
  return (
    <div className="flex flex-col gap-3">
      <TextFeld
        pfad={`${pfad}.de`}
        label={label}
        wert={wert.de}
        onChange={(de) => onChange(bereinige({ ...wert, de }))}
        pflicht={pflicht}
        hinweis={hinweis}
        zeilen={zeilen}
      />
      <details ref={details} open={anfangsOffen} className="rounded-md border border-linie bg-sand px-4 py-3">
        <summary className="inline-flex min-h-12 cursor-pointer items-center font-bold">{t('uebersetzungen')}</summary>
        <div className="mt-3 flex flex-col gap-4">
          <p className="text-16 text-tinte-2">{t('uebersetzungenHinweis')}</p>
          <TextFeld
            pfad={`${pfad}.tr`}
            label={`${label} (${t('sprache.tr')})`}
            wert={wert.tr ?? ''}
            onChange={(tr) => onChange(bereinige({ ...wert, tr }))}
            zeilen={zeilen}
          />
          <TextFeld
            pfad={`${pfad}.en`}
            label={`${label} (${t('sprache.en')})`}
            wert={wert.en ?? ''}
            onChange={(en) => onChange(bereinige({ ...wert, en }))}
            zeilen={zeilen}
          />
        </div>
      </details>
    </div>
  );
}

/**
 * Wiederholbare Gruppe (Muster „Eintrag hinzufügen/entfernen/nach oben/nach unten“). Die Einträge bleiben in der
 * Reihenfolge der Liste; der Fokus geht nach jeder Aktion auf den betroffenen Eintrag oder die Gruppe.
 */
export function Liste<T>({
  pfad,
  titel,
  eintraege,
  onChange,
  neu,
  maximal,
  renderEintrag,
  titelVerborgen,
}: {
  pfad: string;
  titel: string;
  /** Überschrift nur für Hilfstechnik, wenn sie den Abschnittstitel wiederholt (DP-C2 Befund 7). */
  titelVerborgen?: boolean;
  eintraege: readonly T[];
  onChange: (neue: T[]) => void;
  neu: () => T;
  maximal?: number;
  renderEintrag: (eintrag: T, index: number, aendern: (neu: T) => void) => ReactNode;
}) {
  const t = useTranslations('verwaltung.seiteninhalte');
  const id = feldId(pfad);
  const schluessel = useContext(FehlerKontext)[pfad];
  const fehler = schluessel ? t(`fehler.${schluessel}`) : undefined;
  const fokus = useRef<number | null>(null);
  useEffect(() => {
    if (fokus.current === null) return;
    document.getElementById(`${id}-${fokus.current}`)?.focus();
    fokus.current = null;
  });
  const voll = maximal !== undefined && eintraege.length >= maximal;
  const verschiebe = (von: number, nach: number) => {
    if (nach < 0 || nach >= eintraege.length) return;
    fokus.current = nach;
    onChange(tausche(eintraege, von, nach));
  };
  const entferne = (index: number) => {
    onChange(eintraege.filter((_, j) => j !== index));
    document.getElementById(id)?.focus();
  };
  const hinzu = () => {
    fokus.current = eintraege.length;
    onChange([...eintraege, neu()]);
  };
  return (
    <div
      role="group"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-titel`}
      aria-describedby={fehler ? `${id}-fehler` : undefined}
      className="flex flex-col gap-4"
    >
      <h3 id={`${id}-titel`} className={cn('font-bold', titelVerborgen && 'sr-only')}>
        {titel}
      </h3>
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
      {eintraege.length === 0 ? <p className="text-16 text-tinte-2">{t('keineEintraege')}</p> : null}
      <ol className="flex flex-col gap-4">
        {eintraege.map((eintrag, index) => {
          const nr = t('eintrag', { nr: index + 1 });
          return (
            <li key={index} id={`${id}-${index}`} tabIndex={-1} className="flex flex-col gap-4 rounded-md border border-linie bg-weiss p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold">{nr}</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={index === 0}
                    aria-label={`${t('nachOben')}: ${nr}`}
                    onClick={() => verschiebe(index, index - 1)}
                    className="max-sm:size-12 max-sm:px-0"
                  >
                    <ArrowUp aria-hidden />
                    <span className="max-sm:sr-only">{t('nachOben')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={index === eintraege.length - 1}
                    aria-label={`${t('nachUnten')}: ${nr}`}
                    onClick={() => verschiebe(index, index + 1)}
                    className="max-sm:size-12 max-sm:px-0"
                  >
                    <ArrowDown aria-hidden />
                    <span className="max-sm:sr-only">{t('nachUnten')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`${t('entfernen')}: ${nr}`}
                    onClick={() => entferne(index)}
                    className="max-sm:size-12 max-sm:px-0"
                  >
                    <Trash2 aria-hidden />
                    <span className="max-sm:sr-only">{t('entfernen')}</span>
                  </Button>
                </div>
              </div>
              {renderEintrag(eintrag, index, (geaendert) => onChange(eintraege.map((x, j) => (j === index ? geaendert : x))))}
            </li>
          );
        })}
      </ol>
      {voll ? (
        <p className="text-16 text-tinte-2">{t('maximal', { anzahl: maximal ?? 0 })}</p>
      ) : (
        <div>
          <Button type="button" variant="outline" onClick={hinzu}>
            <Plus aria-hidden />
            {t('hinzufuegen')}
          </Button>
        </div>
      )}
    </div>
  );
}
