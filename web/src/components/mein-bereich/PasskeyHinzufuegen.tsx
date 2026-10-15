'use client';

import { Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { passkeyErstellen, passkeysMoeglich } from '@/lib/konto/webauthn';
import { passkeyRegistrieren, passkeyRegistrierOptionen } from '@/server/actions/mein-bereich';

const nieAendern = () => () => undefined;

/** Passkey hinzufügen: Name (optional) → Optionen (Server) → Authenticator → Prüfung (Server) → Liste neu laden. */
export function PasskeyHinzufuegen({ standardName }: { standardName: string }) {
  const t = useTranslations('meinBereich');
  const router = useRouter();
  const moeglich = useSyncExternalStore(nieAendern, passkeysMoeglich, () => true);
  const [laeuft, starte] = useTransition();
  const [meldung, setMeldung] = useState<{ art: 'erfolg' | 'fehler'; text: string } | null>(null);
  if (!moeglich) return <Meldung art="info">{t('konto.passkeys.nichtMoeglich')}</Meldung>;
  const hinzufuegen = (fd: FormData) =>
    starte(async () => {
      setMeldung(null);
      const o = await passkeyRegistrierOptionen();
      if (!o.optionen) return setMeldung({ art: 'fehler', text: t(o.fehler ?? 'konto.passkeys.fehler') });
      const antwort = await passkeyErstellen(o.optionen);
      if (!antwort) return setMeldung({ art: 'fehler', text: t('konto.passkeys.abgebrochen') });
      const r = await passkeyRegistrieren(antwort, String(fd.get('name') ?? '') || standardName);
      if (!r.ok) return setMeldung({ art: 'fehler', text: t(r.fehler ?? 'konto.passkeys.fehler') });
      setMeldung({ art: 'erfolg', text: t('konto.passkeys.hinzugefuegt') });
      router.refresh();
    });
  return (
    <form action={hinzufuegen} className="flex max-w-120 flex-col gap-4">
      {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      <Feld
        id="passkey-name"
        name="name"
        maxLength={60}
        label={t('konto.passkeys.name')}
        hinweis={t('konto.passkeys.nameHinweis')}
        placeholder={standardName}
      />
      <Button
        type="submit"
        variant="secondary"
        disabled={laeuft}
        className="druck self-start transition duration-(--dauer-rueckmeldung) disabled:cursor-wait"
      >
        {laeuft ? <LadeStern /> : <Fingerprint aria-hidden />}
        {laeuft ? t('konto.passkeys.laeuft') : t('konto.passkeys.hinzufuegen')}
      </Button>
    </form>
  );
}
