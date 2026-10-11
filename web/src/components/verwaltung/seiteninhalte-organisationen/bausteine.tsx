'use client';

import { ArrowDown, ArrowUp, CircleAlert, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { SpeicherZustand } from '@/server/actions/seiteninhalte-organisationen';
import type { Fehlerschluessel } from './bereiche';
import { feldId, type MehrText } from './formwerte';
import type { Eintrag, Liste } from './liste';

/** Speicheraktion: Zustand und FormData → neuer Zustand (Server Action). */
export type Aktion = (vorher: SpeicherZustand, fd: FormData) => Promise<SpeicherZustand>;

const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-fehler aria-invalid:border-2 disabled:bg-sand';

/** Abschnitt mit Legende (wie im Verwaltungsformular Veranstaltungen). */
export function Abschnitt({ titel, kinder, spalten = true }: { titel: string; kinder: ReactNode; spalten?: boolean }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className={cn('clear-both grid gap-4', spalten && 'md:grid-cols-2')}>{kinder}</div>
    </fieldset>
  );
}

/** Rahmen eines Feldes: Beschriftung, Hinweis, Fehler am Feld (aria-invalid, aria-describedby; K-07, K-11). */
function Rahmen({
  id,
  label,
  hinweis,
  fehler,
  breit,
  kinder,
}: {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: string;
  breit?: boolean;
  kinder: (aria: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}) {
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', breit && 'md:col-span-2')}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {kinder({ id, ...(fehler ? { 'aria-invalid': true as const } : {}), 'aria-describedby': beschreibung })}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Einzeiliges Feld oder (mit `zeilen`) mehrzeiliges Feld; der Fehler kommt aus dem Server über den Pfad. */
export function TextFeld({
  pfad,
  label,
  hinweis,
  wert,
  onChange,
  feldFehler,
  zeilen,
  max,
  typ = 'text',
  inputMode,
  breit,
}: {
  pfad: string;
  label: string;
  hinweis?: string;
  wert: string;
  onChange: (wert: string) => void;
  feldFehler?: Record<string, Fehlerschluessel>;
  zeilen?: number;
  max?: number;
  typ?: 'text' | 'url' | 'email' | 'tel' | 'time';
  inputMode?: 'decimal';
  breit?: boolean;
}) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const schluessel = feldFehler?.[pfad];
  return (
    <Rahmen
      id={feldId(pfad)}
      label={label}
      hinweis={hinweis}
      fehler={schluessel ? t(`fehler.${schluessel}`) : undefined}
      breit={breit}
      kinder={(aria) =>
        zeilen ? (
          <textarea
            {...aria}
            rows={zeilen}
            value={wert}
            maxLength={max}
            onChange={(e) => onChange(e.target.value)}
            className={cn(eingabe, 'py-2.5')}
          />
        ) : (
          <input
            {...aria}
            type={typ}
            inputMode={inputMode}
            value={wert}
            maxLength={max}
            onChange={(e) => onChange(e.target.value)}
            className={eingabe}
          />
        )
      }
    />
  );
}

/** Auswahlfeld (Auswahlliste) mit Fehler am Feld; die Werte sind Schlüssel des Schemas. */
export function AuswahlFeld({
  pfad,
  label,
  wert,
  onChange,
  optionen,
  feldFehler,
}: {
  pfad: string;
  label: string;
  wert: string;
  onChange: (wert: string) => void;
  optionen: { wert: string; label: string }[];
  feldFehler?: Record<string, Fehlerschluessel>;
}) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const schluessel = feldFehler?.[pfad];
  return (
    <Rahmen
      id={feldId(pfad)}
      label={label}
      fehler={schluessel ? t(`fehler.${schluessel}`) : undefined}
      kinder={(aria) => (
        <select {...aria} value={wert} onChange={(e) => onChange(e.target.value)} className={eingabe}>
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

/** Mehrsprachiger Text: Deutsch Pflicht; Türkisch und Englisch aufklappbar (optional, Rückfall auf Deutsch). */
export function MehrsprachigFeld({
  pfad,
  label,
  hinweis,
  wert,
  onChange,
  feldFehler,
  zeilen,
  max,
}: {
  pfad: string;
  label: string;
  hinweis?: string;
  wert: MehrText;
  onChange: (wert: MehrText) => void;
  feldFehler?: Record<string, Fehlerschluessel>;
  zeilen?: number;
  max: number;
}) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  // Ist eine Übersetzung befüllt oder fehlerhaft, bleibt der Abschnitt offen (Fehler sind sonst nicht erreichbar)
  const offen = Boolean(wert.tr || wert.en || feldFehler?.[`${pfad}.tr`] || feldFehler?.[`${pfad}.en`]);
  return (
    <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
      <TextFeld
        pfad={`${pfad}.de`}
        label={`${label} ${t('pflichtfeld')}`}
        hinweis={hinweis}
        wert={wert.de}
        onChange={(de) => onChange({ ...wert, de })}
        feldFehler={feldFehler}
        zeilen={zeilen}
        max={max}
      />
      <details className="rounded-md border border-linie p-4" open={offen}>
        <summary className="flex min-h-12 cursor-pointer items-center font-bold">
          {t('uebersetzungen.aufklappenVon', { feld: label })}
        </summary>
        <div className="mt-3 flex flex-col gap-4">
          <p className="text-16 text-tinte-2">{t('uebersetzungen.hinweis')}</p>
          <TextFeld
            pfad={`${pfad}.tr`}
            label={t('uebersetzungen.tr', { feld: label })}
            wert={wert.tr}
            onChange={(tr) => onChange({ ...wert, tr })}
            feldFehler={feldFehler}
            zeilen={zeilen}
            max={max}
          />
          <TextFeld
            pfad={`${pfad}.en`}
            label={t('uebersetzungen.en', { feld: label })}
            wert={wert.en}
            onChange={(en) => onChange({ ...wert, en })}
            feldFehler={feldFehler}
            zeilen={zeilen}
            max={max}
          />
        </div>
      </details>
    </div>
  );
}

/**
 * Wiederholbare Gruppe mit Eintrag hinzufügen, entfernen, nach oben und nach unten (Schaltflächen mit Namen
 * „Aktion: Eintrag“). Die Einträge tragen ihren Pfad (`listenPfad.N`) für Feldnamen und Fehler.
 */
export function Reihe<T>({
  titel,
  gruppe,
  liste,
  listenPfad,
  hinzufuegen,
  hinweis,
  renderEintrag,
}: {
  titel: string;
  gruppe: string;
  liste: Liste<T>;
  listenPfad: string;
  hinzufuegen: string;
  hinweis?: string;
  renderEintrag: (eintrag: Eintrag<T>, pfad: string) => ReactNode;
}) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const listeRef = useRef<HTMLOListElement>(null);
  const hinzuRef = useRef<HTMLButtonElement>(null);
  const { fokus } = liste;

  // Nach jeder Bedienung Fokus setzen: den Eintrag, oder bei leerem Ziel die Schaltfläche „hinzufügen“
  useEffect(() => {
    if (!fokus) return;
    const ziel = fokus.k ? listeRef.current?.querySelector<HTMLElement>(`[data-k="${fokus.k}"]`) : hinzuRef.current;
    ziel?.focus();
  }, [fokus]);

  const voll = liste.hoechstens !== undefined && liste.eintraege.length >= liste.hoechstens;
  const letzter = liste.eintraege.length - 1;
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both flex flex-col gap-4">
        {hinweis ? <p className="text-16 text-tinte-2">{hinweis}</p> : null}
        {liste.eintraege.length === 0 ? <p className="text-tinte-2">{t('reihe.leer')}</p> : null}
        <ol ref={listeRef} className="flex flex-col gap-4">
          {liste.eintraege.map((e, i) => {
            const name = `${gruppe} ${i + 1}`;
            return (
              <li key={e.k} data-k={e.k} tabIndex={-1} className="flex min-w-0 flex-col gap-4 rounded-md border border-linie p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{name}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === 0}
                      aria-label={t('reihe.nachOben', { name })}
                      onClick={() => liste.verschiebe(e.k, -1)}
                    >
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === letzter}
                      aria-label={t('reihe.nachUnten', { name })}
                      onClick={() => liste.verschiebe(e.k, 1)}
                    >
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler"
                      aria-label={t('reihe.entfernen', { name })}
                      onClick={() => liste.entferne(e.k)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
                {renderEintrag(e, `${listenPfad}.${i}`)}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" ref={hinzuRef} disabled={voll} onClick={liste.hinzu}>
            <Plus aria-hidden />
            {hinzufuegen}
          </Button>
          {voll ? <p className="text-16 text-tinte-2">{t('reihe.hoechstens', { anzahl: liste.hoechstens ?? 0 })}</p> : null}
        </div>
      </div>
    </fieldset>
  );
}

/** Pfad → lesbare Bezeichnung für die Fehlerzusammenfassung, z. B. „Öffnungszeit 1, Tage, Deutsch“. */
function Pfadbezeichnung({ pfad }: { pfad: string }) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const namen: string[] = [];
  const teile = pfad.split('.');
  teile.forEach((teil, i) => {
    if (/^\d+$/.test(teil)) {
      const gruppe = teile[i - 1] ?? '';
      const gruppenName = t.has(`gruppe.${gruppe}`) ? t(`gruppe.${gruppe}` as never) : gruppe;
      namen[namen.length - 1] = `${gruppenName} ${Number(teil) + 1}`;
    } else if (teil === 'de' || teil === 'tr' || teil === 'en') {
      namen.push(t(`sprache.${teil}` as never));
    } else {
      namen.push(t.has(`feld.${teil}`) ? t(`feld.${teil}` as never) : teil);
    }
  });
  return <>{namen.join(', ')}</>;
}

/** Rückmeldung nach dem Absenden: Fehlerzusammenfassung mit Sprungverweisen oder Bestätigung; Fokus darauf (K-07). */
export function Rueckmeldung({ zustand }: { zustand: SpeicherZustand }) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) ref.current?.focus();
  }, [zustand]);
  const feldFehler = Object.entries(zustand.feldFehler ?? {});
  return (
    <div ref={ref} tabIndex={-1}>
      {zustand.fehler ? (
        <Meldung art="fehler">
          <p>{t(`fehler.${zustand.fehler}`)}</p>
          {feldFehler.length ? (
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 font-normal">
              {feldFehler.map(([pfad, schluessel]) => (
                <li key={pfad}>
                  <a href={`#${feldId(pfad)}`} className="text-fehler underline underline-offset-4">
                    <Pfadbezeichnung pfad={pfad} />
                  </a>
                  : {t(`fehler.${schluessel}`)}
                </li>
              ))}
            </ul>
          ) : null}
        </Meldung>
      ) : zustand.gespeichert ? (
        <Meldung art="erfolg">{t('gespeichert')}</Meldung>
      ) : null}
    </div>
  );
}

/** Hinweise über dem Formular: Beispielangaben, unlesbarer Inhalt, verbleibende Platzhalter (G-05). */
export function Hinweise({ beispiel, unlesbar, platzhalter }: { beispiel: boolean; unlesbar: boolean; platzhalter: boolean }) {
  const t = useTranslations('verwaltung.seiteninhalteOrganisationen');
  return (
    <>
      {unlesbar ? (
        <Meldung art="info">{t('unlesbar')}</Meldung>
      ) : beispiel ? (
        <Meldung art="info">
          <span>{t('beispiel.titel')}. </span>
          <span className="font-normal">{t('beispiel.text')}</span>
        </Meldung>
      ) : null}
      {platzhalter ? (
        <Meldung art="info">
          <span>{t('platzhalter.titel')}. </span>
          <span className="font-normal">{t('platzhalter.text')}</span>
        </Meldung>
      ) : null}
    </>
  );
}
