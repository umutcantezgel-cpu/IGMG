'use client';

import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { einladungAnnehmen, type FormularZustand } from '@/server/actions/anmeldung';
import { Feld } from '../Feld';
import { Meldung } from '../Meldung';
import { ANMELDE_KNOPF } from './knopf';

export function EinladungsFormular({ token, name, email }: { token: string; name: string; email: string }) {
  const t = useTranslations('verwaltung');
  const [zustand, aktion, laeuft] = useActionState<FormularZustand, FormData>(einladungAnnehmen, {});
  useEffect(() => {
    if (zustand.fehler) document.getElementById('einladung-meldung')?.focus();
  }, [zustand]);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      {zustand.fehler ? (
        <Meldung art="fehler" id="einladung-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <Feld id="einladung-name" label={t('einladung.name')} value={name} readOnly disabled />
      <Feld id="einladung-email" label={t('einladung.email')} value={email} readOnly disabled autoComplete="username" />
      <Feld
        id="einladung-passwort"
        name="passwort"
        type="password"
        autoComplete="new-password"
        minLength={12}
        required
        label={t('einladung.passwort')}
        pflicht={t('pflichtfeld')}
        hinweis={t('einladung.passwortHinweis')}
        fehler={zustand.feldFehler?.passwort ? t(zustand.feldFehler.passwort) : undefined}
      />
      <Feld
        id="einladung-wiederholung"
        name="wiederholung"
        type="password"
        autoComplete="new-password"
        required
        label={t('einladung.passwortWiederholen')}
        pflicht={t('pflichtfeld')}
        fehler={zustand.feldFehler?.wiederholung ? t(zustand.feldFehler.wiederholung) : undefined}
      />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <UserPlus aria-hidden />}
        {t('einladung.absenden')}
      </Button>
    </form>
  );
}
