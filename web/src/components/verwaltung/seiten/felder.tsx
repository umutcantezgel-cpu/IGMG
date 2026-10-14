'use client';

import type { ReactNode } from 'react';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { cn } from '@/lib/utils';

/**
 * Gesteuerte Eingabefelder des Seiten- und Menü-Editors (Zustand im Editor, nicht im Formular). Beschriftung, Hinweis
 * und Fehler wie bei allen Verwaltungsformularen (`Rahmen`, K-07, K-11): 48 px hoch, Fehler über aria-describedby.
 */
type Basis = {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: string;
  pflicht?: string;
  lang?: string;
};

export function TextFeld({
  wert,
  aendern,
  max,
  platzhalter,
  ...b
}: Basis & { wert: string; aendern: (v: string) => void; max?: number; platzhalter?: string }) {
  return (
    <Rahmen
      id={b.id}
      label={b.label}
      hinweis={b.hinweis}
      fehler={b.fehler}
      pflicht={b.pflicht}
      kinder={(aria) => (
        <input
          {...aria}
          type="text"
          lang={b.lang}
          value={wert}
          maxLength={max}
          placeholder={platzhalter}
          onChange={(e) => aendern(e.target.value)}
          className={eingabe}
        />
      )}
    />
  );
}

export function BereichFeld({
  wert,
  aendern,
  max,
  zeilen = 4,
  ...b
}: Basis & { wert: string; aendern: (v: string) => void; max?: number; zeilen?: number }) {
  return (
    <Rahmen
      id={b.id}
      label={b.label}
      hinweis={b.hinweis}
      fehler={b.fehler}
      pflicht={b.pflicht}
      kinder={(aria) => (
        <textarea
          {...aria}
          lang={b.lang}
          rows={zeilen}
          value={wert}
          maxLength={max}
          onChange={(e) => aendern(e.target.value)}
          // Wächst mit dem Inhalt, mindestens drei Zeilen (SB-1); ohne field-sizing gilt `rows`
          className={cn(eingabe, 'field-sizing-content min-h-[calc(3lh+1.25rem+0.125rem)] py-2.5')}
        />
      )}
    />
  );
}

export function AuswahlFeld({
  wert,
  aendern,
  optionen,
  gruppen,
  ...b
}: Basis & {
  wert: string;
  aendern: (v: string) => void;
  optionen?: { wert: string; label: string }[];
  gruppen?: { label: string; optionen: { wert: string; label: string }[] }[];
}) {
  return (
    <Rahmen
      id={b.id}
      label={b.label}
      hinweis={b.hinweis}
      fehler={b.fehler}
      pflicht={b.pflicht}
      kinder={(aria) => (
        <select {...aria} value={wert} onChange={(e) => aendern(e.target.value)} className={eingabe}>
          {optionen?.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
          {gruppen?.map((g) =>
            g.optionen.length ? (
              <optgroup key={g.label} label={g.label}>
                {g.optionen.map((o) => (
                  <option key={o.wert} value={o.wert}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
      )}
    />
  );
}

export function ZahlFeld({
  wert,
  aendern,
  min,
  max,
  ...b
}: Basis & { wert: number; aendern: (v: number) => void; min: number; max: number }) {
  return (
    <Rahmen
      id={b.id}
      label={b.label}
      hinweis={b.hinweis}
      fehler={b.fehler}
      pflicht={b.pflicht}
      kinder={(aria) => (
        <input
          {...aria}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(wert) ? wert : ''}
          onChange={(e) => aendern(e.target.value === '' ? Number.NaN : Number(e.target.value))}
          className={eingabe}
        />
      )}
    />
  );
}

export function SchalterFeld({
  id,
  label,
  wert,
  aendern,
  hinweis,
}: {
  id: string;
  label: ReactNode;
  wert: boolean;
  aendern: (v: boolean) => void;
  hinweis?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
        <input
          id={id}
          type="checkbox"
          checked={wert}
          onChange={(e) => aendern(e.target.checked)}
          aria-describedby={hinweis ? `${id}-hinweis` : undefined}
          className="size-6 accent-gruen-700"
        />
        {label}
      </label>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
    </div>
  );
}
