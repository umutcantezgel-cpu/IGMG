'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { cn } from '@/lib/utils';
import { speichereSpenden, type SpendenZustand } from '@/server/actions/einstellungen-spenden';

const ZWECKE = [0, 1, 2, 3] as const;
const SPRACHEN = ['Tr', 'En'] as const;

/**
 * Einstellungen › Spenden (MN-13): Empfänger, IBAN (Prüfziffer), BIC und bis zu vier Spendenzwecke mit Übersetzungen.
 * Leere Zweck-Zeilen entfallen beim Speichern. Fehler am Feld, Zusammenfassung oben, Fokus auf die Rückmeldung.
 */
export function SpendenFormular({ startwerte }: { startwerte: Record<string, string> }) {
  const t = useTranslations('verwaltung.spenden');
  const [zustand, absenden, laeuft] = useActionState<SpendenZustand, FormData>(speichereSpenden, {});
  const w = zustand.werte ?? startwerte;
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);

  const feld = (name: string, label: string, opt: { hinweis?: string; max?: number; bereich?: boolean; breit?: boolean } = {}) => (
    <div className={opt.breit ? 'md:col-span-2' : undefined}>
      <Rahmen
        id={id(name)}
        label={label}
        hinweis={opt.hinweis}
        fehler={f(name)}
        kinder={(aria) =>
          opt.bereich ? (
            <textarea {...aria} name={name} rows={2} defaultValue={w[name] ?? ''} maxLength={opt.max} className={cn(eingabe, 'py-2.5')} />
          ) : (
            <input {...aria} name={name} defaultValue={w[name] ?? ''} maxLength={opt.max} className={eingabe} />
          )
        }
      />
    </div>
  );
  const mitSprache = (label: string, s: 'Tr' | 'En') => t('feldSprache', { feld: label, sprache: t(`sprache.${s}`) });
  const fehlerListe = Object.keys(zustand.feldFehler ?? {});

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {f(k)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 font-display text-20 font-semibold">{t('abschnittBank')}</legend>
        {feld('empfaenger', t('empfaenger'), { hinweis: t('empfaengerHinweis'), max: 70, breit: true })}
        {feld('iban', t('iban'), { hinweis: t('ibanHinweis'), max: 42 })}
        {feld('bic', t('bic'), { hinweis: t('bicHinweis'), max: 14 })}
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-20 font-semibold">{t('abschnittZwecke')}</legend>
        <p className="text-16 text-tinte-2">{t('zweckeHinweis')}</p>
        {ZWECKE.map((i) => {
          const offen =
            i === 0 ||
            Boolean(w[`zweck${i}TitelDe`] || w[`zweck${i}Verwendungszweck`]) ||
            fehlerListe.some((k) => k.startsWith(`zweck${i}`));
          return (
            <details key={i} open={offen} className="rounded-md border border-linie p-4">
              <summary className="min-h-11 cursor-pointer font-bold">{t('zweck', { nr: i + 1 })}</summary>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {feld(`zweck${i}TitelDe`, t('titelFeld'), { max: 80 })}
                {feld(`zweck${i}Verwendungszweck`, t('verwendungszweck'), { hinweis: t('verwendungszweckHinweis'), max: 140 })}
                {feld(`zweck${i}BeschreibungDe`, t('beschreibung'), { max: 300, bereich: true, breit: true })}
                {SPRACHEN.map((s) => (
                  <div key={s} className="contents">
                    {feld(`zweck${i}Titel${s}`, mitSprache(t('titelFeld'), s), { max: 80 })}
                    {feld(`zweck${i}Beschreibung${s}`, mitSprache(t('beschreibung'), s), { max: 300, bereich: true })}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </fieldset>
      <Button type="submit" disabled={laeuft} className="self-start">
        <Save aria-hidden />
        {t('speichern')}
      </Button>
    </form>
  );
}
