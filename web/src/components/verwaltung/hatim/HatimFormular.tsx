'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { HatimZustand } from '@/server/actions/hatim';

type Aktion = (vorher: HatimZustand, fd: FormData) => Promise<HatimZustand>;
const SPRACHEN = ['Tr', 'En'] as const;

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/**
 * Formular „Hatim“ (AUFTRAG 3.10): Titel und Anlass (Deutsch, Übersetzungen aufklappbar), Beginn und geplante
 * Vollendung. Ungesteuerte Felder mit Startwerten bzw. den zurückgegebenen Werten; Fokus auf die Rückmeldung.
 */
export function HatimFormular({
  aktion,
  startwerte,
  modus,
}: {
  aktion: Aktion;
  startwerte: Record<string, string>;
  modus: 'neu' | 'bearbeiten';
}) {
  const t = useTranslations('verwaltung.hatim');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w = zustand.werte ?? startwerte;
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);
  const fehlerListe = Object.keys(zustand.feldFehler ?? {});

  const feld = (
    name: string,
    label: string,
    opt: { pflicht?: boolean; hinweis?: string; typ?: string; max?: number; breit?: boolean } = {},
  ) => (
    <div className={opt.breit ? 'md:col-span-2' : undefined}>
      <Rahmen
        id={id(name)}
        label={label}
        hinweis={opt.hinweis}
        fehler={f(name)}
        pflicht={opt.pflicht ? tv('pflichtfeld') : undefined}
        kinder={(aria) => (
          <input
            {...aria}
            name={name}
            type={opt.typ ?? 'text'}
            defaultValue={w[name] ?? ''}
            required={opt.pflicht}
            maxLength={opt.max}
            className={eingabe}
          />
        )}
      />
    </div>
  );
  const mitSprache = (name: string, s: 'Tr' | 'En') =>
    t('formular.feldSprache', { feld: t(`formular.${name}`), sprache: t(`formular.sprache.${s}`) });

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
                      {t(`formular.${k.replace(/(De|Tr|En)$/, '')}`)}: {f(k)}
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
      {startwerte.id ? <input type="hidden" name="id" value={startwerte.id} /> : null}
      <Abschnitt
        titel={t('formular.abschnittInhalt')}
        kinder={
          <>
            {feld('titelDe', t('formular.titel'), { pflicht: true, hinweis: t('formular.titelHinweis'), max: 120, breit: true })}
            {feld('anlassDe', t('formular.anlass'), { hinweis: t('formular.anlassHinweis'), max: 200, breit: true })}
          </>
        }
      />
      <Abschnitt
        titel={t('formular.abschnittZeit')}
        kinder={
          <>
            {feld('beginn', t('formular.beginn'), { pflicht: true, typ: 'date' })}
            {feld('ziel', t('formular.ziel'), { typ: 'date', hinweis: t('formular.zielHinweis') })}
          </>
        }
      />
      <details className="rounded-lg border border-linie bg-weiss p-5 md:p-6" open={fehlerListe.some((k) => /(Tr|En)$/.test(k))}>
        <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzung')}</summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {SPRACHEN.map((s) => (
            <fieldset key={s} className="flex flex-col gap-4">
              <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
              {feld(`titel${s}`, mitSprache('titel', s), { max: 120 })}
              {feld(`anlass${s}`, mitSprache('anlass', s), { max: 200 })}
            </fieldset>
          ))}
        </div>
      </details>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {modus === 'neu' ? t('formular.anlegen') : t('formular.speichern')}
        </Button>
      </div>
    </form>
  );
}
