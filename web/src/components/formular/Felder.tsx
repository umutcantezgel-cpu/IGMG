import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Formularfelder öffentlicher Formulare (K-07, K-11, design/BaseComponents.dc.html, FormWizard.dc.html):
 * Server-Komponenten (E-028) – die Action rendert sie nach dem Absenden mit Werten und Fehlern neu.
 * Beschriftung über dem Feld, Hinweis und Fehler am Feld (aria-describedby, aria-invalid), Ziele ≥ 48 px.
 * Feste IDs (`feldId`), damit die Fehler-Zusammenfassung auf das Feld springen kann.
 */
const EINGABE =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler focus-visible:border-2 focus-visible:border-gruen-700';

export const feldId = (name: string) => `feld-${name}`;

type Basis = { name: string; label: ReactNode; hinweis?: ReactNode; fehler?: string; pflicht?: string; className?: string };

function Fehler({ id, text }: { id: string; text: string }) {
  return (
    <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <span>{text}</span>
    </p>
  );
}

function Rahmen({
  label,
  hinweis,
  fehler,
  pflicht,
  className,
  name,
  kinder,
}: Basis & { kinder: (aria: Record<string, unknown>) => ReactNode }) {
  const id = feldId(name);
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-16 font-bold">
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> {pflicht}</span> : null}
      </label>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="max-w-text text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {kinder({ id, 'aria-invalid': fehler ? true : undefined, 'aria-describedby': beschreibung })}
      {fehler ? <Fehler id={id} text={fehler} /> : null}
    </div>
  );
}

export function FeldText({
  wert,
  typ = 'text',
  autoComplete,
  maxLaenge,
  platzhalter,
  ...b
}: Basis & {
  wert?: string;
  typ?: 'text' | 'email' | 'tel' | 'number' | 'date';
  autoComplete?: string;
  maxLaenge?: number;
  platzhalter?: string;
}) {
  return (
    <Rahmen
      {...b}
      kinder={(aria) => (
        <input
          {...aria}
          name={b.name}
          type={typ}
          defaultValue={wert}
          required={Boolean(b.pflicht)}
          autoComplete={autoComplete}
          maxLength={maxLaenge}
          placeholder={platzhalter}
          className={EINGABE}
        />
      )}
    />
  );
}

export function FeldBereich({
  wert,
  zeilen = 5,
  maxLaenge,
  platzhalter,
  ...b
}: Basis & { wert?: string; zeilen?: number; maxLaenge?: number; platzhalter?: string }) {
  return (
    <Rahmen
      {...b}
      kinder={(aria) => (
        <textarea
          {...aria}
          name={b.name}
          rows={zeilen}
          defaultValue={wert}
          required={Boolean(b.pflicht)}
          maxLength={maxLaenge}
          placeholder={platzhalter}
          className={cn(EINGABE, 'py-2.5')}
        />
      )}
    />
  );
}

