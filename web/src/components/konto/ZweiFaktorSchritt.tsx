'use client';

import { ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ANMELDE_KNOPF } from '@/components/verwaltung/anmeldung/knopf';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { kontoZweiFaktorPruefen, type KontoZustand } from '@/server/actions/konto';

/** Zweiter Schritt der Anmeldung: Code aus der App oder ein Ersatzcode (Umschalter, ein Feld). */
export function ZweiFaktorSchritt({ weiter, zurueck }: { weiter: string | null; zurueck: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [ersatz, setErsatz] = useState(false);
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoZweiFaktorPruefen, {});
  useEffect(() => {
    if (zustand.fehler || zustand.feldFehler) document.getElementById('zwei-faktor-code')?.focus();
  }, [zustand]);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      <input type="hidden" name="art" value={ersatz ? 'ersatzcode' : 'totp'} />
      {weiter ? <input type="hidden" name="weiter" value={weiter} /> : null}
      {zustand.fehler && zustand.fehler !== 'zweiFaktor.fehler' ? (
        <Meldung art="fehler" id="zwei-faktor-meldung">
          {t(zustand.fehler)}
          {zustand.fehler === 'zweiFaktor.abgelaufen' ? (
            <>
              {' '}
              <a href={zurueck}>{t('zweiFaktor.zurueck')}</a>
            </>
          ) : null}
        </Meldung>
      ) : null}
      <Feld
        key={ersatz ? 'ersatz' : 'app'}
        id="zwei-faktor-code"
        name="code"
        inputMode={ersatz ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        autoCapitalize="none"
        maxLength={ersatz ? 32 : 6}
        required
        label={ersatz ? t('zweiFaktor.ersatzcode') : t('zweiFaktor.code')}
        fehler={zustand.feldFehler?.code ? t(zustand.feldFehler.code) : undefined}
        className={ersatz ? 'font-mono' : 'tracking-code tabular-nums'}
      />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <ShieldCheck aria-hidden />}
        {t('zweiFaktor.absenden')}
      </Button>
      <button
        type="button"
        onClick={() => setErsatz((e) => !e)}
        className="inline-flex min-h-12 cursor-pointer items-center self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
      >
        {ersatz ? t('zweiFaktor.appVerwenden') : t('zweiFaktor.ersatzVerwenden')}
      </button>
    </form>
  );
}
