'use client';

import { ArrowRight, CheckCheck, KeyRound, MailCheck, Send, UserCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ANMELDE_KNOPF } from '@/components/verwaltung/anmeldung/knopf';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import {
  gemeindeEinladungAnnehmen,
  gemeindeEinladungUebernehmen,
  kontoBestaetigen,
  kontoPasswortNeu,
  kontoPasswortVergessen,
  type KontoZustand,
} from '@/server/actions/konto';
import { Haken } from './Haken';
import { PasswortFeld } from './PasswortFeld';

/**
 * Kleine Formulare des Konto-Einstiegs: Adresse bestätigen, Einladung annehmen/übernehmen, Passwort vergessen/neu.
 * Alle mit Server Action (CSRF-fest), Fehlern als Schlüssel unter `konto` und Fokus auf die Rückmeldung.
 */
function useFokus(zustand: KontoZustand, id: string) {
  useEffect(() => {
    if (zustand.fehler || zustand.ok) document.getElementById(id)?.focus();
  }, [zustand, id]);
}

export function BestaetigenFormular({ token }: { token: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoBestaetigen, {});
  useFokus(zustand, 'bestaetigen-meldung');
  return (
    <form action={aktion} className="flex flex-col gap-5">
      <input type="hidden" name="sprache" value={sprache} />
      <input type="hidden" name="token" value={token} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="bestaetigen-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <MailCheck aria-hidden />}
        {t('bestaetigen.absenden')}
      </Button>
    </form>
  );
}

export function EinladungFormular({ token, datenschutz }: { token: string; datenschutz: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(gemeindeEinladungAnnehmen, {});
  useFokus(zustand, 'einladung-meldung');
  const ff = (feld: string) => (zustand.feldFehler?.[feld] ? t(zustand.feldFehler[feld]) : undefined);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      <input type="hidden" name="token" value={token} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="einladung-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <PasswortFeld
        id="einladung-passwort"
        name="passwort"
        label={t('felder.passwortNeu')}
        autoComplete="new-password"
        staerke
        fehler={ff('passwort')}
      />
      <PasswortFeld
        id="einladung-wiederholung"
        name="wiederholung"
        label={t('felder.passwortWiederholen')}
        autoComplete="new-password"
        fehler={ff('wiederholung')}
      />
      <Haken
        id="einladung-einwilligung"
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
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <UserCheck aria-hidden />}
        {t('einladung.absenden')}
      </Button>
    </form>
  );
}

export function EinladungUebernehmen({ token }: { token: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(gemeindeEinladungUebernehmen, {});
  useFokus(zustand, 'uebernehmen-meldung');
  return (
    <form action={aktion} className="flex flex-col gap-5">
      <input type="hidden" name="sprache" value={sprache} />
      <input type="hidden" name="token" value={token} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="uebernehmen-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <CheckCheck aria-hidden />}
        {t('einladung.uebernehmen')}
      </Button>
    </form>
  );
}

export function PasswortVergessenFormular({ zurAnmeldung }: { zurAnmeldung: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoPasswortVergessen, {});
  useFokus(zustand, 'vergessen-meldung');
  if (zustand.ok) {
    return (
      <div className="flex flex-col gap-5">
        <Meldung art="erfolg" id="vergessen-meldung" fokus>
          {t('passwortVergessen.gesendet')}
        </Meldung>
        <a href={zurAnmeldung} className="inline-flex min-h-12 items-center self-start font-bold">
          {t('passwortVergessen.zurueck')}
        </a>
      </div>
    );
  }
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="vergessen-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <Feld
        id="vergessen-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        label={t('felder.email')}
        fehler={zustand.feldFehler?.email ? t(zustand.feldFehler.email) : undefined}
      />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <Send aria-hidden />}
        {t('passwortVergessen.absenden')}
      </Button>
      <p className="text-16 text-pretty text-tinte-2">{t('passwortVergessen.kinderHinweis')}</p>
    </form>
  );
}

export function PasswortNeuFormular({ token }: { token: string }) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoPasswortNeu, {});
  useFokus(zustand, 'neu-meldung');
  const ff = (feld: string) => (zustand.feldFehler?.[feld] ? t(zustand.feldFehler[feld]) : undefined);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      <input type="hidden" name="token" value={token} />
      {zustand.fehler ? (
        <Meldung art="fehler" id="neu-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <PasswortFeld
        id="neu-passwort"
        name="passwort"
        label={t('felder.passwortNeu')}
        autoComplete="new-password"
        staerke
        fehler={ff('passwort')}
      />
      <PasswortFeld
        id="neu-wiederholung"
        name="wiederholung"
        label={t('felder.passwortWiederholen')}
        autoComplete="new-password"
        fehler={ff('wiederholung')}
      />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <KeyRound aria-hidden />}
        {t('passwortNeu.absenden')}
      </Button>
    </form>
  );
}

/** Link im Stil eines Hauptknopfs (z. B. „Anmelden und Einladung annehmen“). */
export function KnopfLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 motion-reduce:active:scale-100"
    >
      {text}
      <ArrowRight aria-hidden className="size-5" />
    </a>
  );
}
