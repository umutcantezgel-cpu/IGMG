'use client';

import { Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore, useTransition } from 'react';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { passkeyAbfragen, passkeysMoeglich } from '@/lib/konto/webauthn';
import { passkeyAnmelden, passkeyAnmeldeOptionen } from '@/server/actions/konto';

const nieAendern = () => () => undefined;

/**
 * Zusätzlicher Weg: Anmeldung mit Passkey (WebAuthn). Steht schon im Server-HTML (kein Springen beim Laden) und
 * verschwindet nach der Hydrierung, wenn der Browser keine Passkeys kann. Optionen und Prüfung über Server Actions.
 */
export function PasskeyAnmelden({ sprache, weiter }: { sprache: string; weiter: string | null }) {
  const t = useTranslations('konto');
  // Server und erstes Rendern: sichtbar; im Browser die echte Fähigkeit (ändert sich nicht)
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
      const r = await passkeyAnmelden(antwort, sprache, weiter ?? undefined);
      if (r?.fehler) setFehler(r.fehler);
    });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-16 text-tinte-2" aria-hidden>
        <span className="h-px flex-1 bg-linie" />
        {t('anmelden.oder')}
        <span className="h-px flex-1 bg-linie" />
      </div>
      {fehler ? (
        <Meldung art={fehler === 'passkey.verwaltung' ? 'info' : 'fehler'} id="passkey-meldung">
          {t(fehler)}
        </Meldung>
      ) : null}
      <button
        type="button"
        onClick={anmelden}
        disabled={laeuft}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-6 text-18 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 disabled:cursor-wait disabled:opacity-80 motion-reduce:active:scale-100"
      >
        {laeuft ? <LadeStern /> : <Fingerprint aria-hidden className="size-5" />}
        {laeuft ? t('passkey.laeuft') : t('passkey.knopf')}
      </button>
    </div>
  );
}
