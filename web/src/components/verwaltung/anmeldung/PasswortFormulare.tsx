'use client';

import NextLink from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { passwortNeuSetzen, passwortVergessen, type FormularZustand } from '@/server/actions/anmeldung';
import { Feld } from '../Feld';
import { Meldung } from '../Meldung';

function useFokus(z: FormularZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  return ref;
}

/** Passwort vergessen (C12): E-Mail-Adresse; Antwort immer gleich (keine Kontenaufzählung). */
export function PasswortVergessenFormular() {
  const t = useTranslations('verwaltung');
  const [z, aktion, laeuft] = useActionState<FormularZustand, FormData>(passwortVergessen, {});
  const ref = useFokus(z);
  if (z.ok) {
    return (
      <div ref={ref} className="flex flex-col gap-4">
        <Meldung art="erfolg" fokus>
          {t('passwortVergessen.gesendet')}
        </Meldung>
        <NextLink href="/verwaltung/anmelden" className="inline-flex min-h-11 items-center font-bold">
          {t('passwortVergessen.zurueck')}
        </NextLink>
      </div>
    );
  }
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(z.fehler)}
          </Meldung>
        ) : null}
      </div>
      <Feld
        id="vergessen-email"
        name="email"
        type="email"
        autoComplete="username"
        required
        label={t('passwortVergessen.email')}
        pflicht={t('pflichtfeld')}
        fehler={z.feldFehler?.email ? t(z.feldFehler.email) : undefined}
      />
      <Button type="submit" disabled={laeuft} className="w-full">
        {laeuft ? t('passwortVergessen.sendet') : t('passwortVergessen.absenden')}
      </Button>
      <NextLink href="/verwaltung/anmelden" className="inline-flex min-h-11 items-center self-start font-bold">
        {t('passwortVergessen.zurueck')}
      </NextLink>
    </form>
  );
}

/** Neues Passwort mit dem Link aus der Mail (C12). */
export function PasswortNeuFormular({ token }: { token: string }) {
  const t = useTranslations('verwaltung');
  const [z, aktion, laeuft] = useActionState<FormularZustand, FormData>(passwortNeuSetzen, {});
  const ref = useFokus(z);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            <span className="flex flex-col gap-1">
              {t(z.fehler)}
              {z.fehler === 'passwortNeu.ungueltig' ? (
                <NextLink href="/verwaltung/passwort-vergessen" className="font-bold">
                  {t('passwortNeu.neuAnfordern')}
                </NextLink>
              ) : null}
            </span>
          </Meldung>
        ) : null}
      </div>
      <input type="hidden" name="token" value={token} />
      <Feld
        id="neu-passwort"
        name="passwort"
        type="password"
        autoComplete="new-password"
        minLength={12}
        required
        label={t('passwortNeu.passwort')}
        pflicht={t('pflichtfeld')}
        hinweis={t('passwortNeu.passwortHinweis')}
        fehler={z.feldFehler?.passwort ? t(z.feldFehler.passwort) : undefined}
      />
      <Feld
        id="neu-wiederholung"
        name="wiederholung"
        type="password"
        autoComplete="new-password"
        required
        label={t('passwortNeu.wiederholung')}
        pflicht={t('pflichtfeld')}
        fehler={z.feldFehler?.wiederholung ? t(z.feldFehler.wiederholung) : undefined}
      />
      <Button type="submit" disabled={laeuft} className="w-full">
        {t('passwortNeu.absenden')}
      </Button>
    </form>
  );
}
