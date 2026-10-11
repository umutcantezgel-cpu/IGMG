'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { anmelden, type FormularZustand } from '@/server/actions/anmeldung';
import { Feld } from '../Feld';
import { Meldung } from '../Meldung';

export function AnmeldeFormular() {
  const t = useTranslations('verwaltung');
  const [zustand, aktion, laeuft] = useActionState<FormularZustand, FormData>(anmelden, {});
  const [sichtbar, setSichtbar] = useState(false);
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler) document.getElementById('anmelden-meldung')?.focus();
  }, [zustand]);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      {zustand.fehler ? (
        <div ref={meldung}>
          <Meldung art="fehler" id="anmelden-meldung" fokus>
            {t(zustand.fehler)}
          </Meldung>
        </div>
      ) : null}
      <Feld
        id="anmelden-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        label={t('anmelden.email')}
        defaultValue={zustand.werte?.email}
      />
      <div className="relative">
        <Feld
          id="anmelden-passwort"
          name="passwort"
          type={sichtbar ? 'text' : 'password'}
          autoComplete="current-password"
          required
          label={t('anmelden.passwort')}
          className="pr-14"
        />
        <button
          type="button"
          onClick={() => setSichtbar((s) => !s)}
          aria-label={sichtbar ? t('anmelden.passwortVerbergen') : t('anmelden.passwortAnzeigen')}
          aria-pressed={sichtbar}
          className="absolute right-0 bottom-0 flex size-12 items-center justify-center rounded-md text-tinte-2 hover:text-tinte"
        >
          {sichtbar ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
      <Button type="submit" disabled={laeuft} className="w-full">
        <LogIn aria-hidden />
        {t('anmelden.absenden')}
      </Button>
    </form>
  );
}
