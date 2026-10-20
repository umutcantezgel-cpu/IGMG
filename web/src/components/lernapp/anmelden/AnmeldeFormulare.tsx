'use client';

import { Fingerprint, KeyRound, LogIn, Mail, Smile } from 'lucide-react';
import { useActionState, useEffect, useRef, useState, useSyncExternalStore, useTransition, type KeyboardEvent } from 'react';
import { passkeyAbfragen, passkeysMoeglich } from '@/lib/konto/webauthn';
import { kinderAnmelden, kontoAnmelden, passkeyAnmelden, passkeyAnmeldeOptionen, type KontoZustand } from '@/server/actions/konto';
import { LernFeld, LernMeldung, LernPasswort } from './Felder';

export type AnmeldeFehler = {
  anmelden: string;
  zuViele: string;
  unbestaetigt: string;
  kind: string;
  code: string;
  abgelaufen: string;
  passkey: string;
  passkeyAbgebrochen: string;
  passkeyVerwaltung: string;
};

export type AnmeldeTexte = {
  reiter: string;
  reiterEmail: string;
  reiterKind: string;
  email: string;
  passwort: string;
  benutzername: string;
  zeigen: string;
  absenden: string;
  laeuft: string;
  kindText: string;
  kindVergessen: string;
  oder: string;
  passkey: string;
  passwortVergessen: string;
  fehler: AnmeldeFehler;
};

/** Fehlerschlüssel der Konto-Actions (Namensraum `konto`) → Texte der Lern-App. */
const FEHLER: Record<string, keyof AnmeldeFehler> = {
  'anmelden.fehler': 'anmelden',
  'anmelden.zuViele': 'zuViele',
  'anmelden.unbestaetigt': 'unbestaetigt',
  'kinder.fehler': 'kind',
  'zweiFaktor.fehler': 'code',
  'zweiFaktor.abgelaufen': 'abgelaufen',
  'passkey.fehler': 'passkey',
  'passkey.abgebrochen': 'passkeyAbgebrochen',
  'passkey.verwaltung': 'passkeyVerwaltung',
};

export function fehlerText(fehler: AnmeldeFehler, schluessel: string): string {
  return fehler[FEHLER[schluessel] ?? 'anmelden'];
}

type Reiter = 'email' | 'kind';
const nieAendern = () => () => undefined;
const KNOPF =
  'inline-flex min-h-12 w-full druck cursor-pointer items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800 disabled:cursor-wait disabled:opacity-80';

function useFokusBeiFehler(zustand: KontoZustand, id: string) {
  useEffect(() => {
    if (zustand.fehler) document.getElementById(id)?.focus();
  }, [zustand, id]);
}

/**
 * Anmeldung im Scope der Lern-App (ADR 0037 Nr. 4, O-7): Reiter „E-Mail“ und „Kinderzugang“ (WAI-ARIA, Pfeiltasten),
 * dazu Passkey, wenn der Browser ihn kann. Nutzt die Server Actions der Konten (Schalter, Ratenbegrenzung, Protokoll,
 * zweiter Faktor) mit `weiter` = Rückkehr in die Lern-App; Texte kommen vom Server (kein next-intl im Client).
 */
export function AnmeldeFormulare({ weiter, texte, startReiter }: { weiter: string; texte: AnmeldeTexte; startReiter: Reiter }) {
  const [reiter, setReiter] = useState<Reiter>(startReiter);
  const knoepfe = useRef<Record<Reiter, HTMLButtonElement | null>>({ email: null, kind: null });
  const wechsel = (e: KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const neu: Reiter = e.key === 'Home' ? 'email' : e.key === 'End' ? 'kind' : reiter === 'email' ? 'kind' : 'email';
    setReiter(neu);
    knoepfe.current[neu]?.focus();
  };
  const reiterKnopf = (r: Reiter, Zeichen: typeof Mail, text: string) => (
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
      className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-16 font-bold ${reiter === r ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte-2 hover:text-tinte'}`}
    >
      <Zeichen aria-hidden className="size-5 shrink-0" />
      {text}
    </button>
  );
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label={texte.reiter} className="flex gap-1 rounded-lg bg-sand p-1">
        {reiterKnopf('email', Mail, texte.reiterEmail)}
        {reiterKnopf('kind', Smile, texte.reiterKind)}
      </div>
      <div role="tabpanel" id="bereich-email" aria-labelledby="reiter-email" hidden={reiter !== 'email'}>
        <EmailAnmeldung weiter={weiter} texte={texte} />
      </div>
      <div role="tabpanel" id="bereich-kind" aria-labelledby="reiter-kind" hidden={reiter !== 'kind'}>
        <KindAnmeldung weiter={weiter} texte={texte} />
      </div>
    </div>
  );
}

