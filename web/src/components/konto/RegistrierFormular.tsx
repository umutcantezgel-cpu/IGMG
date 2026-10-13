'use client';

import { MailCheck, UserPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect } from 'react';
import { AltchaFeld } from '@/components/formular/AltchaFeld';
import { Button } from '@/components/ui/button';
import { ANMELDE_KNOPF } from '@/components/verwaltung/anmeldung/knopf';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { registrieren, type KontoZustand } from '@/server/actions/konto';
import { Haken } from './Haken';
import { PasswortFeld } from './PasswortFeld';

/**
 * Registrierung (nur Gemeindemitglieder): Name, E-Mail, Passwort mit Stärke-Hinweis, Einwilligung, ALTCHA und
 * Honigtopf. Nach dem Absenden immer dieselbe Erfolgsansicht (keine Auskunft, ob es die Adresse schon gibt).
 * Nach einem Fehler bindet `versuch` das ALTCHA-Widget neu (Lösungen sind einmalig).
 */
export function RegistrierFormular({ datenschutz, anmelden }: { datenschutz: string; anmelden: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale() as 'de' | 'tr' | 'en';
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(registrieren, {});
  useEffect(() => {
    if (zustand.fehler) document.getElementById('registrieren-meldung')?.focus();
    if (zustand.ok) document.getElementById('registrieren-erfolg')?.focus();
  }, [zustand]);
  if (zustand.ok) {
    return (
      <div id="registrieren-erfolg" tabIndex={-1} role="status" className="tritt-auf flex flex-col gap-4 outline-none">
        <span className="flex size-14 items-center justify-center rounded-lg bg-gruen-50 text-gruen-700">
          <MailCheck aria-hidden className="size-7" />
        </span>
        <h2 className="text-24">{t('registrieren.erfolgTitel')}</h2>
        <p className="text-pretty">{t('registrieren.erfolgText')}</p>
        <p className="text-16 text-pretty text-tinte-2">{t('registrieren.erfolgHinweis')}</p>
        <a href={anmelden} className="inline-flex min-h-12 items-center self-start font-bold">
          {t('registrieren.zurAnmeldung')}
        </a>
      </div>
    );
  }
  const ff = (feld: string) => (zustand.feldFehler?.[feld] ? t(zustand.feldFehler[feld]) : undefined);
  return (
    <form action={aktion} className="relative flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="registrieren-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <Feld
        id="registrieren-name"
        name="name"
        autoComplete="name"
        required
        maxLength={80}
        label={t('felder.name')}
        hinweis={t('registrieren.nameHinweis')}
        defaultValue={zustand.werte?.name}
        fehler={ff('name')}
      />
      <Feld
        id="registrieren-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        label={t('felder.email')}
        defaultValue={zustand.werte?.email}
        fehler={ff('email')}
      />
      <PasswortFeld
        id="registrieren-passwort"
        name="passwort"
        label={t('felder.passwortNeu')}
        autoComplete="new-password"
        staerke
        fehler={ff('passwort')}
      />
      <Haken
        id="registrieren-einwilligung"
        name="einwilligung"
        fehler={ff('einwilligung')}
        label={t.rich('einwilligung.text', {
          link: (teil) => (
            <a href={datenschutz} target="_blank" rel="noopener" className="font-bold underline underline-offset-2">
              {teil}
            </a>
          ),
        })}
      />
      {/* Honigtopf: für Menschen unsichtbar, Bots füllen ihn aus */}
      <div aria-hidden="true" className="absolute -left-full h-px w-px overflow-hidden">
        <label>
          {t('registrieren.honigtopf')}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <AltchaFeld
        key={zustand.versuch ?? 0}
        sprache={sprache}
        texte={{ label: t('registrieren.altcha.label'), hinweis: t('registrieren.altcha.hinweis') }}
      />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <UserPlus aria-hidden />}
        {laeuft ? t('registrieren.sendet') : t('registrieren.absenden')}
      </Button>
    </form>
  );
}
