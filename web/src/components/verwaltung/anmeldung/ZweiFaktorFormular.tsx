'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { zweiFaktorPruefen, type FormularZustand } from '@/server/actions/anmeldung';
import { Feld } from '../Feld';
import { Meldung } from '../Meldung';

export function ZweiFaktorFormular() {
  const t = useTranslations('verwaltung');
  const [zustand, aktion, laeuft] = useActionState<FormularZustand, FormData>(zweiFaktorPruefen, {});
  const [ersatz, setErsatz] = useState(false);
  useEffect(() => {
    if (zustand.fehler) document.getElementById('zwei-faktor-meldung')?.focus();
  }, [zustand]);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      {zustand.fehler ? (
        <Meldung art="fehler" id="zwei-faktor-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <input type="hidden" name="art" value={ersatz ? 'ersatzcode' : 'totp'} />
      {ersatz ? (
        <Feld
          id="zwei-faktor-code"
          name="code"
          autoComplete="off"
          required
          label={t('zweiFaktor.ersatzcodeFeld')}
          fehler={zustand.feldFehler?.code ? t(zustand.feldFehler.code) : undefined}
        />
      ) : (
        <Feld
          id="zwei-faktor-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          label={t('zweiFaktor.code')}
          hinweis={t('zweiFaktor.hinweis')}
          fehler={zustand.feldFehler?.code ? t(zustand.feldFehler.code) : undefined}
          className="font-mono tracking-[0.3em]"
        />
      )}
      <Button type="submit" disabled={laeuft} className="w-full">
        <ShieldCheck aria-hidden />
        {t('zweiFaktor.absenden')}
      </Button>
      <Button type="button" variant="link" onClick={() => setErsatz((e) => !e)}>
        {ersatz ? t('zweiFaktor.code') : t('zweiFaktor.ersatzcode')}
      </Button>
    </form>
  );
}
