'use client';

import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { IQAMA_GEBETE } from '@/lib/anzeige/einstellung';
import type { AnzeigeZustand } from '@/server/actions/anzeige';

type Aktion = (vorher: AnzeigeZustand, fd: FormData) => Promise<AnzeigeZustand>;

function Abschnitt({ titel, text, kinder, drei = false }: { titel: string; text?: string; kinder: ReactNode; drei?: boolean }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      {text ? <p className="clear-both max-w-einleitung text-16 text-tinte-2">{text}</p> : null}
      <div className={`clear-both grid items-start gap-4 sm:grid-cols-2 ${drei ? 'xl:grid-cols-3' : ''}`}>{kinder}</div>
    </fieldset>
  );
}

/**
 * Einstellungen der Anzeige (AUFTRAG 3.10, MN-14): Iqama-Minuten je Gebet (leer = keine Iqama-Anzeige), Ruhe nach der
 * Iqama bzw. ab dem Ezan, Freitagsmodus und Foliendauer. Ganze Zahlen; Prüfung auf dem Server.
 */
export function EinstellungFormular({
  aktion,
  startwerte,
  gebete,
}: {
  aktion: Aktion;
  startwerte: Record<string, string>;
  gebete: Record<string, string>;
}) {
  const t = useTranslations('verwaltung.anzeige');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w = (zustand.werte ?? startwerte) as Record<string, string>;
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);

  const zahl = (name: string, label: string, hinweis: string) => (
    <Rahmen
      id={id(name)}
      label={label}
      hinweis={hinweis}
      fehler={f(name)}
      kinder={(aria) => (
        <input
          {...aria}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          defaultValue={w[name] ?? ''}
          className={eingabe}
        />
      )}
    />
  );

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('einstellung.gespeichert')}</Meldung>
        ) : null}
      </div>
      <Abschnitt
        titel={t('einstellung.iqamaTitel')}
        text={t('einstellung.iqamaText')}
        drei
        kinder={IQAMA_GEBETE.map((g) => (
          <div key={g}>{zahl(`iqama_${g}`, t('einstellung.iqamaFeld', { gebet: gebete[g] ?? g }), t('einstellung.iqamaHinweis'))}</div>
        ))}
      />
      <Abschnitt
        titel={t('einstellung.ruheTitel')}
        text={t('einstellung.ruheText')}
        kinder={
          <>
            {zahl('ruheNachIqamaMin', t('einstellung.ruheNachIqama'), t('einstellung.ruheNachIqamaHinweis'))}
            {zahl('ruheOhneIqamaMin', t('einstellung.ruheOhneIqama'), t('einstellung.ruheOhneIqamaHinweis'))}
          </>
        }
      />
      <Abschnitt
        titel={t('einstellung.freitagTitel')}
        text={t('einstellung.freitagText')}
        kinder={
          <>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 sm:col-span-2">
              <input type="checkbox" name="freitagAktiv" defaultChecked={w.freitagAktiv === 'on'} className="size-5 accent-gruen-700" />
              <span className="font-bold">{t('einstellung.freitagAktiv')}</span>
            </label>
            {zahl('freitagVorMin', t('einstellung.freitagVor'), t('einstellung.minutenHinweis'))}
            {zahl('freitagNachMin', t('einstellung.freitagNach'), t('einstellung.minutenHinweis'))}
          </>
        }
      />
      <Abschnitt
        titel={t('einstellung.folienTitel')}
        kinder={zahl('folienDauerSek', t('einstellung.folienDauer'), t('einstellung.folienDauerHinweis'))}
      />
      <div>
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('formular.laeuft') : t('einstellung.speichern')}
        </Button>
      </div>
    </form>
  );
}
