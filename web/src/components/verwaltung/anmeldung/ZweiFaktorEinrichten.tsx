'use client';

import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LadeStern } from '@/components/website/Zustandsgrafik';
import { zweiFaktorBestaetigen, zweiFaktorStarten, type FormularZustand } from '@/server/actions/anmeldung';
import { Feld } from '../Feld';
import { Meldung } from '../Meldung';
import { ANMELDE_KNOPF } from './knopf';
import { QrCode } from './QrCode';

/** Einrichtung TOTP: Passwort bestätigen → QR + Schlüssel + Ersatzcodes → Code bestätigen. */
export function ZweiFaktorEinrichten() {
  const t = useTranslations('verwaltung.zweiFaktorEinrichten');
  const [start, startAktion, startLaeuft] = useActionState<FormularZustand, FormData>(zweiFaktorStarten, {});
  const [ende, endeAktion, endeLaeuft] = useActionState<FormularZustand, FormData>(zweiFaktorBestaetigen, {});
  const totp = start.totp;
  useEffect(() => {
    if (totp) document.getElementById('zwei-faktor-schritt2')?.focus();
  }, [totp]);

  if (!totp) {
    return (
      <form action={startAktion} className="flex flex-col gap-5" noValidate>
        <h2 className="text-24">{t('schritt1')}</h2>
        <Feld
          id="einrichten-passwort"
          name="passwort"
          type="password"
          autoComplete="current-password"
          required
          label={t('schritt1')}
          fehler={start.feldFehler?.passwort ? t('fehlerPasswort') : undefined}
        />
        <Button type="submit" disabled={startLaeuft} className={ANMELDE_KNOPF}>
          {t('weiter')}
          {startLaeuft ? <LadeStern /> : <ArrowRight aria-hidden />}
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="zwei-faktor-schritt2" className="flex flex-col gap-3">
        <h2 id="zwei-faktor-schritt2" tabIndex={-1} className="text-24">
          {t('schritt2')}
        </h2>
        <p>{t('scannen')}</p>
        <div className="self-start rounded-lg border border-linie bg-weiss p-4 shadow-s1">
          <QrCode text={totp.uri} titel={t('qrAlt')} />
        </div>
        <p>{t('manuell')}</p>
        <code data-testid="totp-geheimnis" className="block rounded-md bg-sand px-3.5 py-2.5 font-mono text-18 break-all">
          {totp.geheimnis}
        </code>
      </section>
      <section aria-labelledby="zwei-faktor-ersatz" className="flex flex-col gap-3">
        <h3 id="zwei-faktor-ersatz" className="text-20">
          {t('ersatzcodesTitel')}
        </h3>
        <Meldung art="info">{t('ersatzcodesHinweis')}</Meldung>
        <ul className="grid grid-cols-2 gap-2 font-mono text-18">
          {totp.ersatzcodes.map((c) => (
            <li key={c} className="rounded-md bg-sand px-3 py-2.5 tracking-wide">
              {c}
            </li>
          ))}
        </ul>
      </section>
      <form action={endeAktion} className="flex flex-col gap-5" noValidate>
        <h2 className="text-24">{t('schritt3')}</h2>
        <Feld
          id="einrichten-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          label={t('schritt3')}
          fehler={ende.feldFehler?.code ? t('fehlerCode') : undefined}
          className="tracking-code tabular-nums"
        />
        <Button type="submit" disabled={endeLaeuft} className={ANMELDE_KNOPF}>
          {endeLaeuft ? <LadeStern /> : <ShieldCheck aria-hidden />}
          {t('bestaetigen')}
        </Button>
      </form>
    </div>
  );
}
