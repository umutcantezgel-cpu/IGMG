'use client';

import { KeyRound, LogIn, Mail, Smile } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ANMELDE_KNOPF } from '@/components/verwaltung/anmeldung/knopf';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { kinderAnmelden, kontoAnmelden, type KontoZustand } from '@/server/actions/konto';
import { PasskeyAnmelden } from './PasskeyAnmelden';
import { PasswortFeld } from './PasswortFeld';

type Reiter = 'email' | 'kinder';

/**
 * Anmeldung (ADR 0026): Reiter „E-Mail“ (Gemeinde, Eltern, Lehrkraft, Schüler ≥ 16) und „Kinderzugang“ (Benutzername).
 * Reiter nach WAI-ARIA (Pfeiltasten, ein Tab-Halt). Fehler ohne Details, Fokus auf die Meldung. Passkey als zusätzlicher
 * Weg, nur wenn der Browser ihn kann. Adressen kommen vom Server (`links`).
 */
export function AnmeldeBereich({
  startReiter,
  weiter,
  links,
}: {
  startReiter: Reiter;
  weiter: string | null;
  links: { passwortVergessen: string };
}) {
  const t = useTranslations('konto');
  const sprache = useLocale();
  const [reiter, setReiter] = useState<Reiter>(startReiter);
  const knoepfe = useRef<Record<Reiter, HTMLButtonElement | null>>({ email: null, kinder: null });
  const wechsel = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const neu: Reiter = e.key === 'Home' ? 'email' : e.key === 'End' ? 'kinder' : reiter === 'email' ? 'kinder' : 'email';
    setReiter(neu);
    knoepfe.current[neu]?.focus();
  };
  const reiterKnopf = (r: Reiter, Icon: typeof Mail, text: string) => (
    <button
      ref={(el) => {
        knoepfe.current[r] = el;
      }}
      type="button"
      role="tab"
      id={`reiter-${r}`}
      aria-selected={reiter === r}
      aria-controls={`bereich-${r}`}
      tabIndex={reiter === r ? 0 : -1}
      onClick={() => setReiter(r)}
      onKeyDown={wechsel}
      className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-16 font-bold transition duration-(--dauer-rueckmeldung) ${reiter === r ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte-2 hover:text-tinte'}`}
    >
      <Icon aria-hidden className="size-5" />
      {text}
    </button>
  );
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label={t('anmelden.reiter.label')} className="flex gap-1 rounded-lg bg-sand p-1">
        {reiterKnopf('email', Mail, t('anmelden.reiter.email'))}
        {reiterKnopf('kinder', Smile, t('anmelden.reiter.kinder'))}
      </div>
      <div role="tabpanel" id="bereich-email" aria-labelledby="reiter-email" hidden={reiter !== 'email'} className="tritt-auf">
        <EmailAnmeldung sprache={sprache} weiter={weiter} passwortVergessen={links.passwortVergessen} />
      </div>
      <div role="tabpanel" id="bereich-kinder" aria-labelledby="reiter-kinder" hidden={reiter !== 'kinder'} className="tritt-auf">
        <KinderAnmeldung sprache={sprache} />
      </div>
    </div>
  );
}

function useFokusBeiFehler(zustand: KontoZustand, id: string) {
  useEffect(() => {
    if (zustand.fehler) document.getElementById(id)?.focus();
  }, [zustand, id]);
}

function EmailAnmeldung({ sprache, weiter, passwortVergessen }: { sprache: string; weiter: string | null; passwortVergessen: string }) {
  const t = useTranslations('konto');
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoAnmelden, {});
  useFokusBeiFehler(zustand, 'anmelden-meldung');
  return (
    <div className="flex flex-col gap-5">
      <form action={aktion} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="sprache" value={sprache} />
        {weiter ? <input type="hidden" name="weiter" value={weiter} /> : null}
        {zustand.fehler ? (
          <Meldung art="fehler" id="anmelden-meldung" fokus>
            {t(zustand.fehler)}
          </Meldung>
        ) : null}
        <Feld
          id="anmelden-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          label={t('felder.email')}
          defaultValue={zustand.werte?.email}
        />
        <PasswortFeld id="anmelden-passwort" name="passwort" label={t('felder.passwort')} autoComplete="current-password" />
        <a href={passwortVergessen} className="inline-flex min-h-12 items-center self-start font-bold">
          {t('anmelden.passwortVergessen')}
        </a>
        <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
          {laeuft ? <LadeStern /> : <LogIn aria-hidden />}
          {t('anmelden.absenden')}
        </Button>
      </form>
      <PasskeyAnmelden sprache={sprache} weiter={weiter} />
    </div>
  );
}

function KinderAnmeldung({ sprache }: { sprache: string }) {
  const t = useTranslations('konto');
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kinderAnmelden, {});
  useFokusBeiFehler(zustand, 'kinder-meldung');
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="sprache" value={sprache} />
      <p className="text-pretty text-tinte-2">{t('kinder.text')}</p>
      {zustand.fehler ? (
        <Meldung art="fehler" id="kinder-meldung" fokus>
          {t(zustand.fehler)}
        </Meldung>
      ) : null}
      <Feld
        id="kinder-benutzername"
        name="benutzername"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        maxLength={32}
        label={t('felder.benutzername')}
        defaultValue={zustand.werte?.benutzername}
      />
      <PasswortFeld id="kinder-passwort" name="passwort" label={t('felder.passwort')} autoComplete="current-password" />
      <Button type="submit" disabled={laeuft} className={ANMELDE_KNOPF}>
        {laeuft ? <LadeStern /> : <KeyRound aria-hidden />}
        {t('kinder.absenden')}
      </Button>
      <p className="text-16 text-tinte-2">{t('kinder.vergessen')}</p>
    </form>
  );
}