export function FeldAuswahl({
  wert,
  optionen,
  leer,
  ...b
}: Basis & { wert?: string; optionen: { wert: string; label: string }[]; leer?: string }) {
  return (
    <Rahmen
      {...b}
      kinder={(aria) => (
        <select {...aria} name={b.name} defaultValue={wert ?? ''} required={Boolean(b.pflicht)} className={EINGABE}>
          {leer !== undefined ? <option value="">{leer}</option> : null}
          {optionen.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    />
  );
}

/** Einwilligung (Pflicht-Häkchen): Text wörtlich wie gespeichert (Textversion), Link zur Datenschutzerklärung. */
export function FeldEinwilligung({
  name,
  text,
  link,
  fehler,
  wert,
}: {
  name: string;
  text: string;
  link?: { href: string; label: string };
  fehler?: string;
  wert?: boolean;
}) {
  const id = feldId(name);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          name={name}
          value="ja"
          defaultChecked={wert}
          required
          aria-invalid={fehler ? true : undefined}
          aria-describedby={fehler ? `${id}-fehler` : undefined}
          className="mt-0.5 size-6 shrink-0 accent-gruen-700"
        />
        <label htmlFor={id} className="ohne-silbentrennung max-w-text text-16">
          {text}
          {link ? (
            <>
              {' '}
              <a href={link.href} className="font-bold underline underline-offset-2">
                {link.label}
              </a>
            </>
          ) : null}
        </label>
      </div>
      {fehler ? <Fehler id={id} text={fehler} /> : null}
    </div>
  );
}

type Option = { wert: string; label: string; beschreibung?: string };

/**
 * Auswahl als Karten (FormWizard.dc.html: Radio und Mehrfachauswahl): `fieldset` mit `legend`, gewählte Karte grün
 * (`has-checked`, ohne JavaScript). Radio: eine Wahl; Checkbox: mehrere Werte unter demselben Namen.
 */
export function FeldOptionen({
  name,
  label,
  typ,
  optionen,
  wert,
  hinweis,
  fehler,
  pflicht,
  spaltenMin = 'sm:raster-kacheln',
  kompakt = false,
}: {
  name: string;
  label: ReactNode;
  typ: 'radio' | 'checkbox';
  optionen: Option[];
  wert?: string | string[];
  hinweis?: ReactNode;
  fehler?: string;
  pflicht?: string;
  /** Tailwind-Klasse für die Spaltenbreite der Karten */
  spaltenMin?: string;
  /** Karten nur so breit wie ihr Inhalt, nebeneinander (z. B. Ja/Nein, DP-B-03) */
  kompakt?: boolean;
}) {
  const id = feldId(name);
  const gewaehlt = new Set(Array.isArray(wert) ? wert : wert ? [wert] : []);
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset
      aria-describedby={beschreibung}
      aria-invalid={fehler ? true : undefined}
      className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0"
    >
      <legend className="mb-2 p-0 text-16 font-bold">
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> {pflicht}</span> : null}
      </legend>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="max-w-text text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      <div className={kompakt ? 'flex flex-wrap gap-2' : cn('grid gap-2', spaltenMin)}>
        {optionen.map((o, i) => (
          <label
            key={o.wert}
            className={cn(
              'flex min-h-14 cursor-pointer items-start gap-3 rounded-md border bg-weiss px-3.5 py-3 has-checked:border-2 has-checked:border-gruen-700 has-checked:bg-gruen-50',
              fehler ? 'border-2 border-fehler' : 'border-rand',
              kompakt && 'px-4.5',
            )}
          >
            <input
              id={i === 0 ? id : undefined}
              type={typ}
              name={name}
              value={o.wert}
              defaultChecked={gewaehlt.has(o.wert)}
              className="mt-0.5 size-5.5 shrink-0 accent-gruen-700"
            />
            <span className="flex flex-col leading-snug">
              <strong>{o.label}</strong>
              {o.beschreibung ? <span className="text-16 text-tinte-2">{o.beschreibung}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {fehler ? <Fehler id={id} text={fehler} /> : null}
    </fieldset>
  );
}

/** Einzelnes Häkchen als Karte (FormWizard.dc.html „isCheck“), z. B. Newsletter oder Einwilligung mit Erläuterung. */
export function FeldHaken({
  name,
  label,
  beschreibung,
  wert,
  fehler,
  pflicht,
}: {
  name: string;
  label: ReactNode;
  beschreibung?: ReactNode;
  wert?: boolean;
  fehler?: string;
  pflicht?: string;
}) {
  const id = feldId(name);
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn(
          'flex min-h-14 cursor-pointer items-start gap-3 rounded-md border bg-weiss px-3.5 py-3 has-checked:bg-gruen-50',
          fehler ? 'border-2 border-fehler' : 'border-rand',
        )}
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          value="ja"
          defaultChecked={wert}
          required={Boolean(pflicht)}
          aria-invalid={fehler ? true : undefined}
          aria-describedby={fehler ? `${id}-fehler` : undefined}
          className="mt-0.5 size-5.5 shrink-0 accent-gruen-700"
        />
        <span className="flex flex-col leading-normal">
          <span>
            {label}
            {pflicht ? <span className="text-tinte-2"> {pflicht}</span> : null}
          </span>
          {beschreibung ? <span className="text-16 text-tinte-2">{beschreibung}</span> : null}
        </span>
      </label>
      {fehler ? <Fehler id={id} text={fehler} /> : null}
    </div>
  );
}

/** Honigtopf gegen Bots (ADR 0005): außerhalb des Sichtbereichs, nicht fokussierbar, ohne Autovervollständigung. */
export function Honigtopf({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-full h-px w-px overflow-hidden">
      <label>
        {label}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
