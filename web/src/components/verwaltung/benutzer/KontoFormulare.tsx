'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ersatzcodesErzeugen, passwortAendern, type BenutzerZustand } from '@/server/actions/benutzer';

function useFokus(z: BenutzerZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) ref.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  return ref;
}

/** Mein Konto › Passwort ändern (C12): aktuelles Passwort, neues zweimal; andere Sitzungen enden. */
export function PasswortFormular() {
  const t = useTranslations('verwaltung.benutzer');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState<BenutzerZustand, FormData>(passwortAendern, {});
  const ref = useFokus(z);
  const fehler = (feld: string) => (z.feldFehler?.[feld] ? t(`fehler.${z.feldFehler[feld]}` as never) : undefined);
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate key={z.ok ? 'fertig' : 'offen'}>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : z.ok ? (
          <Meldung art="erfolg" fokus>
            {t('konto.passwortGeaendert')}
          </Meldung>
        ) : null}
      </div>
      <Feld
        id="konto-aktuell"
        name="aktuell"
        type="password"
        autoComplete="current-password"
        required
        label={t('konto.aktuell')}
        pflicht={tv('pflichtfeld')}
        fehler={fehler('aktuell')}
      />
      <Feld
        id="konto-neu"
        name="neu"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        label={t('konto.neu')}
        pflicht={tv('pflichtfeld')}
        hinweis={t('konto.neuHinweis')}
        fehler={fehler('neu')}
      />
      <Feld
        id="konto-wiederholung"
        name="wiederholung"
        type="password"
        autoComplete="new-password"
        required
        label={t('konto.wiederholung')}
        pflicht={tv('pflichtfeld')}
        fehler={fehler('wiederholung')}
      />
      <Button type="submit" className="self-start" disabled={laeuft}>
        {laeuft ? t('konto.sendet') : t('konto.passwortSpeichern')}
      </Button>
    </form>
  );
}

/** Mein Konto › neue Ersatzcodes (C12): Passwort zur Bestätigung, Codes nur in dieser Antwort. */
export function ErsatzcodesFormular() {
  const t = useTranslations('verwaltung.benutzer');
  const tv = useTranslations('verwaltung');
  const [z, absenden, laeuft] = useActionState<BenutzerZustand, FormData>(ersatzcodesErzeugen, {});
  const ref = useFokus(z);
  if (z.ok && z.ersatzcodes) {
    return (
      <div ref={ref} className="flex flex-col gap-3">
        <Meldung art="erfolg" fokus>
          {t('konto.ersatzNeu')}
        </Meldung>
        <ul aria-label={t('konto.ersatzListe')} className="grid grid-cols-2 gap-2 font-mono text-18 sm:grid-cols-5">
          {z.ersatzcodes.map((c) => (
            <li key={c} className="rounded-md border border-linie bg-sand px-2 py-1 text-center">
              {c}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <div ref={ref}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <Feld
        id="konto-ersatz-passwort"
        name="passwort"
        type="password"
        autoComplete="current-password"
        required
        label={t('konto.passwort')}
        pflicht={tv('pflichtfeld')}
        fehler={z.feldFehler?.passwort ? t(`fehler.${z.feldFehler.passwort}` as never) : undefined}
      />
      <Button type="submit" variant="outline" className="self-start" disabled={laeuft}>
        {laeuft ? t('konto.sendet') : t('konto.ersatzErzeugen')}
      </Button>
    </form>
  );
}
