'use client';

import { Check, RotateCcw, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import type { KoranZustand } from '@/server/actions/koran';

export type KoranAktion = (vorher: KoranZustand, fd: FormData) => Promise<KoranZustand>;

/**
 * Gemeinsamer Zustand der Formulare im Modul „Koran & Hadith“: Action-Zustand, Rückmeldung mit Fokus (K-07, K-11),
 * Startwerte aus dem letzten Ergebnis (ungesteuerte Felder) und Fehlertexte je Feld.
 */
export function useKoranFormular(aktion: KoranAktion, startwerte: Record<string, string> = {}) {
  const t = useTranslations('verwaltung.koran');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const meldungRef = useRef<HTMLDivElement>(null);
  const basis = useId();

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  const werte = (zustand.fehler ? zustand.werte : undefined) as Record<string, unknown> | undefined;
  const wert = (feld: string) => {
    const w = werte?.[feld] ?? startwerte[feld];
    return typeof w === 'string' ? w : '';
  };
  const fehler = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const id = (feld: string) => `${basis}-${feld}`;

  const rueckmeldung = (
    <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
      {zustand.fehler ? (
        <Meldung art="fehler">
          <p>{t(`fehler.${zustand.fehler}`)}</p>
        </Meldung>
      ) : zustand.gespeichert ? (
        <Meldung art="erfolg">
          {zustand.status ? t('gespeichertStatus', { status: t(`status.${zustand.status}`) }) : t('gespeichert')}
        </Meldung>
      ) : null}
    </div>
  );
  return { t, zustand, absenden, laeuft, wert, fehler, id, rueckmeldung, pflicht: tv('pflichtfeld') };
}

/** Einzeiliges Textfeld mit Beschriftung, Hinweis und Fehler am Feld. */
export function TextFeld({
  id,
  name,
  label,
  wert,
  fehler,
  hinweis,
  pflicht,
  max,
  lang,
  dir,
}: {
  id: string;
  name: string;
  label: string;
  wert: string;
  fehler?: string;
  hinweis?: string;
  pflicht?: string;
  max?: number;
  lang?: string;
  dir?: 'rtl';
}) {
  return (
    <Rahmen
      id={id}
      label={label}
      hinweis={hinweis}
      fehler={fehler}
      pflicht={pflicht}
      kinder={(aria) => (
        <input
          {...aria}
          name={name}
          defaultValue={wert}
          maxLength={max}
          required={Boolean(pflicht)}
          lang={lang}
          dir={dir}
          className={cn(eingabe, dir === 'rtl' && 'font-arabic text-20')}
        />
      )}
    />
  );
}

/** Mehrzeiliges Textfeld. */
export function TextBereich({
  id,
  name,
  label,
  wert,
  fehler,
  hinweis,
  pflicht,
  zeilen = 3,
  max,
  lang,
}: {
  id: string;
  name: string;
  label: string;
  wert: string;
  fehler?: string;
  hinweis?: string;
  pflicht?: string;
  zeilen?: number;
  max?: number;
  lang?: string;
}) {
  return (
    <Rahmen
      id={id}
      label={label}
      hinweis={hinweis}
      fehler={fehler}
      pflicht={pflicht}
      kinder={(aria) => (
        <textarea
          {...aria}
          name={name}
          defaultValue={wert}
          rows={zeilen}
          maxLength={max}
          required={Boolean(pflicht)}
          lang={lang}
          className={cn(eingabe, 'py-2.5')}
        />
      )}
    />
  );
}

/** Speichern und „Speichern und zur Prüfung geben“ (Feld `einreichen=1` über den gedrückten Knopf). */
export function SpeicherKnoepfe({ laeuft, einreichen = true }: { laeuft: boolean; einreichen?: boolean }) {
  const t = useTranslations('verwaltung.koran');
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" variant="secondary" disabled={laeuft}>
        {laeuft ? t('laeuft') : t('aktion.speichern')}
      </Button>
      {einreichen ? (
        <Button type="submit" name="einreichen" value="1" disabled={laeuft}>
          {t('aktion.speichernEinreichen')}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Kleines Formular für einen Schritt (Status, Ausgabe, Listeneintrag, Löschen): versteckte Felder, optional Grund,
 * Bestätigung oder ein Eingabefeld, ein Knopf. Mit `aufklappen` steht es hinter einer Zusammenfassung (Rückfrage).
 * Der Server prüft Recht und Eingabe erneut.
 */
export function AktionsFormular({
  aktion,
  felder,
  knopf,
  knopfAria,
  symbol,
  variante = 'default',
  grund = false,
  bestaetigen,
  eingabeFeld,
  frage,
  aufklappen,
  nurSymbol = false,
}: {
  aktion: KoranAktion;
  felder: Record<string, string>;
  knopf: string;
  knopfAria?: string;
  symbol?: ReactNode;
  variante?: 'default' | 'secondary' | 'outline' | 'destructive';
  grund?: boolean;
  bestaetigen?: string;
  eingabeFeld?: { name: string; label: string; hinweis?: string; max?: number };
  frage?: string;
  aufklappen?: string;
  nurSymbol?: boolean;
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung } = useKoranFormular(aktion);
  const inhalt = (
    <form action={absenden} className={cn('flex flex-col gap-3', nurSymbol && 'gap-1')} noValidate>
      {rueckmeldung}
      {Object.entries(felder).map(([name, w]) => (
        <input key={name} type="hidden" name={name} value={w} />
      ))}
      {frage ? <p className="text-16 text-tinte-2">{frage}</p> : null}
      {eingabeFeld ? (
        <TextFeld
          id={id(eingabeFeld.name)}
          name={eingabeFeld.name}
          label={eingabeFeld.label}
          hinweis={eingabeFeld.hinweis}
          wert={wert(eingabeFeld.name)}
          fehler={fehler(eingabeFeld.name)}
          max={eingabeFeld.max}
        />
      ) : null}
      {grund ? (
        <TextBereich
          id={id('grund')}
          name="grund"
          label={t('aktion.grund')}
          hinweis={t('aktion.grundHinweis')}
          wert={wert('grund')}
          fehler={fehler('grund')}
          zeilen={2}
          max={300}
        />
      ) : null}
      {bestaetigen ? (
        <div className="flex flex-col gap-1.5">
          <label className="flex min-h-12 cursor-pointer items-start gap-3 py-2 text-16">
            <input
              type="checkbox"
              name="bestaetigt"
              aria-invalid={fehler('bestaetigt') ? true : undefined}
              aria-describedby={fehler('bestaetigt') ? id('bestaetigt-fehler') : undefined}
              className="mt-0.5 size-6 shrink-0 accent-gruen-700"
            />
            <span>{bestaetigen}</span>
          </label>
          {fehler('bestaetigt') ? (
            <p id={id('bestaetigt-fehler')} className="text-16 font-bold text-fehler">
              {fehler('bestaetigt')}
            </p>
          ) : null}
        </div>
      ) : null}
      <Button
        type="submit"
        variant={variante}
        size={nurSymbol ? 'icon' : 'default'}
        disabled={laeuft}
        aria-label={knopfAria}
        className="self-start"
      >
        {symbol}
        {nurSymbol ? <span className="sr-only">{knopf}</span> : laeuft ? t('laeuft') : knopf}
      </Button>
    </form>
  );
  if (!aufklappen) return inhalt;
  return (
    <details className="group rounded-md border border-linie bg-papier">
      <summary className="flex min-h-12 cursor-pointer items-center px-4 font-bold text-tinte marker:text-tinte-2">{aufklappen}</summary>
      <div className="border-t border-linie p-4">{inhalt}</div>
    </details>
  );
}

/**
 * Schritte im Freigabe-Ablauf mit einem gemeinsamen Zustand: Die Rückmeldung bleibt stehen, auch wenn nach dem
 * Statuswechsel ein anderer Knopf erscheint (einreichen → freigeben → aufheben). Welche Schritte erscheinen,
 * entscheidet die Seite nach Recht und Vier-Augen-Prinzip; der Server prüft alles erneut.
 */
export function FreigabeSchritte({
  aktion,
  art,
  kennung,
  status,
  eigen,
  darfBearbeiten,
  darfFreigeben,
}: {
  aktion: KoranAktion;
  art: string;
  kennung: string;
  status: 'entwurf' | 'zur_pruefung' | 'geprueft';
  eigen: boolean;
  darfBearbeiten: boolean;
  darfFreigeben: boolean;
}) {
  const { t, absenden, laeuft, wert, fehler, id, rueckmeldung } = useKoranFormular(aktion);
  const versteckt = (ziel: string) => (
    <>
      <input type="hidden" name="art" value={art} />
      <input type="hidden" name="kennung" value={kennung} />
      <input type="hidden" name="ziel" value={ziel} />
    </>
  );
  const schritt = (ziel: string, knopf: string, symbol: ReactNode, variante: 'default' | 'secondary') => (
    <form action={absenden}>
      {versteckt(ziel)}
      <Button type="submit" variant={variante} disabled={laeuft}>
        {symbol}
        {laeuft ? t('laeuft') : knopf}
      </Button>
    </form>
  );
  const vorwaerts = (status === 'entwurf' && darfBearbeiten) || (status === 'zur_pruefung' && darfFreigeben && !eigen);
  return (
    <div className="flex flex-col gap-3">
      {rueckmeldung}
      {status === 'zur_pruefung' && eigen && darfFreigeben ? <p className="text-16 font-bold text-warnung">{t('eigen')}</p> : null}
      {vorwaerts ? (
        <div className="flex flex-wrap items-start gap-3">
          {status === 'entwurf' ? schritt('zur_pruefung', t('aktion.einreichen'), <Send aria-hidden />, 'secondary') : null}
          {status === 'zur_pruefung' ? schritt('geprueft', t('aktion.freigeben'), <Check aria-hidden />, 'default') : null}
        </div>
      ) : null}
      {status !== 'entwurf' && darfFreigeben ? (
        <details className="rounded-md border border-linie bg-papier">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 font-bold text-tinte marker:text-tinte-2">
            {status === 'geprueft' ? t('aktion.aufhebenOeffnen') : t('aktion.zurueckweisenOeffnen')}
          </summary>
          <form action={absenden} className="flex flex-col gap-3 border-t border-linie p-4" noValidate>
            {versteckt('entwurf')}
            <TextBereich
              id={id('grund')}
              name="grund"
              label={t('aktion.grund')}
              hinweis={t('aktion.grundHinweis')}
              wert={wert('grund')}
              fehler={fehler('grund')}
              zeilen={2}
              max={300}
            />
            <Button type="submit" variant="outline" disabled={laeuft} className="self-start">
              <RotateCcw aria-hidden />
              {laeuft ? t('laeuft') : status === 'geprueft' ? t('aktion.aufheben') : t('aktion.zurueckweisen')}
            </Button>
          </form>
        </details>
      ) : null}
    </div>
  );
}