function EmailAnmeldung({ weiter, texte }: { weiter: string; texte: AnmeldeTexte }) {
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoAnmelden, {});
  useFokusBeiFehler(zustand, 'anmelden-meldung');
  return (
    <div className="flex flex-col gap-5">
      <form action={aktion} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="weiter" value={weiter} />
        {zustand.fehler ? (
          <LernMeldung id="anmelden-meldung" art="fehler">
            {fehlerText(texte.fehler, zustand.fehler)}
          </LernMeldung>
        ) : null}
        <LernFeld
          id="anmelden-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          dir="ltr"
          maxLength={254}
          label={texte.email}
          defaultValue={zustand.werte?.email}
        />
        <LernPasswort id="anmelden-passwort" name="passwort" label={texte.passwort} zeigen={texte.zeigen} />
        <button type="submit" disabled={laeuft} className={KNOPF}>
          <LogIn aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
          {laeuft ? texte.laeuft : texte.absenden}
        </button>
      </form>
      <PasskeyAnmeldung weiter={weiter} texte={texte} />
    </div>
  );
}

function KindAnmeldung({ weiter, texte }: { weiter: string; texte: AnmeldeTexte }) {
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kinderAnmelden, {});
  useFokusBeiFehler(zustand, 'kind-meldung');
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="weiter" value={weiter} />
      <p className="text-16 text-pretty text-tinte-2">{texte.kindText}</p>
      {zustand.fehler ? (
        <LernMeldung id="kind-meldung" art="fehler">
          {fehlerText(texte.fehler, zustand.fehler)}
        </LernMeldung>
      ) : null}
      <LernFeld
        id="kind-benutzername"
        name="benutzername"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        dir="ltr"
        maxLength={32}
        label={texte.benutzername}
        defaultValue={zustand.werte?.benutzername}
      />
      <LernPasswort id="kind-passwort" name="passwort" label={texte.passwort} zeigen={texte.zeigen} />
      <button type="submit" disabled={laeuft} className={KNOPF}>
        <KeyRound aria-hidden className="size-5 shrink-0" />
        {laeuft ? texte.laeuft : texte.absenden}
      </button>
      <p className="text-16 text-tinte-2">{texte.kindVergessen}</p>
    </form>
  );
}

/** Passkey (WebAuthn) als zusätzlicher Weg; steht im Server-HTML und verschwindet, wenn der Browser ihn nicht kann. */
function PasskeyAnmeldung({ weiter, texte }: { weiter: string; texte: AnmeldeTexte }) {
  const moeglich = useSyncExternalStore(nieAendern, passkeysMoeglich, () => true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starte] = useTransition();
  if (!moeglich) return null;
  const anmelden = () =>
    starte(async () => {
      setFehler(null);
      const o = await passkeyAnmeldeOptionen();
      if (!o.optionen) return setFehler(o.fehler ?? 'passkey.fehler');
      const antwort = await passkeyAbfragen(o.optionen);
      if (!antwort) return setFehler('passkey.abgebrochen');
      const r = await passkeyAnmelden(antwort, 'de', weiter);
      if (r?.fehler) setFehler(r.fehler);
    });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-16 text-tinte-2" aria-hidden>
        <span className="h-px flex-1 bg-linie" />
        {texte.oder}
        <span className="h-px flex-1 bg-linie" />
      </div>
      {fehler ? (
        <LernMeldung id="passkey-meldung" art={fehler === 'passkey.verwaltung' ? 'info' : 'fehler'}>
          {fehlerText(texte.fehler, fehler)}
        </LernMeldung>
      ) : null}
      <button
        type="button"
        onClick={anmelden}
        disabled={laeuft}
        className="inline-flex min-h-12 w-full druck cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-6 text-18 font-bold text-gruen-800 hover:bg-gruen-50 disabled:cursor-wait disabled:opacity-80"
      >
        <Fingerprint aria-hidden className="size-5 shrink-0" />
        {laeuft ? texte.laeuft : texte.passkey}
      </button>
    </div>
  );
}
